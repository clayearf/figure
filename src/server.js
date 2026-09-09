const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const uploadRoutes = require('./routes/upload');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === 'null' || config.corsOrigin.includes('*')) {
      callback(null, true);
      return;
    }
    if (config.corsOrigin.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Figure AI API is running' });
});

app.use('/api', uploadRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || 'Bad request' });
  }
  next();
});

app.listen(config.port, () => {
  console.log(`Figure AI API running on http://localhost:${config.port}`);
});
