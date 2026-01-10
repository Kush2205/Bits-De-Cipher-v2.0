import type { LeaderboardView } from '../../types/leaderboard';

interface LeaderboardHeaderProps {
  title: string;
  subtitle?: string;
  totalCount: number;
  view: LeaderboardView;
  onViewChange: (view: LeaderboardView) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  currentUserName?: string | null;
  currentUserRank?: number | null;
}

export const LeaderboardHeader = ({
  title,
  subtitle,
  totalCount,
  view,
  onViewChange,
  onRefresh,
  isLoading,
  isRefreshing,
  currentUserName,
  currentUserRank,
}: LeaderboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-6 border-b border-gray-800 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Leaderboard</p>
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-gray-400 text-sm max-w-2xl">{subtitle}</p>}
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="px-3 py-1 rounded-full bg-gray-900/60 border border-gray-800 text-emerald-300 font-medium">
              {totalCount} {totalCount === 1 ? 'competitor' : 'competitors'}
            </span>
            <span className="h-3 w-px bg-gray-800" />
            <span className="text-gray-500">View</span>
            <div className="inline-flex rounded-lg border border-gray-800 bg-gray-900/60 p-1">
              <button
                onClick={() => onViewChange('top')}
                className={`px-3 py-1 text-sm rounded-md transition ${view === 'top' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]' : 'text-gray-400 hover:text-white'}`}
              >
                Top
              </button>
              <button
                onClick={() => onViewChange('all')}
                className={`px-3 py-1 text-sm rounded-md transition ${view === 'all' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]' : 'text-gray-400 hover:text-white'}`}
              >
                All
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          {currentUserName && (
            <div className="text-right">
              <p className="text-gray-400 text-sm">{currentUserName}</p>
              {currentUserRank ? (
                <p className="text-emerald-400 text-sm font-semibold">Rank #{currentUserRank}</p>
              ) : (
                <p className="text-gray-500 text-xs">Not ranked yet</p>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-400"
            >
              <span className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </span>
              {isLoading ? 'Refreshing...' : isRefreshing ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span>Real-time hooks placeholder</span>
        <span className="text-gray-600">(socket integration intentionally deferred)</span>
      </div>
    </div>
  );
};
