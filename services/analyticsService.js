const pool = require('../config/db');

// ========== PEMBANTU TANGGAL ==========
function getStartDate(period = 'today') {
    const now = new Date();
    switch (period) {
        case '7d': return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString().split('T')[0];
        case '30d': return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString().split('T')[0];
        case '90d': return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90).toISOString().split('T')[0];
        case 'this_month': return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        case 'last_month': return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        default: return now.toISOString().split('T')[0];
    }
}

// ========== RINGKASAN UTAMA (LAMA) ==========
async function getSummary(period = 'today') {
    const startDate = getStartDate(period);
    const revenueResult = await pool.query(
        `SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount), 0) AS total_revenue
     FROM orders WHERE status IN ('processing','shipped','completed') AND created_at >= $1::date`,
        [startDate]
    );
    const itemsResult = await pool.query(
        `SELECT COALESCE(SUM(oi.quantity), 0) AS items_sold
     FROM order_items oi JOIN orders ON oi.order_id = orders.id
     WHERE orders.status IN ('processing','shipped','completed') AND orders.created_at >= $1::date`,
        [startDate]
    );
    const usersResult = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    return {
        total_revenue: parseFloat(revenueResult.rows[0].total_revenue),
        total_orders: parseInt(revenueResult.rows[0].total_orders),
        items_sold: parseInt(itemsResult.rows[0].items_sold),
        total_users: parseInt(usersResult.rows[0].total_users),
    };
}

async function getSalesTrend(days = 7) {
    const result = await pool.query(
        `SELECT DATE(created_at) AS date, COALESCE(SUM(total_amount), 0) AS total_sales, COUNT(*) AS order_count
     FROM orders WHERE status IN ('processing','shipped','completed') AND created_at >= CURRENT_DATE - $1::int
     GROUP BY DATE(created_at) ORDER BY date ASC`,
        [days]
    );
    return result.rows;
}

// ========== METRIK UTAMA & KARTU INSIGHT ==========
async function getMainMetrics(period) {
    const startDate = getStartDate(period);
    const prevStartDate = getStartDate('last_month');
    const current = await pool.query(
        `SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount),0) AS total_revenue,
            COALESCE(AVG(total_amount),0) AS avg_order_value, COUNT(DISTINCT user_id) AS total_customers
     FROM orders WHERE status IN ('processing','shipped','completed') AND created_at >= $1::date`, [startDate]);
    const previous = await pool.query(
        `SELECT COALESCE(SUM(total_amount),0) AS prev_revenue, COUNT(*) AS prev_orders
     FROM orders WHERE status IN ('processing','shipped','completed') AND created_at >= $1::date AND created_at < $2::date`,
        [prevStartDate, startDate]);
    return { ...current.rows[0], ...previous.rows[0] };
}

async function getBestDay(period) {
    const startDate = getStartDate(period);
    const res = await pool.query(
        `SELECT TO_CHAR(created_at, 'Day') AS day, SUM(total_amount) AS revenue
     FROM orders WHERE status IN ('processing','shipped','completed') AND created_at >= $1::date
     GROUP BY day ORDER BY revenue DESC LIMIT 1`, [startDate]);
    return res.rows[0] || { day: '-', revenue: 0 };
}

// ========== GRAFIK ==========
async function getDailyPattern(period) {
    const startDate = getStartDate(period);
    const res = await pool.query(
        `SELECT TO_CHAR(created_at, 'Day') AS day, SUM(total_amount) AS revenue, COUNT(*) AS orders
     FROM orders WHERE status IN ('processing','shipped','completed') AND created_at >= $1::date
     GROUP BY day ORDER BY MIN(created_at)`, [startDate]);
    return res.rows;
}

async function getWeeklyTrend() {
    const res = await pool.query(
        `SELECT DATE_TRUNC('week', created_at) AS week, SUM(total_amount) AS revenue, COUNT(*) AS orders
     FROM orders WHERE status IN ('processing','shipped','completed') AND created_at >= CURRENT_DATE - 28
     GROUP BY week ORDER BY week`);
    return res.rows;
}

