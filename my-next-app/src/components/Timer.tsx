import React from 'react';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../lib/utils';

/**
 * サーバーから送られてくる残り時間を表示するだけのコンポーネント。
 * 独自のタイマーロジックは持たない。
 */
const Timer: React.FC = () => {
    // Zustandストアから、現在の部屋の情報と、サーバー管理の残り時間を取得
    const { room, timeRemaining } = useGameStore();

    // 部屋情報がなければ何も表示しない
    if (!room) {
        return null;
    }

    const { problem, isGameActive, players, currentPlayerIndex } = room;

    // 問題データから初期時間を取得
    const initialTime = problem.timeLimit;

    // 残り時間に応じて文字色を変更する
    const getTimeColor = () => {
        if (!isGameActive) return 'text-gray-500';
        if (timeRemaining > initialTime * 0.5) return 'text-green-600';
        if (timeRemaining > initialTime * 0.2) return 'text-yellow-600';
        return 'text-red-600';
    };

    // プログレスバーの進捗率を計算
    const progressPercentage = isGameActive ? ((initialTime - timeRemaining) / initialTime) * 100 : 0;

    // 現在誰のターンかを表示する
    const getCurrentTurnPlayerName = () => {
        if (!isGameActive || !players[currentPlayerIndex]) {
            return "待機中...";
        }
        return `${players[currentPlayerIndex].name}さんのターン`;
    };

    return (
        <div className="w-full text-center p-4">
            <div className="text-lg text-gray-700 mb-3">
                {getCurrentTurnPlayerName()}
            </div>
            
            {/* プログレスバー */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                        progressPercentage > 80 ? 'bg-red-500' : 
                        progressPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
            </div>
            
            <div className={`text-5xl font-bold tracking-wider transition-colors duration-300 ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
            </div>
            
        </div>
    );
};

export default Timer; 