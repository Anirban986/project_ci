// src/services/file.service.js
// Exclusively handles business logic for file operations

const {
  createFile,
  getFileById,
  getFilesByUserId,
  updateFileStatus,
  updateFileMetadata,
  deleteFile,
  fileExistsForUser,
  getAllTags,
  getTagByName,
  createTag,
  addTagsToFile,
  removeTagFromFile,
  replaceUserTagsOnFile,
  getTagCountsForUser,
} = require('../repositories/file.repository');

const { deleteFromS3 } = require('../config/s3');
const { notifyFastAPI }  = require('../config/fastapi');
const AppError           = require('../utils/AppError');
const { getAnalysisByFileId } = require('../repositories/file.repository');
// ─── CATEGORY → AUTO TAGS MAP ─────────────────────────────────────────────────
// Tags automatically applied by the system when a file is uploaded

const CATEGORY_AUTO_TAGS = {
  health_report:    ['unreviewed'],
  prescription:     ['unreviewed'],
  scan_or_imaging:  ['unreviewed'],
  insurance:        [],
  identity:         [],
  other:            [],
};

// ─── MIME TYPE → FILE TYPE MAP ────────────────────────────────────────────────

const resolveFileType = (mimeType) => {
  if (!mimeType) return 'other';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  return 'other';
};

// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────

/**
 * Called after multer + S3 upload is complete.
 * Creates DB record, assigns auto-tags, triggers FastAPI pipeline.
 */
const handleFileUpload = async ({
  userId,
  fileUrl,
  fileName,
  fileKey,
  mimeType,
  fileSize,
  category,
  metadata = {},
}) => {
  const fileType = resolveFileType(mimeType);

  // 1. Create file record
  const file = await createFile({
    userId,
    fileUrl,
    fileName,
    fileKey,
    fileType,
    mimeType,
    fileSize,
    category,
    metadata,
  });

  // 2. Apply auto system tags based on category
  const autoTagNames = CATEGORY_AUTO_TAGS[category] || [];
  if (autoTagNames.length > 0) {
    const tagIds = await resolveTagIds(autoTagNames);
    await addTagsToFile(file.id, tagIds, 'system');
  }

  // 3. Trigger async FastAPI pipeline (fire and forget)
  //    FastAPI will call back to PATCH /files/:id/status when done
  const pipeline = category === 'prescription' ? 'prescription' : 'report';
  notifyFastAPI(pipeline, {
    file_id:   file.id,
    file_url:  file.file_url,
    file_key:  file.file_key,
    file_type: file.file_type,
    category:  file.category,
  }).catch((err) => {
    // Log but don't fail the upload response
    console.error(`[file.service] FastAPI notification failed for file ${file.id}:`, err.message);
    updateFileStatus(file.id, 'failed').catch(() => {});
  });

  // 4. Update status to 'processing'
  await updateFileStatus(file.id, 'processing');

  return file;
};

// ─── FILE QUERIES ─────────────────────────────────────────────────────────────

const getUserFiles = async (userId, filters = {}) => {
  return getFilesByUserId(userId, filters);
};

const getSingleFile = async (fileId, userId) => {
  const file = await getFileById(fileId);
  if (!file) throw new AppError('File not found', 404);
  if (file.user_id !== userId) throw new AppError('Access denied', 403);
  return file;
};

// ─── FILE STATUS UPDATE (called by FastAPI callback) ─────────────────────────

const updateProcessingStatus = async (fileId, status, extraMetadata = {}) => {
  const file = await updateFileStatus(fileId, status);
  if (!file) throw new AppError('File not found', 404);

  if (Object.keys(extraMetadata).length > 0) {
    await updateFileMetadata(fileId, extraMetadata);
  }

  // If analysis is done, remove 'unreviewed' system tag and add 'reviewed'
  if (status === 'processed' || status === 'extracted') {
    const unreviewed = await getTagByName('unreviewed');
    const reviewed   = await getTagByName('reviewed');
    if (unreviewed) await removeTagFromFile(fileId, unreviewed.id);
    if (reviewed)   await addTagsToFile(fileId, [reviewed.id], 'system');
  }

  return file;
};

// ─── FILE DELETION ────────────────────────────────────────────────────────────

const removeFile = async (fileId, userId) => {
  const owned = await fileExistsForUser(fileId, userId);
  if (!owned) throw new AppError('File not found or access denied', 404);

  const deleted = await deleteFile(fileId);
  if (!deleted) throw new AppError('Could not delete file', 500);

  // Delete from S3
  await deleteFromS3(deleted.file_key).catch((err) => {
    // Log but don't block — DB record is already gone
    console.error(`[file.service] S3 deletion failed for key ${deleted.file_key}:`, err.message);
  });

  return { message: 'File deleted successfully' };
};

// ─── TAG MANAGEMENT ───────────────────────────────────────────────────────────

const listAllTags = async () => getAllTags();

const createCustomTag = async ({ name, color }) => {
  if (!name || name.trim().length === 0) throw new AppError('Tag name is required', 400);
  const normalized = name.trim().toLowerCase().replace(/\s+/g, '-');
  return createTag({ name: normalized, color });
};

/**
 * Update user-assigned tags on a file (replaces existing user tags)
 */
const updateFileTags = async (fileId, userId, tagIds) => {
  const owned = await fileExistsForUser(fileId, userId);
  if (!owned) throw new AppError('File not found or access denied', 404);

  if (!Array.isArray(tagIds)) throw new AppError('tagIds must be an array', 400);

  await replaceUserTagsOnFile(fileId, tagIds);
  return getFileById(fileId);
};

const getUserTagCounts = async (userId) => getTagCountsForUser(userId);

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Given an array of tag names, return their IDs.
 * Creates any tags that don't exist yet.
 */
const resolveTagIds = async (tagNames) => {
  const ids = [];
  for (const name of tagNames) {
    let tag = await getTagByName(name);
    if (!tag) tag = await createTag({ name });
    ids.push(tag.id);
  }
  return ids;
};

const fetchFileAnalysis = async (fileId, userId) => {
  const owned = await fileExistsForUser(fileId, userId);
  if (!owned) throw new AppError('Access denied', 403);

  // just try to fetch — no status check needed
  const analysis = await getAnalysisByFileId(fileId);

  if (!analysis) {
    throw new AppError('Analysis not ready yet', 404);  // 404 keeps polling going
  }

  return analysis;
};

module.exports = {
  handleFileUpload,
  getUserFiles,
  getSingleFile,
  updateProcessingStatus,
  removeFile,
  listAllTags,
  createCustomTag,
  updateFileTags,
  getUserTagCounts,
  fetchFileAnalysis
};