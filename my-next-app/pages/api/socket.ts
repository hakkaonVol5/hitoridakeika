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

        // ここが Socket.IO の 'connection' イベントのメインハンドラです
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // join-room イベントハンドラ
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

                // room-joined は socket.emit で単一クライアントに送る（現状維持、もし使われるなら）
                // socket.emit('room-joined', { room: updatedRoom, playerId: socket.id });

                // ルームの最新情報を参加者全員にブロードキャスト (main ブランチの変更)
                io.to(roomId).emit('updateRoom', updatedRoom);

                // player-joined は 'updateRoom' に統合された可能性があるため、コメントアウトを継続
                // socket.to(roomId).emit('player-joined', { player: updatedRoom.players[updatedRoom.players.length - 1] });
            });

            // update-code イベントハンドラ
            socket.on('update-code', ({ roomId, code }) => {
                updateCode(roomId, code);
                socket.to(roomId).emit('code-updated', {
                    code,
                    playerId: socket.id,
                });
            });

            // turn-complete イベントハンドラ
            socket.on('turn-complete', ({ roomId }) => {
                const room = nextTurn(roomId);
                if (room) {
                    io.to(roomId).emit('turn-changed', {
                        currentPlayer: room.players[room.currentPlayerIndex],
                        timeRemaining: room.problem.timeLimit,
                    });
                }
            });

            // submit-code イベントハンドラ (あなたのブランチの変更を反映)
            // クライアントから code と isSuccess が送られてくるので、ハンドラでも受け取る
            socket.on('submit-code', ({ roomId, code, isSuccess }) => {
                console.log("--- submit-code イベントを受信しました ---"); // デバッグ用に追加した行
                const result = submitGame(roomId, code, isSuccess); // submitGame に code と isSuccess を渡す
                if (result) {
                    io.to(roomId).emit('game-result', { result });
                }
            });

            // disconnect イベントハンドラ
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                const result = removePlayerFromRoom(socket.id);
                if (result && !result.roomDeleted) {
                    const room = getRoom(result.roomId);
                    if (room) {
                        // プレイヤー退出後、最新のルーム情報をブロードキャスト (main ブランチの変更)
                        io.to(result.roomId).emit('updateRoom', room);
                    }
                }
            });
        }); // io.on('connection') の終了括弧

        res.socket.server.io = io;
    }

    res.end();
};

export default ioHandler;