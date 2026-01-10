import api from '../lib/api';
import type { BackendQuestion } from '../types';

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  awardedPoints: number;
  alreadyCompleted: boolean;
  totalPoints?: number;
  currentQuestionIndex?: number;
  nextQuestion?: BackendQuestion | null;
}

export const getCurrentQuestion = async () => {
  const response = await api.get<{ question: BackendQuestion | null }>('/quiz/current');
  return response.data;
};

export const submitAnswer = async (data: {
  questionId: string;
  submittedText: string;
  usedHint1?: boolean;
  usedHint2?: boolean;
}) => {
  const response = await api.post<SubmitAnswerResponse>('/quiz/answer', data);
  return response.data;
};

export const useHint = async (data: {
  questionId: number;
  hintNumber: 1 | 2;
}) => {
  const response = await api.post('/quiz/hint', data);
  return response.data;
};

export const getLeaderboard = async (limit = 15) => {
  const response = await api.get('/quiz/leaderboard', { params: { limit } });
  return response.data as {
    leaderboard: Array<{
      id: string;
      name: string | null;
      email: string;
      totalPoints: number;
      currentQuestionIndex: number;
    }>;
  };
};
