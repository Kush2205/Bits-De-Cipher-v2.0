import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaderboardHeader } from '../components/leaderboard/LeaderboardHeader';
import { LeaderboardSearch } from '../components/leaderboard/LeaderboardSearch';
import { LeaderboardStats } from '../components/leaderboard/LeaderboardStats';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import {
  requestTopLeaderboard,
  requestAllLeaderboard,
  refreshLeaderboard,
} from '../store/slices/leaderboardSlice';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const leaderboardState = useAppSelector((state) => state.leaderboard);
  const [search, setSearch] = useState('');
  const {
    entries: data,
    status,
    error,
    view,
    limit,
    isRefreshing,
    currentUserRank,
  } = leaderboardState;

  useEffect(() => {
    if (data.length === 0) {
      dispatch(requestAllLeaderboard());
    }
  }, [data.length, dispatch]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((entry) =>
      (entry.name || '').toLowerCase().includes(q) || entry.email.toLowerCase().includes(q)
    );
  }, [data, search]);

  const currentUserEntry = useMemo(
    () => data.find((entry) => entry.id === user?.id),
    [data, user?.id]
  );

  const handleViewChange = (nextView: 'top' | 'all') => {
    if (nextView === view) return;
    if (nextView === 'top') {
      dispatch(requestTopLeaderboard({ limit }));
    } else {
      dispatch(requestAllLeaderboard());
    }
  };

  const handleRefresh = () => {
    dispatch(refreshLeaderboard({ userId: user?.id }));
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2 text-sm text-gray-300 transition hover:border-emerald-500 hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2 text-sm text-gray-300 transition hover:border-emerald-500 hover:text-white"
          >
            Logout
          </button>
        </div>

        <LeaderboardHeader
          title="Global Leaderboard"
          subtitle="Rankings update automatically. Real-time sockets can be wired later."
          totalCount={data.length}
          view={view}
          onViewChange={handleViewChange}
          onRefresh={handleRefresh}
          isLoading={status === 'loading'}
          isRefreshing={isRefreshing}
          currentUserName={user?.name || user?.email}
          currentUserRank={currentUserRank}
        />

        {error && (
          <div className="rounded-lg border border-red-600/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <LeaderboardStats
          rank={currentUserRank}
          points={currentUserEntry?.totalPoints || 0}
          questionsSolved={currentUserEntry?.currentQuestionIndex || 0}
        />

        <div className="space-y-4">
          <LeaderboardSearch value={search} onChange={setSearch} />
          <LeaderboardTable
            entries={filtered}
            isLoading={status === 'loading'}
            currentUserId={user?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
