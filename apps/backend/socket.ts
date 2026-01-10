import { Server } from 'socket.io';
import type http from 'http';

let io: Server | null = null;

export const initSocket = (server: http.Server) => {
  const frontendUrls = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  // Add production URL if defined
  if (process.env.PRODUCTION_URL) {
    frontendUrls.push(process.env.PRODUCTION_URL);
  }

  io = new Server(server, {
    cors: {
      origin: frontendUrls,
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization', 'Content-Type'],
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true, // Enable compatibility with Socket.IO v2 clients if needed
  });

  console.log('🔌 Socket.IO initialized with CORS origins:', frontendUrls);
  
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};
