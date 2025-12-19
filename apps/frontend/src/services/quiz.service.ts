import api from '../lib/api';

export interface Question {
  id: number;
  name: string;
  imageUrl?: string | null;
  points: number;
  maxPoints: number;
  hints?: Array<{
    id: number;
    name: string;
    hintText: string;
  }>;
}

export const getCurrentQuestion = async () => {
  const response = await api.get<{ question: Question | null }>('/quiz/current-question');
  return response.data;
};

export const submitAnswer = async (data: {
  questionId: string;
  submittedText: string;
  usedHint1?: boolean;
  usedHint2?: boolean;
}) => {
  const response = await api.post('/quiz/submit-answer', data);
  return response.data as {
    isCorrect: boolean;
    awardedPoints: number;
    alreadyCompleted: boolean;
  };
};

export const getLeaderboard = async (limit = 15) => {
  const response = await api.get('/leaderboard', { params: { limit } });
  return response.data.leaderboard as Array<{
    id: string;
    name: string | null;
    email: string;
    totalPoints: number;
    currentQuestionIndex: number;
  }>;
};
