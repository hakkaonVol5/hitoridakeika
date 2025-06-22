/// <reference types="react" />
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { generateRoomId, validatePlayerName, validateRoomId } from '@/lib/utils'
import { useSocket } from '@/lib/socket'
import { useGameStore } from '@/store/gameStore';

export default function Home() {
  const router = useRouter()
  const { joinRoom, isConnecting } = useSocket()
  const { resetGame, isConnected } = useGameStore()

  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [error, setError] = useState('')

  const handleCreateRoom = () => {
    if (!validatePlayerName(playerName)) return setError('プレイヤー名は1〜8文字で入力してください')
    const newRoomId = generateRoomId()
    joinRoom(newRoomId, playerName)

    //router.push(`/waiting/${newRoomId}?playerName=${playerName}&host=true`)
    ///room/1Q7DFC?host=true&playerName=ああ
    //router.push(`/room/${newRoomId}?host=true&playerName=${playerName}`)←テスト用（強制的にゲーム画面に移る）

    router.push(`/room/${newRoomId}?playerName=${playerName}&host=true`)

  }

  const handleJoinRoom = () => {
    if (!validatePlayerName(playerName)) return setError('プレイヤー名は1〜8文字で入力してください')
    if (!validateRoomId(roomId)) return setError('ルームIDは3〜8文字の英数字で入力してください')
    joinRoom(roomId, playerName)
    router.push(`/room/${roomId}?playerName=${playerName}&host=false`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#005481] to-[#19A591] text-white px-4 bg-pattern-overlay py-12">
      <h1 className="text-4xl font-bold mb-4 text-center leading-tight">
        <span className="text-6xl text-[#B2D6B5] font-extrabold [text-shadow:-2px_-2px_0_#005481,2px_-2px_0_#005481,-2px_2px_0_#005481,2px_2px_0_#005481,-2px_0_0_#005481,2px_0_0_#005481,0_-2px_0_#005481,0_2px_0_#005481]">みんプロ</span>
        <br />
        <span className="text-3xl text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">みんなで競技プログラミング</span>
      </h1>
      <p className="text-center text-lg text-white mb-10 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">制限時間内で交代しながらコードを完成させよう！</p>

      <div className="w-full max-w-5xl flex flex-row items-stretch justify-center gap-12">
        {/* Left Column */}
        <div className="flex-1 bg-white/10 p-10 rounded-lg border border-black/40 backdrop-blur-md">
          <label className="block mb-3 text-xl font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">プレイヤー名</label>
          <input
            type="text"
            placeholder="あなたの名前を入力"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 mb-5 border border-black/50 rounded bg-white/10 text-white placeholder-white/60 text-xl"
          />

          <button onClick={handleCreateRoom} className="w-full py-3 mb-2 bg-[#AFC0E2] text-black font-semibold rounded text-xl hover:bg-[#9BB0D8] transition-colors">
            新しくルームを作成
          </button>
          <p className="text-center text-lg text-white mb-5 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">ホストとしてゲームを開始します</p>

          <div className="border-t border-black/40 my-5"></div>
          <p className="text-center text-lg text-white/70 mb-5 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">または</p>

          <label className="block mb-3 text-xl font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">ルームID</label>
          <input
            type="text"
            placeholder="例: ABC123"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-3 mb-4 border border-black/50 rounded bg-white/10 text-white placeholder-white/60 text-xl"
          />

          <button onClick={handleJoinRoom} className="w-full py-3 bg-green-400 text-black font-semibold rounded text-xl hover:bg-green-500 transition-colors">
            ルームに参加
          </button>

          {error && <p className="text-red-300 mt-5 text-lg drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{error}</p>}
        </div>

        {/* Right Column */}
        <div className="flex-1 bg-white/10 p-10 rounded-lg border border-black/40 backdrop-blur-md flex flex-col">
          <h2 className="text-2xl font-bold mb-4 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">ゲームの遊び方</h2>
          <ul className="list-disc list-inside text-xl text-white">
            <li className="drop-shadow-[0_1px_1px_rgba(0,0,0,1)] py-2">最大5人でチームを組んでプログラミング</li>
            <li className="drop-shadow-[0_1px_1px_rgba(0,0,0,1)] py-2">制限時間内で交代しながらコードを書く</li>
            <li className="drop-shadow-[0_1px_1px_rgba(0,0,0,1)] py-2">自分の番以外は編集不可</li>
            <li className="drop-shadow-[0_1px_1px_rgba(0,0,0,1)] py-2">全テストケース通過でクリア！</li>
          </ul>
          <div className="flex-grow flex items-center justify-center pt-8">
            <Image
              src="/computer-icon2.png"
              alt="decoration icon"
              width={300}
              height={300}
              className="opacity-70"
            />
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-5xl mt-4">
        {isConnecting && (
          <div className="p-4 bg-blue-500/20 text-blue-200 text-lg rounded border border-blue-400/30">
            サーバーに接続中...
          </div>
        )}

        {!isConnected && !isConnecting && (
          <div className="p-4 bg-yellow-500/20 text-yellow-200 text-lg rounded border border-yellow-400/30">
            ⚠️ サーバーに接続できませんでした。ページを再読み込みしてください。
          </div>
        )}
      </div>
    </div>
  )
}
