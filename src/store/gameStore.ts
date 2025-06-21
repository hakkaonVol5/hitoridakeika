import { create } from 'zustand';
import { Room, GameResult } from '../types/game';

interface GameState {
    // 接続状態
    isConnected: boolean;
    timeRemaining: number;
    
    // ルーム情報
    room: Room | null;
    currentPlayerId: string | null;
    isMyTurn: boolean; // isMyTurnを直接のプロパティとして保持
    
    // ゲーム結果
    gameResult: GameResult | null;
    
    // アクション
    setConnected: (connected: boolean) => void;
    setTimeRemaining: (time: number) => void;
    setRoom: (room: Room | null) => void;
    setCurrentPlayerId: (playerId: string | null) => void;
    setIsMyTurn: (isMyTurn: boolean) => void; // isMyTurnを更新するアクション
    updateCode: (code: string) => void;
    setGameResult: (result: GameResult | null) => void;
    reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    // 初期状態
    isConnected: false,
    timeRemaining: 0,
    room: null,
    currentPlayerId: null,
    isMyTurn: false, // isMyTurnの初期値
    gameResult: null,

    // アクション
    setConnected: (connected) => set({ isConnected: connected }),
    setTimeRemaining: (time) => set({ timeRemaining: time }),
    setRoom: (room) => {
        const { currentPlayerId } = get();
        if (room && currentPlayerId) {
            const currentPlayerInRoom = room.players[room.currentPlayerIndex];
            set({ room, isMyTurn: currentPlayerInRoom?.id === currentPlayerId });
        } else {
            set({ room, isMyTurn: false });
        }
    },
    setCurrentPlayerId: (playerId) => {
        const { room } = get();
        if (room && playerId) {
            const currentPlayerInRoom = room.players[room.currentPlayerIndex];
            set({ currentPlayerId: playerId, isMyTurn: currentPlayerInRoom?.id === playerId });
        } else {
            set({ currentPlayerId: playerId, isMyTurn: false });
        }
    },
    setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
    updateCode: (code) => {
        const { room } = get();
        if (room) {
            set({ room: { ...room, code } });
        }
    },
    setGameResult: (result) => set({ gameResult: result }),
    reset: () => set({
        isConnected: false,
        timeRemaining: 0,
        room: null,
        currentPlayerId: null,
        isMyTurn: false,
        gameResult: null
    })
})); 