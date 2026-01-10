import { ExtendedError, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
}

export const socketAuthMiddleware = (socket: Socket, next: (err?: ExtendedError) => void) => {
  try {
    let token = socket.handshake.auth?.token;
    
    if (!token) {
      token = socket.handshake.headers?.authorization?.replace('Bearer ', '');
    }
    
    if (!token && socket.handshake.query?.token) {
      token = socket.handshake.query.token as string;
    }

    if (!token) {
      console.log(' Socket auth failed: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
    
    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    
    console.log(`✅ Socket authenticated for user: ${decoded.email} (${decoded.userId})`);
    next();
  } catch (error) {
    console.log('Socket auth failed: Invalid token -', error instanceof Error ? error.message : 'Unknown error');
    next(new Error('Authentication error: Invalid token'));
  }
};