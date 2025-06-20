import { Player } from '../types/game';

interface PlayerListProps {
    players: Player[];
    currentPlayerId: string | null;
}

export default function PlayerList({ players, currentPlayerId }: PlayerListProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                プレイヤー ({players.length}/5)
            </h3>

            <div className="space-y-2">
                {players.map((player, index) => (
                    <div
                        key={`${player.id}-${player.turnOrder}`}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${player.isCurrentTurn
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            {/* 順番表示 */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${player.isCurrentTurn
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                                }`}>
                                {index + 1}
                            </div>

                            {/* プレイヤー名 */}
                            <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-800">
                                    {player.name}
                                </span>
                                {player.id === currentPlayerId && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        あなた
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 現在のターン表示 */}
                        {player.isCurrentTurn && (
                            <div className="flex items-center space-x-1 text-blue-600">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">編集中</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 空のスロット表示 */}
            {players.length < 5 && (
                <div className="mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <div className="text-gray-500 text-sm">
                        プレイヤー待機中... ({5 - players.length}人分空き)
                    </div>
                </div>
            )}
        </div>
    );
} 