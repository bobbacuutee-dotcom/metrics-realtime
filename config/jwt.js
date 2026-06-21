const jwt = require('jsonwebtoken');

// Secret HARUS sama dengan yang di backend PHP (JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || 'm4rketHub_$3cr3t!2026_XyZ';

/**
 * Verifikasi token JWT.
 * Mengembalikan payload jika valid, atau null jika tidak.
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

module.exports = { verifyToken, JWT_SECRET };