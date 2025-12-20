/**
 * Quiz Room Page
 * 
 * Real-time quiz interface with socket integration.
 * Layout: 80% quiz area (left) + 20% leaderboard (right)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQuizRoom } from '../hooks/useQuizRoom';
import LiveLeaderboard from '../components/LiveLeaderboard';

const QuizRoomPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  // Quiz room functionality
  const quiz = useQuizRoom({
    userId: user?.id,
    autoJoin: true,
    leaderboardLimit: 15,
  });

  // Clear answer and result when question changes
  useEffect(() => {
    if (quiz.currentQuestion) {
      setAnswer('');
      quiz.clearLastResult();
      quiz.resetHints();
      // Refresh leaderboard when question changes to get latest standings
      quiz.refreshLeaderboard();
    }
  }, [quiz.currentQuestion?.id]);

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!quiz.currentQuestion || !answer.trim() || quiz.isSubmitting) {
      return;
    }

    const result = await quiz.submitAnswer(quiz.currentQuestion.id, answer.trim());

    if (result?.isCorrect && !result.alreadyCompleted) {
      console.log('Correct answer! Points:', result.awardedPoints);
      
      // Move to next question if available
      if (result.nextQuestion) {
        console.log('Moving to next question...');
        quiz.updateQuestion(result.nextQuestion, {
          totalPoints: result.totalPoints,
          currentQuestionIndex: result.currentQuestionIndex,
        });
        setAnswer(''); // Clear answer input
      } else {
        // No more questions - quiz completed
        console.log('Quiz completed!');
        quiz.updateQuestion(null, {
          totalPoints: result.totalPoints,
          currentQuestionIndex: result.currentQuestionIndex,
        });
      }
    }
  };

  // Handle hint usage
  const handleUseHint = async (hintNumber: 1 | 2) => {
    if (!quiz.currentQuestion) return;

    const success = await quiz.useHint(quiz.currentQuestion.id, hintNumber);
    if (success) {
      console.log(`Hint ${hintNumber} activated`);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // View full leaderboard
  const handleViewFullLeaderboard = () => {
    quiz.requestAllLeaderboard();
    setShowFullLeaderboard(true);
  };

  // Loading states
  if (!quiz.isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!quiz.isJoined && !quiz.error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (quiz.error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto bg-red-900/20 border border-red-500 rounded-lg p-8">
          <h2 className="text-red-500 text-xl font-bold mb-4">Error</h2>
          <p className="text-white mb-6">{quiz.error}</p>
          <button
            onClick={() => navigate('/contest')}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Quiz completed
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
            {quiz.currentUserRank && (
              <p className="text-lg text-gray-300 mt-4">
                Rank: <span className="text-green-500 font-bold">#{quiz.currentUserRank}</span>
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
              onClick={() => navigate('/contest')}
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <nav className="bg-[#1a1a1a] border-b border-gray-800">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Quiz Room</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${quiz.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-xs ${quiz.isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {quiz.isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">{user?.name || user?.email}</p>
                <p className="text-xs text-green-500 font-semibold">
                  {quiz.userStats?.totalPoints || 0} points • {quiz.userStats?.currentQuestionIndex || 0}/10 solved
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Quiz Area - 80% */}
          <div className="flex-1 lg:w-[80%]">
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-8">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Question {(quiz.userStats?.currentQuestionIndex || 0) + 1}
                  </h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Points Available</p>
                    <p className="text-2xl font-bold text-green-500">
                      {(() => {
                        const basePoints = quiz.currentQuestion.points;
                        const maxPoints = quiz.currentQuestion.maxPoints;
                        const minPoints = Math.floor(maxPoints * 0.5);
                        let penalty = 0;
                        if (quiz.usedHints.hint1) penalty += 0.15;
                        if (quiz.usedHints.hint2) penalty += 0.3;
                        const availablePoints = Math.max(minPoints, Math.floor(basePoints * (1 - penalty)));
                        return availablePoints;
                      })()} / {quiz.currentQuestion.maxPoints}
                    </p>
                    {(quiz.usedHints.hint1 || quiz.usedHints.hint2) && (
                      <p className="text-xs text-yellow-500 mt-1">
                        {quiz.usedHints.hint1 && quiz.usedHints.hint2 ? '-45% penalty' : quiz.usedHints.hint1 ? '-15% penalty' : '-30% penalty'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-400">Progress</p>
                  <p className="text-xs text-green-500 font-semibold">
                    {quiz.userStats?.currentQuestionIndex || 0} / 10 questions solved
                  </p>
                </div>
                <div className="h-2 bg-[#2d2d2d] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all duration-500"
                    style={{
                      width: `${((quiz.userStats?.currentQuestionIndex || 0) / 10) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Question Name */}
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-white mb-4">
                  {quiz.currentQuestion.name}
                </h3>
              </div>

              {/* Question Image */}
              {quiz.currentQuestion.imageUrl && (
                <div className="mb-8">
                  <div className="relative rounded-lg overflow-hidden bg-[#2d2d2d] border border-gray-700">
                    <img
                      src={quiz.currentQuestion.imageUrl}
                      alt="Question"
                      className="w-full h-auto max-h-[500px] object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Hints */}
              <div className="mb-6">
                <div className="flex gap-4">
                  {quiz.currentQuestion.hints && quiz.currentQuestion.hints.length > 0 && (
                    <>
                      {quiz.currentQuestion.hints[0] && (
                        <button
                          onClick={() => handleUseHint(1)}
                          disabled={quiz.usedHints.hint1}
                          className={`
                            flex-1 px-4 py-3 rounded-lg border font-semibold transition
                            ${quiz.usedHints.hint1
                              ? 'bg-[#2d2d2d] border-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-yellow-600/10 border-yellow-600 text-yellow-500 hover:bg-yellow-600/20'
                            }
                          `}
                        >
                          {quiz.usedHints.hint1 ? '✓ Hint 1 Used (-15%)' : '💡 Use Hint 1 (-15%)'}
                        </button>
                      )}
                      {quiz.currentQuestion.hints[1] && (
                        <button
                          onClick={() => handleUseHint(2)}
                          disabled={quiz.usedHints.hint2}
                          className={`
                            flex-1 px-4 py-3 rounded-lg border font-semibold transition
                            ${quiz.usedHints.hint2
                              ? 'bg-[#2d2d2d] border-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-orange-600/10 border-orange-600 text-orange-500 hover:bg-orange-600/20'
                            }
                          `}
                        >
                          {quiz.usedHints.hint2 ? '✓ Hint 2 Used (-30%)' : '💡 Use Hint 2 (-30%)'}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Display hints if used */}
                {quiz.currentQuestion.hints && (
                  <div className="mt-4 space-y-2">
                    {quiz.usedHints.hint1 && quiz.currentQuestion.hints[0] && (
                      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                        <p className="text-yellow-500 font-semibold text-sm mb-1">
                          {quiz.currentQuestion.hints[0].name}
                        </p>
                        <p className="text-white">
                          {quiz.currentQuestion.hints[0].hintText}
                        </p>
                      </div>
                    )}
                    {quiz.usedHints.hint2 && quiz.currentQuestion.hints[1] && (
                      <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                        <p className="text-orange-500 font-semibold text-sm mb-1">
                          {quiz.currentQuestion.hints[1].name}
                        </p>
                        <p className="text-white">
                          {quiz.currentQuestion.hints[1].hintText}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Answer Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Your Answer
                </label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                    placeholder="Type your answer here..."
                    disabled={quiz.isSubmitting}
                    className="flex-1 px-4 py-3 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition"
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!answer.trim() || quiz.isSubmitting}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                  >
                    {quiz.isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>

              {/* Result Feedback */}
              {quiz.lastSubmitResult && (
                <div className={`
                  p-4 rounded-lg border
                  ${quiz.lastSubmitResult.isCorrect
                    ? 'bg-green-900/20 border-green-600'
                    : quiz.lastSubmitResult.alreadyCompleted
                    ? 'bg-blue-900/20 border-blue-600'
                    : 'bg-red-900/20 border-red-600'
                  }
                `}>
                  <p className={`font-semibold ${
                    quiz.lastSubmitResult.isCorrect
                      ? 'text-green-500'
                      : quiz.lastSubmitResult.alreadyCompleted
                      ? 'text-blue-500'
                      : 'text-red-500'
                  }`}>
                    {quiz.lastSubmitResult.isCorrect
                      ? `✓ Correct! +${quiz.lastSubmitResult.awardedPoints} points`
                      : quiz.lastSubmitResult.alreadyCompleted
                      ? 'You already answered this question correctly'
                      : '✗ Incorrect answer, try again!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Sidebar - 20% */}
          <div className="hidden lg:block lg:w-[20%] min-w-[280px]">
            <div className="sticky top-6">
              <LiveLeaderboard
                participants={quiz.leaderboard}
                currentUserId={user?.id || ''}
                limit={15}
              />
              <button
                onClick={handleViewFullLeaderboard}
                className="w-full mt-4 px-4 py-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white text-sm font-medium rounded-lg transition border border-gray-700 hover:border-gray-600"
              >
                View Full Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard Modal */}
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
              participants={quiz.leaderboard}
              currentUserId={user?.id || ''}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizRoomPage;
