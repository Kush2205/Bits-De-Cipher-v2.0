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
    <div className="h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="bg-linear-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 shrink-0">
        <div className="mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold bg-linear-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Bits De Cipher
              </h1>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full">
                <div className={`w-2 h-2 rounded-full ${socketState.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-medium ${socketState.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {socketState.isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-300">{user?.name || user?.email}</p>
                  <p className="text-xs text-gray-400">
                    <span className="text-green-400 font-semibold">{quiz.userStats?.totalPoints || 0}</span> pts •{' '}
                    <span className="text-emerald-400">{quiz.userStats?.currentQuestionIndex || 0}/10</span> solved
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 grid grid-cols-12 gap-4 px-6 py-4 overflow-hidden">
        <div className="col-span-12 lg:col-span-9 h-full flex flex-col gap-4 min-h-0 overflow-hidden">
          <div className="flex-1 bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl overflow-hidden relative flex min-h-0">
            {quiz.currentQuestion.imageUrl && (
              <img
                src={quiz.currentQuestion.imageUrl}
                alt="Question"
                className="w-full h-full object-contain"
              />
            )}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-4 py-2 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">Available points</p>
              <p className="text-2xl font-bold text-green-400 leading-tight">
                {quiz.currentQuestion.points}
              </p>
            </div>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-lg p-4 flex flex-col gap-4">
            <div className="flex gap-3">
              {quiz.currentQuestion.hints && quiz.currentQuestion.hints.length > 0 && (
                <>
                  {quiz.currentQuestion.hints[0] && (
                    <button
                      onClick={() => handleUseHint(1)}
                      disabled={quiz.usedHints.hint1}
                      className={`
                        flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200
                        ${quiz.usedHints.hint1
                          ? 'bg-gray-800 text-gray-500 border border-gray-700'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25'}
                      `}
                    >
                      {quiz.usedHints.hint1 ? 'Hint 1 used' : 'Use Hint 1'}
                    </button>
                  )}
                  {quiz.currentQuestion.hints[1] && (
                    <button
                      onClick={() => handleUseHint(2)}
                      disabled={quiz.usedHints.hint2}
                      className={`
                        flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200
                        ${quiz.usedHints.hint2
                          ? 'bg-gray-800 text-gray-500 border border-gray-700'
                          : 'bg-orange-500/15 text-orange-300 border border-orange-500/40 hover:bg-orange-500/25'}
                      `}
                    >
                      {quiz.usedHints.hint2 ? 'Hint 2 used' : 'Use Hint 2'}
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 min-h-30">
              {quiz.currentQuestion.hints && (
                <div className="space-y-2">
                  {quiz.usedHints.hint1 && quiz.currentQuestion.hints[0] && (
                    <div className="text-sm text-gray-200">
                      {quiz.currentQuestion.hints[0].hintText}
                    </div>
                  )}
                  {quiz.usedHints.hint2 && quiz.currentQuestion.hints[1] && (
                    <div className="text-sm text-gray-200">
                      {quiz.currentQuestion.hints[1].hintText}
                    </div>
                  )}
                  {!quiz.usedHints.hint1 && !quiz.usedHints.hint2 && (
                    <p className="text-xs text-gray-500">Hint will appear here after you use it.</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                placeholder="Type your answer"
                disabled={quiz.isSubmitting}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || quiz.isSubmitting}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition"
              >
                {quiz.isSubmitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Leaderboard, no page scroll above */}
        <div className="col-span-12 lg:col-span-3 h-full flex flex-col min-h-0">
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl shadow-xl h-full flex flex-col overflow-hidden">
            <LiveLeaderboard
              participants={leaderboardState.entries}
              currentUserId={user?.id || ''}
              limit={15}
            />
            <div className="p-4 border-t border-gray-800 shrink-0">
              <button
                onClick={handleViewFullLeaderboard}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition"
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
