/**
 * Mendaftarkan event‑event untuk analitik real‑time.
 */
function analyticsHandler(io, socket) {
    // Saat admin bergabung ke room analitik
    socket.on('join_analytics', () => {
        if (socket.user.role === 'admin') {
            socket.join('analytics');
        }
    });

    // Event bisa dipanggil dari internal routes untuk broadcast
    // Misal: new_order, stock_update, visitor_online

    // Kita juga bisa mendengarkan event yang dikirim dari REST endpoint internal
    socket.on('broadcast_new_order', (data) => {
        io.to('analytics').emit('new_order', data);
    });

    socket.on('broadcast_stock_update', (data) => {
        io.to('analytics').emit('stock_update', data);
    });
}

module.exports = analyticsHandler;