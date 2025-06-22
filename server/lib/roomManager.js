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
}`,
        testCases: [
            { input: 'hello', expectedOutput: 'olleh' },
            { input: 'world', expectedOutput: 'dlrow' },
            { input: '12345', expectedOutput: '54321' },
            { input: '', expectedOutput: '' }
        ]
    },
    {
        id: 'sum-array',
        title: '配列の合計を求める',
        description: '与えられた配列の要素の合計を返す関数を作成してください。',
        difficulty: 'easy',
        timeLimit: 60,
        maxPlayers: 5,
        initialCode: `function sumArray(arr) {
  // ここにコードを書いてください
  return 0;
}`,
        testCases: [
            { input: [1, 2, 3, 4, 5], expectedOutput: 15 },
            { input: [10, 20, 30], expectedOutput: 60 },
            { input: [0, 0, 0], expectedOutput: 0 },
            { input: [], expectedOutput: 0 }
        ]
    },
    {
        id: 'find-max',
        title: '最大値を求める',
        description: '与えられた配列から最大値を返す関数を作成してください。',
        difficulty: 'easy',
        timeLimit: 60,
        maxPlayers: 5,
        initialCode: `function findMax(arr) {
  // ここにコードを書いてください
  return 0;
}`,
        testCases: [
            { input: [1, 5, 3, 9, 2], expectedOutput: 9 },
            { input: [10, 20, 30], expectedOutput: 30 },
            { input: [-5, -10, -3], expectedOutput: -3 },
            { input: [42], expectedOutput: 42 }
        ]
    }
];

const rooms = new Map();
const playerRooms = new Map();

const getRoom = (roomId) => rooms.get(roomId);

const createRoom = (roomId) => {
    const problem = sampleProblems[Math.floor(Math.random() * sampleProblems.length)];
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

const addPlayerToRoom = (roomId, player) => {
    const room = getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    if (playerRooms.has(player.id)) {
        return { error: 'Player already in a room' };
    }

    if (room.players.length >= room.problem.maxPlayers) {
        return { error: 'Room is full' };
    }

    room.players.push({
        ...player,
        turnOrder: room.players.length,
        isCurrentTurn: room.players.length === 0
    });
    playerRooms.set(player.id, roomId);

    if (room.players.length === 1) {
        room.isGameActive = true;
        room.startTime = new Date();
    }

    return { room };
};

const removePlayerFromRoom = (playerId) => {
    const roomId = playerRooms.get(playerId);
    if (!roomId) return null;

    const room = getRoom(roomId);
    if (!room) return null;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return null;

    room.players.splice(playerIndex, 1);
    playerRooms.delete(playerId);

    if (room.players.length === 0) {
        rooms.delete(roomId);
        console.log(`Room deleted: ${roomId}`);
        return { roomDeleted: true, roomId };
    }

    if (playerIndex === room.currentPlayerIndex) {
        room.currentPlayerIndex = room.currentPlayerIndex % room.players.length;
        if (room.players.length > 0) {
            room.players[room.currentPlayerIndex].isCurrentTurn = true;
        }
    }

    return { room, roomId };
};

const nextTurn = (roomId) => {
    const room = getRoom(roomId);
    if (!room || !room.isGameActive) return null;

    if (room.players.length > 0) {
        room.players[room.currentPlayerIndex].isCurrentTurn = false;
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        room.players[room.currentPlayerIndex].isCurrentTurn = true;
    }

    return room;
};

const updateCode = (roomId, code) => {
    const room = getRoom(roomId);
    if (room) {
        room.code = code;
    }
    return room;
};

const submitGame = (roomId) => {
    const room = getRoom(roomId);
    if (room) {
        room.isGameActive = false;
        room.endTime = new Date();
        const totalTime = Math.floor(((room.endTime - room.startTime) || 0) / 1000);
        return {
            isSuccess: true, // 本来はテスト結果で判定
            totalTime,
            turnLog: room.turnLog,
            finalCode: room.code,
            testResults: []
        };
    }
    return null;
};

module.exports = {
    getRoom,
    createRoom,
    addPlayerToRoom,
    removePlayerFromRoom,
    nextTurn,
    updateCode,
    submitGame,
    sampleProblems,
    rooms,
}; 