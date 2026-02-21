require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    console.log('✅ MySQL Database Connected Successfully');

    app.listen(PORT, () => {
      console.log(`🚀 FleetFlow backend running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Database Connection Failed');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();