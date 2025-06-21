import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import io from 'socket.io-client';
import type { GameResult, Player, Room } from '@/types/game';

// App Routerでは同じポート（3000）でSocket.IOサーバーを動作させる
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

// モックモードの判定（本番環境でSocket.IOサーバーが利用できない場合）
const isMockMode = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SOCKET_URL;

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

        const initSocket = async () => {
            setIsConnecting(true);
            try {
                // サーバー側のSocket.IOを初期化するためにAPIルートを叩く
                await fetch('/api/socket');

                // クライアント側でSocket.IOに接続
                // URLを省略し、pathを正しく指定する
                socketRef.current = io({
                    path: '/api/socket',
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
                    setRoom(data.room);
                    setCurrentPlayerId(data.playerId);
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

            } catch (error) {
                console.error('Failed to initialize socket:', error);
                setConnected(false);
                setIsConnecting(false);
            }
        };

        initSocket();

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