async function getOrderStatusDistribution(period) {
    const startDate = getStartDate(period);
    const res = await pool.query(
        `SELECT status, COUNT(*) AS count FROM orders WHERE created_at >= $1::date GROUP BY status`, [startDate]);
    return res.rows;
}

async function getMonthlyTrend6() {
    const res = await pool.query(
        `SELECT TO_CHAR(created_at, 'Mon') AS month, SUM(total_amount) AS revenue
     FROM orders WHERE status IN ('processing','shipped','completed') AND created_at >= CURRENT_DATE - 180
     GROUP BY month ORDER BY MIN(created_at)`);
    return res.rows;
}

async function getRevenueBreakdown(period) {
    const startDate = getStartDate(period);
    const res = await pool.query(
        `SELECT c.name AS category, COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue
     FROM order_items oi JOIN orders ON oi.order_id = orders.id
     JOIN products p ON oi.product_id = p.id JOIN categories c ON p.category_id = c.id
     WHERE orders.status IN ('processing','shipped','completed') AND orders.created_at >= $1::date
     GROUP BY c.name ORDER BY revenue DESC`, [startDate]);
    return res.rows;
}

async function getTopBuyerCities(period, limit = 5) {
    const startDate = getStartDate(period);
    const res = await pool.query(
        `SELECT COALESCE(shipping_address->>'city', 'Tidak diketahui') AS city, COUNT(*) AS orders
     FROM orders WHERE status IN ('processing','shipped','completed') AND created_at >= $1::date
     GROUP BY city ORDER BY orders DESC LIMIT $2`, [startDate, limit]);
    return res.rows;
}

// ========== TABEL ==========
async function getCategoryPerformance(period) {
    const startDate = getStartDate(period);
    const res = await pool.query(
        `SELECT c.name, SUM(oi.quantity) AS total_sold, SUM(oi.price * oi.quantity) AS revenue,
            COUNT(DISTINCT p.id) AS total_products, AVG(oi.price) AS avg_price
     FROM order_items oi JOIN orders ON oi.order_id = orders.id
     JOIN products p ON oi.product_id = p.id JOIN categories c ON p.category_id = c.id
     WHERE orders.status IN ('processing','shipped','completed') AND orders.created_at >= $1::date
     GROUP BY c.name ORDER BY revenue DESC`, [startDate]);
    return res.rows;
}

async function getProductPerformance(period, category_id) {
    const startDate = getStartDate(period);
    let query = `SELECT p.id, p.name, p.image, p.stock, c.name AS category,
                      SUM(oi.quantity) AS total_sold, SUM(oi.price * oi.quantity) AS revenue
               FROM order_items oi JOIN orders ON oi.order_id = orders.id
               JOIN products p ON oi.product_id = p.id JOIN categories c ON p.category_id = c.id
               WHERE orders.status IN ('processing','shipped','completed') AND orders.created_at >= $1::date`;
    const params = [startDate];
    if (category_id) { query += ' AND p.category_id = $2'; params.push(category_id); }
    query += ' GROUP BY p.id, p.name, p.image, p.stock, c.name ORDER BY revenue DESC';
    const res = await pool.query(query, params);
    return res.rows;
}

async function getConversionFunnel() {
    // Data dummy untuk demo (bisa diganti dengan data nyata dari activity_logs)
    return { steps: ['Visitors', 'Product Views', 'Add to Cart', 'Checkout', 'Purchase'], values: [1200, 500, 200, 100, 60] };
}

async function getTotalOrderStatusDistribution() {
    const res = await pool.query(
        `SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status`
    );
    return res.rows;
}

// ========== EXPORT ==========
module.exports = {
    getSummary, getSalesTrend,
    getMainMetrics, getBestDay, getDailyPattern, getWeeklyTrend,
    getOrderStatusDistribution, getMonthlyTrend6,
    getRevenueBreakdown, getTopBuyerCities,
    getCategoryPerformance, getProductPerformance, getConversionFunnel, getTotalOrderStatusDistribution
};