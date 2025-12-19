import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { getLeaderboard } from '../services/quiz.service';

interface UserAnswer {
  id: number;
  questionId: number;
  submittedText: string;
  isCorrect: boolean;
  awardedPoints: number;
  usedHint1: boolean;
  usedHint2: boolean;
  createdAt: string;
  question: {
    id: number;
    name: string;
    correctAnswer: string;
    maxPoints: number;
  };
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [hasCompletedAllQuestions, setHasCompletedAllQuestions] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);

      // Fetch user's answers
      const answersResponse = await api.get('/quiz/my-answers');
      const answers = answersResponse.data.answers || [];
      setUserAnswers(answers);

      // Fetch total questions count
      const questionsResponse = await api.get('/quiz/total-questions');
      const total = questionsResponse.data.total || 0;
      setTotalQuestions(total);

      // Fetch all questions
      const allQuestionsResponse = await api.get('/quiz/all-questions');
      const questions = allQuestionsResponse.data.questions || [];
      setAllQuestions(questions);

      // Fetch user stats
      const statsResponse = await api.get('/auth/me');
      const stats = statsResponse.data.user;
      setUserStats(stats);

      // Check if user has completed all questions
      setHasCompletedAllQuestions(stats.currentQuestionIndex >= total);

      // Fetch leaderboard
      const leaderboardData = await getLeaderboard(10);
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
    } catch (err) {
      console.error('Failed to fetch results:', err);
      // Set default values on error
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuiz = async () => {
    if (!window.confirm('Are you sure you want to reset your progress? This will delete all your answers and start from the beginning.')) {
      return;
    }

    try {
      await api.post('/quiz/reset');
      navigate('/quiz');
    } catch (err: any) {
      console.error('Failed to reset quiz:', err);
      alert(err.response?.data?.message || 'Failed to reset quiz');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
  const totalPoints = userStats?.totalPoints || 0;
  const accuracy = userAnswers.length > 0 ? (correctAnswers / userAnswers.length) * 100 : 0;
  const userRank = Array.isArray(leaderboard) ? leaderboard.findIndex(u => u.id === user?.id) + 1 : 0;

  // Create a combined list of all questions encountered (up to currentQuestionIndex)
  const displayQuestions = allQuestions
    .slice(0, userStats?.currentQuestionIndex || 0)
    .map((question, index) => {
      const userAnswer = userAnswers.find(a => a.questionId === question.id);
      return {
        questionNumber: index + 1,
        question,
        answer: userAnswer,
        isSkipped: !userAnswer, // If no answer found, it was skipped
      };
    });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <nav className="bg-[#1a1a1a] border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Quiz Results</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/contest')}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition border border-gray-700 hover:border-gray-600 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Completion Status */}
        {hasCompletedAllQuestions && (
          <div className="mb-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">🎉 Congratulations!</h2>
                <p className="text-gray-300 mb-4">
                  You have completed all {totalQuestions} questions! You've already attempted the entire quiz.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleResetQuiz}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Reattempt Quiz
                  </button>
                  <button
                    onClick={() => navigate('/leaderboard')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!hasCompletedAllQuestions && userAnswers.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Quiz In Progress</h2>
                <p className="text-gray-300 mb-4">
                  You've answered {userAnswers.length} out of {totalQuestions} questions. Keep going!
                </p>
                <button
                  onClick={() => navigate('/quiz')}
                  className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                >
                  Continue Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Total Points</h3>
            </div>
            <p className="text-4xl font-bold text-green-500">{totalPoints}</p>
          </div>

          {/* Accuracy Card */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Accuracy</h3>
            </div>
            <p className="text-4xl font-bold text-blue-500">{accuracy.toFixed(1)}%</p>
            <p className="text-sm text-gray-400 mt-2">{correctAnswers}/{userAnswers.length} correct</p>
          </div>

          {/* Rank Card */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Your Rank</h3>
            </div>
            <p className="text-4xl font-bold text-purple-500">#{userRank > 0 ? userRank : '-'}</p>
            <p className="text-sm text-gray-400 mt-2">Out of {leaderboard.length} players</p>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Your Answers</h2>
          
          {displayQuestions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-lg mb-4">No answers yet</p>
              <button
                onClick={() => navigate('/quiz')}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Start Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayQuestions.map((item) => (
                <div
                  key={item.question.id}
                  className={`p-4 rounded-lg border ${
                    item.isSkipped
                      ? 'bg-gray-900/30 border-gray-700/50'
                      : item.answer?.isCorrect
                      ? 'bg-green-900/10 border-green-700/50'
                      : 'bg-red-900/10 border-red-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-400">Q{item.questionNumber}</span>
                        <h3 className="text-lg font-semibold text-white">{item.question.name}</h3>
                      </div>
                      
                      {item.isSkipped ? (
                        <div className="mt-3">
                          <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                          <p className="font-medium text-gray-500">__SKIP__</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm font-medium text-gray-400">
                              ⊘ Skipped
                            </span>
                            <span className="text-sm text-gray-400">
                              Points: 0/{item.question.maxPoints}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                              <p className={`font-medium ${item.answer?.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                {item.answer?.submittedText}
                              </p>
                            </div>
                            
                            {!item.answer?.isCorrect && (
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Correct Answer:</p>
                                <p className="font-medium text-green-400">{item.question.correctAnswer}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            <span className={`text-sm font-medium ${item.answer?.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {item.answer?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                            <span className="text-sm text-gray-400">
                              Points: {item.answer?.awardedPoints}/{item.question.maxPoints}
                            </span>
                            {(item.answer?.usedHint1 || item.answer?.usedHint2) && (
                              <span className="text-sm text-yellow-400">
                                💡 Hints used: {[item.answer?.usedHint1 && '1', item.answer?.usedHint2 && '2'].filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard Preview */}
        {Array.isArray(leaderboard) && leaderboard.length > 0 && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Top Players</h2>
              <button
                onClick={() => navigate('/leaderboard')}
                className="px-4 py-2 text-sm font-medium text-green-400 hover:text-green-300 transition"
              >
                View Full Leaderboard →
              </button>
            </div>
            
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    player.id === user?.id
                      ? 'bg-green-900/20 border border-green-700/50'
                      : 'bg-gray-900/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-600' :
                      'text-gray-500'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">
                        {player.name || player.email}
                        {player.id === user?.id && (
                          <span className="ml-2 text-xs text-green-400">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-400">
                        Questions: {(player as any).answeredQuestionsCount || 0}/{totalQuestions}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-500">{player.totalPoints}</p>
                    <p className="text-xs text-gray-400">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
