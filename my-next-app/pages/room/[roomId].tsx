import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '../../src/lib/socket';
import { useGameStore } from '../../src/store/gameStore';
import { getDifficultyLabel, getDifficultyColor } from '../../src/lib/utils';
import { executeProblemCode } from '../../src/lib/codeExecutor';
import CodeEditor from '../../src/components/CodeEditor';
import Timer from '../../src/components/Timer';
import PlayerList from '../../src/components/PlayerList';
import { TestResult } from '../../src/types/game';

export default function GameRoom() {
    const router = useRouter();
    const { roomId } = router.query;
    const { joinRoom, updateCode, submitCode, completeTurn, isConnecting } = useSocket();
    const {
        room,
        currentPlayerId,
        isConnected,
        isMyTurn,
        timeRemaining,
        updateCode: updateCodeInStore,
        setGameResult
    } = useGameStore();

    const [playerName, setPlayerName] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const hasJoinedRoom = useRef(false);

    useEffect(() => {
        if (!roomId || typeof roomId !== 'string') return;

        // URLパラメータから情報を取得
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get('playerName') || '';
        const host = urlParams.get('host') === 'true';

        setPlayerName(name);
        setIsHost(host);
    }, [roomId]);

    // 接続状態の監視とルーム参加
    useEffect(() => {
        if (isConnected && !isConnecting && playerName && roomId && !hasJoinedRoom.current) {
            console.log('Connected and ready to join room');
            hasJoinedRoom.current = true;
            joinRoom(roomId as string, playerName);
            setIsLoading(false);
        }
    }, [isConnected, isConnecting, playerName, roomId, joinRoom]);

    // 接続エラー時の再試行
    useEffect(() => {
        if (!isConnected && !isConnecting && connectionAttempts < 3) {
            const timer = setTimeout(() => {
                console.log('Retrying connection...');
                setConnectionAttempts(prev => prev + 1);
                hasJoinedRoom.current = false;
                // ページを再読み込み
                window.location.reload();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isConnected, isConnecting, connectionAttempts]);

    // ルーム参加成功時の処理
    useEffect(() => {
        if (room && currentPlayerId) {
            setIsLoading(false);
        }
    }, [room, currentPlayerId]);

    // コード変更時の処理
    const handleCodeChange = (code: string) => {
        if (!room || !isMyTurn) return;

        updateCodeInStore(code);

        // サーバーにコード更新を送信
        if (roomId && typeof roomId === 'string') {
            updateCode(roomId, code);
        }
    };

    // コード実行
    const handleExecuteCode = async () => {
        if (!room) return;

        setIsExecuting(true);

        try {
            const results = executeProblemCode(
                room.problem.id,
                room.code,
                room.problem.testCases
            );

            setTestResults(results);

            // 全テストケースが通過したかチェック
            const allPassed = results.every(result => result.passed);

            if (allPassed) {
                // 成功時の処理
                if (roomId && typeof roomId === 'string') {
                    submitCode(roomId, room.code);
                }
            }
        } catch (error) {
            console.error('コード実行エラー:', error);
        } finally {
            setIsExecuting(false);
        }
    };

    // タイマー終了時の処理
    const handleTimeUp = () => {
        if (!room || !currentPlayerId) return;

        // 次のプレイヤーに交代
        if (roomId && typeof roomId === 'string') {
            completeTurn(roomId, currentPlayerId);
        }
    };

    // ローディング中
    if (isLoading || !room) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 mb-2">
                        {isConnecting ? 'サーバーに接続中...' : 'ルームに接続中...'}
                    </p>
                    {!isConnected && connectionAttempts > 0 && (
                        <p className="text-sm text-gray-500">
                            接続試行回数: {connectionAttempts}/3
                        </p>
                    )}
                    {!isConnected && connectionAttempts >= 3 && (
                        <div className="mt-4">
                            <p className="text-red-600 mb-2">接続に失敗しました</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                再試行
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* ヘッダー */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold text-gray-800">
                                cordic chat
                            </h1>
                            <div className="text-sm text-gray-500">
                                ルームID: {roomId}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(room.problem.difficulty)}`}>
                                {getDifficultyLabel(room.problem.difficulty)}
                            </div>
                            <div className="text-sm text-gray-600">
                                接続状態: {isConnected ? '🟢 接続中' : '🔴 切断中'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* 左サイドバー - プレイヤーリスト */}
                    <div className="lg:col-span-1">
                        <PlayerList
                            players={room.players}
                            currentPlayerId={currentPlayerId}
                        />
                    </div>

                    {/* メインコンテンツ */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* 問題表示 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                {room.problem.title}
                            </h2>
                            <p className="text-gray-600 mb-4">
                                {room.problem.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>制限時間: {room.problem.timeLimit}秒/人</span>
                                <span>最大プレイヤー: {room.problem.maxPlayers}人</span>
                            </div>
                        </div>

                        {/* タイマー */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                現在のターン
                            </h3>
                            <Timer
                                initialTime={room.problem.timeLimit}
                                onTimeUp={handleTimeUp}
                                isActive={isMyTurn && room.isGameActive}
                            />
                        </div>

                        {/* コードエディタ */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    コードエディタ
                                </h3>
                                <div className="flex items-center space-x-2">
                                    {isMyTurn ? (
                                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            あなたの番です
                                        </span>
                                    ) : (
                                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            他のプレイヤーの番です
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="h-96 mb-4">
                                <CodeEditor
                                    code={room.code}
                                    onChange={handleCodeChange}
                                    isReadOnly={!isMyTurn}
                                    language="javascript"
                                />
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={handleExecuteCode}
                                    disabled={isExecuting || !isMyTurn}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isExecuting ? '実行中...' : '実行'}
                                </button>

                                <button
                                    onClick={() => {
                                        if (roomId && typeof roomId === 'string') {
                                            submitCode(roomId, room.code);
                                        }
                                    }}
                                    disabled={!isMyTurn}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    提出
                                </button>
                            </div>
                        </div>

                        {/* テスト結果 */}
                        {testResults.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    テスト結果
                                </h3>
                                <div className="space-y-3">
                                    {testResults.map((result, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg border ${result.passed
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-red-50 border-red-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium">
                                                        テストケース {index + 1}:
                                                    </span>
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        {result.testCase.description || `入力: ${result.testCase.input}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {result.passed ? (
                                                        <span className="text-green-600">✅ 通過</span>
                                                    ) : (
                                                        <span className="text-red-600">❌ 失敗</span>
                                                    )}
                                                </div>
                                            </div>

                                            {!result.passed && (
                                                <div className="mt-2 text-sm">
                                                    <div>期待値: {result.testCase.expectedOutput}</div>
                                                    <div>実際の値: {result.actualOutput || 'エラー'}</div>
                                                    {result.error && (
                                                        <div className="text-red-600">エラー: {result.error}</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 