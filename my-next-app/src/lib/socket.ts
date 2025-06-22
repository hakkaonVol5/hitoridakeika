import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import io from 'socket.io-client';
import type { GameResult, Player, Room } from '@/types/game';

// 接続先のサーバーURLを環境変数から取得。なければRenderの本番URLをデフォルトにする
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://hitoridakeika.onrender.com';

export const useSocket = () => {
    // @ts-ignore
    const socketRef = useRef<import('socket.io-client').Socket | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const hasInitialized = useRef(false);
    const {
        setRoom,
        setCurrentPlayerId,
        setConnected,
        setIsMyTurn,
        setTimeRemaining,
        updateCode: updateCodeInStore,
        setGameResult
    } = useGameStore();

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setIsConnecting(true);

        // 外部サーバーに正しく接続する
        socketRef.current = io(SOCKET_SERVER_URL, {
            path: '/api/socket',
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket']
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            setConnected(true);
            setIsConnecting(false);
        });

        socket.on('connect_error', (error: Error) => {
            console.error('❌ Socket.IO connection error:', error);
            setConnected(false);
            setIsConnecting(false);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        // サーバーからの'updateRoom'イベントを正しく受け取る
        socket.on('updateRoom', (data: Room) => {
            setRoom(data);
            const { currentPlayerId } = useGameStore.getState();
            if (!currentPlayerId && data.players.length > 0) {
                const myPlayer = data.players.find(p => p.id === socket.id);
                if (myPlayer) {
                    setCurrentPlayerId(myPlayer.id);
                }
            }
        });

        socket.on('code-updated', (data: { code: string }) => {
            updateCodeInStore(data.code);
        });

        socket.on('turn-changed', (data: { currentPlayer: Player; timeRemaining: number }) => {
            const { currentPlayerId } = useGameStore.getState();
            if (currentPlayerId) {
                setIsMyTurn(data.currentPlayer.id === currentPlayerId);
            }
            setTimeRemaining(data.timeRemaining);
        });

        socket.on('game-result', (data: { result: GameResult }) => {
            setGameResult(data.result);
        });

        socket.on('error', (data: { message: string }) => {
            alert(`エラー: ${data.message}`);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            hasInitialized.current = false;
        };
    }, [setRoom, setCurrentPlayerId, setConnected, setIsMyTurn, setTimeRemaining, updateCodeInStore, setGameResult]);

    const joinRoom = (roomId: string, playerName: string) => {
        socketRef.current?.emit('join-room', { roomId, playerName });
    };

    const leaveRoom = (roomId: string, playerId: string) => {
        socketRef.current?.emit('leave-room', { roomId, playerId });
    };

    const updateCode = (roomId: string, code: string) => {
        socketRef.current?.emit('update-code', { roomId, code });
    };

    const submitCode = (roomId: string, code: string, isSuccess: boolean) => {
        socketRef.current?.emit('submit-code', { roomId, code, isSuccess });
    };

    const completeTurn = (roomId: string, playerId: string) => {
        socketRef.current?.emit('turn-complete', { roomId, playerId });
    };

    return {
        socket: socketRef.current,
        isConnecting,
        joinRoom,
        leaveRoom,
        updateCode,
        submitCode,
        completeTurn,
    };
}; 