const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
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

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Figure AI API is running' });
});

app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.FIGURE_CONFIG = ${JSON.stringify({ apiBaseUrl: config.apiBaseUrl })};`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
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

module.exports = app;