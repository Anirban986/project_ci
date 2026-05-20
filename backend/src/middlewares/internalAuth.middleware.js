// src/middleware/internalAuth.middleware.js
// Protects routes that are only called by FastAPI (not the browser)
// FastAPI must send the shared secret in the X-Internal-Key header

const AppError = require('../utils/AppError');

const internalApiKey = (req, res, next) => {
  const key = req.headers['x-internal-key'];

  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return next(new AppError('Unauthorized', 401));
  }

  next();
};

module.exports = { internalApiKey };