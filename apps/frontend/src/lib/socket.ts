import { io, Socket } from 'socket.io-client';

const SOCKET_URL = window.location.origin; 

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
      query: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}...`);
    });

    this.socket.io.on('reconnect', (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event: string, data?: any, callback?: (response: any) => void) {
    if (!this.socket) {
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

  on(event: string, handler: (data: any) => void) {
    if (!this.socket) {
      return;
    }
    this.socket.on(event, handler);
  }

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

  getSocket(): Socket | null {
    return this.socket;
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

export const socketManager = new SocketManager();
export default socketManager;
