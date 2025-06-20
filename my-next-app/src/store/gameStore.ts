import { create } from 'zustand';
import { Room, Player, GameResult } from '../types/game';

interface GameState {
    // ルーム情報
    room: Room | null;
    currentPlayerId: string | null;

    // ゲーム状態
    isConnected: boolean;
    isMyTurn: boolean;
    timeRemaining: number;

    // 結果
    gameResult: GameResult | null;

    // アクション
    setRoom: (room: Room) => void;
    setCurrentPlayerId: (playerId: string) => void;
    setConnected: (connected: boolean) => void;
    setIsMyTurn: (isMyTurn: boolean) => void;
    setTimeRemaining: (time: number) => void;
    updateCode: (code: string) => void;
    setGameResult: (result: GameResult) => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    // 初期状態
    room: null,
    currentPlayerId: null,
    isConnected: false,
    isMyTurn: false,
    timeRemaining: 0,
    gameResult: null,

    // アクション
    setRoom: (room: Room) => set({ room }),

    setCurrentPlayerId: (playerId: string) => {
        set({ currentPlayerId: playerId });
        const { room } = get();
        if (room) {
            const isMyTurn = room.players[room.currentPlayerIndex]?.id === playerId;
            set({ isMyTurn });
        }
    },

    setConnected: (connected: boolean) => set({ isConnected: connected }),

    setIsMyTurn: (isMyTurn: boolean) => set({ isMyTurn }),

    setTimeRemaining: (time: number) => {
        // 時間が実際に変更された場合のみ更新
        const currentTime = get().timeRemaining;
        if (currentTime !== time) {
            set({ timeRemaining: time });
        }
    },

    updateCode: (code: string) => {
        const { room } = get();
        if (room && room.code !== code) {
            set({
                room: {
                    ...room,
                    code
                }
            });
        }
    },

    setGameResult: (result: GameResult) => set({ gameResult: result }),

    resetGame: () => set({
        room: null,
        currentPlayerId: null,
        isConnected: false,
        isMyTurn: false,
        timeRemaining: 0,
        gameResult: null
    })
})); 