const express = require('express');
const multer = require('multer');
const config = require('../config');
const { generateFigureFromImage } = require('../services/geminiService');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
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

    const imageBuffer = req.file.buffer;
    const result = await generateFigureFromImage({
      imageBuffer,
      mimeType: req.file.mimetype,
      style,
      prompt,
    });

    return res.json({
      success: true,
      style,
      imageUrl: null,
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
