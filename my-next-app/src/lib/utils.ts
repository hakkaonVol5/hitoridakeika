// ルームID生成
export const generateRoomId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// 時間フォーマット
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// プレイヤー名の検証
export const validatePlayerName = (name: string): { isValid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
        return { isValid: false, error: 'プレイヤー名を入力してください' };
    }

    if (name.length > 20) {
        return { isValid: false, error: 'プレイヤー名は20文字以内で入力してください' };
    }

    if (!/^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/.test(name)) {
        return { isValid: false, error: 'プレイヤー名に使用できない文字が含まれています' };
    }

    return { isValid: true };
};

// ルームIDの検証
export const validateRoomId = (roomId: string): { isValid: boolean; error?: string } => {
    if (!roomId || roomId.trim().length === 0) {
        return { isValid: false, error: 'ルームIDを入力してください' };
    }

    if (!/^[A-Z0-9]{6}$/.test(roomId)) {
        return { isValid: false, error: 'ルームIDは6文字の英数字で入力してください' };
    }

    return { isValid: true };
};

// 難易度の日本語表示
export const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
        case 'easy':
            return '初級';
        case 'medium':
            return '中級';
        case 'hard':
            return '上級';
        default:
            return '不明';
    }
};

// 難易度の色
export const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
        case 'easy':
            return 'text-green-600 bg-green-100';
        case 'medium':
            return 'text-yellow-600 bg-yellow-100';
        case 'hard':
            return 'text-red-600 bg-red-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
}; 