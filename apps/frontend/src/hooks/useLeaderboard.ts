/**
 * useLeaderboard Hook
 * 
 * Manages leaderboard state and real-time updates via socket.
 * Handles both initial leaderboard data and live updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import type {
  LeaderboardUpdatePayload,
  LeaderboardDataPayload,
  BackendLeaderboardEntry,
} from '../types';

interface UseLeaderboardOptions {
  /** Auto-request leaderboard on mount */
  autoFetch?: boolean;
  /** Initial limit for leaderboard entries */
  initialLimit?: number;
  /** Current user ID for tracking position changes */
  currentUserId?: string;
}

interface UseLeaderboardReturn {
  // State
  leaderboard: BackendLeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  currentUserRank: number | null;

  // Actions
  requestLeaderboard: (limit?: number) => void;
  requestAllLeaderboard: () => void;
  refreshLeaderboard: () => void;
  clearError: () => void;
}

export const useLeaderboard = (options: UseLeaderboardOptions = {}): UseLeaderboardReturn => {
  const {
    autoFetch = false,
    initialLimit = 15,
    currentUserId,
  } = options;

  const { emit, on, off, isConnected } = useSocket();

  // State
  const [leaderboard, setLeaderboard] = useState<BackendLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'limited'>('limited'); // Track if viewing all or limited

  /**
   * Calculate current user's rank
   */
  const currentUserRank = leaderboard.findIndex(
    (entry) => entry.id === currentUserId
  ) + 1 || null;

  /**
   * Request leaderboard with limit
   */
  const requestLeaderboard = useCallback((limit: number = initialLimit) => {
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }

    console.log(`Requesting leaderboard (limit: ${limit})`);
    setIsLoading(true);
    setError(null);
    setViewMode('limited');
    emit('requestLeaderboard', { limit });
  }, [isConnected, emit, initialLimit]);

  /**
   * Request all leaderboard entries
   */
  const requestAllLeaderboard = useCallback(() => {
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }

    console.log('Requesting all leaderboard entries');
    setIsLoading(true);
    setError(null);
    setViewMode('all');
    emit('requestAllLeaderboard');
  }, [isConnected, emit]);

  /**
   * Refresh leaderboard (uses current limit)
   */
  const refreshLeaderboard = useCallback(() => {
    requestLeaderboard(initialLimit);
  }, [requestLeaderboard, initialLimit]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear state when socket disconnects
   */
  useEffect(() => {
    if (!isConnected) {
      setLeaderboard([]);
      setIsLoading(false);
    }
  }, [isConnected]);

  /**
   * Socket event listeners
   */
  useEffect(() => {
    if (!isConnected) return;

    // Handle leaderboard data response
    const handleLeaderboardData = (data: LeaderboardDataPayload) => {
      console.log('Received leaderboard data:', data.leaderboard.length, 'entries');
      setLeaderboard(data.leaderboard);
      setIsLoading(false);
      setError(null);
    };

    // Handle all leaderboard data response
    const handleAllLeaderboardData = (data: LeaderboardDataPayload) => {
      console.log('Received all leaderboard data:', data.leaderboard.length, 'entries');
      setLeaderboard(data.leaderboard);
      setIsLoading(false);
      setError(null);
    };

    // Handle real-time leaderboard updates (when someone answers)
    const handleLeaderboardUpdate = (data: LeaderboardUpdatePayload) => {
      console.log('Leaderboard update received:', data);

      setLeaderboard((prev) => {
        // If viewing all leaderboard, we need to merge carefully
        if (viewMode === 'all') {
          // Find and update the user's entry
          const existingIndex = prev.findIndex((entry) => entry.id === data.userId);

          let updated: BackendLeaderboardEntry[];

          if (existingIndex !== -1) {
            // Update existing entry with new points and question index
            updated = prev.map((entry) =>
              entry.id === data.userId
                ? { 
                    ...entry, 
                    totalPoints: data.totalPoints,
                    currentQuestionIndex: (data as any).currentQuestionIndex ?? entry.currentQuestionIndex
                  }
                : entry
            );
          } else {
            // New user not in current leaderboard - add them
            const newEntry: BackendLeaderboardEntry = {
              id: data.userId,
              email: (data as any).email || '',
              name: (data as any).name || null,
              totalPoints: data.totalPoints,
              currentQuestionIndex: (data as any).currentQuestionIndex ?? 0,
            };
            updated = [...prev, newEntry];
            console.log('Added new user to leaderboard:', newEntry);
          }

          // Re-sort by totalPoints descending
          return updated.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
              return b.totalPoints - a.totalPoints;
            }
            return 0;
          });
        } else {
          // For limited view, just update if user exists
          const existingIndex = prev.findIndex((entry) => entry.id === data.userId);

          if (existingIndex !== -1) {
            const updated = prev.map((entry) =>
              entry.id === data.userId
                ? { 
                    ...entry, 
                    totalPoints: data.totalPoints,
                    currentQuestionIndex: (data as any).currentQuestionIndex ?? entry.currentQuestionIndex
                  }
                : entry
            );

            return updated.sort((a, b) => {
              if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
              }
              return 0;
            });
          }

          return prev;
        }
      });
    };

    // Handle errors
    const handleError = (data: { message: string }) => {
      console.error('Leaderboard error:', data.message);
      setError(data.message);
      setIsLoading(false);
    };

    // Register event listeners
    on('leaderboardData', handleLeaderboardData);
    on('allLeaderboardData', handleAllLeaderboardData);
    on('leaderboard:update', handleLeaderboardUpdate);
    on('error', handleError);

    // Cleanup listeners on unmount
    return () => {
      off('leaderboardData', handleLeaderboardData);
      off('allLeaderboardData', handleAllLeaderboardData);
      off('leaderboard:update', handleLeaderboardUpdate);
      off('error', handleError);
    };
  }, [isConnected, on, off, viewMode]);

  /**
   * Auto-fetch leaderboard on mount if enabled
   */
  useEffect(() => {
    if (autoFetch && isConnected) {
      requestLeaderboard(initialLimit);
    }
  }, [autoFetch, isConnected, requestLeaderboard, initialLimit]);

  /**
   * Handle initial data which includes leaderboard
   */
  useEffect(() => {
    if (!isConnected) return;

    const handleInitialData = (data: { leaderboard: BackendLeaderboardEntry[] }) => {
      if (data.leaderboard) {
        console.log('Setting leaderboard from initial data');
        setLeaderboard(data.leaderboard);
      }
    };

    on('initialData', handleInitialData);

    return () => {
      off('initialData', handleInitialData);
    };
  }, [isConnected, on, off]);

  return {
    // State
    leaderboard,
    isLoading,
    error,
    currentUserRank,

    // Actions
    requestLeaderboard,
    requestAllLeaderboard,
    refreshLeaderboard,
    clearError,
  };
};
