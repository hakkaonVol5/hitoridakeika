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

// サンプル問題データ
// ... existing code ...
// ... existing code ...
    // 最初のプレイヤーが参加したらゲーム開始
    if (room.players.length === 1) {
        room.isGameActive = true;
        room.startTime = new Date();
        startTurnTimer(roomId); // 最初のタイマーを開始
    }

    console.log(`Player ${player.name} added to room ${roomId}`);
// ... existing code ...
const removePlayerFromRoom = (roomId, playerId) => {
    const room = getRoom(roomId);
    if (!room) return null;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return null;

    const wasCurrentPlayer = playerIndex === room.currentPlayerIndex;

    room.players.splice(playerIndex, 1);
    playerRooms.delete(playerId);

    // プレイヤーが0人になったらルーム削除
    if (room.players.length === 0) {
        stopTurnTimer(roomId); // タイマーを停止
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (no players left)`);
        return null;
    }

    // 現在のプレイヤーが抜けた場合、次のプレイヤーに交代
    if (wasCurrentPlayer) {
        room.currentPlayerIndex %= room.players.length;
        room.players[room.currentPlayerIndex].isCurrentTurn = true;
        startTurnTimer(roomId); // 次のプレイヤーのタイマーを開始
    }

    return room;
};

// ... existing code ...
// ... existing code ...
        if (room) {
            stopTurnTimer(roomId); // ゲーム終了時にタイマーを停止
            // ゲーム終了処理
            room.isGameActive = false;
            room.endTime = new Date();
// ... existing code ...
// ... existing code ...
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
// ... existing code ...
// ... existing code ...
        for (const [roomId, room] of rooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const updatedRoom = removePlayerFromRoom(roomId, socket.id);
                if (updatedRoom) {
                    socket.to(roomId).emit('player-left', { playerId: socket.id });
                    io.to(roomId).emit('room-updated', updatedRoom);
                } else {
                    // ルームが削除された場合
                    stopTurnTimer(roomId);
                }
                break;
            }
        }
    });
});
// ... existing code ... 