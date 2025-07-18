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

        io.on('connection', socket => {
            console.log('Client connected:', socket.id);

            socket.on('join-room', ({ roomId, playerName }) => {
                let room = getRoom(roomId);
                if (!room) {
                    room = createRoom(roomId);
                }

                const { room: updatedRoom, error } = addPlayerToRoom(roomId, { id: socket.id, name: playerName });

                if (error) {
                    return socket.emit('error', { message: error });
                }

                socket.join(roomId);
                socket.emit('room-joined', { room: updatedRoom, playerId: socket.id });
                socket.to(roomId).emit('player-joined', { player: updatedRoom.players[updatedRoom.players.length - 1] });
            });

            socket.on('update-code', ({ roomId, code }) => {
                updateCode(roomId, code);
                socket.to(roomId).emit('code-updated', { code, playerId: socket.id });
            });

            socket.on('turn-complete', ({ roomId }) => {
                const room = nextTurn(roomId);
                if (room) {
                    io.to(roomId).emit('turn-changed', {
                        currentPlayer: room.players[room.currentPlayerIndex],
                        timeRemaining: room.problem.timeLimit
                    });
                }
            });

            socket.on('submit-code', ({ roomId, code, isSuccess }) => {
                const result = submitGame(roomId, code, isSuccess); // submitGame に code と isSuccess を渡す
                if (result) {
                    io.to(roomId).emit('game-result', { result });
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                const result = removePlayerFromRoom(socket.id);
                if (result && !result.roomDeleted) {
                    socket.to(result.roomId).emit('player-left', { playerId: socket.id });
                }
            });
        });

        res.socket.server.io = io;
    }
    res.end();
};

export default ioHandler;
