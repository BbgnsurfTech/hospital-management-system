import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

let io: Server;

export const initializeSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.email} (${user.id})`);

    // Join user-specific room
    socket.join(`user-${user.id}`);

    // Join role-specific room
    socket.join(`role-${user.role}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.email}`);
    });

    // Patient status update
    socket.on('patient-status-update', (data) => {
      io.emit('patient-status-changed', data);
    });

    // Queue update
    socket.on('queue-update', (data) => {
      io.to(`role-${data.department}`).emit('queue-changed', data);
    });
  });

  console.log('✓ Socket.IO initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Emit events to specific users or roles
export const emitToUser = (userId: string, event: string, data: any) => {
  io.to(`user-${userId}`).emit(event, data);
};

export const emitToRole = (role: string, event: string, data: any) => {
  io.to(`role-${role}`).emit(event, data);
};

export const emitToAll = (event: string, data: any) => {
  io.emit(event, data);
};
