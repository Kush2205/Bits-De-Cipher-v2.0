/**
 * Quiz Room Page Component
 * 
 * Real-time quiz taking interface with live leaderboard.
 * 
 * Features to Implement:
 * 
 * 1. Quiz Session Initialization:
 *    - POST /quiz/:quizId/start to create session
 *    - Get sessionId from response
 *    - Connect to WebSocket with sessionId
 *    - Join quiz room via socket event
 * 
 * 2. Question Display:
 *    - Show current question text
 *    - Display multiple choice options
 *    - Highlight selected option
 *    - Show question number (1/10)
 * 
 * 3. Timer:
 *    - Countdown timer for quiz duration
 *    - Or per-question timer
 *    - Visual indicator (progress bar)
 *    - Auto-submit when time expires
 * 
 * 4. Answer Submission:
 *    - Emit 'submit-answer' socket event
 *    - Record time taken per question
 *    - Show instant feedback (correct/incorrect)
 *    - Display points earned
 *    - Move to next question automatically
 * 
 * 5. Live Leaderboard:
 *    - Display in sidebar or modal
 *    - Show current rankings in real-time
 *    - Update when anyone submits answer
 *    - Highlight current user's position
 *    - Show: rank, name, score
 * 
 * 6. Progress Tracking:
 *    - Show answered/total questions
 *    - Progress bar
 *    - Disable going back to previous questions
 * 
 * 7. Quiz Completion:
 *    - Show final score
 *    - Show correct/incorrect answers
 *    - Display final leaderboard position
 *    - Buttons: "View Results", "Return to Dashboard"
 * 
 * 8. WebSocket Events:
 *    - Listen: 'leaderboard-update', 'answer-result'
 *    - Emit: 'join-quiz-session', 'submit-answer', 'quiz-complete'
 * 
 * Example Structure:
 * <div className="quiz-room">
 *   <header>
 *     <Timer duration={quiz.duration} />
 *     <ProgressBar current={currentQuestion} total={totalQuestions} />
 *   </header>
 *   
 *   <main>
 *     <QuestionDisplay 
 *       question={currentQuestion}
 *       onAnswer={handleAnswer}
 *     />
 *   </main>
 *   
 *   <aside>
 *     <LiveLeaderboard participants={leaderboard} />
 *   </aside>
 * </div>
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQuiz } from '../hooks/useQuiz';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import { getCurrentUser } from '../services/auth.service';
import { SocketStatus } from '../components/socket/SocketStatus';
import api from '../lib/api';

const QuizRoomPage = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { currentQuestion, hints, hintUsage, fetchCurrentQuestion, fetchHints, submitAnswer, useHint } = useQuiz();
  const { isConnected, emit, on, off } = useSocket();
  const { showToast } = useToast();
  
  const [answer, setAnswer] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [displayUser, setDisplayUser] = useState<any>(user);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Load initial question and join quiz
  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch fresh user stats
        const freshUser = await getCurrentUser();
        setDisplayUser(freshUser);
        
        // Fetch total questions
        let total = 10; // Default fallback
        try {
          const totalResponse = await fetch(`${import.meta.env.VITE_API_URL}/quiz/total-questions`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          const totalData = await totalResponse.json();
          total = totalData.total || 10;
          setTotalQuestions(total);
          console.log('Total questions fetched:', total);
        } catch (err) {
          console.error('Failed to fetch total questions:', err);
          setTotalQuestions(total);
        }
        
        // Check if already completed all questions
        if (freshUser.currentQuestionIndex >= total) {
          setQuizCompleted(true);
          return;
        }
        
        const question = await fetchCurrentQuestion();
        if (isConnected) {
          emit('joinQuiz');
        }
        
        // If no question available, mark as completed
        if (!question) {
          setQuizCompleted(true);
        }
      } catch (err: any) {
        console.error('Failed to initialize quiz:', err);
        const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to load quiz';
        showToast(errorMsg, 'error');
        if (err.response?.status === 404) {
          // No more questions
          setQuizCompleted(true);
        }
      }
    };

    initialize();
  }, [isConnected]);

  // Listen to socket events with proper cleanup
  useEffect(() => {
    if (!isConnected) return;

    // Initial data when joining quiz
    const handleInitialData = (data: any) => {
      console.log('📦 Initial data received:', data);
      
      if (data.currentQuestion) {
        // Question is already loaded from API call, but we can update if needed
      }
      
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
      
      if (data.userStats) {
        setDisplayUser((prev: any) => ({ ...prev, ...data.userStats }));
      }
      
      if (data.hintUsage) {
        // Update hint usage if provided
        console.log('Hint usage:', data.hintUsage);
      }
    };

    // User answered notification (broadcast to other users)
    const handleUserAnswered = (data: any) => {
      console.log('👤 User answered:', data);
      // Optionally show notification that someone answered
      // This triggers a leaderboard update
    };

    // Leaderboard changed, need to refresh
    const handleLeaderboardUpdate = () => {
      console.log('🏆 Leaderboard update triggered');
      emit('requestLeaderboard', { limit: 15 });
    };

    // Leaderboard data response
    const handleLeaderboardData = (data: any) => {
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    };

    // User joined room notification
    const handleUserJoined = (data: any) => {
      console.log('👋 User joined:', data.userName);
    };

    // User left room notification
    const handleUserLeft = (data: any) => {
      console.log('👋 User left:', data.userId);
    };

    // User typing indicator
    const handleUserTyping = (data: any) => {
      console.log('✏️ User typing:', data.userId);
    };

    // User stopped typing
    const handleUserStoppedTyping = (data: any) => {
      console.log('✏️ User stopped typing:', data.userId);
    };

    // Socket error from backend
    const handleSocketError = (data: any) => {
      console.error('❌ Socket error:', data.message);
      showToast(data.message || 'Socket error occurred', 'error');
    };

    // No more questions available
    const handleNoMoreQuestions = (data: any) => {
      console.log('✅ No more questions:', data.message);
      showToast('All questions completed!', 'success');
      setQuizCompleted(true);
    };

    // Hint marked as used
    const handleHintMarked = (data: any) => {
      console.log('💡 Hint marked:', data);
    };

    // Register all event listeners
    on('initialData', handleInitialData);
    on('userAnswered', handleUserAnswered);
    on('leaderboard:update', handleLeaderboardUpdate);
    on('leaderboardData', handleLeaderboardData);
    on('userJoined', handleUserJoined);
    on('userLeft', handleUserLeft);
    on('userTyping', handleUserTyping);
    on('userStoppedTyping', handleUserStoppedTyping);
    on('error', handleSocketError);
    on('noMoreQuestions', handleNoMoreQuestions);
    on('hintMarked', handleHintMarked);

    // Cleanup: remove all listeners on unmount
    return () => {
      off('initialData', handleInitialData);
      off('userAnswered', handleUserAnswered);
      off('leaderboard:update', handleLeaderboardUpdate);
      off('leaderboardData', handleLeaderboardData);
      off('userJoined', handleUserJoined);
      off('userLeft', handleUserLeft);
      off('userTyping', handleUserTyping);
      off('userStoppedTyping', handleUserStoppedTyping);
      off('error', handleSocketError);
      off('noMoreQuestions', handleNoMoreQuestions);
      off('hintMarked', handleHintMarked);
    };
  }, [isConnected, on, off, emit, navigate, showToast]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) {
      showToast('Please enter an answer', 'error');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const result = await submitAnswer(currentQuestion.id, answer);
      
      if (result.alreadyCompleted) {
        showToast('You have already answered this question correctly', 'info');
        // Load next question
        setTimeout(async () => {
          setAnswer('');
          setFeedback(null);
          setShowHints(false);
          const nextQuestion = await fetchCurrentQuestion();
          if (!nextQuestion) {
            showToast('Quiz completed! Redirecting...', 'success');
            navigate('/contest');
          }
        }, 2000);
      } else if (result.isCorrect) {
        showToast(`Correct! You earned ${result.awardedPoints} points`, 'success');
        setFeedback({ 
          message: `Correct! You earned ${result.awardedPoints} points`, 
          type: 'success' 
        });
        
        // Refresh user stats (both local and global)
        const freshUser = await getCurrentUser();
        setDisplayUser(freshUser);
        await refreshUser(); // Update global auth context
        
        // Wait a moment then load next question
        setTimeout(async () => {
          setAnswer('');
          setFeedback(null);
          setShowHints(false);
          const nextQuestion = await fetchCurrentQuestion();
          if (!nextQuestion) {
            showToast('Quiz completed! Congratulations!', 'success');
            setQuizCompleted(true);
          }
        }, 2000);
      } else {
        showToast('Incorrect answer. Try again!', 'error');
        setFeedback({ message: 'Incorrect answer. Try again!', type: 'error' });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to submit answer';
      showToast(errorMsg, 'error');
      setFeedback({ 
        message: errorMsg, 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseHint = async (hintNumber: 1 | 2) => {
    if (!currentQuestion) return;

    try {
      await useHint(currentQuestion.id, hintNumber);
      await fetchHints(currentQuestion.id);
      showToast(`Hint ${hintNumber} unlocked!`, 'success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to use hint';
      showToast(errorMsg, 'error');
      console.error('Failed to use hint:', err);
    }
  };

  const handleSkipQuestion = async () => {
    if (!currentQuestion) return;

    try {
      setSubmitting(true);
      
      // Call backend to skip this question and move to next
      await api.post('/quiz/skip-question', {
        questionId: currentQuestion.id
      });
      
      // Refresh user stats (both local and global)
      const freshUser = await getCurrentUser();
      setDisplayUser(freshUser);
      await refreshUser(); // Update global auth context
      
      // Load next question
      setAnswer('');
      setFeedback(null);
      setShowHints(false);
      const nextQuestion = await fetchCurrentQuestion();
      
      if (!nextQuestion) {
        showToast('All questions completed!', 'success');
        setQuizCompleted(true);
      } else {
        showToast('Question skipped', 'info');
      }
    } catch (err: any) {
      console.error('Failed to skip question:', err);
      showToast('Failed to skip question', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishQuiz = () => {
    setQuizCompleted(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Quiz Completed Modal
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600 mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🎉 Quiz Finished!
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-300 mb-2">
            Congratulations! You've completed {(displayUser as any)?.answeredQuestionsCount || 0} out of {totalQuestions} questions.
          </p>
          <p className="text-gray-400 mb-8">
            You earned a total of <span className="text-green-500 font-bold">{displayUser?.totalPoints || 0} points</span>!
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#2d2d2d] p-4 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Questions Answered</p>
              <p className="text-2xl font-bold text-green-500">{(displayUser as any)?.answeredQuestionsCount || 0}/{totalQuestions}</p>
            </div>
            <div className="bg-[#2d2d2d] p-4 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Total Points</p>
              <p className="text-2xl font-bold text-green-500">{displayUser?.totalPoints || 0}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/results')}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              View Results
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => navigate('/contest')}
              className="px-8 py-3 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white font-semibold rounded-lg transition-colors border border-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="bg-[#1a1a1a] border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Quiz Competition</h1>
              <SocketStatus />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Points</p>
                <p className="text-lg font-bold text-green-500">{displayUser?.totalPoints || 0}</p>
              </div>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Quiz Area */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-8">
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-400">
                    Question #{displayUser?.currentQuestionIndex + 1 || 1}
                  </span>
                  <span className="text-sm font-medium text-green-500">
                    {currentQuestion.maxPoints} points
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-6">{currentQuestion.name}</h2>
                
                {currentQuestion.imageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden border border-gray-700">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Question" 
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>

              {/* Answer Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Answer
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                  disabled={submitting}
                />
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  feedback.type === 'success' 
                    ? 'bg-green-900/20 border-green-800 text-green-400' 
                    : 'bg-red-900/20 border-red-800 text-red-400'
                }`}>
                  {feedback.message}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answer.trim()}
                    className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="px-6 py-3 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white font-medium rounded-lg transition-colors border border-gray-700"
                  >
                    {showHints ? 'Hide' : 'Show'} Hints
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSkipQuestion}
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Skip Question →
                  </button>
                  <button
                    onClick={handleFinishQuiz}
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Finish Quiz
                  </button>
                </div>
              </div>

              {/* Hints */}
              {showHints && (
                <div className="mt-6 space-y-3">
                  {hints.map((hint, index) => {
                    const hintNum = (index + 1) as 1 | 2;
                    const isUsed = hintNum === 1 ? hintUsage.hint1Used : hintUsage.hint2Used;
                    
                    return (
                      <div key={hint.id} className="bg-[#2d2d2d] p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-400">Hint {hintNum}</span>
                          {!isUsed && (
                            <button
                              onClick={() => handleUseHint(hintNum)}
                              className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                            >
                              Use Hint (-{hintNum === 1 ? '15' : '30'}% points)
                            </button>
                          )}
                        </div>
                        {isUsed ? (
                          <p className="text-sm text-gray-300">{hint.hintText}</p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Click to reveal hint</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🏆</span> Leaderboard
              </h3>
              
              <div className="space-y-2">
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No data yet</p>
                ) : (
                  leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg ${
                        entry.id === user?.id
                          ? 'bg-green-900/20 border border-green-800'
                          : 'bg-[#2d2d2d] border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {entry.name || entry.email}
                              {entry.id === user?.id && (
                                <span className="ml-2 text-xs text-green-400">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Q{entry.currentQuestionIndex || 0}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-500">{entry.totalPoints}</p>
                          <p className="text-xs text-gray-500">pts</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizRoomPage;
