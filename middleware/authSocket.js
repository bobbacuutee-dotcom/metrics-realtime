const { verifyToken } = require('../config/jwt');

/**
 * Middleware Socket.IO untuk memverifikasi token JWT.
 * Akan menolak koneksi jika token tidak valid.
 */
function authSocket(socket, next) {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Token tidak ditemukan.'));
    }

    const payload = verifyToken(token);

    if (!payload) {
        return next(new Error('Token tidak valid atau kadaluarsa.'));
    }

    // Simpan data user di socket untuk dipakai di handler selanjutnya
    socket.user = payload;   // { user_id, role, name? }
    next();
}

module.exports = authSocket;