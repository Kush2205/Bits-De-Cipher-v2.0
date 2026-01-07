import type { LeaderboardEntry } from '../../types/leaderboard';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
  currentUserId?: string;
}

export const LeaderboardTable = ({ entries, isLoading = false, currentUserId }: LeaderboardTableProps) => {
  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-800 bg-[#0b0b0b] p-10 text-gray-400">
        Loading leaderboard...
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-800 bg-[#0b0b0b] p-10 text-gray-500">
        No leaderboard data yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#0b0b0b] shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
      <div className="grid grid-cols-12 bg-[#0f0f0f] px-4 py-3 text-xs uppercase tracking-[0.15em] text-gray-500">
        <div className="col-span-2">Rank</div>
        <div className="col-span-4">Competitor</div>
        <div className="col-span-3">Points</div>
        <div className="col-span-3">Solved</div>
      </div>
      <div className="divide-y divide-gray-800">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.id === currentUserId;
          const rank = index + 1;

          return (
            <div
              key={entry.id}
              className={`grid grid-cols-12 items-center px-4 py-3 text-sm transition hover:bg-emerald-500/5 ${
                isCurrentUser ? 'bg-emerald-500/10 border-l-2 border-emerald-400' : ''
              }`}
            >
              <div className="col-span-2 flex items-center gap-2 text-gray-300">
                <span className="text-lg font-semibold text-emerald-400">#{rank}</span>
              </div>
              <div className="col-span-4 flex flex-col">
                <span className="text-white font-medium">{entry.name || 'Anonymous'}</span>
                <span className="text-gray-500 text-xs">{entry.email}</span>
              </div>
              <div className="col-span-3 text-white font-semibold">
                {entry.totalPoints.toLocaleString()}
              </div>
              <div className="col-span-3 text-gray-300">
                {entry.currentQuestionIndex}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
