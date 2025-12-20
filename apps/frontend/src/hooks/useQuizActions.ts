/**
 * useQuizActions Hook
 * 
 * Provides actions for quiz operations including answer submission and hints.
 * Integrates REST API calls with socket updates.
 */

import { useState, useCallback } from 'react';
import { submitAnswer as submitAnswerAPI, useHint as useHintAPI } from '../services/quiz.service';

interface UseQuizActionsReturn {
  // State
  isSubmitting: boolean;
  submitError: string | null;
  lastResult: SubmitAnswerResult | null;
  usedHints: { hint1: boolean; hint2: boolean };

  // Actions
  submitAnswer: (questionId: number, answer: string) => Promise<SubmitAnswerResult | null>;
  useHint: (questionId: number, hintNumber: 1 | 2) => Promise<boolean>;
  clearSubmitError: () => void;
  clearLastResult: () => void;
  resetHints: () => void;
}

interface SubmitAnswerResult {
  isCorrect: boolean;
  awardedPoints: number;
  alreadyCompleted: boolean;
  totalPoints?: number;
  currentQuestionIndex?: number;
  nextQuestion?: any;
}

export const useQuizActions = (): UseQuizActionsReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SubmitAnswerResult | null>(null);
  const [usedHints, setUsedHints] = useState({ hint1: false, hint2: false });

  /**
   * Submit answer via REST API
   * Backend will broadcast leaderboard update via socket
   */
  const submitAnswer = useCallback(async (
    questionId: number,
    answer: string
  ): Promise<SubmitAnswerResult | null> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitAnswerAPI({
        questionId: questionId.toString(),
        submittedText: answer,
        usedHint1: usedHints.hint1,
        usedHint2: usedHints.hint2,
      });

      setLastResult(result);
      setIsSubmitting(false);

      // Reset hints for next question if correct
      if (result.isCorrect && !result.alreadyCompleted) {
        setUsedHints({ hint1: false, hint2: false });
      }

      return result;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit answer';
      setSubmitError(errorMessage);
      setIsSubmitting(false);
      return null;
    }
  }, [usedHints]);

  /**
   * Use a hint for the current question
   */
  const useHint = useCallback(async (
    questionId: number,
    hintNumber: 1 | 2
  ): Promise<boolean> => {
    try {
      await useHintAPI({ questionId, hintNumber });
      
      setUsedHints((prev) => ({
        ...prev,
        [hintNumber === 1 ? 'hint1' : 'hint2']: true,
      }));

      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to use hint';
      setSubmitError(errorMessage);
      return false;
    }
  }, []);

  /**
   * Clear submit error
   */
  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  /**
   * Clear last result
   */
  const clearLastResult = useCallback(() => {
    setLastResult(null);
  }, []);

  /**
   * Reset hints (for new question)
   */
  const resetHints = useCallback(() => {
    setUsedHints({ hint1: false, hint2: false });
  }, []);

  return {
    isSubmitting,
    submitError,
    lastResult,
    usedHints,
    submitAnswer,
    useHint,
    clearSubmitError,
    clearLastResult,
    resetHints,
  };
};
