import { useState } from 'react';
import { useRouter } from 'next/router';
import { generateRoomId } from '../src/lib/utils';

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('プレイヤー名を入力してください');
      return;
    }

    const newRoomId = generateRoomId();
    router.push(`/room/${newRoomId}?playerName=${encodeURIComponent(playerName)}&host=true`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert('プレイヤー名を入力してください');
      return;
    }
    if (!roomId.trim()) {
      alert('ルームIDを入力してください');
      return;
    }

    router.push(`/room/${roomId}?playerName=${encodeURIComponent(playerName)}&host=false`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              cordic chat
            </h1>
            <p className="text-gray-600">
              マルチプレイヤーコーディングゲーム
            </p>
          </div>

          <div className="space-y-6">
            {/* プレイヤー名入力 */}
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                プレイヤー名
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="あなたの名前を入力"
                maxLength={20}
              />
            </div>

            {/* ホスト/ゲスト選択 */}
            <div className="flex space-x-4">
              <button
                onClick={() => setIsHost(true)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  isHost
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">ホスト</div>
                  <div className="text-sm">新しいルームを作成</div>
                </div>
              </button>

              <button
                onClick={() => setIsHost(false)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  !isHost
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">ゲスト</div>
                  <div className="text-sm">既存のルームに参加</div>
                </div>
              </button>
            </div>

            {/* ルームID入力（ゲストの場合） */}
            {!isHost && (
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                  ルームID
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="6文字のルームIDを入力"
                  maxLength={6}
                />
              </div>
            )}

            {/* アクションボタン */}
            <div className="space-y-3">
              {isHost ? (
                <button
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim()}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ルームを作成
                </button>
              ) : (
                <button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomId.trim()}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ルームに参加
                </button>
              )}
            </div>

            {/* 説明 */}
            <div className="text-center text-sm text-gray-500">
              <p>ホストがルームを作成し、ゲストがルームIDで参加できます</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 