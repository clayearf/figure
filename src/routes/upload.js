const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { generateFigureFromImage } = require('../services/geminiService');

const router = express.Router();

const uploadDir = path.join(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.png');
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (config.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Unsupported file type'));
  }
});

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'figure-ai-api', timestamp: new Date().toISOString() });
});

router.post('/preview', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const style = req.body.style || 'chibi';
    const prompt = req.body.prompt || '';

    const imageBuffer = fs.readFileSync(req.file.path);
    const result = await generateFigureFromImage({
      imageBuffer,
      mimeType: req.file.mimetype,
      style,
      prompt,
    });

    const publicUrl = `/uploads/${req.file.filename}`;

    return res.json({
      success: true,
      style,
      imageUrl: publicUrl,
      generatedImage: result.imageBase64 ? `data:${result.mimeType};base64,${result.imageBase64}` : null,
      description: result.text,
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      }
    });
  } catch (error) {
    console.error('Preview generation failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate preview'
    });
  }
});

module.exports = router;
