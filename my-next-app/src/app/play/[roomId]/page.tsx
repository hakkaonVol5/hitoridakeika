'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useSocket } from '@/lib/socket'
import { useGameStore } from '@/store/gameStore'
import { Player, Room } from '@/types/game'

export default function PlayPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const roomId = pathname?.split('/').pop() || ''
  const initialName = searchParams?.get('playerName') || ''
  const isHost = searchParams?.get('host') === 'true'

  const { joinRoom, leaveRoom, submitCode, onPlayerUpdate, onGameEvent } = useSocket()
  const { setPlayers, setGameState, currentPlayerId, resetGame } = useGameStore()

  const hasJoinedRoom = useRef(false)

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hasJoinedRoom.current || !roomId || !initialName) return
    hasJoinedRoom.current = true

    joinRoom(roomId, initialName)
    onPlayerUpdate((players: Player[]) => setPlayers(players))
    onGameEvent((gameState: Room) => setGameState(gameState))

    return () => {
      if (roomId && currentPlayerId) {
        leaveRoom(roomId, currentPlayerId)
      }
    }
  }, [roomId, initialName, joinRoom, leaveRoom, onPlayerUpdate, onGameEvent, setPlayers, setGameState, currentPlayerId])

  const handleSubmit = async () => {
    try {
      await submitCode(roomId, code)
      setError(null)
    } catch (e: any) {
      setError(e.message || '提出中にエラーが発生しました')
    }
  }

  const handleExit = () => {
    if (roomId && currentPlayerId) {
      leaveRoom(roomId, currentPlayerId)
    }
    resetGame()
    router.push('/')
  }

  return (
    <div className="play-page">
      <h1>Room: {roomId}</h1>
      <p>あなた：{initialName} {isHost && '(ホスト)'}</p>

      <pre className="code-editor">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ここにコードを入力..."
        />
      </pre>

      {error && <div className="error">{error}</div>}

      <button onClick={handleSubmit}>コードを提出</button>
      <button onClick={handleExit}>退出して戻る</button>
    </div>
  )
}
