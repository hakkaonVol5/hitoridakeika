// my-next-app/src/lib/roomManager.js
import { sampleProblems } from "@/data/problems";

// サンプル問題データ（変更なし）
// const sampleProblems = [
//     {
//         id: 'sum-array',
//         title: '配列の合計を計算',
//         description: '数値の配列を受け取り、その合計を返す関数を作成してください。',
//         difficulty: 'easy',
//         timeLimit: 60,
//         maxPlayers: 5,
//         initialCode: `function sumArray(arr) {
//   // ここにコードを書いてください
//   // ※注意※
//   // sumArrayが自動的に実行されるので消さないようにしてください。
//   // sumArrayの引数arrが与えられる配列です。
//   // sumArray関数の中を書き換えるだけでOKです。外から呼び出す必要はありません。
//   return 0;
// }
// `,
//         testCases: [
//             {
//                 input: '[1, 2, 3, 4, 5]',
//                 expectedOutput: '15',
//                 description: '基本的な配列の合計'
//             },
//             {
//                 input: '[10, 20, 30]',
//                 expectedOutput: '60',
//                 description: '別の配列の合計'
//             },
//             {
//                 input: '[1.6, 2]',
//                 expectedOutput: '3.6',
//                 description: '小数'
//             },
//             {
//                 input: '[1]',
//                 expectedOutput: '1',
//                 description: '要素が1つの配列'
//             }
//         ],
//         nonVisibleTestCases: [
//             {
//                 input: '[100, 200, 300, 400]',
//                 expectedOutput: '1000'
//             },
//             {
//                 input: '[-1, -2, -3]',
//                 expectedOutput: '-6'
//             },
//             {
//                 input: '[0, 0, 0, 0]',
//                 expectedOutput: '0'
//             },
//             {
//                 input: '[5, -5]',
//                 expectedOutput: '0'
//             },
//             {
//                 input: '[1.5, 2.5, 3.0]', // 小数点のテストケースも追加
//                 expectedOutput: '7'
//             }
//         ]
//     },
// ];



const rooms = new Map();
const playerRooms = new Map();

export const getRoom = (roomId) => rooms.get(roomId);

export const createRoom = (roomId) => {
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

export const addPlayerToRoom = (roomId, player) => {
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

export const removePlayerFromRoom = (playerId) => {
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

export const nextTurn = (roomId) => {
    const room = getRoom(roomId);
    if (!room || !room.isGameActive) return null;

    if (room.players.length > 0) {
        room.players[room.currentPlayerIndex].isCurrentTurn = false;
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        room.players[room.currentPlayerIndex].isCurrentTurn = true;
    }

    return room;
};

export const updateCode = (roomId, code) => {
    const room = getRoom(roomId);
    if (room) {
        room.code = code;
    }
    return room;
};

export const submitGame = (roomId, submittedCode, isSuccess) => {
    console.log("いすさくせす"+isSuccess)
    const room = getRoom(roomId);
    if (room) {
        room.isGameActive = false;
        room.endTime = new Date();
        const totalTime = Math.floor(((room.endTime - room.startTime) || 0) / 1000);
        return {
            isSuccess: isSuccess,
            totalTime,
            turnLog: room.turnLog,
            finalCode: room.code,
            testResults: []
        };
    }
    return null;
}; 