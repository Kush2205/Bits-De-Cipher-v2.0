import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  Medal, ChevronLeft, LogOut, Crown,} from 'lucide-react';
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

  const top3 = entries.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#020305] text-white selection:bg-emerald-500/30 font-sans relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-emerald-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-5xl px-6 py-10 relative z-10">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-white"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-all hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-16 space-y-3">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-gray-400 font-medium tracking-wide">The elite performers of the arena.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-4 text-sm text-red-400 mb-12 backdrop-blur-md flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        {/* ================= PODIUM SECTION ================= */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-20">
            {/* Rank 2 */}
            <div className="order-2 md:order-1">
              <PodiumBlock entry={top3[1]} rank={2} height="h-60" />
            </div>
            {/* Rank 1 */}
            <div className="order-1 md:order-2">
              <PodiumBlock entry={top3[0]} rank={1} height="h-80" isWinner />
            </div>
            {/* Rank 3 */}
            <div className="order-3 md:order-3">
              <PodiumBlock entry={top3[2]} rank={3} height="h-52" />
            </div>
          </div>
        )}

        {/* Loading State */}
        {status === 'loading' && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] p-20 text-sm text-gray-400 backdrop-blur-sm">
            <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
            Loading leaderboard...
          </div>
        )}

        {/* ================= COMPLETE LIST SECTION ================= */}
        <div className="relative group">
    {/* Subtle border glow effect */}
    <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-50" />
    
    <div className="relative divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#0b0c10]/60 backdrop-blur-xl 
        /* Scrollbar logic added here */
        max-h-[840px] overflow-y-auto overflow-x-hidden
        scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
        
        {entries.length > 0 ? (
            entries.map((entry, index) => (
            <div
                key={entry.id}
                className={`flex items-center justify-between px-8 py-5 text-sm transition-all duration-300 hover:bg-white/[0.03] ${
                entry.id === user?.id ? 'bg-emerald-500/5' : ''
                }`}
            >
                <div className="flex items-center gap-6">
                <span className={`text-lg font-black w-8 ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-300' : 
                    index === 2 ? 'text-orange-400' : 'text-gray-600'
                }`}>
                    {(index + 1).toString().padStart(2, '0')}
                </span>
                <div className="flex flex-col">
                    <span className="text-gray-100 font-bold tracking-tight text-base">
                        {entry.name || 'Anonymous'}
                    </span>
                    {entry.id === user?.id && (
                        <span className="text-[10px] uppercase font-black text-emerald-500 tracking-widest flex items-center gap-1">
                          {/* You can add 'YOU' text here if needed */}
                        </span>
                    )}
                </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="font-mono font-black text-lg text-emerald-400">
                        {entry.totalPoints?.toLocaleString()}
                    </span>
                    <span className="text-[9px] uppercase text-gray-500 font-bold tracking-tighter">Points</span>
                </div>
            </div>
            ))
        ) : status !== 'loading' ? (
            <div className="flex items-center justify-center p-16 text-sm text-gray-500 italic">
            No leaderboard data yet.
            </div>
        ) : null}
    </div>
</div>
      </div>
    </div>
  );
};

/* --- Internal Helper: Podium Block --- */
const PodiumBlock = ({ entry, rank, height, isWinner }: any) => {
  if (!entry) return <div className={`${height} opacity-5 border border-white/5 rounded-[2.5rem] bg-white/5`} />;
  
  const themes = {
    1: { 
        text: "text-yellow-400", 
        border: "border-yellow-500/30", 
        bg: "from-yellow-500/10 via-transparent to-transparent",
        icon: <Crown size={32} className="drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
    },
    2: { 
        text: "text-gray-300", 
        border: "border-gray-400/20", 
        bg: "from-gray-400/5 via-transparent to-transparent",
        icon: <Medal size={28} />
    },
    3: { 
        text: "text-orange-400", 
        border: "border-orange-500/20", 
        bg: "from-orange-500/5 via-transparent to-transparent",
        icon: <Medal size={24} />
    }
  };

  const theme = themes[rank as keyof typeof themes];

  return (
    <div className={`flex flex-col items-center transition-all duration-700 hover:-translate-y-2 ${isWinner ? 'scale-105 z-20' : 'scale-100 z-10'}`}>
        <div className={`w-full ${height} rounded-[2.5rem] border ${theme.border} bg-gradient-to-b ${theme.bg} bg-[#0d0e12] backdrop-blur-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group`}>
            
            {/* Top Rank Indicator */}
            <div className={`absolute top-6 flex flex-col items-center ${theme.text} transition-transform duration-500 group-hover:scale-110`}>
               {theme.icon}
               <span className="text-[10px] font-black mt-2 tracking-[0.2em] opacity-80">RANK 0{rank}</span>
            </div>

            <div className="mt-12 flex flex-col items-center w-full">
                <h3 className="text-xl font-black text-white mb-1 truncate w-full px-2 tracking-tight">
                    {entry.name || 'Anonymous'}
                </h3>
                <div className={`h-1 w-6 rounded-full ${theme.text} opacity-20 my-4`} />
                <div className="flex flex-col items-center">
                    <span className={`text-3xl font-black italic tracking-tighter ${theme.text}`}>
                        {entry.totalPoints?.toLocaleString()}
                    </span>
                    <span className="text-[9px] uppercase text-gray-500 font-bold tracking-widest mt-1">Total Score</span>
                </div>
            </div>

            {/* Background Rank Number */}
            <span className={`absolute -bottom-6 -right-4 text-[10rem] font-black opacity-[0.5] italic pointer-events-none select-none ${theme.text}`}>
              {rank}
            </span>
        </div>
    </div>
  );
};

export default LeaderboardPage;