import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { requestAllLeaderboard } from '../store/slices/leaderboardSlice';
import LiveLeaderboard from '../components/LiveLeaderboard';

const ContestEndedPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const leaderboardState = useAppSelector((state) => state.leaderboard);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        await dispatch(requestAllLeaderboard()).unwrap();
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#05060a] flex flex-col">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="shrink-0 border-b border-white/5 bg-[#0d0e12]/80 backdrop-blur-md relative z-10">
        <div className="mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-white tracking-tight italic">
                Bits De Cipher
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold leading-none">
                  Player
                </p>
                <p className="text-xs font-semibold text-emerald-400">
                  {user?.name || user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-400 transition-all hover:text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-4xl w-full">
          {/* Contest Ended Banner */}
          <div className="mb-8 text-center">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30">
              <p className="text-xs font-black uppercase tracking-widest text-red-400">
                Contest Ended
              </p>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
              The Competition is Over
            </h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Thank you for participating! The contest has concluded after 24 hours. Check out the final standings below.
            </p>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-[#0d0e12]/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-linear-to-r from-emerald-500/5 to-transparent">
              <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Final Leaderboard
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
                </div>
                <p className="text-white text-sm font-medium animate-pulse">
                  Loading Leaderboard...
                </p>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                <LiveLeaderboard
                  participants={leaderboardState.entries}
                  currentUserId={user?.id || ''}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.5); }
      `}</style>
    </div>
  );
};

export default ContestEndedPage;
