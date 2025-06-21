'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSocket } from '@/lib/socket'
import { useGameStore } from '@/store/gameStore'

export default function WaitingRoom() {
  const params = useParams<{ roomId?: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  // 安全なパラメータ取得
  const roomId = params?.roomId ?? ''
  const isHost = searchParams?.get('host') === 'true'
  const playerName = searchParams?.get('playerName') ?? ''

  const { socket } = useSocket();
  const { room } = useGameStore();
  const players = room?.players||[];
  const { setGameResult } = useGameStore()

  const handleStartGame = () => {
    if (socket && roomId && players && players.length >= 2) {
      socket.emit('manual-start-game', { roomId })
    }
  }

  useEffect(() => {
    if (!socket) return
    const handleStart = () => {
      router.push(`/play/${roomId}?playerName=${playerName}`)
    }
    socket.on('game-started', handleStart)
    return () => {
      socket.off('game-started', handleStart)
    }
  }, [socket, roomId, router, playerName])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100 p-4">
      <h1 className="text-3xl font-bold">Waiting Room: {roomId}</h1>
      <p className="mt-4">
        プレイヤーを待っています（{players ? players.length : 0}人）
      </p>

      {players && players.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold">参加中のプレイヤー:</h2>
          <ul className="list-disc list-inside">
            {players.map((player, i) => (
              <li key={i}>{player.name}</li>
            ))}
          </ul>
        </div>
      )}

      {isHost && players && players.length >= 2 && (
        <button
          onClick={handleStartGame}
          className="mt-6 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          ゲームを開始する
        </button>
      )}
    </div>
  )
}
