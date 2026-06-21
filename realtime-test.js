const pool = require('./config/db');

(async () => {
    try {
        const orders = await pool.query('SELECT id, status, total_amount FROM orders');
        console.log('📦 Semua pesanan:', orders.rows);

        const items = await pool.query('SELECT * FROM order_items');
        console.log('📋 Semua order_items:', items.rows);

        const test = await pool.query(
            "SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount),0) AS total_revenue FROM orders WHERE status IN ('processing','shipped','completed')"
        );
        console.log('📊 Hasil analitik:', test.rows[0]);
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
})();