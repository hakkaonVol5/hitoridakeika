import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';

import { NextApiResponseServerIO } from '@/types/socket';
import {
  getRoom,
  createRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  nextTurn,
  updateCode,
  submitGame,
} from '@/lib/roomManager';

export const config = {
  api: {
    bodyParser: false,
  },
};

// プレイヤー型を定義（必要なら共通化して types/player.ts などに移動）
type Player = {
  id: string;
  name: string;
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting Socket.IO');

    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-room', ({ roomId, playerName }) => {
        let room = getRoom(roomId);
        if (!room) {
          room = createRoom(roomId);
        }

        const { room: updatedRoom, error } = addPlayerToRoom(roomId, {
          id: socket.id,
          name: playerName,
        });

        if (error) {
          return socket.emit('error', { message: error });
        }

        socket.join(roomId);

        // ルームの最新情報を参加者全員にブロードキャスト
        io.to(roomId).emit('updateRoom', updatedRoom);
      });

      // 'manual-start-game' イベントリスナーを 'join-room' の外に移動
      socket.on('manual-start-game', ({ roomId }) => {
        const room = getRoom(roomId);
        if (room) {
          io.to(roomId).emit('start-game');
        }
      });

      socket.on('update-code', ({ roomId, code }) => {
        updateCode(roomId, code);
        socket.to(roomId).emit('code-updated', {
          code,
          playerId: socket.id,
        });
      });

      socket.on('turn-complete', ({ roomId }) => {
        const room = nextTurn(roomId);
        if (room) {
          io.to(roomId).emit('turn-changed', {
            currentPlayer: room.players[room.currentPlayerIndex],
            timeRemaining: room.problem.timeLimit,
          });
        }
      });

      socket.on('submit-code', ({ roomId }) => {
        const result = submitGame(roomId);
        if (result) {
          io.to(roomId).emit('game-result', { result });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        const result = removePlayerFromRoom(socket.id);
        if (result && !result.roomDeleted) {
          const room = getRoom(result.roomId);
          if (room) {
            // プレイヤー退出後、最新のルーム情報をブロードキャスト
            io.to(result.roomId).emit('updateRoom', room);
          }
        }
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
