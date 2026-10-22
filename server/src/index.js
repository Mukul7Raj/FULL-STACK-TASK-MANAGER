require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Verify database connection and schema
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Task Manager API running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
