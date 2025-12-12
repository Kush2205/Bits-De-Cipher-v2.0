/**
 * Socket Context
 * 
 * Global context for managing WebSocket connections across the app.
 * 
 * Context Value:
 * - socket: Socket.io client instance
 * - isConnected: Connection status boolean
 * - emit: Function to emit events
 * - on: Function to add event listeners
 * - off: Function to remove event listeners
 * 
 * Features to Implement:
 * 
 * 1. Socket Initialization:
 *    - Create socket.io client instance
 *    - Connect to backend WebSocket server
 *    - URL: process.env.VITE_API_URL or http://localhost:3000
 * 
 * 2. Authentication:
 *    - Pass JWT token in connection auth
 *    - socket.io({ auth: { token: jwt } })
 *    - Handle authentication errors
 * 
 * 3. Connection Management:
 *    - Track connection status
 *    - Handle connect/disconnect events
 *    - Implement reconnection logic
 *    - Show connection status to user
 * 
 * 4. Event Handling:
 *    - Wrapper functions for emit/on/off
 *    - Type-safe event names and payloads
 *    - Auto-cleanup listeners on unmount
 * 
 * 5. Error Handling:
 *    - Connection errors
 *    - Authentication failures
 *    - Network timeouts
 * 
 * 6. Cleanup:
 *    - Disconnect socket on unmount
 *    - Remove all event listeners
 * 
 * Provider Usage:
 * <SocketProvider>
 *   <App />
 * </SocketProvider>
 * 
 * Hook Usage:
 * const { socket, isConnected, emit, on } = useSocket();
 * 
 * Dependencies to Install:
 * - socket.io-client
 */

import { createContext, useState, useEffect, ReactNode, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: any | null; // Socket type from socket.io-client
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler: (data: any) => void) => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // TODO: Get JWT token from storage
    const token = localStorage.getItem('token');
    
    // TODO: Initialize socket connection
    // socketRef.current = io(BACKEND_URL, {
    //   auth: { token }
    // });

    // TODO: Setup connection event listeners
    // socketRef.current.on('connect', () => setIsConnected(true));
    // socketRef.current.on('disconnect', () => setIsConnected(false));

    // Cleanup on unmount
    return () => {
      // socketRef.current?.disconnect();
    };
  }, []);

  const emit = (event: string, data?: any) => {
    // TODO: Emit socket event
    // socketRef.current?.emit(event, data);
  };

  const on = (event: string, handler: (data: any) => void) => {
    // TODO: Add event listener
    // socketRef.current?.on(event, handler);
  };

  const off = (event: string, handler: (data: any) => void) => {
    // TODO: Remove event listener
    // socketRef.current?.off(event, handler);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        emit,
        on,
        off
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
