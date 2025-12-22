/**
 * Socket Context
 * 
 * Global context for managing WebSocket connections across the app.
 * Automatically connects when user is authenticated and token is available.
 */

import { createContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { socketManager } from '../lib/socket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler?: (data: any) => void) => void;
  reconnect: () => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Get JWT token from storage
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.log('No auth token found, skipping socket connection');
      return;
    }

    // Initialize socket connection with token
    const socket = socketManager.connect(token);
    socketRef.current = socket;

    // Setup connection event listeners
    const handleConnect = () => {
      console.log('Socket connected in context');
      setIsConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      console.log('Socket disconnected in context:', reason);
      setIsConnected(false);
      
      // Auto-reconnect after disconnect (except when explicitly disconnected by client)
      if (reason !== 'io client disconnect') {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          const token = localStorage.getItem('accessToken');
          if (token && socketRef.current) {
            console.log('Attempting to reconnect...');
            socketRef.current.connect();
          }
        }, 2000);
      }
    };

    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      if (error.message.includes('Authentication')) {
        console.warn('Socket authentication failed - token may be invalid or expired');
      } else {
        console.error('Socket connection error in context:', error.message);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Set initial connection status
    if (socket.connected) {
      setIsConnected(true);
    }

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socketManager.disconnect();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const emit = (event: string, data?: any) => {
    socketManager.emit(event, data);
  };

  const on = (event: string, handler: (data: any) => void) => {
    socketManager.on(event, handler);
  };

  const off = (event: string, handler?: (data: any) => void) => {
    socketManager.off(event, handler);
  };

  const reconnect = () => {
    console.log('🔄 Manual socket reconnect triggered');
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.warn('No token found for reconnection');
      return;
    }

    // Disconnect existing socket
    socketManager.disconnect();
    
    // Connect with new token
    const socket = socketManager.connect(token);
    socketRef.current = socket;

    // Re-attach event listeners
    const handleConnect = () => {
      console.log('Socket reconnected successfully');
      setIsConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      console.error('Socket connection error:', error.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Set initial connection status
    if (socket.connected) {
      setIsConnected(true);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        emit,
        on,
        off,
        reconnect
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
