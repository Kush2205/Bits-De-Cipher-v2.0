/**
 * useQuizSocket Hook
 * 
 * Manages quiz-related socket operations and state.
 * Provides clean API for joining quiz, receiving questions, and real-time updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import type {
  InitialDataPayload,
  SocketErrorPayload,
  BackendQuestion,
  BackendUserStats,
} from '../types';

interface UseQuizSocketReturn {
  // State
  currentQuestion: BackendQuestion | null;
  userStats: BackendUserStats | null;
  isJoined: boolean;
  error: string | null;
  isLoading: boolean;

  // Actions
  joinQuiz: () => void;
  clearError: () => void;
  resetState: () => void;
  updateQuestion: (question: BackendQuestion | null, userStats?: Partial<BackendUserStats>) => void;
}

export const useQuizSocket = (): UseQuizSocketReturn => {
  const { emit, on, off, isConnected } = useSocket();

  // State
  const [currentQuestion, setCurrentQuestion] = useState<BackendQuestion | null>(null);
  const [userStats, setUserStats] = useState<BackendUserStats | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ref to track if join has been called
  const hasJoinedRef = useRef(false);

  /**
   * Join the quiz and receive initial data
   */
  const joinQuiz = useCallback(() => {
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }

    if (hasJoinedRef.current) {
      console.log('Already joined quiz');
      return;
    }

    console.log('Joining quiz...');
    setIsLoading(true);
    setError(null);
    emit('joinQuiz');
    hasJoinedRef.current = true;
  }, [isConnected, emit]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state (useful for re-joining or cleanup)
   */
  const resetState = useCallback(() => {
    setCurrentQuestion(null);
    setUserStats(null);
    setIsJoined(false);
    setError(null);
    setIsLoading(false);
    hasJoinedRef.current = false;
  }, []);

  /**
   * Manually update the current question and user stats
   * Used when moving to next question after correct answer
   */
  const updateQuestion = useCallback((
    question: BackendQuestion | null,
    userStatsUpdate?: Partial<BackendUserStats>
  ) => {
    setCurrentQuestion(question);
    if (userStatsUpdate && userStats) {
      setUserStats({ ...userStats, ...userStatsUpdate });
    }
  }, [userStats]);

  /**
   * Reset state when socket disconnects
   */
  useEffect(() => {
    if (!isConnected) {
      resetState();
    }
  }, [isConnected, resetState]);

  /**
   * Socket event listeners
   */
  useEffect(() => {
    if (!isConnected) return;

    // Handle initial data from server
    const handleInitialData = (data: InitialDataPayload) => {
      console.log('Received initial quiz data:', data);
      setCurrentQuestion(data.currentQuestion);
      setUserStats(data.userStats);
      setIsJoined(true);
      setIsLoading(false);
      setError(null);
    };

    // Handle errors from server
    const handleError = (data: SocketErrorPayload) => {
      console.error('Quiz socket error:', data.message);
      setError(data.message);
      setIsLoading(false);
    };

    // Register event listeners
    on('initialData', handleInitialData);
    on('error', handleError);

    // Cleanup listeners on unmount
    return () => {
      off('initialData', handleInitialData);
      off('error', handleError);
    };
  }, [isConnected, on, off]);

  /**
   * Auto-join when connected (optional - can be controlled by parent)
   */
  useEffect(() => {
    // Only auto-join if explicitly needed
    // Parent component should call joinQuiz() manually for better control
  }, []);

  return {
    // State
    currentQuestion,
    userStats,
    isJoined,
    error,
    isLoading,

    // Actions
    joinQuiz,
    clearError,
    resetState,
    updateQuestion,
  };
};
