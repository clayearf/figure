const config = require('./config');
const app = require('./app');

app.listen(config.port, () => {
  console.log(`Figure AI API running on http://localhost:${config.port}`);
});
