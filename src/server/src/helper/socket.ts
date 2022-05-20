import { Namespace, Server, Socket } from 'socket.io';
import { logger } from './logging';

export let projectIo: Namespace | undefined;

export const initSockets = (io: Server) => {
    if (process.env.NODE_ENV !== 'test') {
        projectIo = io.of('/project');

        projectIo.on('connection', (socket: Socket) => {
            socket.on('join-project', (room: string) => {
                logger.info({
                    message: 'Received socket connection',
                    socketId: socket.id,
                    room,
                });
                socket.join(room);
            });

            socket.on('leave-project', (room: string) => {
                logger.info({
                    message: 'Ended socket connection',
                    socketId: socket.id,
                    room,
                });
                socket.leave(room);
            });
        });
    } else {
        projectIo = undefined;
    }
};
