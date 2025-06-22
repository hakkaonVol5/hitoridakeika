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
} = require('./lib/roomManager');

const app = express();
app.use(cors());

const server = http.createServer(app);

const VERCEL_URL_REGEX = /vercel\.app$/;

const io = new Server(server, {
    cors: {
        origin: [VERCEL_URL_REGEX, "http://localhost:3000"],
        methods: ['GET', 'POST'],
    },
});

// プレイヤー管理（重複参加防止用）
const playerRooms = new Map();
const roomTimers = new Map(); // 各部屋のタイマーを管理

// タイマーを停止するヘルパー関数
const stopTurnTimer = (roomId) => {
    if (roomTimers.has(roomId)) {
        clearInterval(roomTimers.get(roomId));
        roomTimers.delete(roomId);
    }
};

// サーバー側でタイマーを開始/管理する関数
const startTurnTimer = (roomId) => {
    stopTurnTimer(roomId); // 古いタイマーが残っていれば停止

    const room = getRoom(roomId);
    if (!room || !room.isGameActive) {
        console.log(`[Timer] Room ${roomId} not active. Timer not started.`);
        return;
    }

    console.log(`[Timer] Starting timer for room ${roomId} with ${room.problem.timeLimit} seconds.`);
    let timeRemaining = room.problem.timeLimit;

    const timerId = setInterval(() => {
        // 部屋の全員に残り時間を送信
        io.to(roomId).emit('timer-tick', { timeRemaining });
        console.log(`[Timer] Tick for room ${roomId}: ${timeRemaining}s left.`);

        if (timeRemaining <= 0) {
            // 時間切れの場合、次のターンへ
            console.log(`[Timer] Time's up for room ${roomId}. Switching turns.`);
            stopTurnTimer(roomId);
            const updatedRoom = nextTurn(roomId);
            if (updatedRoom) {
                io.to(roomId).emit('room-updated', updatedRoom);
                io.to(roomId).emit('turn-changed', {
                    currentPlayer: updatedRoom.players[updatedRoom.currentPlayerIndex],
                });
                startTurnTimer(roomId); // 次のプレイヤーのタイマーを開始
            }
        } else {
            timeRemaining--;
        }
    }, 1000);

    roomTimers.set(roomId, timerId);
};

app.get('/', (req, res) => {
    res.send('Socket.IO Server is running');
});

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, playerName }) => {
        let room = getRoom(roomId);
        if (!room) {
            room = createRoom(roomId);
        }

        const { room: updatedRoom, error } = addPlayerToRoom(roomId, { id: socket.id, name: playerName });

        if (error) {
            return socket.emit('error', { message: error });
        }

        // プレイヤーとルームの関連付けを保存
        playerRooms.set(socket.id, roomId);

        socket.join(roomId);
        socket.emit('room-joined', { room: updatedRoom, playerId: socket.id });
        socket.to(roomId).emit('player-joined', { player: updatedRoom.players[updatedRoom.players.length - 1] });

        // 最初のプレイヤーが参加したらゲーム開始
        if (updatedRoom.players.length === 1) {
            updatedRoom.isGameActive = true;
            updatedRoom.startTime = new Date();
            startTurnTimer(roomId); // 最初のタイマーを開始
        }

        console.log(`Player ${playerName} added to room ${roomId}`);
    });

    socket.on('update-code', ({ roomId, code }) => {
        updateCode(roomId, code);
        socket.to(roomId).emit('code-updated', { code });
    });

    socket.on('submit-code', ({ roomId, code }) => {
        const result = submitGame(roomId, code);
        if (result.success) {
            stopTurnTimer(roomId); // ゲーム終了時にタイマーを停止
            io.to(roomId).emit('game-result', { result: result.result });
        } else {
            socket.emit('error', { message: result.error });
        }
    });

    // ターン完了
    socket.on('turn-complete', (data) => {
        const { roomId, playerId } = data;
        const room = getRoom(roomId);

        // 現在のプレイヤーからのリクエストか検証
        if (!room || !room.players[room.currentPlayerIndex] || room.players[room.currentPlayerIndex].id !== playerId) {
            return;
        }

        stopTurnTimer(roomId); // 現在のタイマーを停止
        const updatedRoom = nextTurn(roomId);
        if (updatedRoom) {
            io.to(roomId).emit('room-updated', updatedRoom);
            io.to(roomId).emit('turn-changed', {
                currentPlayer: updatedRoom.players[updatedRoom.currentPlayerIndex],
            });
            startTurnTimer(roomId); // 次のプレイヤーのタイマーを開始
        }
    });

    // 切断処理
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        // プレイヤーが参加していたルームから削除
        const roomId = playerRooms.get(socket.id);
        if (roomId) {
            const room = getRoom(roomId);
            if (room) {
                const playerIndex = room.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    const wasCurrentPlayer = playerIndex === room.currentPlayerIndex;
                    const updatedRoom = removePlayerFromRoom(roomId, socket.id);
                    
                    if (updatedRoom) {
                        socket.to(roomId).emit('player-left', { playerId: socket.id });
                        io.to(roomId).emit('room-updated', updatedRoom);
                        
                        // 現在のプレイヤーが抜けた場合、次のプレイヤーに交代
                        if (wasCurrentPlayer) {
                            startTurnTimer(roomId); // 次のプレイヤーのタイマーを開始
                        }
                    } else {
                        // ルームが削除された場合
                        stopTurnTimer(roomId);
                    }
                }
            }
            playerRooms.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
