// src/middleware/upload.middleware.js
// Handles multipart/form-data file uploads → streams directly to S3
// Uses multer-s3 so the file never touches disk on the server

const multer    = require('multer');
const multerS3  = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const path      = require('path');
const s3Client  = require('../config/s3');
const AppError  = require('../utils/AppError');

// ─── ALLOWED MIME TYPES ───────────────────────────────────────────────────────

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// ─── S3 STORAGE ENGINE ───────────────────────────────────────────────────────

const s3Storage = multerS3({
  s3:      s3Client,
  bucket:  process.env.AWS_S3_BUCKET,
  acl:     'private',    // files are private; use pre-signed URLs to share
  contentType: multerS3.AUTO_CONTENT_TYPE,

  key: (req, file, cb) => {
    const userId    = req.user?.id || 'anonymous';
    const category  = req.body?.category || 'other';
    const ext       = path.extname(file.originalname).toLowerCase();
    const uniqueKey = `uploads/${userId}/${category}/${uuidv4()}${ext}`;
    cb(null, uniqueKey);
  },
});

// ─── FILE FILTER ──────────────────────────────────────────────────────────────

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file type: ${file.mimetype}. Allowed: PDF, JPEG, PNG, WEBP, DOCX`,
        415
      ),
      false
    );
  }
};

// ─── MULTER INSTANCE ──────────────────────────────────────────────────────────

const upload = multer({
  storage:  s3Storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files:    1,   // one file per request
  },
});

// ─── MIDDLEWARE WRAPPER ───────────────────────────────────────────────────────
// Attaches req.uploadedFile with normalized shape for the controller

const uploadSingle = (req, res, next) => {
  const multerHandler = upload.single('file');

  multerHandler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`, 413));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new AppError('No file provided. Send the file as form-data with key "file"', 400));
    }

    // Normalize multer-s3 output into a clean shape for the controller
    req.uploadedFile = {
      fileUrl:  req.file.location,           // full S3 URL
      fileName: req.file.originalname,
      fileKey:  req.file.key,                // S3 object key (for deletion)
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    };

    next();
  });
};

module.exports = { uploadSingle };