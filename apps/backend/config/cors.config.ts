/**
 * CORS Configuration
 * 
 * Configure Cross-Origin Resource Sharing for API security.
 * 
 * CORS Options:
 * 
 * origin:
 * - Allow requests from frontend URL
 * - In development: http://localhost:5173 (Vite default)
 * - In production: your deployed frontend URL
 * - Can be array for multiple origins
 * - Can be function for dynamic checking
 * 
 * credentials:
 * - Set to true to allow cookies/auth headers
 * - Required for JWT in Authorization header
 * - Required for session cookies
 * 
 * methods:
 * - Allowed HTTP methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
 * 
 * allowedHeaders:
 * - Headers client can send
 * - Include 'Authorization' for JWT
 * - Include 'Content-Type' for JSON
 * 
 * exposedHeaders:
 * - Headers client can read from response
 * - Include custom headers if needed
 * 
 * maxAge:
 * - Cache preflight response (in seconds)
 * - Reduces OPTIONS requests
 * 
 * Example Configuration:
 * 
 * {
 *   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
 *   credentials: true,
 *   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
 *   allowedHeaders: ['Content-Type', 'Authorization'],
 *   exposedHeaders: ['X-Total-Count'],
 *   maxAge: 86400 // 24 hours
 * }
 * 
 * Dynamic Origin (for multiple environments):
 * 
 * origin: (origin, callback) => {
 *   const allowedOrigins = [
 *     'http://localhost:5173',
 *     'https://yourdomain.com',
 *     'https://staging.yourdomain.com'
 *   ];
 *   if (!origin || allowedOrigins.includes(origin)) {
 *     callback(null, true);
 *   } else {
 *     callback(new Error('Not allowed by CORS'));
 *   }
 * }
 * 
 * Usage:
 * import cors from 'cors';
 * import { corsOptions } from './config/cors.config';
 * app.use(cors(corsOptions));
 */

import { CorsOptions } from 'cors';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const corsOptions: CorsOptions = {
  // TODO: Configure CORS options based on environment
};
