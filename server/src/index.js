require('dotenv').config();
const app = require('./app');
const { initExpiryCron } = require('./cron/expiryCheck');

const PORT = process.env.PORT || 5000;

// Start Expiry Check Cron Job
initExpiryCron();

app.listen(PORT, () => {
  console.log(`Baan Na Resort Backend running on port ${PORT}`);
});
