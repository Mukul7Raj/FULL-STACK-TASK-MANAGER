const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'taskmanager'}`,
  ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Test connection and auto-run schema on initial start
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');

    const schemaPath = path.join(__dirname, '../db/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('✅ Database schema verified/initialized');
    }

    client.release();
  } catch (err) {
    console.error('❌ Database connection/initialization error:', err.message);
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDatabase
};
