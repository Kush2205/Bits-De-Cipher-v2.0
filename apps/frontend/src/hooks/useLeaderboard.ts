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

  const { emit, on, off, isConnected, socket } = useSocket();

  // State
  const [leaderboard, setLeaderboard] = useState<BackendLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'limited'>('limited'); // Track if viewing all or limited
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger to force refresh

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

      // Find if user exists in current leaderboard
      setLeaderboard((prev) => {
        const existingIndex = prev.findIndex((entry) => entry.id === data.userId);

        if (existingIndex !== -1) {
          // User exists - update their data immediately
          const updated = prev.map((entry) =>
            entry.id === data.userId
              ? { 
                  ...entry, 
                  totalPoints: data.totalPoints,
                  currentQuestionIndex: data.currentQuestionIndex || entry.currentQuestionIndex
                }
              : entry
          );

          // Re-sort by totalPoints descending
          return updated.sort((a, b) => b.totalPoints - a.totalPoints);
        } else {
          // New user detected - trigger refresh outside of setState
          console.log('New user detected, triggering background refresh...');
          // Use setTimeout to avoid setState during render
          setTimeout(() => {
            if (viewMode === 'all' && socket) {
              socket.emit('requestAllLeaderboard');
            }
          }, 0);
          
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
  }, [isConnected, on, off, viewMode, socket]);

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

  /**
   * Auto-refresh leaderboard periodically when viewing 'all' mode
   * This ensures new users appear even if socket updates are missed
   */
  useEffect(() => {
    if (!isConnected || viewMode !== 'all') return;

    // Refresh every 3 seconds when viewing all leaderboard
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing full leaderboard...');
      if (socket) {
        socket.emit('requestAllLeaderboard');
      }
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isConnected, viewMode, socket]);

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
