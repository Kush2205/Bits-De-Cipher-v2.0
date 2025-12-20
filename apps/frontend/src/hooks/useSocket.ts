/**
 * useSocket Hook
 * 
 * Custom hook for accessing WebSocket context and methods.
 * Must be used within SocketProvider.
 */

import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};
