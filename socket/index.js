const chatHandler = require('./chatHandler');
const analyticsHandler = require('./analyticsHandler');
const authSocket = require('../middleware/authSocket');

function initSocket(io) {
    // Middleware autentikasi
    io.use(authSocket);

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.user_id} (${socket.user.role})`);

        // Pasang handler chat
        chatHandler(io, socket);

        // Pasang handler analitik
        analyticsHandler(io, socket);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.user_id}`);
        });
    });
}

module.exports = initSocket;