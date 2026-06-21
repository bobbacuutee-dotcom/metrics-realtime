require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const initSocket = require('./socket');               // handler asli
const analyticsRoutes = require('./routes/analytics');
const chatRoutes = require('./routes/chat');
const internalRoutes = require('./routes/internal');
const scheduleDailySummary = require('./cron/dailySummary');

console.log('🔵 Mulai inisialisasi server...');

const app = express();
const server = http.createServer(app);

// ---------- Socket.IO ----------
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Pasang semua event handler (chat, analytics)
initSocket(io);
app.set('io', io);

// ---------- Middleware REST ----------
app.use(cors());
app.use(express.json());

// ---------- Routes ----------
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/internal', internalRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Realtime server berjalan.', version: '1.0.0' });
});

// ---------- Cron job ----------
scheduleDailySummary();

// ---------- Start server ----------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Realtime server berjalan di http://localhost:${PORT}`);
});