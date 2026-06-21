const pool = require('../config/db');

/**
 * Model untuk tabel messages (live chat).
 */
const Message = {
    /**
     * Menyimpan pesan baru ke database.
     * @param {string} room - room ID (contoh: "user_1")
     * @param {string} sender - nama pengirim
     * @param {string} message - isi pesan
     * @returns {object} - pesan yang baru disimpan
     */
    async create(room, sender, message) {
        const result = await pool.query(
            `INSERT INTO messages (room, sender, message) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
            [room, sender, message]
        );
        return result.rows[0];
    },

    /**
     * Mengambil riwayat chat untuk sebuah room.
     * @param {string} room - room ID
     * @param {number} limit - batas jumlah pesan (default 100)
     * @returns {array} - daftar pesan
     */
    async getHistory(room, limit = 100) {
        const result = await pool.query(
            `SELECT * FROM messages 
       WHERE room = $1 
       ORDER BY timestamp ASC 
       LIMIT $2`,
            [room, limit]
        );
        return result.rows;
    },

    /**
     * Menghapus semua pesan dalam room (opsional, untuk admin).
     * @param {string} room - room ID
     */
    async clearRoom(room) {
        await pool.query('DELETE FROM messages WHERE room = $1', [room]);
    }
};

module.exports = Message;