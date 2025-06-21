import { Server } from 'socket.io';
import {
    getRoom,
    createRoom,
    addPlayerToRoom,
    removePlayerFromRoom,
    nextTurn,
    updateCode,
    submitGame,
} from '../../src/lib/roomManager';

const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
        console.log('Socket is already running');
    } else {
        console.log('Socket is initializing');
        const io = new Server(res.socket.server, {
            path: '/api/socket_io',
            addTrailingSlash: false,
        });
        res.socket.server.io = io;

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
                    socket.to(result.roomId).emit('player-left', { playerId: socket.id });
                }
            });
        });
    }
    res.end();
};

export default SocketHandler; 