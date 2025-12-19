/**
 * useSocket Hook
 * 
 * Manages WebSocket connection using Socket.IO with proper authentication,
 * reconnection handling, and event listener cleanup.
 * 
 * Backend Socket Events (from contest.socket.ts):
 * 
 * Client → Server:
 * - joinQuiz: Join the game room and receive initial data
 * - requestCurrentQuestion: Request current question for user
 * - answerSubmitted: Notify answer submission (used internally)
 * - requestLeaderboard: Request leaderboard with limit
 * - requestAllLeaderboard: Request full leaderboard
 * - typing: Notify user is typing
 * - stopTyping: Notify user stopped typing
 * - requestUserStats: Request current user stats
 * - requestHintUsage: Request hint usage for a question
 * - hintUsed: Notify hint was used
 * 
 * Server → Client:
 * - initialData: Initial quiz data on join
 * - currentQuestion: Current question data
 * - noMoreQuestions: No more questions available
 * - userAnswered: Another user answered (broadcast)
 * - userJoined: User joined room (broadcast)
 * - userLeft: User left room (broadcast)
 * - leaderboardData: Leaderboard data response
 * - allLeaderboardData: Full leaderboard response
 * - userTyping: User is typing (broadcast)
 * - userStoppedTyping: User stopped typing (broadcast)
 * - userStats: User stats data
 * - hintUsageData: Hint usage data
 * - hintMarked: Hint marked as used
 * - error: Error message
 * - leaderboard:update: Leaderboard changed (trigger refresh)
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, getSocket, disconnectSocket as cleanupSocket } from '../lib/socket';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No authentication token found');
      return;
    }

    // Get or create socket instance
    let socket = getSocket();
    
    if (!socket) {
      socket = initializeSocket(token);
    }

    socketRef.current = socket;

    // Connection event handlers
    const handleConnect = () => {
      console.log('✅ Socket connected:', socket?.id);
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    };

    const handleConnectError = (err: Error) => {
      console.error('❌ Socket connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        socket?.disconnect();
      }
    };

    const handleDisconnect = (reason: string) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      
      // Auto-reconnect unless manually disconnected
      if (reason === 'io server disconnect') {
        socket?.connect();
      }
    };

    const handleReconnectAttempt = (attempt: number) => {
      console.log(`🔄 Reconnection attempt ${attempt}/${maxReconnectAttempts}`);
    };

    const handleReconnect = (attempt: number) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    };

    const handleReconnectFailed = () => {
      console.error('❌ Failed to reconnect after maximum attempts');
      setError('Connection failed. Please refresh the page.');
    };

    const handleBackendError = (data: { message: string }) => {
      console.error('Backend error:', data.message);
      setError(data.message);
    };

    // Register event handlers
    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_failed', handleReconnectFailed);
    socket.on('error', handleBackendError);

    // Set initial connection state
    setIsConnected(socket.connected);

    // Cleanup on unmount
    return () => {
      // Remove only the connection event listeners
      socket?.off('connect', handleConnect);
      socket?.off('connect_error', handleConnectError);
      socket?.off('disconnect', handleDisconnect);
      socket?.off('reconnect_attempt', handleReconnectAttempt);
      socket?.off('reconnect', handleReconnect);
      socket?.off('reconnect_failed', handleReconnectFailed);
      socket?.off('error', handleBackendError);
    };
  }, []);

  // Emit event to server
  const emit = useCallback((event: string, data?: any) => {
    const socket = socketRef.current;
    
    if (!socket) {
      console.warn('Socket not initialized');
      return;
    }

    if (!socket.connected) {
      console.warn('Socket not connected, cannot emit event:', event);
      return;
    }

    socket.emit(event, data);
  }, []);

  // Listen to server events
  const on = useCallback((event: string, handler: (data: any) => void) => {
    const socket = socketRef.current;
    
    if (!socket) {
      console.warn('Socket not initialized');
      return;
    }

    socket.on(event, handler);
  }, []);

  // Remove event listener
  const off = useCallback((event: string, handler?: (data: any) => void) => {
    const socket = socketRef.current;
    
    if (!socket) {
      return;
    }

    if (handler) {
      socket.off(event, handler);
    } else {
      socket.off(event);
    }
  }, []);

  // Force reconnect
  const reconnect = useCallback(() => {
    const socket = socketRef.current;
    
    if (socket) {
      console.log('Forcing reconnection...');
      reconnectAttempts.current = 0;
      socket.disconnect().connect();
    }
  }, []);

  // Disconnect and cleanup
  const disconnect = useCallback(() => {
    cleanupSocket();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    off,
    reconnect,
    disconnect,
  };
};
