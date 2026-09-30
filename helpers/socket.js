const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

// Sala por stand: la pantalla de cocina solo recibe los pedidos de su stand
const standRoom = (mobileStandId) => `stand:${mobileStandId}`;

const initSocket = (httpServer) => {
    io = new Server(httpServer, { cors: { origin: '*' } });

    // Solo clientes con un JWT válido pueden conectarse
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        try {
            socket.usuarioId = jwt.verify(token, process.env.JWT_SECRET).id;
            next();
        } catch (error) {
            next(new Error('Token no valido o expirado'));
        }
    });

    io.on('connection', (socket) => {
        socket.on('kitchen:join', (mobileStandId) => {
            for (const room of socket.rooms) {
                if (room.startsWith('stand:')) socket.leave(room);
            }
            if (mobileStandId) socket.join(standRoom(mobileStandId));
        });
    });

    return io;
};

// Emite a la pantalla de cocina del stand; no falla si el socket no está iniciado
const emitToStand = (mobileStandId, event, payload) => {
    if (io) io.to(standRoom(mobileStandId)).emit(event, payload);
};

module.exports = { initSocket, emitToStand };
