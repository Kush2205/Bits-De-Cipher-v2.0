import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, 
   
  ShieldCheck, 
  Zap, 
  Target, 
  Play, 
  LayoutDashboard, 
  Terminal,
  
} from "lucide-react";
import PrismaticBurst from "../components/layout/PixelSnowBackground";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser } from "../store/slices/authSlice";
import { joinQuizRoom } from "../store/slices/quizSlice";
import { requestAllLeaderboard } from "../store/slices/leaderboardSlice";

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { isConnected } = useAppSelector((state) => state.socket);
  const { userStats, isJoined } = useAppSelector((state) => state.quiz);
  const { entries: leaderboard = [] } = useAppSelector((state) => state.leaderboard);
  
  const userRank = leaderboard.findIndex((p) => p.id === user?.id) + 1 || "-";

  // useEffect(() => {
  //   if (user?.id) dispatch(setCurrentUserId(user.id));
  // }, [user?.id, dispatch]);

  useEffect(() => {
    if (isConnected && !isJoined) dispatch(joinQuizRoom());
  }, [dispatch, isConnected, isJoined]);
  
  useEffect(() => {
    dispatch(requestAllLeaderboard());
  },[dispatch])

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-[#05060a] text-gray-200 overflow-x-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          animationType="rotate3d"
          intensity={1.2}
          speed={0.3}
          distort={0.8}
          paused={false}
          offset={{ x: 0, y: 0 }}
          hoverDampness={0.2}
          rayCount={18}
          mixBlendMode="lighten"
          colors={["#059669", "#10b981", "#34d399"]}
        />
      </div>
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="shrink-0 border-b border-white/5 bg-[#0d0e12]/80 backdrop-blur-md">
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

        <main className="max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: ABOUT & RULES */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Section */}
            <div className="relative p-10 rounded-[2.5rem] border border-white/5 bg-[#0d0e12]/60 backdrop-blur-2xl overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Terminal size={120} className="text-emerald-500" />
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">
                  What is <span className="text-emerald-500">Bits De Cipher</span> ?
                </h2>
                <p className="text-gray-400 leading-relaxed max-w-2xl font-medium">
                  Welcome to <span className="text-white font-bold italic">Bits De Cipher</span>. 
                  Your goal is to solve a series of visual puzzles, each hiding a secret code. Think outside the box, find the pattern, and enter the answer to move to the next question.
                  The clock is ticking—how fast can you solve them?
                </p>
            </div>

            {/* About & Rules Grid */}
            <div className=" gap-6">

                {/* Rules Card */}
                <div className="p-8 rounded-3xl border border-white/5 bg-[#0d0e12]/40 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                      <ShieldCheck size={20} />
                    </div>

                    <h3 className="text-xl font-bold text-white uppercase tracking-tight italic">
                      Contest Rules
                    </h3>
                  </div>

                    
                    <ul className="text-xs text-gray-400 space-y-3 font-mono uppercase tracking-wider">
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">▶</span>
                            Rule 1
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">▶</span>
                            Rule 2
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">▶</span>
                            Rule 3
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">▶</span>
                            Rule 4
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">▶</span>
                            Rule 5
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">▶</span>
                            Rule 6
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">▶</span>
                            Rule 7
                        </li>
                    </ul>
                </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STATS & NAVIGATION */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* User Stats Card */}
            <div className="p-8 rounded-[2rem] border border-white/5 bg-[#0d0e12]/80 backdrop-blur-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-8 flex items-center gap-2">
                    <LayoutDashboard size={14} className="text-emerald-500" />
                    Your Status
                </h3>
                
                <div className="space-y-6">
                    <StatRow label="Current Rank" value={`#${userRank}`} icon={<Trophy size={16} className="text-yellow-400" />} />
                    <StatRow label="Total Score" value={userStats?.totalPoints ?? 0} icon={<Zap size={16} className="text-emerald-400" />} />
                    <StatRow label="Questions Solved" value={`${userStats?.currentQuestionIndex ?? 0}/10`} icon={<Target size={16} className="text-cyan-400" />} />
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-3">
                {/* 1. START CONTEST */}
                <button
                    onClick={() => navigate("/quiz")}
                    className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 p-px transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                    <div className="relative flex items-center justify-center gap-3 rounded-2xl bg-[#05060a] px-8 py-5 transition-all group-hover:bg-transparent">
                    <Play size={20} className="text-emerald-400 group-hover:text-black fill-current" />
                    <span className="text-lg font-black uppercase tracking-widest text-emerald-400 group-hover:text-black">
                        Start Contest
                    </span>
                    </div>
                </button>

                {/* 2. LIVE LEADERBOARD */}
                <button
                    onClick={() => navigate("/leaderboard")}
                    className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-px transition-all hover:border-emerald-500/50"
                >
                    <div className="flex items-center justify-center gap-3 px-8 py-4 text-gray-400 transition-all group-hover:text-white">
                        <BarChart3Icon size={18} />
                        <span className="text-sm font-black uppercase tracking-widest">
                            Live Leaderboard
                        </span>
                    </div>
                </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Internal Helper Components
const StatRow = ({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 group-hover:text-white transition-colors">
                {icon}
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-xl font-black text-white italic tracking-tighter">{value}</span>
    </div>
);

const BarChart3Icon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
    </svg>
);

export default DashboardPage;
