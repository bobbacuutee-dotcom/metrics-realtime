const express = require('express');
const router = express.Router();

/**
 * Endpoint internal yang dipanggil oleh backend PHP.
 * Semua permintaan dari localhost saja (untuk keamanan).
 */

// Middleware pembatas akses (hanya dari localhost)
router.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        return next();
    }
    res.status(403).json({ message: 'Akses hanya dari localhost.' });
});

// POST /api/internal/event (menerima event dari PHP)
router.post('/event', (req, res) => {
    const { event, data } = req.body;
    console.log(`Event diterima: ${event}`, data);

    // Broadcast ke semua admin via Socket.IO
    const io = req.app.get('io');
    if (io) {
        switch (event) {
            case 'new_order':
                io.to('admin').emit('new_order', data);
                break;
            case 'payment_update':
                io.to('admin').emit('payment_update', data);
                break;
            case 'stock_update':
                io.to('admin').emit('stock_update', data);
                break;
            default:
                io.to('admin').emit(event, data);
        }
    }

    res.json({ message: 'Event diteruskan.' });
});

module.exports = router;