import { create } from 'zustand';
import { Room, GameResult } from '../types/game';

interface GameState {
    // 接続状態
    isConnected: boolean;
    isMyTurn: boolean;
    timeRemaining: number;
    
    // ルーム情報
    room: Room | null;
    currentPlayerId: string | null;
    
    // ゲーム結果
    gameResult: GameResult | null;
    
    // アクション
    setConnected: (connected: boolean) => void;
    setIsMyTurn: (isMyTurn: boolean) => void;
    setTimeRemaining: (time: number) => void;
    setRoom: (room: Room | null) => void;
    setCurrentPlayerId: (playerId: string | null) => void;
    updateCode: (code: string) => void;
    setGameResult: (result: GameResult | null) => void;
    reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    // 初期状態
    isConnected: false,
    isMyTurn: false,
    timeRemaining: 0,
    room: null,
    currentPlayerId: null,
    gameResult: null,

    // アクション
    setConnected: (connected) => set({ isConnected: connected }),
    setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
    setTimeRemaining: (time) => set({ timeRemaining: time }),
    setRoom: (room) => set({ room }),
    setCurrentPlayerId: (playerId) => set({ currentPlayerId: playerId }),
    updateCode: (code) => {
        const { room } = get();
        if (room) {
            set({ room: { ...room, code } });
        }
    },
    setGameResult: (result) => set({ gameResult: result }),
    reset: () => set({
        isConnected: false,
        isMyTurn: false,
        timeRemaining: 0,
        room: null,
        currentPlayerId: null,
        gameResult: null
    })
})); 