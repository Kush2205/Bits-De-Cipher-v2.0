import type { LeaderboardEntry } from '../types/leaderboard';

interface LiveLeaderboardProps {
  participants: LeaderboardEntry[];
  currentUserId?: string;
  limit?: number;
  isLoading?: boolean;
}

const LiveLeaderboard = ({ participants, currentUserId, limit, isLoading }: LiveLeaderboardProps) => {
  const sortedParticipants = participants;

  let entries = sortedParticipants;

  if (limit !== undefined) {
    const topEntries = sortedParticipants.slice(0, limit);

    const currentUserEntry = currentUserId
      ? sortedParticipants.find((p) => p.id === currentUserId)
      : null;

    const isUserInTop = currentUserEntry
      ? topEntries.some((p) => p.id === currentUserEntry.id)
      : false;

    entries =
      isUserInTop || !currentUserEntry
        ? topEntries
        : [...topEntries, currentUserEntry];
  }

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-gray-500">No players yet</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-800/50 px-5 py-4 shrink-0">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
          Live Rankings
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">
          {sortedParticipants.length} competitors
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-0.5 p-3">
          {entries.map((entry) => {
            const isCurrentUser = entry.id === currentUserId;
            const rank =
              sortedParticipants.findIndex((p) => p.id === entry.id) + 1;

            const isTopThree = rank <= 3;
            const showDivider = isCurrentUser && limit !== undefined && rank > limit;

            return (
              <div key={entry.id}>
                {showDivider && (
                  <div className="my-2 shrink-0 border-t border-gray-800/50 text-center text-xs text-gray-500">
                    Your position
                  </div>
                )}

                <div
                  className={`relative flex items-center justify-between rounded-lg px-3 py-2.5 transition ${
                    isCurrentUser
                      ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30'
                      : 'hover:bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-sm font-bold ${
                        isTopThree
                          ? rank === 1
                            ? 'text-yellow-400'
                            : rank === 2
                            ? 'text-gray-300'
                            : 'text-amber-600'
                          : 'text-gray-600'
                      }`}
                    >
                      #{rank}
                    </span>

                    <span
                      className={`truncate text-sm ${
                        isCurrentUser ? 'text-white' : 'text-gray-200'
                      }`}
                    >
                      {entry.name || 'Anonymous'}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-emerald-400">
                    {entry.totalPoints.toLocaleString()}
                  </span>

                  {isCurrentUser && (
                    <div className="absolute -left-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r bg-emerald-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


export default LiveLeaderboard;
