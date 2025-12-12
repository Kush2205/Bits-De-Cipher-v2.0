/**
 * TypeScript Type Definitions
 * 
 * Shared types and interfaces for the backend application.
 * 
 * User Types:
 * 
 * interface User {
 *   id: string;
 *   email: string;
 *   name: string | null;
 *   password: string | null; // Null for OAuth users
 *   role: 'user' | 'admin';
 *   createdAt: Date;
 *   updatedAt: Date;
 * }
 * 
 * interface UserWithoutPassword extends Omit<User, 'password'> {}
 * 
 * Authentication Types:
 * 
 * interface LoginRequest {
 *   email: string;
 *   password: string;
 * }
 * 
 * interface SignupRequest {
 *   email: string;
 *   password: string;
 *   name?: string;
 * }
 * 
 * interface AuthResponse {
 *   success: boolean;
 *   user: UserWithoutPassword;
 *   accessToken: string;
 *   refreshToken?: string;
 * }
 * 
 * interface JWTPayload {
 *   userId: string;
 *   email: string;
 *   role?: string;
 *   iat: number;
 *   exp: number;
 * }
 * 
 * Quiz Types:
 * 
 * interface Quiz {
 *   id: string;
 *   title: string;
 *   description: string | null;
 *   duration: number; // in seconds
 *   isPublished: boolean;
 *   createdAt: Date;
 *   updatedAt: Date;
 * }
 * 
 * interface Question {
 *   id: string;
 *   quizId: string;
 *   text: string;
 *   order: number;
 *   correctAnswer: number; // Index of correct option
 *   points: number;
 * }
 * 
 * interface Option {
 *   id: string;
 *   questionId: string;
 *   text: string;
 *   order: number;
 * }
 * 
 * interface CreateQuizRequest {
 *   title: string;
 *   description?: string;
 *   duration: number;
 *   questions: {
 *     text: string;
 *     options: string[];
 *     correctAnswer: number;
 *     points?: number;
 *   }[];
 * }
 * 
 * Session Types:
 * 
 * interface QuizSession {
 *   id: string;
 *   quizId: string;
 *   startedAt: Date;
 *   completedAt: Date | null;
 *   status: 'in_progress' | 'completed' | 'abandoned';
 * }
 * 
 * interface QuizParticipant {
 *   id: string;
 *   sessionId: string;
 *   userId: string;
 *   totalScore: number;
 *   questionsAnswered: number;
 * }
 * 
 * interface Answer {
 *   id: string;
 *   participantId: string;
 *   questionId: string;
 *   selectedOption: number;
 *   isCorrect: boolean;
 *   points: number;
 *   timeTaken: number;
 *   answeredAt: Date;
 * }
 * 
 * Leaderboard Types:
 * 
 * interface LeaderboardEntry {
 *   rank: number;
 *   userId: string;
 *   name: string;
 *   score: number;
 *   timeTaken?: number;
 *   quizzesTaken?: number;
 * }
 * 
 * interface UserStats {
 *   userId: string;
 *   globalRank: number;
 *   totalScore: number;
 *   averageScore: number;
 *   quizzesTaken: number;
 *   quizHistory: {
 *     quizId: string;
 *     quizTitle: string;
 *     score: number;
 *     completedAt: Date;
 *   }[];
 * }
 * 
 * WebSocket Event Types:
 * 
 * interface SocketEvents {
 *   // Client → Server
 *   'join-quiz-session': (data: { sessionId: string }) => void;
 *   'submit-answer': (data: {
 *     sessionId: string;
 *     questionId: string;
 *     selectedOption: number;
 *     timeTaken: number;
 *   }) => void;
 *   'request-leaderboard': (data: { sessionId: string }) => void;
 *   'quiz-complete': (data: { sessionId: string }) => void;
 *   
 *   // Server → Client
 *   'participant-joined': (data: { userId: string; name: string }) => void;
 *   'answer-result': (data: { correct: boolean; score: number }) => void;
 *   'leaderboard-update': (data: LeaderboardEntry[]) => void;
 *   'leaderboard-data': (data: LeaderboardEntry[]) => void;
 *   'quiz-results': (data: any) => void;
 * }
 * 
 * API Response Types:
 * 
 * interface ApiResponse<T = any> {
 *   success: boolean;
 *   data?: T;
 *   error?: {
 *     message: string;
 *     code: string;
 *     details?: any;
 *   };
 * }
 * 
 * interface PaginatedResponse<T> extends ApiResponse {
 *   data: {
 *     items: T[];
 *     total: number;
 *     page: number;
 *     limit: number;
 *   };
 * }
 */

// TODO: Define all TypeScript interfaces and types
// TODO: Export types for use across the application
