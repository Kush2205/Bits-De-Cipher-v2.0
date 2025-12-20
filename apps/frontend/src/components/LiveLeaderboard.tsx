/**
 * Live Leaderboard Component
 * 
 * Displays real-time rankings during quiz sessions.
 */

import type { BackendLeaderboardEntry } from '../types';

interface LiveLeaderboardProps {
  participants: BackendLeaderboardEntry[];
  currentUserId: string;
  compact?: boolean;
  limit?: number;
}

const LiveLeaderboard = ({
  participants,
  currentUserId,
  compact = false,
  limit
}: LiveLeaderboardProps) => {
  // Apply limit if specified
  const displayedParticipants = limit ? participants.slice(0, limit) : participants;

  // Get medal emoji for top 3
  const getMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  // Get background color based on rank
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-600/20 to-yellow-800/20 border-yellow-600/50';
      case 2:
        return 'from-gray-400/20 to-gray-600/20 border-gray-400/50';
      case 3:
        return 'from-orange-600/20 to-orange-800/20 border-orange-600/50';
      default:
        return 'from-gray-800/50 to-gray-900/50 border-gray-700/50';
    }
  };

  if (displayedParticipants.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Live Leaderboard
        </h3>
        <p className="text-gray-400 text-center">No participants yet</p>
      </div>
    );
  }

  return (
    <div className={`bg-[#1a1a1a] rounded-xl ${compact ? 'p-4' : 'p-6'} border border-gray-800`}>
      <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-white mb-4 flex items-center gap-2`}>
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Live Leaderboard
        <span className="ml-auto text-xs text-gray-400 font-normal">
          {displayedParticipants.length} {displayedParticipants.length === 1 ? 'player' : 'players'}
        </span>
      </h3>

      <div className="space-y-2">
        {displayedParticipants.map((participant, index) => {
          const rank = index + 1;
          const isCurrentUser = participant.id === currentUserId;
          const medal = getMedal(rank);

          return (
            <div
              key={participant.id}
              className={`
                relative p-3 rounded-lg border transition-all duration-300
                bg-gradient-to-r ${getRankColor(rank)}
                ${isCurrentUser ? 'ring-2 ring-green-500 shadow-lg shadow-green-900/30' : ''}
                ${compact ? 'p-2' : 'p-3'}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className={`
                  flex-shrink-0 ${compact ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'} 
                  rounded-full flex items-center justify-center font-bold
                  ${rank <= 3 ? 'bg-gradient-to-br from-white/20 to-white/5 text-white' : 'bg-gray-800 text-gray-400'}
                `}>
                  {medal || `#${rank}`}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`
                      ${compact ? 'text-sm' : 'text-base'} font-semibold truncate
                      ${isCurrentUser ? 'text-green-400' : 'text-white'}
                    `}>
                      {participant.name || participant.email.split('@')[0]}
                    </p>
                    {isCurrentUser && (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  {!compact && (
                    <p className="text-xs text-gray-400">
                      {participant.currentQuestionIndex} question{participant.currentQuestionIndex !== 1 ? 's' : ''} solved
                    </p>
                  )}
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <p className={`
                    ${compact ? 'text-base' : 'text-xl'} font-bold
                    ${isCurrentUser ? 'text-green-400' : 'text-white'}
                  `}>
                    {participant.totalPoints}
                  </p>
                  {!compact && (
                    <p className="text-xs text-gray-400">points</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveLeaderboard;
