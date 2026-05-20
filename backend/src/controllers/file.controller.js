// src/controllers/file.controller.js
// Handles HTTP request/response only — no business logic here

const {
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
} = require('../services/file.service');


// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────

/**
 * POST /files/upload
 * Multer middleware runs before this — file is already in S3
 * req.uploadedFile is set by the multer middleware
 */
const uploadFile = async (req, res, next) => {
  try {
    const { category, metadata } = req.body;
    const { fileUrl, fileName, fileKey, mimeType, fileSize } = req.uploadedFile;

    if (!category) {
      return res.status(400).json({ success: false, message: 'category is required' });
    }

    const file = await handleFileUpload({
      userId:   req.user.id,
      fileUrl,
      fileName,
      fileKey,
      mimeType,
      fileSize,
      category,
      metadata: metadata ? JSON.parse(metadata) : {},
    });

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully. Processing started.',
      data:    file,
    });
  } catch (err) {
    next(err);
  }
};


// ─── FILE QUERIES ─────────────────────────────────────────────────────────────

/**
 * GET /files
 * Query params: category, status, tags (comma-separated), limit, offset
 */
const listFiles = async (req, res, next) => {
  try {
    const { category, status, tags, limit = 20, offset = 0 } = req.query;
    const tagNames = tags ? tags.split(',').map((t) => t.trim()) : undefined;

    const files = await getUserFiles(req.user.id, {
      category,
      status,
      tagNames,
      limit:  parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    return res.json({ success: true, data: files });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /files/:id
 */
const getFile = async (req, res, next) => {
  try {
    const file = await getSingleFile(req.params.id, req.user.id);
    return res.json({ success: true, data: file });
  } catch (err) {
    next(err);
  }
};


// ─── FILE STATUS (FastAPI callback) ──────────────────────────────────────────

/**
 * PATCH /files/:id/status
 * Called by FastAPI when processing is complete or fails
 * Secured by internal API key (see auth middleware)
 */
const updateStatus = async (req, res, next) => {
  try {
     console.log('[updateStatus] fileId:', req.params.id, 'status:', req.body.status);
    const { status, metadata } = req.body;

    const allowed = ['uploaded', 'processing', 'processed', 'extracted', 'failed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const file = await updateProcessingStatus(req.params.id, status, metadata || {});
    return res.json({ success: true, data: file });
  } catch (err) {
    next(err);
  }
};


// ─── FILE DELETION ────────────────────────────────────────────────────────────

/**
 * DELETE /files/:id
 */
const deleteFile = async (req, res, next) => {
  try {
    const result = await removeFile(req.params.id, req.user.id);
    return res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};


// ─── TAGS ─────────────────────────────────────────────────────────────────────

/**
 * GET /tags
 * Returns all available tags
 */
const getTags = async (req, res, next) => {
  try {
    const tags = await listAllTags();
    return res.json({ success: true, data: tags });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /tags
 * Create a custom tag
 * Body: { name, color? }
 */
const addTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const tag = await createCustomTag({ name, color });
    return res.status(201).json({ success: true, data: tag });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /files/:id/tags
 * Replace user-assigned tags on a file
 * Body: { tagIds: ["uuid1", "uuid2"] }
 */
const setFileTags = async (req, res, next) => {
  try {
    const { tagIds } = req.body;
    const file = await updateFileTags(req.params.id, req.user.id, tagIds);
    return res.json({ success: true, data: file });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /files/tags/summary
 * Returns tag counts for the current user (used for dashboard grouping)
 */
const getTagSummary = async (req, res, next) => {
  try {
    const counts = await getUserTagCounts(req.user.id);
    return res.json({ success: true, data: counts });
  } catch (err) {
    next(err);
  }
};


const getAnalysis = async (req, res, next) => {
  try {
    console.log('[getAnalysis] fileId:', req.params.id, 'userId:', req.user.id);
    const analysis = await fetchFileAnalysis(req.params.id, req.user.id);
    return res.json({ success: true, data: analysis });
  } catch (err) {
    console.log('[getAnalysis] error:', err.message);  // ← add this
    next(err);
  }
};


module.exports = {
  uploadFile,
  listFiles,
  getFile,
  updateStatus,
  deleteFile,
  getTags,
  addTag,
  setFileTags,
  getTagSummary,
  getAnalysis
};