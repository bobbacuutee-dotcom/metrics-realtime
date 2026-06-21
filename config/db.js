const { Pool } = require('pg');

// Konfigurasi koneksi PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'MNajiv1703',
    database: process.env.DB_NAME || 'market_hub',
    max: 10, // maksimal koneksi
    idleTimeoutMillis: 30000,
});

module.exports = pool;