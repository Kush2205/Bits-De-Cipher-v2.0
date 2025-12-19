/**
 * useQuiz Hook
 * 
 * Custom hook for quiz-related operations.
 * 
 * Returns:
 * - quizzes: List of available quizzes
 * - currentQuiz: Currently active quiz
 * - loading: Loading state
 * - error: Error message
 * - fetchQuizzes: Function to load quizzes
 * - startQuiz: Function to start quiz session
 * - submitAnswer: Function to submit answer
 * - completeQuiz: Function to finish quiz
 * 
 * Features to Implement:
 * 
 * 1. Fetch Quizzes:
 *    - GET /quiz/list
 *    - Pagination support
 *    - Cache results
 *    - Loading and error states
 * 
 * 2. Start Quiz:
 *    - POST /quiz/:quizId/start
 *    - Create quiz session
 *    - Get sessionId
 *    - Connect to WebSocket
 * 
 * 3. Submit Answer:
 *    - Emit WebSocket event
 *    - Track time taken
 *    - Handle response
 *    - Update local state
 * 
 * 4. Quiz State Management:
 *    - Track current question
 *    - Store user answers
 *    - Calculate progress
 *    - Handle quiz completion
 * 
 * 5. Error Handling:
 *    - Network errors
 *    - Validation errors
 *    - Session expiry
 * 
 * Example Usage:
 * const { 
 *   quizzes, 
 *   loading, 
 *   fetchQuizzes, 
 *   startQuiz 
 * } = useQuiz();
 * 
 * useEffect(() => {
 *   fetchQuizzes();
 * }, []);
 * 
 * const handleStartQuiz = async (quizId) => {
 *   const session = await startQuiz(quizId);
 *   navigate(`/quiz/${session.id}`);
 * };
 */

import { useState, useCallback } from 'react';
import * as quizService from '../services/quiz.service';

interface Question {
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

interface HintUsage {
  hint1Used: boolean;
  hint2Used: boolean;
}

interface SubmitAnswerResult {
  isCorrect: boolean;
  awardedPoints: number;
  alreadyCompleted: boolean;
}

export const useQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [hints, setHints] = useState<Array<{ id: number; name: string; hintText: string }>>([]);
  const [hintUsage, setHintUsage] = useState<HintUsage>({ hint1Used: false, hint2Used: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizService.getCurrentQuestion();
      setCurrentQuestion(data.question);
      if (data.question?.hints) {
        setHints(data.question.hints);
      }
      // Reset hint usage for new question
      setHintUsage({ hint1Used: false, hint2Used: false });
      return data.question;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch question';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHints = useCallback(async (questionId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz/${questionId}/hints`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setHints(data.hints || []);
      setHintUsage(data.hintUsage || { hint1Used: false, hint2Used: false });
      return data;
    } catch (err: any) {
      console.error('Failed to fetch hints:', err);
      throw err;
    }
  }, []);

  const submitAnswer = useCallback(async (questionId: number, submittedText: string): Promise<SubmitAnswerResult> => {
    setLoading(true);
    setError(null);
    try {
      const result = await quizService.submitAnswer({
        questionId: questionId.toString(),
        submittedText,
        usedHint1: hintUsage.hint1Used,
        usedHint2: hintUsage.hint2Used,
      });
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to submit answer';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hintUsage]);

  const useHint = useCallback(async (questionId: number, hintNumber: 1 | 2) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quiz/${questionId}/use-hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ questionId, hintNumber }),
      });
      const data = await response.json();
      
      // Update local hint usage
      setHintUsage(prev => ({
        ...prev,
        [`hint${hintNumber}Used`]: true,
      }));
      
      return data;
    } catch (err: any) {
      console.error('Failed to use hint:', err);
      throw err;
    }
  }, []);

  return {
    currentQuestion,
    hints,
    hintUsage,
    loading,
    error,
    fetchCurrentQuestion,
    fetchHints,
    submitAnswer,
    useHint,
    setHintUsage,
  };
};
