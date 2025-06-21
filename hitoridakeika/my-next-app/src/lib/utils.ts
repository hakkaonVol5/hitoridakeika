export const getDifficultyLabel = (difficulty: 'easy' | 'medium' | 'hard'): string => {
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

export const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard'): string => {
    switch (difficulty) {
        case 'easy':
            return 'bg-green-100 text-green-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'hard':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const generateRoomId = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}; 