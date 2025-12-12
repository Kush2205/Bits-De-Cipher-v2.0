/**
 * TypeScript Type Definitions
 * 
 * Shared types and interfaces for the frontend application.
 * These should match the backend API response structures.
 */

// User Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role?: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  duration: number; // in seconds
  questionCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  order: number;
  points: number;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  questionId: string;
  text: string;
  order: number;
}

export interface QuestionWithAnswer extends Question {
  correctAnswer: number; // Index of correct option
}

// Quiz Session Types
export interface QuizSession {
  id: string;
  quizId: string;
  quiz?: Quiz;
  startedAt: Date;
  completedAt: Date | null;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface QuizParticipant {
  id: string;
  sessionId: string;
  userId: string;
  user?: User;
  totalScore: number;
  questionsAnswered: number;
}

export interface Answer {
  id: string;
  participantId: string;
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  points: number;
  timeTaken: number; // in seconds
  answeredAt: Date;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  timeTaken?: number;
  quizzesTaken?: number;
  completedAt?: Date;
}

export interface UserStats {
  userId: string;
  name: string;
  globalRank: number;
  totalScore: number;
  averageScore: number;
  quizzesTaken: number;
  quizHistory: QuizHistory[];
}

export interface QuizHistory {
  quizId: string;
  quizTitle: string;
  score: number;
  rank: number;
  completedAt: Date;
}

// WebSocket Event Types
export interface SocketEvents {
  // Client → Server
  'join-quiz-session': { sessionId: string };
  'submit-answer': {
    sessionId: string;
    questionId: string;
    selectedOption: number;
    timeTaken: number;
  };
  'request-leaderboard': { sessionId: string };
  'quiz-complete': { sessionId: string };
  'subscribe-global-leaderboard': void;
  'subscribe-quiz-leaderboard': { quizId: string };

  // Server → Client
  'participant-joined': { userId: string; name: string };
  'answer-result': { correct: boolean; score: number; correctAnswer: number };
  'leaderboard-update': LeaderboardEntry[];
  'leaderboard-data': LeaderboardEntry[];
  'quiz-results': any;
  'participant-finished': { userId: string; name: string };
  'global-leaderboard-update': LeaderboardEntry[];
  'quiz-leaderboard-update': LeaderboardEntry[];
  'rank-change': { newRank: number; oldRank: number };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
