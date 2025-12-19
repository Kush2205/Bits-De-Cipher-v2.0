/**
 * Leaderboard Page Component
 * 
 * Global and quiz-specific leaderboards with real-time updates.
 * 
 * Features to Implement:
 * 
 * 1. Tab Navigation:
 *    - "Global Leaderboard" tab
 *    - "Quiz Leaderboards" tab
 *    - Switch between views
 * 
 * 2. Global Leaderboard:
 *    - Fetch from GET /leaderboard/global
 *    - Display top 100 users
 *    - Show: rank, name, total score, quizzes taken
 *    - Highlight current user's position
 *    - Real-time updates via WebSocket
 * 
 * 3. Quiz-Specific Leaderboard:
 *    - List all quizzes with dropdown/tabs
 *    - Fetch from GET /leaderboard/quiz/:quizId
 *    - Show top scores for selected quiz
 *    - Display: rank, name, score, time taken
 * 
 * 4. User Search/Filter:
 *    - Search for specific user
 *    - Filter by time period (optional)
 *    - Pagination for large lists
 * 
 * 5. Current User Highlight:
 *    - Scroll to and highlight user's position
 *    - Show rank badge if top 10
 *    - Display rank change indicator (↑↓)
 * 
 * 6. WebSocket Integration:
 *    - Subscribe to leaderboard updates
 *    - Emit 'subscribe-global-leaderboard'
 *    - Listen for 'global-leaderboard-update'
 *    - Smoothly update rankings without jarring UI
 * 
 * 7. Visual Design:
 *    - Trophy icons for top 3
 *    - Different colors for rank tiers
 *    - Animated rank changes
 *    - Responsive table/card layout
 * 
 * Example Structure:
 * <div className="leaderboard-page">
 *   <h1>Leaderboard</h1>
 *   
 *   <Tabs>
 *     <Tab label="Global">
 *       <GlobalLeaderboard entries={globalLeaderboard} />
 *     </Tab>
 *     <Tab label="By Quiz">
 *       <QuizSelector onChange={setSelectedQuiz} />
 *       <QuizLeaderboard entries={quizLeaderboard} />
 *     </Tab>
 *   </Tabs>
 *   
 *   <LeaderboardTable 
 *     entries={leaderboard}
 *     currentUserId={userId}
 *   />
 * </div>
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import { SocketStatus } from '../components/socket/SocketStatus';

interface LeaderboardEntry {
  id: string;
  name: string | null;
  email: string;
  totalPoints: number;
  currentQuestionIndex: number;
}

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isConnected, emit, on, off } = useSocket();
  const { showToast } = useToast();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err: any) {
        console.error('Failed to fetch leaderboard:', err);
        showToast('Failed to load leaderboard', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [showToast]);

  // Socket event listeners with proper cleanup
  useEffect(() => {
    if (!isConnected) return;

    // Request initial leaderboard data
    emit('requestLeaderboard', { limit: 50 });

    // Leaderboard data response
    const handleLeaderboardData = (data: any) => {
      if (data.leaderboard) {
        console.log('📊 Leaderboard data received:', data.leaderboard.length, 'entries');
        setLeaderboard(data.leaderboard);
        setLoading(false);
      }
    };

    // Leaderboard update notification - refresh data
    const handleLeaderboardUpdate = () => {
      console.log('🔄 Leaderboard update triggered, refreshing...');
      emit('requestLeaderboard', { limit: 50 });
    };

    // User answered (triggers leaderboard change)
    const handleUserAnswered = (data: any) => {
      console.log('👤 User answered:', data.userName, data.isCorrect ? '✅' : '❌');
      // Leaderboard will update via leaderboard:update event
    };

    // User joined notification
    const handleUserJoined = (data: any) => {
      console.log('👋 User joined:', data.userName);
    };

    // User left notification
    const handleUserLeft = (data: any) => {
      console.log('👋 User left:', data.userId);
    };

    // Socket error
    const handleSocketError = (data: any) => {
      console.error('❌ Socket error:', data.message);
      showToast(data.message || 'Socket error occurred', 'error');
    };

    // Register all listeners
    on('leaderboardData', handleLeaderboardData);
    on('leaderboard:update', handleLeaderboardUpdate);
    on('userAnswered', handleUserAnswered);
    on('userJoined', handleUserJoined);
    on('userLeft', handleUserLeft);
    on('error', handleSocketError);

    // Cleanup on unmount
    return () => {
      off('leaderboardData', handleLeaderboardData);
      off('leaderboard:update', handleLeaderboardUpdate);
      off('userAnswered', handleUserAnswered);
      off('userJoined', handleUserJoined);
      off('userLeft', handleUserLeft);
      off('error', handleSocketError);
    };
  }, [isConnected, emit, on, off, showToast]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="bg-[#1a1a1a] border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/contest')}
                className="text-gray-400 hover:text-white transition"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold">Leaderboard</h1>
              <SocketStatus />
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition border border-gray-700 hover:border-gray-600 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="text-2xl font-bold">Top Competitors</h2>
              <p className="text-sm text-gray-400">Live rankings updated in real-time</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="mt-4 text-gray-400">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No entries yet. Be the first to compete!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.id === user?.id;

                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg transition-all ${
                      isCurrentUser
                        ? 'bg-green-900/20 border-2 border-green-600 shadow-lg shadow-green-900/20'
                        : rank <= 3
                        ? 'bg-gradient-to-r from-yellow-900/10 to-transparent border border-yellow-800/30'
                        : 'bg-[#2d2d2d] border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`text-2xl font-bold ${rank <= 3 ? 'text-3xl' : 'text-gray-400'} min-w-[60px]`}>
                          {getRankIcon(rank)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold text-white">
                              {entry.name || entry.email}
                            </p>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded-full">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {(entry as any).answeredQuestionsCount || 0} questions answered
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-500">
                          {entry.totalPoints}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-400 mb-1">Your Rank</p>
            <p className="text-2xl font-bold text-green-500">
              #{leaderboard.findIndex(e => e.id === user?.id) + 1 || '-'}
            </p>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-400 mb-1">Your Points</p>
            <p className="text-2xl font-bold text-green-500">{user?.totalPoints || 0}</p>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4 text-center">
            <p className="text-sm text-gray-400 mb-1">Total Players</p>
            <p className="text-2xl font-bold text-green-500">{leaderboard.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
