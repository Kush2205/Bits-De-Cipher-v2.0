import api from '../lib/api';

export interface QuestionPayload {
  id: string;
  index: number;
  text: string;
  imageUrl?: string | null;
  originalPoints: number;
  currentPoints: number;
  minPoints: number;
  decayPercent: number;
  hint1Text?: string | null;
  hint2Text?: string | null;
  hint1Penalty?: number | null;
  hint2Penalty?: number | null;
  hint1UnlockSec?: number | null;
  hint2UnlockSec?: number | null;
}

export const getCurrentQuestion = async () => {
  const response = await api.get<{ question: QuestionPayload | null }>('/quiz/current');
  return response.data;
};

export const submitAnswer = async (data: {
  questionId: string;
  submittedText: string;
  usedHint1?: boolean;
  usedHint2?: boolean;
}) => {
  const response = await api.post('/quiz/answer', data);
  return response.data as {
    isCorrect: boolean;
    awardedPoints: number;
    alreadyCompleted: boolean;
  };
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
