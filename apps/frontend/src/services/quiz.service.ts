/**
 * Quiz Service
 * 
 * API calls for quiz-related operations.
 * 
 * Functions:
 * - getQuizzes(page, limit): Fetch available quizzes
 * - getQuizById(id): Get specific quiz details
 * - startQuizSession(quizId): Start new quiz session
 * - submitAnswer(sessionId, answer): Submit quiz answer
 * - getSessionResults(sessionId): Get quiz results
 * 
 * Each function returns a Promise with typed response data.
 */

import api from '../lib/api';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  questionCount: number;
  duration: number;
  isPublished: boolean;
}

interface QuizSession {
  id: string;
  quizId: string;
  startedAt: Date;
  status: 'in_progress' | 'completed';
}

interface AnswerSubmission {
  sessionId: string;
  questionId: string;
  selectedOption: number;
  timeTaken: number;
}

// Fetch all available quizzes
export const getQuizzes = async (page: number = 1, limit: number = 10) => {
  const response = await api.get('/quiz/list', {
    params: { page, limit }
  });
  return response.data;
};

// Get specific quiz details
export const getQuizById = async (quizId: string) => {
  const response = await api.get(`/quiz/${quizId}`);
  return response.data;
};

// Start new quiz session
export const startQuizSession = async (quizId: string): Promise<QuizSession> => {
  const response = await api.post(`/quiz/${quizId}/start`);
  return response.data;
};

// Submit answer for current question
export const submitAnswer = async (data: AnswerSubmission) => {
  const response = await api.post(`/quiz/session/${data.sessionId}/submit`, data);
  return response.data;
};

// Get quiz session results
export const getSessionResults = async (sessionId: string) => {
  const response = await api.get(`/quiz/session/${sessionId}/results`);
  return response.data;
};
