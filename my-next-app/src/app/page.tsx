/// <reference types="react" />
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { generateRoomId, validatePlayerName, validateRoomId } from '@/lib/utils'
import { useSocket } from '@/lib/socket'
import { useGameStore } from '@/store/gameStore';

export default function Home() {
  const router = useRouter()
  const { joinRoom } = useSocket()
  const { resetGame } = useGameStore()

  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [error, setError] = useState('')

  const handleCreateRoom = () => {
    if (!validatePlayerName(playerName)) return setError('プレイヤー名は1〜8文字で入力してください')
    const newRoomId = generateRoomId()
    joinRoom(newRoomId, playerName)
    router.push(`/waiting/${newRoomId}?playerName=${playerName}&host=true`)
  }

  const handleJoinRoom = () => {
    if (!validatePlayerName(playerName)) return setError('プレイヤー名は1〜8文字で入力してください')
    if (!validateRoomId(roomId)) return setError('ルームIDは3〜8文字の英数字で入力してください')
    joinRoom(roomId, playerName)
    router.push(`/waiting/${roomId}?playerName=${playerName}&host=false`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-800 to-blue-800 text-white px-4">
      <div className="bg-white text-gray-900 p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">みんなで競技プログラミング</h1>
        <p className="text-center text-gray-600 mb-6">制限時間内で交代しながらコードを完成させよう！</p>

        <label className="block mb-2 font-semibold">プレイヤー名</label>
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded"
        />

        <button onClick={handleCreateRoom} className="w-full py-2 mb-2 bg-purple-400 text-white font-semibold rounded">
          新しくルームを作成
        </button>
        <p className="text-center text-sm text-gray-500 mb-4">ホストとしてゲームを開始します</p>

        <div className="border-t my-4"></div>
        <p className="text-center text-gray-500 mb-4">または</p>

        <label className="block mb-2 font-semibold">ルームID</label>
        <input
          type="text"
          placeholder="例: ABC123"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded"
        />

        <button onClick={handleJoinRoom} className="w-full py-2 bg-green-400 text-white font-semibold rounded">
          ルームに参加
        </button>

        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

        <div className="mt-8 bg-gray-50 p-4 rounded">
          <h2 className="font-bold mb-2">🎮 ゲームの遊び方</h2>
          <ul className="list-disc list-inside text-sm text-gray-700">
            <li>最大5人でチームを組んでプログラミング</li>
            <li>制限時間内で交代しながらコードを書く</li>
            <li>自分の番以外は編集不可（鬼畜要素）</li>
            <li>全テストケース通過でクリア！</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 text-sm rounded">
          ⚠️ モックモード<br />
          Socket.IOサーバーが利用できないため、モックモードで動作しています。
          リアルタイム機能は制限されますが、基本的な機能は利用できます。
        </div>
      </div>
    </div>
  )
}
