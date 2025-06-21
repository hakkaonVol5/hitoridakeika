import React, { useState, useEffect } from 'react';
import { formatTime } from '../lib/utils';

interface TimerProps {
    initialTime: number;
    onTimeUp: () => void;
    isActive: boolean;
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeUp, isActive }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (!isActive) {
            setTimeLeft(initialTime);
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, initialTime, onTimeUp]);

    // 残り時間に応じて色を変更
    const getTimeColor = () => {
        if (timeLeft > initialTime * 0.6) return 'text-green-600';
        if (timeLeft > initialTime * 0.3) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="text-center">
            <div className={`text-4xl font-bold ${getTimeColor()}`}>
                {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
                {isActive ? 'タイマー実行中' : '待機中'}
            </div>
        </div>
    );
};

export default Timer; 