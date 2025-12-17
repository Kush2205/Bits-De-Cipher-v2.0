import {Socket} from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const socketAuthMiddleware = (socket: Socket, next: (err?: any) => void) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        (socket as any).userId = decoded.userId;
        next();
    } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
    }
};