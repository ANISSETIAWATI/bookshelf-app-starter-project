require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.PGCONNECTION,
  ssl: {
    rejectUnauthorized: false, // Wajib untuk Supabase
  },
});

module.exports = pool;