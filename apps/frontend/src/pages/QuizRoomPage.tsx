import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveLeaderboard from '../components/LiveLeaderboard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import {
  joinQuizRoom,
  submitAnswer as submitAnswerThunk,
  useHint as useHintThunk,
  clearLastSubmitResult,
} from '../store/slices/quizSlice';
import { refreshLeaderboard, requestAllLeaderboard } from '../store/slices/leaderboardSlice';

const QuizRoomPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const socketState = useAppSelector((state) => state.socket);
  const quiz = useAppSelector((state) => state.quiz);
  const leaderboardState = useAppSelector((state) => state.leaderboard);
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  useEffect(() => {
    if (socketState.isConnected && !quiz.isJoined && !quiz.isJoining) {
      dispatch(joinQuizRoom());
    }
  }, [dispatch, socketState.isConnected, quiz.isJoined, quiz.isJoining]);

  useEffect(() => {
    if (quiz.currentQuestion) {
      setAnswer('');
      dispatch(clearLastSubmitResult());
      dispatch(refreshLeaderboard({ userId: user?.id }));
    }
  }, [dispatch, quiz.currentQuestion?.id, user?.id]);

  const handleSubmitAnswer = async () => {
    if (!quiz.currentQuestion || !answer.trim() || quiz.isSubmitting) {
      return;
    }

    const result = await dispatch(
      submitAnswerThunk({ questionId: quiz.currentQuestion.id, answer: answer.trim() })
    ).unwrap();

    if (result?.isCorrect && !result.alreadyCompleted) {
      console.log('Correct answer! Points:', result.awardedPoints);
      if (result.nextQuestion) {
        console.log('Moving to next question...');
        setAnswer('');
      } else {
        console.log('Quiz completed!');
      }
    }
  };

  const handleUseHint = async (hintNumber: 1 | 2) => {
    if (!quiz.currentQuestion) return;

    await dispatch(useHintThunk({ questionId: quiz.currentQuestion.id, hintNumber }));
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleViewFullLeaderboard = () => {
    dispatch(requestAllLeaderboard());
    setShowFullLeaderboard(true);
  };

  const combinedError = quiz.error || leaderboardState.error || socketState.error;

  if (!socketState.isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!quiz.isJoined && !combinedError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining quiz...</p>
        </div>
      </div>
    );
  }

  if (combinedError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto bg-red-900/20 border border-red-500 rounded-lg p-8">
          <h2 className="text-red-500 text-xl font-bold mb-4">Error</h2>
          <p className="text-white mb-6">{combinedError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!quiz.currentQuestion) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h1>
          <p className="text-gray-400 mb-2">Great job completing the quiz!</p>
          <div className="bg-[#2d2d2d] rounded-lg p-6 mb-8 mt-6">
            <p className="text-gray-400 mb-2">Your Final Score</p>
            <p className="text-5xl font-bold text-green-500">{quiz.userStats?.totalPoints || 0}</p>
            <p className="text-gray-400 mt-2">Points</p>
            {leaderboardState.currentUserRank && (
              <p className="text-lg text-gray-300 mt-4">
                Rank: <span className="text-green-500 font-bold">#{leaderboardState.currentUserRank}</span>
              </p>
            )}
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#05060a]">
      {/* Navbar */}
      <nav className="shrink-0 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
        <div className="mx-auto px-6">
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

      <div className="grid flex-1 grid-cols-12 gap-4 overflow-hidden px-6 py-4">
        <div className="col-span-12 flex min-h-0 flex-col gap-3 overflow-hidden lg:col-span-9">
          {/* Image Display - Larger */}
          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-800/50 bg-[#0d0e12] shadow-xl">
            {quiz.currentQuestion.imageUrl && (
              <img
                src={quiz.currentQuestion.imageUrl}
                alt="Question"
                className="h-full w-full object-contain"
              />
            )}
            <div className="absolute left-4 top-4 rounded-lg border border-gray-700/50 bg-black/60 px-4 py-2 backdrop-blur">
              <p className="text-xs text-gray-400">Points</p>
              <p className="text-2xl font-bold leading-tight text-emerald-400">
                {quiz.currentQuestion.points}
              </p>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-gray-800/50 bg-[#0d0e12] p-4 shadow-lg">
            {/* Hints Buttons - Smaller */}
            <div className="flex gap-2">
              {quiz.currentQuestion.hints && quiz.currentQuestion.hints.length > 0 && (
                <>
                  {quiz.currentQuestion.hints[0] && (
                    <button
                      onClick={() => handleUseHint(1)}
                      disabled={quiz.usedHints.hint1}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                        quiz.usedHints.hint1
                          ? 'border border-gray-800 bg-gray-900 text-gray-600'
                          : 'border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                      }`}
                    >
                      {quiz.usedHints.hint1 ? 'Hint 1 used' : 'Hint 1'}
                    </button>
                  )}
                  {quiz.currentQuestion.hints[1] && (
                    <button
                      onClick={() => handleUseHint(2)}
                      disabled={quiz.usedHints.hint2}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                        quiz.usedHints.hint2
                          ? 'border border-gray-800 bg-gray-900 text-gray-600'
                          : 'border border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20'
                      }`}
                    >
                      {quiz.usedHints.hint2 ? 'Hint 2 used' : 'Hint 2'}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Hint Display Area - Subtle when empty */}
            {quiz.currentQuestion.hints && (
              <div
                className={`min-h-[60px] rounded-lg p-3 text-sm ${
                  quiz.usedHints.hint1 || quiz.usedHints.hint2
                    ? 'border border-gray-800/50 bg-gray-900/40 text-gray-200'
                    : 'bg-transparent text-gray-600'
                }`}
              >
                {quiz.usedHints.hint1 && quiz.currentQuestion.hints[0] && (
                  <div className="mb-2">{quiz.currentQuestion.hints[0].hintText}</div>
                )}
                {quiz.usedHints.hint2 && quiz.currentQuestion.hints[1] && (
                  <div>{quiz.currentQuestion.hints[1].hintText}</div>
                )}
                {!quiz.usedHints.hint1 && !quiz.usedHints.hint2 && (
                  <p className="text-xs">Hints will appear here</p>
                )}
              </div>
            )}

            {/* Answer Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                placeholder="Type your answer"
                disabled={quiz.isSubmitting}
                className="flex-1 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || quiz.isSubmitting}
                className="rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {quiz.isSubmitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="col-span-12 flex min-h-0 flex-col lg:col-span-3">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-800/50 bg-[#0d0e12] shadow-xl">
            <LiveLeaderboard
              participants={leaderboardState.entries}
              currentUserId={user?.id || ''}
              limit={15}
            />
            <div className="shrink-0 border-t border-gray-800/50 p-4">
              <button
                onClick={handleViewFullLeaderboard}
                className="w-full rounded-lg bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700/50 hover:text-white"
              >
                View Full Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFullLeaderboard && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Full Leaderboard</h2>
              <button
                onClick={() => setShowFullLeaderboard(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <LiveLeaderboard
              participants={leaderboardState.entries}
              currentUserId={user?.id || ''}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizRoomPage;
