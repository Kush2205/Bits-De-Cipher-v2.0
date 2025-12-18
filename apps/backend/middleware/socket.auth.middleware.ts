import { ExtendedError, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
}

export const socketAuthMiddleware = (socket: Socket, next: (err?: ExtendedError) => void) => {
  try {
    const token =socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
    
    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};