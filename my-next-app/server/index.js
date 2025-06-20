const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = createServer(app);

// CORS設定
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// ルーム管理
const rooms = new Map();
// プレイヤー管理（重複参加防止用）
const playerRooms = new Map();

// サンプル問題データ
const sampleProblems = [
    {
        id: 'reverse-string',
        title: '文字列を逆順にする',
        description: '与えられた文字列を逆順にして返す関数を作成してください。',
        difficulty: 'easy',
        timeLimit: 60,
        maxPlayers: 5,
        initialCode: `function reverseString(str) {
  // ここにコードを書いてください
  return str;
}

// テスト用
console.log(reverseString("hello")); // "olleh" が出力されるはず
console.log(reverseString("world")); // "dlrow" が出力されるはず`,
        testCases: [
            { input: 'hello', expectedOutput: 'olleh', description: '基本的な文字列の逆順' },
            { input: 'world', expectedOutput: 'dlrow', description: '別の文字列の逆順' },
            { input: '12345', expectedOutput: '54321', description: '数字の文字列' },
            { input: '', expectedOutput: '', description: '空文字列' }
        ]
    },
    {
        id: 'sum-array',
        title: '配列の合計を計算',
        description: '数値の配列を受け取り、その合計を返す関数を作成してください。',
        difficulty: 'easy',
        timeLimit: 60,
        maxPlayers: 5,
        initialCode: `function sumArray(arr) {
  // ここにコードを書いてください
  return 0;
}

// テスト用
console.log(sumArray([1, 2, 3, 4, 5])); // 15 が出力されるはず
console.log(sumArray([10, 20, 30])); // 60 が出力されるはず`,
        testCases: [
            { input: '[1, 2, 3, 4, 5]', expectedOutput: '15', description: '基本的な配列の合計' },
            { input: '[10, 20, 30]', expectedOutput: '60', description: '別の配列の合計' },
            { input: '[]', expectedOutput: '0', description: '空配列' },
            { input: '[1]', expectedOutput: '1', description: '要素が1つの配列' }
        ]
    }
];

// ランダム問題取得
const getRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * sampleProblems.length);
    return sampleProblems[randomIndex];
};

// ルーム作成
const createRoom = (roomId) => {
    const problem = getRandomProblem();
    const room = {
        id: roomId,
        players: [],
        currentPlayerIndex: 0,
        code: problem.initialCode,
        isGameActive: false,
        problem: problem,
        turnLog: []
    };
    rooms.set(roomId, room);
    console.log(`Room created: ${roomId}`);
    return room;
};

// ルーム取得
const getRoom = (roomId) => {
    return rooms.get(roomId);
};

// プレイヤー追加
const addPlayerToRoom = (roomId, player) => {
    const room = getRoom(roomId);
    if (!room) return null;

    // プレイヤーが既に他のルームに参加しているかチェック
    const existingRoomId = playerRooms.get(player.id);
    if (existingRoomId && existingRoomId !== roomId) {
        console.log(`Player ${player.name} is already in room ${existingRoomId}`);
        return null;
    }

    // プレイヤーが既にこのルームに参加しているかチェック
    const existingPlayer = room.players.find(p => p.id === player.id);
    if (existingPlayer) {
        console.log(`Player ${player.name} is already in this room`);
        return room; // 既に参加している場合は現在のルームを返す
    }

    // 最大プレイヤー数チェック
    if (room.players.length >= room.problem.maxPlayers) {
        return null;
    }

    // プレイヤーを追加
    room.players.push({
        ...player,
        turnOrder: room.players.length,
        isCurrentTurn: room.players.length === 0 // 最初のプレイヤーが現在のターン
    });

    // プレイヤーとルームの関連を記録
    playerRooms.set(player.id, roomId);

    // 最初のプレイヤーが参加したらゲーム開始
    if (room.players.length === 1) {
        room.isGameActive = true;
        room.startTime = new Date();
    }

    console.log(`Player ${player.name} added to room ${roomId}`);
    return room;
};

