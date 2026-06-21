const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// Ringkasan utama (sebelumnya sudah ada, tetap dipertahankan)
router.get('/summary', async (req, res) => {
    try {
        const period = req.query.period || 'today';
        const data = await analyticsService.getSummary(period);
        res.json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil ringkasan analitik.' });
    }
});

// Tren penjualan (sebelumnya sudah ada)
router.get('/sales-trend', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const data = await analyticsService.getSalesTrend(days);
        res.json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil tren penjualan.' });
    }
});

// === FITUR BARU SESUAI PERMINTAAN ===

// 1. Kartu Metrik Utama (dengan growth)
router.get('/main-metrics', async (req, res) => {
    try {
        const period = req.query.period || 'today';
        const data = await analyticsService.getMainMetrics(period);
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 2. Hari Terbaik
router.get('/best-day', async (req, res) => {
    try {
        const period = req.query.period || 'today';
        const data = await analyticsService.getBestDay(period);
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 3. Pola Penjualan per Hari
router.get('/daily-pattern', async (req, res) => {
    try {
        const period = req.query.period || 'today';
        const data = await analyticsService.getDailyPattern(period);
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 4. Tren Mingguan (4 minggu terakhir)
router.get('/weekly-trend', async (req, res) => {
    try {
        const data = await analyticsService.getWeeklyTrend();
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 5. Distribusi Status Pesanan
router.get('/order-status', async (req, res) => {
    try {
        const period = req.query.period || 'today';
        const data = await analyticsService.getOrderStatusDistribution(period);
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 6. Tren Bulanan 6 Bulan
router.get('/monthly-trend-6', async (req, res) => {
    try {
        const data = await analyticsService.getMonthlyTrend6();
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 7. Performa Kategori (Tabel)
router.get('/category-performance', async (req, res) => {
    try {
        const period = req.query.period || 'today';
        const data = await analyticsService.getCategoryPerformance(period);
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 8. Performa Produk (Enhanced)
router.get('/product-performance', async (req, res) => {
    try {
        const period = req.query.period || 'today';
        const category_id = req.query.category_id || null;
        const data = await analyticsService.getProductPerformance(period, category_id);
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 9. Funnel Konversi
router.get('/conversion-funnel', async (req, res) => {
    try {
        const data = await analyticsService.getConversionFunnel();
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/revenue-breakdown', async (req, res) => {
    try {
        const period = req.query.period || 'today';
        const data = await analyticsService.getRevenueBreakdown(period);
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/top-buyer-cities', async (req, res) => {
    try {
        const period = req.query.period || 'today';
        const limit = parseInt(req.query.limit) || 5;
        const data = await analyticsService.getTopBuyerCities(period, limit);
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/order-status-total', async (req, res) => {
    try {
        const data = await analyticsService.getTotalOrderStatusDistribution();
        res.json({ data });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;