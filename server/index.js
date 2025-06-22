const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const {
    getRoom,
    createRoom,
    addPlayerToRoom,
    removePlayerFromRoom,
    updateCode
} = require('./lib/roomManager');

const app = express();
// 本番環境なので、すべてのオリジンからの接続を許可する
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"]
}));
const server = http.createServer(app);

const io = new Server(server, {
    path: "/api/socket",
    // 本番環境なので、すべてのオリジンからの接続を許可する
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, playerName }) => {
        let room = getRoom(roomId);
        if (!room) {
            room = createRoom(roomId);
        }

        const { room: updatedRoom, error } = addPlayerToRoom(roomId, { id: socket.id, name: playerName });

        if (error) {
            return socket.emit('error', { message: error });
        }

        socket.join(roomId);
        io.to(roomId).emit('updateRoom', updatedRoom);
        console.log(`📥 Player ${playerName} (${socket.id}) joined room ${roomId}`);
    });

    socket.on('update-code', ({ roomId, code }) => {
        updateCode(roomId, code);
        socket.to(roomId).emit('code-updated', {
            code,
            playerId: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
        const result = removePlayerFromRoom(socket.id);
        if (result && !result.roomDeleted) {
            const room = getRoom(result.roomId);
            if (room) {
                io.to(result.roomId).emit('updateRoom', room);
                console.log(`📤 Player left room ${result.roomId}`);
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
