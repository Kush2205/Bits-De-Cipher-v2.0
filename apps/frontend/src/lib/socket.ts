/**
 * WebSocket Manager
 * 
 * Manages Socket.IO connection to backend server.
 * Handles authentication, event emission, and listener management.
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketManager {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  /**
   * Initialize socket connection with JWT authentication
   * @param token - JWT access token
   */
  connect(token: string) {
    if (this.socket?.connected) {
      console.warn('Socket already connected');
      return this.socket;
    }

    console.log('🔌 Initializing socket connection to:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      // Primary auth method - passed in handshake auth
      auth: {
        token: token
      },
      // Backup auth methods
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
      query: {
        token: token
      },
      // Connection settings
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully!', {
        id: this.socket?.id,
        transport: this.socket?.io.engine.transport.name
      });
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      console.error('🔴 Socket connection error:', {
        message: error.message,
        description: error.message.includes('Authentication') 
          ? 'Token authentication failed. Please login again.' 
          : 'Failed to connect to server. Is the backend running?'
      });
    });

    this.socket.on('error', (error) => {
      console.error('🔴 Socket error:', error);
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}...`);
    });

    this.socket.io.on('reconnect', (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
    });

    return this.socket;
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Emit event to server
   * @param event - Event name
   * @param data - Event payload
   * @param callback - Optional acknowledgment callback
   */
  emit(event: string, data?: any, callback?: (response: any) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized. Call connect() first.');
      return;
    }
    
    if (callback) {
      this.socket.emit(event, data, callback);
    } else if (data !== undefined) {
      this.socket.emit(event, data);
    } else {
      this.socket.emit(event);
    }
  }

  /**
   * Listen to event from server
   * @param event - Event name
   * @param handler - Event handler function
   */
  on(event: string, handler: (data: any) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized. Call connect() first.');
      return;
    }
    this.socket.on(event, handler);
  }

  /**
   * Remove event listener
   * @param event - Event name
   * @param handler - Optional specific handler to remove
   */
  off(event: string, handler?: (data: any) => void) {
    if (!this.socket) {
      return;
    }
    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
export default socketManager;
