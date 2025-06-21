import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { io, Socket } from 'socket.io-client';
import type { GameResult, Player, Room } from '@/types/game';

// 接続先サーバーのURLを明示的に指定
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// モックモードの判定（本番環境でSocket.IOサーバーが利用できない場合）
const isMockMode = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SOCKET_URL;

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
        if (hasInitialized.current) {
            return;
        }
        hasInitialized.current = true;

        console.log(`Connecting to Socket.IO server at ${SOCKET_URL}`);
        setIsConnecting(true);

        // 外部サーバーに接続
        const socket = io(SOCKET_URL, {
            reconnectionAttempts: 5,
            timeout: 10000,
        });

        socketRef.current = socket;

        // ===== イベントリスナー =====

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            setConnected(true);
            setIsConnecting(false);
        });

        socket.on('connect_error', (error: Error) => {
            console.error('❌ Socket.IO connection error:', error.message);
            // 開発環境で接続失敗のアラートを表示
            if (process.env.NODE_ENV === 'development') {
                alert(`サーバー(${SOCKET_URL})への接続に失敗しました。\nサーバーが起動しているか確認してください。`);
            }
            setConnected(false);
            setIsConnecting(false);
        });

        socket.on('disconnect', (reason: string) => {
            console.log('Socket disconnected:', reason);
            setConnected(false);
        });

        socket.on('room-joined', (data: { room: any; playerId: string }) => {
            console.log('Event[room-joined] received:', data);
            setRoom(data.room);
            setCurrentPlayerId(data.playerId);
        });

        socket.on('room-updated', (room: any) => {
            console.log('Event[room-updated] received:', room);
            setRoom(room);
        });
        
        socket.on('timer-tick', (data: { timeRemaining: number }) => {
            // このログは頻繁に出るので、開発中に必要ならコメントを外す
            // console.log('[Socket] Received timer-tick:', data.timeRemaining);
            setTimeRemaining(data.timeRemaining);
        });

        socket.on('code-updated', (data: { code: string }) => {
            updateCodeInStore(data.code);
        });

        socket.on('turn-changed', (data: { currentPlayer: any }) => {
            console.log('Event[turn-changed] received:', data);
            const { currentPlayerId } = useGameStore.getState();
            setIsMyTurn(data.currentPlayer.id === currentPlayerId);
        });

        socket.on('game-result', (data: { result: any }) => {
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