/**
 * useQuizRoom Hook
 * 
 * Comprehensive hook that combines quiz socket, leaderboard, and actions.
 * Provides a complete API for quiz room operations.
 * 
 * This is the main hook to use in quiz pages/components.
 */

import { useQuizSocket } from './useQuizSocket';
import { useLeaderboard } from './useLeaderboard';
import { useQuizActions } from './useQuizActions';
import { useSocket } from './useSocket';

interface UseQuizRoomOptions {
  /** Current user ID for leaderboard tracking */
  userId?: string;
  /** Auto-join quiz on mount */
  autoJoin?: boolean;
  /** Initial leaderboard limit */
  leaderboardLimit?: number;
}

export const useQuizRoom = (options: UseQuizRoomOptions = {}) => {
  const {
    userId,
    autoJoin = true,
    leaderboardLimit = 15,
  } = options;

  // Socket connection status
  const { isConnected } = useSocket();

  // Quiz state and socket operations
  const quizSocket = useQuizSocket();

  // Leaderboard state and operations
  const leaderboardHook = useLeaderboard({
    currentUserId: userId,
    initialLimit: leaderboardLimit,
    autoFetch: true, // Enable auto-fetch for real-time updates
  });

  // Quiz actions (submit answer, hints, etc.)
  const quizActions = useQuizActions();

  // Auto-join if enabled
  if (autoJoin && isConnected && !quizSocket.isJoined && !quizSocket.isLoading) {
    quizSocket.joinQuiz();
  }

  return {
    // Connection status
    isConnected,

    // Quiz state
    currentQuestion: quizSocket.currentQuestion,
    userStats: quizSocket.userStats,
    isJoined: quizSocket.isJoined,
    isLoading: quizSocket.isLoading,

    // Leaderboard state
    leaderboard: leaderboardHook.leaderboard,
    currentUserRank: leaderboardHook.currentUserRank,
    leaderboardLoading: leaderboardHook.isLoading,

    // Combined errors
    error: quizSocket.error || leaderboardHook.error || quizActions.submitError,

    // Quiz actions
    joinQuiz: quizSocket.joinQuiz,
    resetQuiz: quizSocket.resetState,
    updateQuestion: quizSocket.updateQuestion,

    // Leaderboard actions
    refreshLeaderboard: leaderboardHook.refreshLeaderboard,
    requestLeaderboard: leaderboardHook.requestLeaderboard,
    requestAllLeaderboard: leaderboardHook.requestAllLeaderboard,

    // Answer submission
    submitAnswer: quizActions.submitAnswer,
    isSubmitting: quizActions.isSubmitting,
    lastSubmitResult: quizActions.lastResult,
    clearLastResult: quizActions.clearLastResult,

    // Hints
    useHint: quizActions.useHint,
    usedHints: quizActions.usedHints,
    resetHints: quizActions.resetHints,

    // Error handling
    clearError: () => {
      quizSocket.clearError();
      leaderboardHook.clearError();
      quizActions.clearSubmitError();
    },
  };
};
