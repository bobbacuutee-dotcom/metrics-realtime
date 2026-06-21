const pool = require('../config/db');

async function logActivity(data) {
    try {
        await pool.query(
            `CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        page VARCHAR(255),
        action VARCHAR(100),
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`
        );

        const { user_id, page, action, metadata } = data;
        await pool.query(
            `INSERT INTO activity_logs (user_id, page, action, metadata)
       VALUES ($1, $2, $3, $4)`,
            [user_id || null, page, action, metadata ? JSON.stringify(metadata) : null]
        );
    } catch (error) {
        console.error('Gagal mencatat aktivitas:', error.message);
    }
}

async function getActivitySummary() {
    try {
        const popularPages = await pool.query(
            `SELECT page, COUNT(*) AS views
       FROM activity_logs
       WHERE created_at >= CURRENT_DATE
       GROUP BY page
       ORDER BY views DESC
       LIMIT 10`
        );
        return { popular_pages: popularPages.rows };
    } catch (error) {
        console.error('Gagal mendapatkan ringkasan aktivitas:', error);
        return { popular_pages: [] };
    }
}

module.exports = { logActivity, getActivitySummary };