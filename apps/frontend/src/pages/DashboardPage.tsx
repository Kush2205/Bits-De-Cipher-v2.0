import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveLeaderboard from '../components/LiveLeaderboard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';

import { joinQuizRoom } from '../store/slices/quizSlice';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isConnected } = useAppSelector((state) => state.socket);
  const { userStats, isJoined, error: quizError } = useAppSelector((state) => state.quiz);
  const { entries: leaderboard, error: leaderboardError } = useAppSelector((state) => state.leaderboard);
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && !isJoined) {
      dispatch(joinQuizRoom());
    }
  }, [dispatch, isConnected, isJoined]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  

  const error = quizError || leaderboardError;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Bits De Cipher</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">{user?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm text-gray-300 transition hover:border-gray-600 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {error && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0e12] p-10 shadow-2xl">
              {/* Hero Section */}
              <div className="mb-10 text-center">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
                  <svg
                    className="h-10 w-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>

                <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                  Ready to Compete?
                </h2>

                <p className="mx-auto max-w-2xl text-base text-gray-400">
                  Test your knowledge and climb the leaderboard.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-800/50 bg-[#12131a] p-5 transition hover:border-emerald-500/30">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Points</div>
                  <div className="text-3xl font-bold text-emerald-400">
                    {userStats?.totalPoints ?? user?.totalPoints ?? 0}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-800/50 bg-[#12131a] p-5 transition hover:border-emerald-500/30">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Solved</div>
                  <div className="text-3xl font-bold text-emerald-400">
                    {userStats?.currentQuestionIndex ?? user?.currentQuestionIndex ?? 0}/10
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button
                  onClick={() => navigate('/quiz')}
                  className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/50"
                >
                  Start Contest
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-3">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0e12] shadow-2xl">
                <LiveLeaderboard
                  participants={leaderboard}
                  currentUserId={user?.id || ''}
                  limit={10}
                />
              </div>
              <button
                onClick={() => navigate('/leaderboard')}
                className="w-full rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50"
              >
                View Full Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;