const cron = require('node-cron');
const { saveDailySummary } = require('../services/analyticsService');

/**
 * Menjadwalkan ringkasan harian.
 * Dijalankan setiap hari pukul 23:59 (jam 11:59 malam).
 */
function scheduleDailySummary() {
    // cron expression: detik(opsional) menit jam hari bulan hari_minggu
    // '59 23 * * *' = setiap pukul 23:59
    cron.schedule('59 23 * * *', () => {
        console.log('Menjalankan daily summary...');
        saveDailySummary().catch(err => console.error('Gagal daily summary:', err));
    });

    console.log('✅ Daily summary cron scheduled (23:59 setiap hari).');
}

module.exports = scheduleDailySummary;