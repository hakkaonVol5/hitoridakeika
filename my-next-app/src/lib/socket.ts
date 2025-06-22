import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Socket, io } from 'socket.io-client';
import type { GameResult, Player, Room } from '@/types/game';

// Socket.IOサーバーのURL（Renderでデプロイしたサーバーを指す）
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
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
        if (hasInitialized.current || !SOCKET_URL) return;
        hasInitialized.current = true;
        setIsConnecting(true);

        // Renderサーバーに直接接続
        socketRef.current = io(SOCKET_URL, {
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

        socket.on('room-joined', (data: { room: Room; playerId: string }) => {
            console.log('Event[room-joined] received:', data);
            setRoom(data.room);
            setCurrentPlayerId(data.playerId);
        });

        socket.on('room-updated', (room: any) => {
            console.log('Event[room-updated] received:', room);
            setRoom(room);
        });

        socket.on('player-joined', (data: { player: Player }) => {
            const { room } = useGameStore.getState();
            if (room) {
                setRoom({ ...room, players: [...room.players, data.player] });
            }
        });

        socket.on('player-left', (data: { playerId: string }) => {
            const { room } = useGameStore.getState();
            if (room) {
                setRoom({ ...room, players: room.players.filter((p) => p.id !== data.playerId) });
            }
        });

        socket.on('code-updated', (data: { code: string }) => {
            updateCodeInStore(data.code);
        });

        socket.on('turn-changed', (data: { currentPlayer: Player; timeRemaining?: number }) => {
            console.log('Event[turn-changed] received:', data);
            const { currentPlayerId } = useGameStore.getState();
            setIsMyTurn(data.currentPlayer.id === currentPlayerId);
            if (data.timeRemaining !== undefined) {
                setTimeRemaining(data.timeRemaining);
            }
        });

        socket.on('timer-tick', (data: { timeRemaining: number }) => {
            // このログは頻繁に出るので、開発中に必要ならコメントを外す
            // console.log('[Socket] Received timer-tick:', data.timeRemaining);
            setTimeRemaining(data.timeRemaining);
        });

        socket.on('game-result', (data: { result: GameResult }) => {
            setGameResult(data.result);
        });

        socket.on('error', (data: { message: string }) => {
            console.error('Socket error from server:', data.message);
            alert(`サーバーエラー: ${data.message}`);
        });

        // クリーンアップ関数
        return () => {
            console.log('Disconnecting socket...');
            socket.disconnect();
            hasInitialized.current = false;
        };
    }, [setConnected, setCurrentPlayerId, setGameResult, setIsMyTurn, setRoom, setTimeRemaining, updateCodeInStore]);

    // ===== 送信アクション =====

    const joinRoom = (roomId: string, playerName: string) => {
        socketRef.current?.emit('join-room', { roomId, playerName });
    };

    const leaveRoom = (roomId: string, playerId: string) => {
        socketRef.current?.emit('leave-room', { roomId, playerId });
    };

    const updateCode = (roomId: string, code: string) => {
        socketRef.current?.emit('update-code', { roomId, code });
    };

    const submitCode = (roomId: string, code: string) => {
        socketRef.current?.emit('submit-code', { roomId, code });
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