import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import LiveLeaderboard from "../components/LiveLeaderboard";
import PrismaticBurst from "../components/layout/PixelSnowBackground";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser } from "../store/slices/authSlice";
import { joinQuizRoom } from "../store/slices/quizSlice";
import { setCurrentUserId } from "../store/slices/leaderboardSlice";

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { isConnected } = useAppSelector((state) => state.socket);
  const { isJoined } = useAppSelector((state) => state.quiz);

  const { entries: leaderboard, currentUserRank } = useAppSelector(
    (state) => state.leaderboard
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(setCurrentUserId(user.id));
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (isConnected && !isJoined) {
      dispatch(joinQuizRoom());
    }
  }, [dispatch, isConnected, isJoined]);

  const myEntry = leaderboard.find((p) => p.id === user?.id);

  const myPoints = myEntry?.totalPoints ?? 0;
  const mySolved = myEntry?.currentQuestionIndex ?? 0;

  const top3 = leaderboard.slice(0, 3);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const [showRules, setShowRules] = useState(false);


  return (
    <div className="relative min-h-screen bg-[#05060a] text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          animationType="rotate3d"
          intensity={1.6}
          speed={0.45}
          distort={0.9}
          rayCount={22}
          colors={["#10b981", "#22c55e", "#84cc16"]}
        />
      </div>

      <div className="absolute inset-0 bg-black/70 z-0" />

      <div className="relative z-10 min-h-screen">
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
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold">Live Leaderboard</h2>
            <p className="text-gray-400 mt-2">
              Compete in real-time and win rewards
            </p>
          </div>

          {/* PODIUM */}
          {leaderboard.length > 0 && (
            <div className="grid grid-cols-3 gap-6 mb-16 items-end">
              <PodiumCard user={top3[1]} rank={2} />
              <PodiumCard user={top3[0]} rank={1} champion />
              <PodiumCard user={top3[2]} rank={3} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-white/10 bg-[#0d1117]/80 p-6">
                <LiveLeaderboard
                  participants={leaderboard}
                  currentUserId={user?.id || ""}
                  limit={10}
                />
              </div>
            </div>

            <div className="space-y-4">
              
              <button
  onClick={() => setShowRules(true)}
  className="w-full py-4 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
>
  Start Contest
</button>


              <StatCard label="Your Rank" value={`#${currentUserRank ?? "-"}`} />
              <StatCard label="Your Points" value={myPoints} />
              <StatCard label="Solved" value={`${mySolved}/10`} />
            </div>
          </div>
        </main>
      </div>

      {showRules && (
  <RulesModal
    onClose={() => setShowRules(false)}
    onStart={() => navigate("/quiz")}
  />
)}

    </div>
  );
};

export default DashboardPage;


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
      ? { ring: "ring-yellow-400/40", number: "text-yellow-400" }
      : rank === 2
      ? { ring: "ring-emerald-400/40", number: "text-emerald-400" }
      : { ring: "ring-cyan-400/40", number: "text-cyan-400" };

  return (
    <div
      className={`relative rounded-3xl px-6 py-8 bg-[#05060a]/90 border border-white/10 ring-2 ${styles.ring}`}
    >
      {champion && (
        <div className="flex justify-center mb-3">
          <Trophy className="text-yellow-400" size={32} />
        </div>
      )}

      <h3 className="text-center text-xl font-semibold mb-6">{user.name}</h3>

      <div className="grid grid-cols-3 text-center">
        <div>
          <p className="text-xs text-gray-400">Points</p>
          <p className="text-xl font-bold text-emerald-400">
            {user.totalPoints}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Solved</p>
          <p className="text-xl font-bold text-emerald-400">
            {user.currentQuestionIndex ?? 0}/10
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Rank</p>
          <p className={`text-xl font-bold ${styles.number}`}>#{rank}</p>
        </div>
      </div>
    </div>
  );
};


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













const RulesModal = ({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d1117] border border-white/10 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-emerald-400 mb-4 text-center">
          Contest Rules
        </h2>

        <ul className="space-y-3 text-gray-300 text-sm mb-6">
          <li>• You will get <b>10 questions</b>.</li>
          <li>• Each correct answer gives you <b>10 points</b>.</li>
          <li>• Once you submit, you <b>cannot change</b> your answer.</li>
          <li>• Leaderboard updates in <b>real time</b>.</li>
          <li>• Top players appear on the <b>podium</b>.</li>
          <li>• No refreshing or leaving during the contest.</li>
        </ul>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:border-red-500 hover:text-red-400 transition"
          >
            Cancel
          </button>

          <button
            onClick={onStart}
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
          >
            Start Contest
          </button>
        </div>
      </div>
    </div>
  );
};
