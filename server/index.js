const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const {
    getRoom,
    createRoom,
    addPlayerToRoom,
    removePlayerFromRoom,
    nextTurn,
    updateCode,
    submitGame,
    sampleProblems,
    rooms,
} = require('./lib/roomManager');

const app = express();
app.use(cors());

const server = http.createServer(app);

const VERCEL_URL_REGEX = /vercel\.app$/;

const io = new Server(server, {
    cors: {
        origin: [VERCEL_URL_REGEX, "http://localhost:3000", "http://localhost:3001"],
        methods: ['GET', 'POST'],
    },
});

app.get('/', (req, res) => {
    res.send('Socket.IO Server is running');
});

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, playerName }) => {
        console.log(`\n--- Event: join-room ---`);
        console.log(`Received data: roomId='${roomId}', playerName='${playerName}'`);
        console.log('Existing rooms before action:', [...rooms.keys()]);

        let room = getRoom(roomId);
        if (!room) {
            console.log(`Room '${roomId}' not found. Creating a new one.`);
            room = createRoom(roomId);
        } else {
            console.log(`Room '${roomId}' found. Joining existing room.`);
        }

        const { room: updatedRoom, error } = addPlayerToRoom(roomId, { id: socket.id, name: playerName });

        if (error) {
            console.error(`Error adding player to room '${roomId}':`, error);
            return socket.emit('error', { message: error });
        }
        
        console.log(`Successfully updated room '${roomId}'. Current players:`, updatedRoom.players.map(p => p.name));
        console.log(`--- End Event: join-room ---\n`);

        socket.join(roomId);
        socket.emit('room-joined', { room: updatedRoom, playerId: socket.id });
        socket.to(roomId).emit('player-joined', { player: updatedRoom.players[updatedRoom.players.length - 1] });
    });

    socket.on('manual-start-game', ({ roomId }) => {
        const room = getRoom(roomId);
        if (room && room.players.length >= 2) {
            const problem = sampleProblems[Math.floor(Math.random() * sampleProblems.length)];
            room.problem = problem;
            room.code = problem.initialCode;
            room.isGameActive = true;
            room.startTime = new Date();
            room.currentPlayerIndex = 0;
            
            io.to(roomId).emit('game-started');
            
            io.to(roomId).emit('room-updated', { room });
            
            console.log(`Game started for room: ${roomId} with problem: ${problem.title}`);
        }
    });

    socket.on('update-code', ({ roomId, code }) => {
        updateCode(roomId, code);
        socket.to(roomId).emit('code-updated', { code, playerId: socket.id });
    });

    socket.on('turn-complete', ({ roomId }) => {
        const room = nextTurn(roomId);
        if (room) {
            io.to(roomId).emit('turn-changed', {
                currentPlayer: room.players[room.currentPlayerIndex],
                timeRemaining: room.problem.timeLimit,
            });
        }
    });

    socket.on('submit-code', ({ roomId }) => {
        const result = submitGame(roomId);
        if (result) {
            io.to(roomId).emit('game-result', { result });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        const result = removePlayerFromRoom(socket.id);
        if (result && !result.roomDeleted) {
            socket.to(result.roomId).emit('player-left', { playerId: socket.id });
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 