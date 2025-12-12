/**
 * Authentication Middleware
 * 
 * JWT Verification Middleware:
 * - Extract token from Authorization header (Bearer <token>)
 * - Verify token using jsonwebtoken.verify() with JWT_SECRET
 * - Decode payload to get userId and email
 * - Attach user data to req.user for use in route handlers
 * - If token invalid/expired, return 401 Unauthorized
 * 
 * Example usage:
 * router.get('/protected', authMiddleware, (req, res) => {
 *   const user = req.user; // Available here
 * });
 * 
 * Optional Middleware:
 * - Extract token but don't require it (for optional auth)
 * - Useful for routes that work for both authenticated and guest users
 * 
 * Admin Middleware:
 * - Check if req.user has admin role
 * - Return 403 Forbidden if not admin
 * - Chain after authMiddleware
 */

import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    }
  }
}

// TODO: Implement JWT verification middleware
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Implementation here
};

// TODO: Implement admin check middleware
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Implementation here
};
