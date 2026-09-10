require('dotenv').config();

const config = {
  port: Number(process.env.PORT || 4000),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash-image',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 10),
  allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/png,image/jpeg,image/webp').split(',').map(item => item.trim()),
  corsOrigin: (process.env.CORS_ORIGIN || '*').split(',').map(item => item.trim()),
};

module.exports = config;
