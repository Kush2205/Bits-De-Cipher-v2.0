/**
 * WebSocket Manager
 * 
 * Utility class for managing Socket.io connections and events.
 * 
 * Features to Implement:
 * 
 * 1. Connection Management:
 *    - Initialize socket connection
 *    - Handle authentication
 *    - Manage connection state
 *    - Implement reconnection logic
 * 
 * 2. Event Emitters:
 *    - Type-safe event emission
 *    - Error handling for emit failures
 *    - Acknowledgment callbacks
 * 
 * 3. Event Listeners:
 *    - Register event handlers
 *    - Remove event listeners
 *    - One-time event listeners
 * 
 * 4. Room Management:
 *    - Join quiz session rooms
 *    - Leave rooms
 *    - Subscribe to channels
 * 
 * 5. Connection Events:
 *    - Handle connect event
 *    - Handle disconnect event
 *    - Handle reconnect event
 *    - Handle error events
 * 
 * Example Usage:
 * import { socketManager } from './lib/socket';
 * 
 * // Connect
 * socketManager.connect(token);
 * 
 * // Join room
 * socketManager.joinQuizSession(sessionId);
 * 
 * // Listen to events
 * socketManager.on('leaderboard-update', (data) => {
 *   updateLeaderboard(data);
 * });
 * 
 * // Emit events
 * socketManager.emit('submit-answer', {
 *   sessionId,
 *   questionId,
 *   selectedOption
 * });
 * 
 * // Cleanup
 * socketManager.disconnect();
 */

// import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketManager {
  private socket: any = null;
  private isConnected: boolean = false;

  // TODO: Initialize connection
  connect(token: string) {
    // this.socket = io(SOCKET_URL, {
    //   auth: { token }
    // });
    
    // Setup event listeners
    // this.socket.on('connect', this.handleConnect);
    // this.socket.on('disconnect', this.handleDisconnect);
  }

  // TODO: Disconnect
  disconnect() {
    // this.socket?.disconnect();
    this.isConnected = false;
  }

  // TODO: Emit event
  emit(event: string, data?: any, callback?: (response: any) => void) {
    // this.socket?.emit(event, data, callback);
  }

  // TODO: Listen to event
  on(event: string, handler: (data: any) => void) {
    // this.socket?.on(event, handler);
  }

  // TODO: Remove listener
  off(event: string, handler?: (data: any) => void) {
    // this.socket?.off(event, handler);
  }

  // TODO: Join quiz session
  joinQuizSession(sessionId: string) {
    this.emit('join-quiz-session', { sessionId });
  }

  // TODO: Subscribe to leaderboard
  subscribeToLeaderboard(type: 'global' | 'quiz', quizId?: string) {
    if (type === 'global') {
      this.emit('subscribe-global-leaderboard');
    } else if (type === 'quiz' && quizId) {
      this.emit('subscribe-quiz-leaderboard', { quizId });
    }
  }

  // Connection handlers
  private handleConnect = () => {
    this.isConnected = true;
    console.log('Socket connected');
  };

  private handleDisconnect = () => {
    this.isConnected = false;
    console.log('Socket disconnected');
  };

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const socketManager = new SocketManager();
