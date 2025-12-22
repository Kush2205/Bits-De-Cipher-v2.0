import LiveLeaderboard from './LiveLeaderboard';
import { useAppSelector } from '../store/hooks';

export const QuizRoomExample = () => {
  const quiz = useAppSelector((state) => state.quiz);
  const leaderboard = useAppSelector((state) => state.leaderboard.entries);
  const { user } = useAppSelector((state) => state.auth);

  if (!quiz.currentQuestion) {
    return (
      <div className="p-4 text-white bg-black">
        <p>No active question. Jump into the main quiz room to start playing!</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#111] text-white rounded-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sample Quiz Room View</h2>
        <p className="text-gray-400 text-sm">This component is only for internal previews.</p>
      </div>

      <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800">
        <p className="text-sm text-gray-400">Current Question</p>
        <h3 className="text-xl font-semibold">{quiz.currentQuestion.name}</h3>
        <p className="text-sm text-gray-500 mt-2">
          Points Available: {quiz.currentQuestion.points}/{quiz.currentQuestion.maxPoints}
        </p>
      </div>

      <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800">
        <p className="text-sm text-gray-400 mb-2">Live Leaderboard Snapshot</p>
        <LiveLeaderboard
          participants={leaderboard}
          currentUserId={user?.id || ''}
          compact
          limit={5}
        />
      </div>
    </div>
  );
};
