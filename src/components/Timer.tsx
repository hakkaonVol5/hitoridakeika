import React from 'react';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../lib/utils';

const Timer: React.FC = () => {
    const { room, timeRemaining } = useGameStore();

    if (!room) {
        return null;
    }

    const { problem, isGameActive, players, currentPlayerIndex } = room;
    const initialTime = problem.timeLimit;

    const getTimeColor = () => {
        if (!isGameActive) return 'text-gray-500';
        if (timeRemaining > initialTime * 0.5) return 'text-green-600';
        if (timeRemaining > initialTime * 0.2) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getCurrentTurnPlayerName = () => {
        if (!isGameActive || !players[currentPlayerIndex]) {
            return "待機中...";
        }
        return `${players[currentPlayerIndex].name}さんのターン`;
    };

    return (
        <div className="text-center">
            <div className="text-lg text-gray-800 mb-2">
                {getCurrentTurnPlayerName()}
            </div>
            <div className={`text-5xl font-bold tracking-wider ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
            </div>
        </div>
    );
};

export default Timer; 