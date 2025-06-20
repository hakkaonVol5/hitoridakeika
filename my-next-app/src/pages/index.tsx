import { useState } from 'react';
import { useRouter } from 'next/router';
import { generateRoomId, validatePlayerName, validateRoomId } from '../lib/utils';
import { useSocket } from '../lib/socket';
import { useGameStore } from '../store/gameStore';

export default function Home() {
  const router = useRouter();
  const { joinRoom } = useSocket();
  const { resetGame } = useGameStore();

  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  // ゲーム開始時に状態をリセット
  useState(() => {
    resetGame();
  });

  const handleCreateRoom = () => {
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.isValid) {
      setError(nameValidation.error || '');
      return;
    }

    setIsCreating(true);
    setError('');

    // 新しいルームIDを生成
    const newRoomId = generateRoomId();

    // ルーム作成ページに遷移
    router.push(`/room/${newRoomId}?host=true&playerName=${encodeURIComponent(playerName)}`);
  };

  const handleJoinRoom = () => {
    const nameValidation = validatePlayerName(playerName);
    const roomValidation = validateRoomId(roomId);

    if (!nameValidation.isValid) {
      setError(nameValidation.error || '');
      return;
    }

    if (!roomValidation.isValid) {
      setError(roomValidation.error || '');
      return;
    }

    setIsJoining(true);
    setError('');

    // ルーム参加ページに遷移
    router.push(`/room/${roomId}?playerName=${encodeURIComponent(playerName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            cordic chat
          </h1>
          <p className="text-gray-600">
            制限時間内で交代しながらコードを完成させよう！
          </p>
        </div>

        {/* プレイヤー名入力 */}
        <div className="mb-6">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
            プレイヤー名
          </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="あなたの名前を入力"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={20}
          />
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* ルーム作成ボタン */}
        <div className="mb-6">
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || !playerName.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isCreating ? '作成中...' : '新しくルームを作成'}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            ホストとしてゲームを開始します
          </p>
        </div>

        {/* 区切り線 */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>

        {/* ルーム参加 */}
        <div className="mb-6">
          <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
            ルームID
          </label>
          <input
            type="text"
            id="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            placeholder="例: ABC123"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            maxLength={6}
          />
        </div>

        <button
          onClick={handleJoinRoom}
          disabled={isJoining || !playerName.trim() || !roomId.trim()}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isJoining ? '参加中...' : 'ルームに参加'}
        </button>

        {/* ゲーム説明 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">🎮 ゲームの遊び方</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 最大5人でチームを組んでプログラミング</li>
            <li>• 制限時間内で交代しながらコードを書く</li>
            <li>• 自分の番以外は編集不可（鬼畜要素）</li>
            <li>• 全テストケース通過でクリア！</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
