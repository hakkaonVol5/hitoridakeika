socket.on('room-updated', (room: any) => {
    console.log('Room updated from server:', room);
    setRoom(room);
});

socket.on('timer-tick', (data: { timeRemaining: number }) => {
    console.log('[Socket] Received timer-tick:', data.timeRemaining);
    setTimeRemaining(data.timeRemaining);
});

socket.on('code-updated', (data: any) => {
    console.log('Code updated:', data);
    updateCodeInStore(data.code);
});

socket.on('turn-changed', (data: any) => {
    console.log('Turn changed:', data);
    const { currentPlayerId } = useGameStore.getState();
    setIsMyTurn(data.currentPlayer.id === currentPlayerId);
    // ここでの時間設定は不要になったので削除
});

socket.on('game-result', (data: any) => {
    console.log('Game result:', data);
    // ... existing code ...
}); 