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

        console.log('Socket initialization started');
        console.log('Socket URL:', SOCKET_URL);
        console.log('Mock mode:', isMockMode);

        // モックモードの場合
        if (isMockMode) {
            console.log('Running in mock mode - Socket.IO server not available');
            setConnected(true);
            setIsConnecting(false);
            return;
        }

        // Socket.IO接続の初期化
        try {
            const { io } = require('socket.io-client');

            setIsConnecting(true);
            console.log('Attempting to connect to Socket.IO server...');
            
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
                console.log('Socket.IO connected successfully');
                setConnected(true);
                setIsConnecting(false);
            });

            socket.on('connect_error', (error: any) => {
                console.error('Socket.IO connection error:', error);
                console.error('Error details:', {
                    message: error.message,
                    description: error.description,
                    context: error.context
                });
                setConnected(false);
                setIsConnecting(false);
                
                // 開発環境ではアラートを表示
                if (process.env.NODE_ENV === 'development') {
                    alert(`サーバーに接続できませんでした。\nエラー: ${error.message}\n\nサーバーが起動しているか確認してください。\nURL: ${SOCKET_URL}`);
                }
            });

            socket.on('disconnect', (reason: string) => {
                console.log('Socket.IO disconnected:', reason);
                setConnected(false);
            });

            socket.on('reconnect', (attemptNumber: number) => {
                console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
                setConnected(true);
                setIsConnecting(false);
            });

            socket.on('reconnect_error', (error: any) => {
                console.error('Socket.IO reconnection error:', error);
            });

            socket.on('reconnect_failed', () => {
                console.error('Socket.IO reconnection failed');
                setConnected(false);
                setIsConnecting(false);
            });

            // ゲームイベント
            socket.on('room-joined', (data: any) => {
                console.log('Room joined:', data);
                setRoom(data.room);
                setCurrentPlayerId(data.playerId);
            });

            socket.on('room-updated', (room: any) => {
                console.log('Room updated from server:', room);
                setRoom(room);
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

        } catch (error) {
            console.error('Failed to initialize Socket.IO:', error);
            setConnected(false);
            setIsConnecting(false);
            
            if (process.env.NODE_ENV === 'development') {
                alert('Socket.IOの初期化に失敗しました。socket.io-clientがインストールされているか確認してください。');
            }
        }

        return () => {
            if (socketRef.current) {
                console.log('Cleaning up Socket.IO connection');
                socketRef.current.disconnect();
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