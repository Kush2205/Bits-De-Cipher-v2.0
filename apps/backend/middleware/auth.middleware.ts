import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
const CONTEST_START_TIME = new Date("2026-01-16T19:00:00+05:30").getTime();

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const currentTime = Date.now();
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    if (currentTime < CONTEST_START_TIME) {

        return res.status(403).json({
            success: false,
            message: "ACCESS_DENIED: Contest has not started yet.",
            unlocksAt: CONTEST_START_TIME
        });
    }

    const token = authHeader.substring(7); 

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
