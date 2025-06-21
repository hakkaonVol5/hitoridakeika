import React from 'react';
import { Player } from '../types/game';

interface PlayerListProps {
    players: Player[];
    currentPlayerId: string | null;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentPlayerId }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                プレイヤー ({players.length})
            </h3>
            
            <div className="space-y-3">
                {players.map((player, index) => (
                    <div
                        key={player.id}
                        className={`
                            flex items-center justify-between p-3 rounded-lg border
                            ${player.id === currentPlayerId
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                            }
                        `}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                ${player.id === currentPlayerId
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-300 text-gray-700'
                                }
                            `}>
                                {index + 1}
                            </div>
                            <div>
                                <div className="font-medium text-gray-800">
                                    {player.name}
                                    {player.id === currentPlayerId && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            あなた
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    順番: {player.turnOrder + 1}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {player.isCurrentTurn && (
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                            <span className="text-sm text-gray-500">
                                {player.isCurrentTurn ? '現在の番' : '待機中'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            {players.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    プレイヤーがいません
                </div>
            )}
        </div>
    );
};

export default PlayerList; 