const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET /api/chat/history/:room?limit=50
router.get('/history/:room', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const messages = await Message.getHistory(req.params.room, limit);
        res.json({ data: messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil riwayat chat.' });
    }
});

module.exports = router;