// ... existing code ...
console.log(`Client connected: ${socket.id}`);

socket.on('joinRoom', ({ roomId, playerName }) => {
    let room = getRoom(roomId);
    if (!room) {
        room = createRoom(roomId);
    }

    const { room: updatedRoom, error } = addPlayerToRoom(roomId, { id: socket.id, name: playerName });

    if (error) {
        return socket.emit('error', { message: error });
    }

    socket.join(roomId);
    // 参加者全員に最新のルーム情報を送信
    io.to(roomId).emit('updateRoom', updatedRoom);
});

socket.on('update-code', ({ roomId, code }) => {
    updateCode(roomId, code);
    // ... existing code ...
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        const result = removePlayerFromRoom(socket.id);
        if (result && !result.roomDeleted) {
            const room = getRoom(result.roomId);
            if (room) {
                // プレイヤー退出後、最新のルーム情報をブロードキャスト
                io.to(result.roomId).emit('updateRoom', room);
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
// ... existing code ...
