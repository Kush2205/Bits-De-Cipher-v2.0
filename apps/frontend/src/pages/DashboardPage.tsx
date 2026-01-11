import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import LiveLeaderboard from "../components/LiveLeaderboard";
import PrismaticBurst from "../components/layout/PixelSnowBackground";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser } from "../store/slices/authSlice";
import { joinQuizRoom } from "../store/slices/quizSlice";

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { isConnected } = useAppSelector((state) => state.socket);
  const { userStats, isJoined } = useAppSelector((state) => state.quiz);
  const { entries: leaderboard = [] } = useAppSelector(
    (state) => state.leaderboard
  );
  const userRank =
  leaderboard.findIndex((p) => p.id === user?.id) + 1 || "-";


  useEffect(() => {
    if (isConnected && !isJoined) {
      dispatch(joinQuizRoom());
    }
  }, [dispatch, isConnected, isJoined]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="relative min-h-screen bg-[#05060a] text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          animationType="rotate3d"
          intensity={1.6}
          speed={0.45}
          distort={0.9}
          paused={false}
          offset={{ x: 0, y: 0 }}
          hoverDampness={0.25}
          rayCount={22}
          mixBlendMode="lighten"
          colors={["#10b981", "#22c55e", "#84cc16"]}
        />
      </div>

      <div className="absolute inset-0 bg-black/70 z-0" />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/40 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <h1 className="text-lg font-semibold">
              Bits De <span className="text-emerald-400">Cipher</span>
            </h1>

            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded-lg border border-white/10 hover:border-emerald-400 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          {/* Title */}
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-wide">
              Live Leaderboard
            </h2>
            <p className="text-gray-400 mt-2">
              Compete in real-time and win rewards
            </p>
          </div>

          {/* ================= PODIUM ================= */}
          <div className="grid grid-cols-3 gap-6 mb-16 items-end">
            <PodiumCard user={top3[1]} rank={2} />
            <PodiumCard user={top3[0]} rank={1} champion />
            <PodiumCard user={top3[2]} rank={3} />
          </div>

          {/* ================= MAIN GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Leaderboard */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-white/10 bg-[#0d1117]/80 backdrop-blur p-6">
                <h3 className="text-lg font-semibold mb-4">Live Rankings</h3>
                <LiveLeaderboard
                  participants={leaderboard}
                  currentUserId={user?.id || ""}
                  limit={10}
                />
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-4">
              {/* Start Contest */}
              <button
                onClick={() => navigate("/quiz")}
                className="w-full py-4 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
              >
                Start Contest
              </button>

              {/* Stats */}
             <StatCard
  label="Your Rank"
  value={`#${userRank}`}
/>

<StatCard
  label="Your Points"
  value={userStats?.totalPoints ?? user?.totalPoints ?? 0}
/>

<StatCard
  label="Solved"
  value={`${userStats?.currentQuestionIndex ?? 0}/10`}
/>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

/* ================= PODIUM CARD ================= */

const PodiumCard = ({
  user,
  rank,
  champion,
}: {
  user: any;
  rank: number;
  champion?: boolean;
}) => {
  if (!user) return <div />;

  const styles =
    rank === 1
      ? {
          glow: "from-yellow-400/40 via-yellow-300/10 to-transparent",
          ring: "ring-yellow-400/40",
          number: "text-yellow-400",
        }
      : rank === 2
      ? {
          glow: "from-emerald-400/30 via-emerald-300/10 to-transparent",
          ring: "ring-emerald-400/40",
          number: "text-emerald-400",
        }
      : {
          glow: "from-cyan-400/30 via-cyan-300/10 to-transparent",
          ring: "ring-cyan-400/40",
          number: "text-cyan-400",
        };

  const ordinal = rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl px-6 py-8 flex flex-col
      bg-[#05060a]/90 border border-white/10 backdrop-blur-xl
      ${champion ? "h-[340px]" : "h-[280px]"}
      ring-2 ${styles.ring}
      shadow-[0_0_80px_rgba(16,185,129,0.25)]`}
    >
      {/* Neon Glow Layer */}
      <div
        className={`absolute -inset-1 bg-gradient-to-t ${styles.glow} blur-3xl opacity-80`}
      />

      {/* Big Rank */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`text-[160px] font-black opacity-[0.08] ${styles.number}`}
        >
          {ordinal}
        </span>
      </div>

      {/* Crown */}
      {champion && (
        <div className="flex justify-center mb-4 relative z-10">
          <Trophy className="text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]" size={36} />
        </div>
      )}

      {/* Name */}
      <h3 className="text-center text-xl font-semibold mb-6 relative z-10 tracking-wide">
        {user.name}
      </h3>

      <div className="flex-1" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center relative z-10">
        <div>
          <p className="text-gray-400 text-xs uppercase">Points</p>
          <p className="text-emerald-400 text-xl font-bold">
            {user.points}
          </p>
        </div>

        <div>
          <p className="text-gray-400 text-xs uppercase">Solved</p>
          <p className="text-emerald-400 text-xl font-bold">
            {user.solved ?? 0}/10
          </p>
        </div>

        <div>
          <p className="text-gray-400 text-xs uppercase">Rank</p>
          <p className={`text-xl font-bold ${styles.number}`}>
            #{rank}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ================= STAT CARD ================= */

const StatCard = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded-xl border border-white/10 bg-[#0d1117]/80 backdrop-blur p-5">
    <div className="text-xs uppercase tracking-wide text-gray-500">
      {label}
    </div>
    <div className="mt-2 text-3xl font-bold text-emerald-400">
      {value}
    </div>
  </div>
);
