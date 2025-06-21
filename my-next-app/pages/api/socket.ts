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
      addTrailingSlash: false,
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
        socket.emit('room-joined', {
          room: updatedRoom,
          playerId: socket.id,
        });

        socket.to(roomId).emit('player-joined', {
          player: updatedRoom.players[updatedRoom.players.length - 1],
        });

        // ✅ プレイヤー一覧送信（型明示）
        io.to(roomId).emit('update-players', {
          players: updatedRoom.players.map((p: Player) => p.name),
        });

        // ✅ 以下を追加：ホストがボタンを押したら手動でゲーム開始
        socket.on('manual-start-game', ({ roomId }) => {
          const room = getRoom(roomId);
          if (room) {
            io.to(roomId).emit('start-game');
          }
        });


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
          socket.to(result.roomId).emit('player-left', {
            playerId: socket.id,
          });

          // ✅ 切断後のプレイヤー一覧更新（型明示）
          const room = getRoom(result.roomId);
          if (room) {
            io.to(result.roomId).emit('update-players', {
              players: room.players.map((p: Player) => p.name),
            });
          }
        }
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
