/**
 * Socket.IO Client Singleton Manager
 * 
 * Centralized socket management with proper cleanup and reconnection handling.
 * Integrates with backend socket events from contest.socket.ts
 */

import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

/**
 * Get the current socket instance
 */
export const getSocket = (): Socket | null => {
  return socketInstance;
};

/**
 * Initialize socket connection with JWT token
 */
export const initializeSocket = (token: string): Socket => {
  // Return existing connected socket
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // Disconnect existing socket if not connected
  if (socketInstance) {
    socketInstance.disconnect();
  }

  const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

  console.log('🔌 Initializing Socket.IO connection to:', socketUrl);

  socketInstance = io(socketUrl, {
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  // Log connection events
  socketInstance.on('connect', () => {
    console.log('✅ Socket connected:', socketInstance?.id);
  });

  socketInstance.on('disconnect', (reason: string) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socketInstance.on('connect_error', (error: Error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  return socketInstance;
};

/**
 * Disconnect and cleanup socket instance
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    console.log('🔌 Disconnecting socket and cleaning up...');
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Update socket token (e.g., after token refresh)
 */
export const updateSocketToken = (token: string) => {
  if (socketInstance) {
    console.log('🔄 Updating socket token...');
    socketInstance.io.opts.extraHeaders = {
      Authorization: `Bearer ${token}`,
    };
    socketInstance.disconnect().connect();
  }
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  return socketInstance?.connected || false;
};
