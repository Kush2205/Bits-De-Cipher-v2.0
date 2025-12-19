/**
 * Socket Connection Status Indicator
 * 
 * Shows real-time connection status and allows manual reconnection.
 */

import { useSocket } from '../../hooks/useSocket';

export const SocketStatus = () => {
  const { isConnected, error, reconnect } = useSocket();

  if (isConnected && !error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 text-green-400 text-xs font-medium">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        Live
      </div>
    );
  }

  if (error) {
    return (
      <button
        onClick={reconnect}
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/20 text-red-400 text-xs font-medium hover:bg-red-900/30 transition cursor-pointer"
        title={error}
      >
        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
        Disconnected (Click to retry)
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-900/20 text-yellow-400 text-xs font-medium">
      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
      Connecting...
    </div>
  );
};
