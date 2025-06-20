import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../lib/utils';

interface TimerProps {
    initialTime: number; // 秒
    onTimeUp: () => void;
    isActive: boolean;
}

export default function Timer({ initialTime, onTimeUp, isActive }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const { timeRemaining, setTimeRemaining } = useGameStore();

    // ストアの時間と同期（レンダリング中ではなくuseEffectで）
    useEffect(() => {
        if (timeRemaining > 0 && timeRemaining !== timeLeft) {
            setTimeLeft(timeRemaining);
        }
    }, [timeRemaining]);

    // 初期時間が変更された場合の処理
    useEffect(() => {
        setTimeLeft(initialTime);
    }, [initialTime]);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) {
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                const newTime = prev - 1;

                // setTimeRemainingはuseEffectの外で呼び出す
                if (newTime <= 0) {
                    // タイマー終了時の処理を次のレンダリングサイクルで実行
                    setTimeout(() => {
                        onTimeUp();
                    }, 0);
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeLeft, onTimeUp]);

    // 時間が変更された時にストアを更新
    useEffect(() => {
        if (timeLeft !== timeRemaining) {
            setTimeRemaining(timeLeft);
        }
    }, [timeLeft, timeRemaining, setTimeRemaining]);

    // 時間が少なくなった時の警告色
    const getTimerColor = () => {
        if (timeLeft <= 3) return 'text-red-600';
        if (timeLeft <= 10) return 'text-yellow-600';
        return 'text-gray-800';
    };

    // プログレスバーの計算
    const progressPercentage = ((initialTime - timeLeft) / initialTime) * 100;

    return (
        <div className="flex items-center space-x-4">
            {/* タイマー表示 */}
            <div className="flex items-center space-x-2">
                <div className={`text-2xl font-bold ${getTimerColor()}`}>
                    {formatTime(timeLeft)}
                </div>
                {timeLeft <= 10 && (
                    <div className="text-red-500 animate-pulse">
                        ⚠️
                    </div>
                )}
            </div>

            {/* プログレスバー */}
            <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-1000 ${timeLeft <= 3 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* 状態表示 */}
            <div className="text-sm text-gray-600">
                {isActive ? '⏰ 進行中' : '⏸️ 停止中'}
            </div>
        </div>
    );
} 