// プレイヤー削除
const removePlayerFromRoom = (roomId, playerId) => {
    const room = getRoom(roomId);
    if (!room) return null;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return null;

    room.players.splice(playerIndex, 1);

    // プレイヤーとルームの関連を削除
    playerRooms.delete(playerId);

    // プレイヤーが0人になったらルーム削除
    if (room.players.length === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (no players left)`);
        return null;
    }

    // 現在のプレイヤーが抜けた場合、次のプレイヤーに交代
    if (playerIndex === room.currentPlayerIndex) {
        room.currentPlayerIndex = room.currentPlayerIndex % room.players.length;
        room.players[room.currentPlayerIndex].isCurrentTurn = true;
    }

    return room;
};

// 次のプレイヤーに交代
const nextTurn = (roomId) => {
    const room = getRoom(roomId);
    if (!room) return null;

    // 現在のプレイヤーのターンを終了
    if (room.players[room.currentPlayerIndex]) {
        room.players[room.currentPlayerIndex].isCurrentTurn = false;
    }

    // 次のプレイヤーに交代
    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
    room.players[room.currentPlayerIndex].isCurrentTurn = true;

    return room;
};

// Socket.IO接続処理
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // ルーム参加
    socket.on('join-room', (data) => {
        const { roomId, playerName } = data;
        console.log(`Join room request: ${roomId}, player: ${playerName}`);

        // プレイヤー情報
        const player = {
            id: socket.id,
            name: playerName
        };

        // ルームが存在しない場合は作成
        let room = getRoom(roomId);
        if (!room) {
            room = createRoom(roomId);
        }

        // プレイヤーをルームに追加
        const updatedRoom = addPlayerToRoom(roomId, player);
        if (!updatedRoom) {
            socket.emit('error', { message: 'ルームが満員です' });
            return;
        }

        // ルームに参加
        socket.join(roomId);

        // 参加成功を通知
        socket.emit('room-joined', {
            room: updatedRoom,
            playerId: socket.id
        });

        // 他のプレイヤーに参加を通知
        socket.to(roomId).emit('player-joined', {
            player: updatedRoom.players[updatedRoom.players.length - 1]
        });

        console.log(`Player ${playerName} joined room ${roomId}`);
    });

    // ルーム退出
    socket.on('leave-room', (data) => {
        const { roomId, playerId } = data;

        const updatedRoom = removePlayerFromRoom(roomId, playerId);

        socket.leave(roomId);

        if (updatedRoom) {
            // 他のプレイヤーに退出を通知
            socket.to(roomId).emit('player-left', { playerId });
        }
    });

    // コード更新
    socket.on('update-code', (data) => {
        const { roomId, code } = data;
        const room = getRoom(roomId);

        if (room) {
            room.code = code;
            // 全プレイヤーにコード更新を通知
            io.to(roomId).emit('code-updated', {
                code: code,
                playerId: socket.id
            });
        }
    });

    // コード提出
    socket.on('submit-code', (data) => {
        const { roomId, code } = data;
        const room = getRoom(roomId);

        if (room) {
            // ゲーム終了処理
            room.isGameActive = false;
            room.endTime = new Date();

            // 結果を計算
            const totalTime = Math.floor((room.endTime - room.startTime) / 1000);

            const result = {
                isSuccess: true,
                totalTime: totalTime,
                turnLog: room.turnLog,
                finalCode: code,
                testResults: []
            };

            // 全プレイヤーに結果を通知
            io.to(roomId).emit('game-result', { result });
        }
    });

    // ターン完了
    socket.on('turn-complete', (data) => {
        const { roomId, playerId } = data;

        const updatedRoom = nextTurn(roomId);
        if (updatedRoom) {
            // 全プレイヤーにターン変更を通知
            io.to(roomId).emit('turn-changed', {
                currentPlayer: updatedRoom.players[updatedRoom.currentPlayerIndex],
                timeRemaining: updatedRoom.problem.timeLimit
            });
        }
    });

    // 切断処理
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // プレイヤーが参加しているルームを探して退出処理
        for (const [roomId, room] of rooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const updatedRoom = removePlayerFromRoom(roomId, socket.id);
                if (updatedRoom) {
                    socket.to(roomId).emit('player-left', { playerId: socket.id });
                }
                break;
            }
        }
    });
});

// ヘルスチェック
app.get('/health', (req, res) => {
    res.json({ status: 'ok', rooms: rooms.size });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
    console.log(`CORS origin: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
}); 