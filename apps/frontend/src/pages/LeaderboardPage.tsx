import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { requestAllLeaderboard } from '../store/slices/leaderboardSlice';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { entries, status, error } = useAppSelector((state) => state.leaderboard);

  useEffect(() => {
    if (entries.length === 0) {
      dispatch(requestAllLeaderboard());
    }
  }, [dispatch, entries.length]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
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

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Leaderboard</h1>
          <p className="text-sm text-gray-400">All competitors listed in order.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-600/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {status === 'loading' && entries.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#0b0b0b] p-8 text-sm text-gray-300">
            Loading leaderboard...
          </div>
        ) : null}

        {entries.length > 0 ? (
          <div className="divide-y divide-gray-800 overflow-hidden rounded-xl border border-gray-800 bg-[#0b0b0b] shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between px-4 py-3 text-sm transition hover:bg-emerald-500/5 ${
                  entry.id === user?.id ? 'bg-emerald-500/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-emerald-400">#{index + 1}</span>
                  <span className="text-white font-medium">{entry.name || 'Anonymous'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {status !== 'loading' && entries.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#0b0b0b] p-8 text-sm text-gray-400">
            No leaderboard data yet.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LeaderboardPage;
