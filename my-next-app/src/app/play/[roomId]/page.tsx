'use client'

import { useParams } from 'next/navigation'
import { useSocket } from '@/lib/socket'
import { useEffect } from 'react'

export default function PlayRoom() {
  const params = useParams()
  const roomId = params?.roomId ?? ''  // null や undefined 対策

  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return
    console.log('ゲーム画面に入りました (roomId):', roomId)
  }, [socket, roomId])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 text-gray-900 px-4">
      <h1 className="text-3xl font-bold mb-4">Game Started!</h1>
      <p className="text-xl">Room ID: {roomId}</p>
      <p className="mt-4">ここにゲーム画面を実装していきます。</p>
    </div>
  )
}
