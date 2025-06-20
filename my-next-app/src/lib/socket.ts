import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// モックモードの判定（本番環境でSocket.IOサーバーが利用できない場合）
const isMockMode = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SOCKET_URL;

export const useSocket = () => {
    const socketRef = useRef<any>(null);
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
        // 重複初期化を防ぐ
        if (hasInitialized.current) {
            return;
        }
        hasInitialized.current = true;

        // モックモードの場合
        if (isMockMode) {
            console.log('Running in mock mode - Socket.IO server not available');
            setConnected(true);
            setIsConnecting(false);
            return;
        }

        // Socket.IO接続の初期化
        const { io } = require('socket.io-client');

        setIsConnecting(true);
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        const socket = socketRef.current;

        // 接続イベント
        socket.on('connect', () => {
            console.log('Socket.IO connected');
            setConnected(true);
            setIsConnecting(false);
        });

        socket.on('connect_error', (error: any) => {
            console.error('Socket.IO connection error:', error);
            setConnected(false);
            setIsConnecting(false);
            // 本番環境ではアラートを表示しない
            if (process.env.NODE_ENV === 'development') {
                alert('サーバーに接続できませんでした。サーバーが起動しているか確認してください。');
            }
        });

        socket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
            setConnected(false);
        });

        socket.on('reconnect', () => {
            console.log('Socket.IO reconnected');
            setConnected(true);
            setIsConnecting(false);
        });

        // ゲームイベント
        socket.on('room-joined', (data: any) => {
            console.log('Room joined:', data);
            setRoom(data.room);
            setCurrentPlayerId(data.playerId);
        });

        socket.on('player-joined', (data: any) => {
            console.log('Player joined:', data);
            // ルーム情報を更新
            const { room } = useGameStore.getState();
            if (room) {
                setRoom({
                    ...room,
                    players: [...room.players, data.player]
                });
            }
        });

        socket.on('player-left', (data: any) => {
            console.log('Player left:', data);
            // ルーム情報を更新
            const { room } = useGameStore.getState();
            if (room) {
                setRoom({
                    ...room,
                    players: room.players.filter(p => p.id !== data.playerId)
                });
            }
        });

        socket.on('code-updated', (data: any) => {
            console.log('Code updated:', data);
            updateCodeInStore(data.code);
        });

        socket.on('turn-changed', (data: any) => {
            console.log('Turn changed:', data);
            const { currentPlayerId } = useGameStore.getState();
            setIsMyTurn(data.currentPlayer.id === currentPlayerId);
            setTimeRemaining(data.timeRemaining);
        });

        socket.on('game-result', (data: any) => {
            console.log('Game result:', data);
            setGameResult(data.result);
        });

        socket.on('error', (data: any) => {
            console.error('Socket error:', data);
            if (process.env.NODE_ENV === 'development') {
                alert(`エラー: ${data.message}`);
            }
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
            hasInitialized.current = false;
        };
    }, [setRoom, setCurrentPlayerId, setConnected, setIsMyTurn, setTimeRemaining, updateCodeInStore, setGameResult]);

    const joinRoom = (roomId: string, playerName: string) => {
        // モックモードの場合
        if (isMockMode) {
            console.log('Mock mode: Joining room:', roomId, 'as:', playerName);
            // モックルームを作成
            const mockRoom = {
                id: roomId,
                players: [{
                    id: 'mock-player-1',
                    name: playerName,
                    isCurrentTurn: true,
                    turnOrder: 0
                }],
                currentPlayerIndex: 0,
                code: '// モックモードで動作中\nconsole.log("Hello, World!");',
                isGameActive: true,
                problem: {
                    id: 'mock-problem-1',
                    title: 'モック問題',
                    description: 'これはモックモードです。Socket.IOサーバーが利用できません。',
                    difficulty: 'easy' as const,
                    timeLimit: 60,
                    maxPlayers: 5,
                    testCases: [],
                    initialCode: '// モックモードで動作中\nconsole.log("Hello, World!");'
                },
                turnLog: []
            };
            setRoom(mockRoom);
            setCurrentPlayerId('mock-player-1');
            setIsMyTurn(true);
            setTimeRemaining(60);
            return;
        }

        if (socketRef.current && socketRef.current.connected) {
            console.log('Joining room:', roomId, 'as:', playerName);
            socketRef.current.emit('join-room', { roomId, playerName });
        } else {
            console.error('Socket not connected');
            if (process.env.NODE_ENV === 'development') {
                alert('サーバーに接続されていません。ページを再読み込みしてください。');
            }
        }
    };

    const leaveRoom = (roomId: string, playerId: string) => {
        if (isMockMode) {
            console.log('Mock mode: Leaving room');
            return;
        }

        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('leave-room', { roomId, playerId });
        }
    };

    const updateCode = (roomId: string, code: string) => {
        if (isMockMode) {
            console.log('Mock mode: Updating code');
            updateCodeInStore(code);
            return;
        }

        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('update-code', { roomId, code });
        }
    };

    const submitCode = (roomId: string, code: string) => {
        if (isMockMode) {
            console.log('Mock mode: Submitting code');
            setGameResult({
                isSuccess: true,
                totalTime: 0,
                turnLog: [],
                finalCode: code,
                testResults: []
            });
            return;
        }

        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('submit-code', { roomId, code });
        }
    };

    const completeTurn = (roomId: string, playerId: string) => {
        if (isMockMode) {
            console.log('Mock mode: Completing turn');
            setIsMyTurn(false);
            return;
        }

        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('turn-complete', { roomId, playerId });
        }
    };

    return {
        socket: socketRef.current,
        isConnecting,
        joinRoom,
        leaveRoom,
        updateCode,
        submitCode,
        completeTurn
    };
}; 