
export interface User {
  id: string;
  email: string;
  name: string | null;
  role?: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  duration: number; 
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
  correctAnswer: number; 
}

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
  timeTaken: number;
  answeredAt: Date;
}

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

export interface BackendQuestion {
  id: number;
  name: string;
  imageUrl: string | null;
  points: number;
  maxPoints: number;
  hints: Array<{
    id: number;
    number: number;
    hintText: string;
  }>;
  createdAt: Date;
}

export interface BackendUserStats {
  totalPoints: number;
  currentQuestionIndex: number;
  name: string | null;
  email: string;
}

export interface BackendLeaderboardEntry {
  id: string;
  name: string | null;
  email: string;
  totalPoints: number;
  currentQuestionIndex: number;
}

export interface InitialDataPayload {
  currentQuestion: BackendQuestion | null;
  userStats: BackendUserStats;
  leaderboard: BackendLeaderboardEntry[];
  hintUsage?: { hint1Used: boolean; hint2Used: boolean };
}

export interface LeaderboardUpdatePayload {
  userId: string;
  awardedPoints: number;
  totalPoints: number;
}

export interface LeaderboardDataPayload {
  leaderboard: BackendLeaderboardEntry[];
}

export interface SocketErrorPayload {
  message: string;
}

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
