// src/routes/file.routes.js

const express    = require('express');
const router     = express.Router();

const {
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
} = require('../controllers/file.controller');

const { uploadSingle }    = require('../middlewares/upload.middleware');
const { userMiddleware }    = require('../middlewares/user.middleware');
const { internalApiKey }  = require('../middlewares/internalAuth.middleware');

// ─── FILE ROUTES ──────────────────────────────────────────────────────────────

router.post('/upload', userMiddleware, uploadSingle, uploadFile);

router.get('/', userMiddleware, listFiles);

router.get('/tags/summary', userMiddleware, getTagSummary);

// ✅ specific routes BEFORE /:id
router.get('/:id/analysis', userMiddleware, getAnalysis);   // ← moved up

router.get('/:id', userMiddleware, getFile);                // ← generic after

router.put('/:id/tags', userMiddleware, setFileTags);

router.patch('/:id/status', internalApiKey, updateStatus);

router.delete('/:id', userMiddleware, deleteFile);


// ─── TAG ROUTES ───────────────────────────────────────────────────────────────

router.get('/tags', userMiddleware, getTags);
router.post('/tags', userMiddleware, addTag);

module.exports = router;