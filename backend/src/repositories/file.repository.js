// src/repositories/file.repository.js
// Exclusively handles all DB queries related to files and tags

const pool = require('../db/pool');

// ─── FILES ────────────────────────────────────────────────────────────────────

/**
 * Create a new file record after upload to S3
 */
const createFile = async ({
  userId,
  fileUrl,
  fileName,
  fileKey,
  fileType,
  mimeType,
  fileSize,
  category,
  metadata = {},
}) => {
  const { rows } = await pool.query(
    `INSERT INTO files
      (user_id, file_url, file_name, file_key, file_type, mime_type, file_size, category, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [userId, fileUrl, fileName, fileKey, fileType, mimeType, fileSize, category, metadata]
  );
  return rows[0];
};

/**
 * Get a single file by ID (with its tags)
 */
const getFileById = async (fileId) => {
  const { rows } = await pool.query(
    `SELECT
       f.*,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'id',        t.id,
             'name',      t.name,
             'color',     t.color,
             'tagged_by', ft.tagged_by
           )
         ) FILTER (WHERE t.id IS NOT NULL),
         '[]'
       ) AS tags
     FROM files f
     LEFT JOIN file_tags ft ON ft.file_id = f.id
     LEFT JOIN tags t       ON t.id = ft.tag_id
     WHERE f.id = $1
     GROUP BY f.id`,
    [fileId]
  );
  return rows[0] || null;
};

/**
 * Get all files for a user with optional filters
 */
const getFilesByUserId = async (userId, { category, status, tagNames, limit = 20, offset = 0 } = {}) => {
  const conditions = ['f.user_id = $1'];
  const params = [userId];
  let paramIndex = 2;

  if (category) {
    conditions.push(`f.category = $${paramIndex++}`);
    params.push(category);
  }

  if (status) {
    conditions.push(`f.status = $${paramIndex++}`);
    params.push(status);
  }

  // Filter by tag names if provided (file must have ALL specified tags)
  if (tagNames && tagNames.length > 0) {
    conditions.push(
      `f.id IN (
         SELECT ft.file_id FROM file_tags ft
         JOIN tags t ON t.id = ft.tag_id
         WHERE t.name = ANY($${paramIndex++})
         GROUP BY ft.file_id
         HAVING COUNT(DISTINCT t.name) = ${tagNames.length}
       )`
    );
    params.push(tagNames);
  }

  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT
       f.*,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'id',        t.id,
             'name',      t.name,
             'color',     t.color,
             'tagged_by', ft.tagged_by
           )
         ) FILTER (WHERE t.id IS NOT NULL),
         '[]'
       ) AS tags
     FROM files f
     LEFT JOIN file_tags ft ON ft.file_id = f.id
     LEFT JOIN tags t       ON t.id = ft.tag_id
     WHERE ${conditions.join(' AND ')}
     GROUP BY f.id
     ORDER BY f.uploaded_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    params
  );
  return rows;
};

/**
 * Update file status
 */
const updateFileStatus = async (fileId, status) => {
  const { rows } = await pool.query(
    `UPDATE files SET status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [status, fileId]
  );
  return rows[0] || null;
};

/**
 * Update file metadata (merges with existing metadata)
 */
const updateFileMetadata = async (fileId, metadata) => {
  const { rows } = await pool.query(
    `UPDATE files
     SET metadata = metadata || $1::jsonb, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [JSON.stringify(metadata), fileId]
  );
  return rows[0] || null;
};

/**
 * Soft-delete a file (or hard delete — your choice)
 * Using hard delete here; S3 key is returned for cleanup
 */
const deleteFile = async (fileId) => {
  const { rows } = await pool.query(
    `DELETE FROM files WHERE id = $1 RETURNING file_key`,
    [fileId]
  );
  return rows[0] || null;
};

/**
 * Check file ownership
 */
const fileExistsForUser = async (fileId, userId) => {
  const { rows } = await pool.query(
    `SELECT id FROM files WHERE id = $1 AND user_id = $2`,
    [fileId, userId]
  );
  return rows.length > 0;
};


// ─── TAGS ─────────────────────────────────────────────────────────────────────

/**
 * Get all available tags
 */
const getAllTags = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM tags ORDER BY name ASC`
  );
  return rows;
};

/**
 * Get a tag by name
 */
const getTagByName = async (name) => {
  const { rows } = await pool.query(
    `SELECT * FROM tags WHERE name = $1`,
    [name]
  );
  return rows[0] || null;
};

/**
 * Create a new tag (user-defined custom tag)
 */
const createTag = async ({ name, color = '#6B7280' }) => {
  const { rows } = await pool.query(
    `INSERT INTO tags (name, color)
     VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color
     RETURNING *`,
    [name, color]
  );
  return rows[0];
};


// ─── FILE TAGS ─────────────────────────────────────────────────────────────────

/**
 * Add tags to a file
 * tagIds: array of tag UUIDs
 * taggedBy: 'system' | 'user'
 */
const addTagsToFile = async (fileId, tagIds, taggedBy = 'system') => {
  if (!tagIds || tagIds.length === 0) return;

  const values = tagIds
    .map((_, i) => `($1, $${i + 2}, '${taggedBy}')`)
    .join(', ');

  await pool.query(
    `INSERT INTO file_tags (file_id, tag_id, tagged_by)
     VALUES ${values}
     ON CONFLICT (file_id, tag_id) DO NOTHING`,
    [fileId, ...tagIds]
  );
};

/**
 * Remove a specific tag from a file
 */
const removeTagFromFile = async (fileId, tagId) => {
  await pool.query(
    `DELETE FROM file_tags WHERE file_id = $1 AND tag_id = $2`,
    [fileId, tagId]
  );
};

/**
 * Replace all user-assigned tags on a file
 */
const replaceUserTagsOnFile = async (fileId, tagIds) => {
  await pool.query(
    `DELETE FROM file_tags WHERE file_id = $1 AND tagged_by = 'user'`,
    [fileId]
  );
  if (tagIds && tagIds.length > 0) {
    await addTagsToFile(fileId, tagIds, 'user');
  }
};

/**
 * Get tag counts for a user (for dashboard grouping)
 */
const getTagCountsForUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT t.name, t.color, COUNT(f.id) AS file_count
     FROM tags t
     JOIN file_tags ft ON ft.tag_id = t.id
     JOIN files f      ON f.id = ft.file_id
     WHERE f.user_id = $1
     GROUP BY t.id, t.name, t.color
     ORDER BY file_count DESC`,
    [userId]
  );
  return rows;
};


//get ai analysis
const getAnalysisByFileId = async (fileId) => {
  const { rows } = await pool.query(
    `SELECT * FROM report_analyses 
     WHERE file_id = $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [fileId]
  );
  return rows[0] || null;
};



module.exports = {
  // files
  createFile,
  getFileById,
  getFilesByUserId,
  updateFileStatus,
  updateFileMetadata,
  deleteFile,
  fileExistsForUser,

  // tags
  getAllTags,
  getTagByName,
  createTag,

  // file_tags
  addTagsToFile,
  removeTagFromFile,
  replaceUserTagsOnFile,
  getTagCountsForUser,

  //get ai analysis
  getAnalysisByFileId
};