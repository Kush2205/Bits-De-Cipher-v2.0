import { useNavigate } from "react-router-dom";
import PrismaticBurst from "../components/layout/PixelSnowBackground";

const RulesPage = () => {
  const navigate = useNavigate();

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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-2xl rounded-2xl bg-[#0d1117]/90 border border-white/10 p-10 shadow-2xl">
          <h1 className="text-3xl font-bold text-emerald-400 mb-6 text-center">
            Contest Rules
          </h1>

          <ul className="space-y-4 text-gray-300 text-lg mb-10">
            <li>• You will get <b>10 questions</b>.</li>
            <li>• Each correct answer gives you <b>10 points</b>.</li>
            <li>• Once you submit, you <b>cannot change</b> your answer.</li>
            <li>• Leaderboard updates in <b>real time</b>.</li>
            <li>• Top players appear on the <b>podium</b>.</li>
            <li>• No refreshing or leaving during the contest.</li>
          </ul>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:border-red-500 hover:text-red-400 transition"
            >
              Back
            </button>

            <button
              onClick={() => navigate("/quiz")}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
            >
              Start Contest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesPage;
