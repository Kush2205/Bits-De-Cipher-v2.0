import {Socket} from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const socketAuthMiddleware = (socket: Socket, next: (err?: any) => void) => {
    const token = socket.handshake.headers.token;

    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }

    try {
        const decoded = jwt.verify(token as string, JWT_SECRET) as any;
        (socket as any).data.userId = decoded.userId;
        next();
    } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
    }
};