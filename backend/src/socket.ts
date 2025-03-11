import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

function SocketIoServer() {
    let io: null | SocketIOServer = null;

    function createSocketServer() {
        const server = http.createServer();
        const io = new SocketIOServer(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: [],
                credentials: false
            }
        });

        return io;
    }

    function startSocketIo(port: number) {
        try {

            io = createSocketServer();
            io.listen(port)
            io.httpServer.on('listening', () => {
                console.log(`Socket.IO server is running on port ${port}`);
            });

            console.log('start socket io');

            io.on('connection', (socket) => {
                console.log('A user connected:', socket.id);
                socket.emit('message', 'Hello from server');
                socket.on('clientMessage', (data) => {
                    console.log('Message from client:', data);
                });
                socket.on('disconnect', () => {
                    console.log('A user disconnected');
                });
            });
        }
        catch (ex) {
            console.log('error socket server', ex)
        }
    }

    return {
        startSocketIo
    };
}

export { SocketIoServer };
