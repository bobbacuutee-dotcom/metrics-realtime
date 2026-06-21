const pool = require('../config/db');

const activeRooms = {};

async function broadcastActiveRooms(io) {
    const rooms = Object.entries(activeRooms).map(([userId, data]) => ({
        roomId: `user_${userId}`,
        userName: data.userName || 'Unknown',
        lastMessage: data.lastMessage || '',
        unread: data.unread || 0,
    }));
    io.to('admin').emit('active_rooms', rooms);
}

function chatHandler(io, socket) {
    socket.join('admin');

    socket.on('join_room', async ({ userId, userType }) => {
        if (userType === 'customer') {
            const effectiveUserId = socket.user.user_id;
            const roomId = `user_${effectiveUserId}`;
            socket.join(roomId);

            activeRooms[effectiveUserId] = {
                socketId: socket.id,
                userName: socket.user.name || `User ${effectiveUserId}`,
                lastMessage: '',
                unread: 0,
            };

            try {
                const queryResult = await pool.query(
                    'SELECT * FROM messages WHERE room = $1 ORDER BY timestamp ASC',
                    [roomId]
                );
                socket.emit('chat_history', queryResult.rows);
            } catch (err) {
                socket.emit('chat_history', []);
            }

            broadcastActiveRooms(io);
        }
    });

    socket.on('admin_get_rooms', () => {
        if (socket.user.role === 'admin') {
            broadcastActiveRooms(io);
        }
    });

    socket.on('admin_join_room', async ({ userId }) => {
        if (socket.user.role !== 'admin') return;
        const roomId = `user_${userId}`;
        socket.join(roomId);

        try {
            const queryResult = await pool.query(
                'SELECT * FROM messages WHERE room = $1 ORDER BY timestamp ASC',
                [roomId]
            );
            socket.emit('chat_history', queryResult.rows);
        } catch (err) {
            socket.emit('chat_history', []);
        }
    });

    socket.on('send_message', async (data) => {
        const { room, message } = data;
        const sender = socket.user.name || `User ${socket.user.user_id}`;
        const timestamp = new Date().toISOString();

        try {
            const queryResult = await pool.query(
                'INSERT INTO messages (room, sender, message, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
                [room, sender, message, timestamp]
            );
            console.log('✅ Pesan tersimpan ke DB, id:', queryResult.rows[0]?.id);
        } catch (err) {
            console.error('❌ Gagal menyimpan pesan:', err.message);
        }

        io.to(room).emit('receive_message', { room, sender, message, timestamp });

        const userId = room.replace('user_', '');
        if (activeRooms[userId]) {
            activeRooms[userId].lastMessage = message;
        }

        broadcastActiveRooms(io);
    });

    socket.on('get_my_name', () => {
        const name = socket.user.name || `User ${socket.user.user_id}`;
        socket.emit('my_name', name);
    });
}

module.exports = chatHandler;