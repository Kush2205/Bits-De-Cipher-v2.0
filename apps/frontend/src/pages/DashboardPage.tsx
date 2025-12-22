import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveLeaderboard from '../components/LiveLeaderboard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { refreshLeaderboard } from '../store/slices/leaderboardSlice';
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

  const handleRefreshLeaderboard = () => {
    dispatch(refreshLeaderboard({ userId: user?.id }));
  };

  const error = quizError || leaderboardError;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <nav className="bg-[#1a1a1a] border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <h1 className="text-xl font-bold text-white">Quiz Competition</h1>
              {/* Connection Status */}
              <div className="flex items-center gap-2 ml-4">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Welcome back,</p>
                <p className="text-sm font-medium text-white">{user?.name || user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition border border-gray-700 hover:border-gray-600 rounded-lg"
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] rounded-xl shadow-2xl p-8 md:p-12 border border-gray-800">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600 mb-6 shadow-lg shadow-green-900/30">
                  <svg
                    className="w-10 h-10 text-white"
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

                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Ready to Compete?
                </h2>

                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Test your knowledge, earn points, and climb the leaderboard. Every second counts!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#2d2d2d] p-6 rounded-xl border border-gray-800 hover:border-green-600/30 transition">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-400">Total Points</div>
                  </div>
                  <div className="text-3xl font-bold text-green-500">
                    {userStats?.totalPoints ?? user?.totalPoints ?? 0}
                  </div>
                </div>

                <div className="bg-[#2d2d2d] p-6 rounded-xl border border-gray-800 hover:border-green-600/30 transition">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-400">Questions Answered</div>
                  </div>
                  <div className="text-3xl font-bold text-green-500">
                    {userStats?.currentQuestionIndex ?? user?.currentQuestionIndex ?? 0}
                  </div>
                </div>

                <div className="bg-[#2d2d2d] p-6 rounded-xl border border-gray-800 hover:border-green-600/30 transition">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    <div className="text-sm font-medium text-gray-400">Status</div>
                  </div>
                  <div className="text-3xl font-bold text-green-500">
                    Live
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-400">Your Progress</span>
                  <span className="text-sm font-medium text-green-500">
                    {userStats?.currentQuestionIndex ?? user?.currentQuestionIndex ?? 0} / 10 Questions
                  </span>
                </div>
                <div className="w-full bg-[#2d2d2d] rounded-full h-3 overflow-hidden border border-gray-800">
                  <div
                    className="bg-linear-to-r from-green-600 to-green-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-green-900/50"
                    style={{ width: `${((userStats?.currentQuestionIndex ?? user?.currentQuestionIndex ?? 0) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button 
                  onClick={() => navigate('/quiz')}
                  className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-xl transition-all shadow-lg shadow-green-900/30 hover:shadow-green-900/50 hover:scale-105"
                >
                  Start Contest
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Answer questions, use hints wisely, and compete in real-time
                </p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
                <h3 className="text-white font-semibold mb-2">⚡ Dynamic Scoring</h3>
                <p className="text-sm text-gray-400">
                  Points decrease as more users answer. Be quick to maximize your score!
                </p>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
                <h3 className="text-white font-semibold mb-2">💡 Hint System</h3>
                <p className="text-sm text-gray-400">
                  Two hints per question, but they come with a penalty. Use them wisely!
                </p>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
                <h3 className="text-white font-semibold mb-2">🏆 Live Leaderboard</h3>
                <p className="text-sm text-gray-400">
                  Watch your rank update in real-time as you and others answer questions.
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <LiveLeaderboard
                participants={leaderboard}
                currentUserId={user?.id || ''}
                limit={10}
              />
              <button
                onClick={handleRefreshLeaderboard}
                className="w-full mt-4 px-4 py-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white text-sm font-medium rounded-lg transition border border-gray-700 hover:border-gray-600"
              >
                Refresh Leaderboard
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition shadow-lg shadow-green-900/30 hover:shadow-green-900/50"
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