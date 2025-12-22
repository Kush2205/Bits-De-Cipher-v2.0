import type { LeaderboardEntry } from '../types/leaderboard';
import { LeaderboardTable } from './leaderboard/LeaderboardTable';

interface LiveLeaderboardProps {
  participants: LeaderboardEntry[];
  currentUserId?: string;
  limit?: number;
  isLoading?: boolean;
}

const LiveLeaderboard = ({ participants, currentUserId, limit, isLoading }: LiveLeaderboardProps) => {
  const entries = limit ? participants.slice(0, limit) : participants;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Live Leaderboard</h3>
        <span className="text-xs text-gray-500">{entries.length} players</span>
      </div>
      <LeaderboardTable entries={entries} currentUserId={currentUserId} isLoading={isLoading} />
    </div>
  );
};

export default LiveLeaderboard;
