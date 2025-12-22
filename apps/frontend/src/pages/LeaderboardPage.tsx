/**
 * Leaderboard Page
 * 
 * Displays complete leaderboard with real-time updates via socket.
 * Reuses existing hooks and components.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useSocket } from '../hooks/useSocket';
import LiveLeaderboard from '../components/LiveLeaderboard';

const LeaderboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isConnected } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const userRowRef = useRef<HTMLDivElement>(null);

  // Fetch all leaderboard entries with auto-fetch enabled
  const {
    leaderboard,
    isLoading,
    error,
    currentUserRank,
    requestAllLeaderboard,
    refreshLeaderboard,
  } = useLeaderboard({
    currentUserId: user?.id,
    autoFetch: false, // We'll fetch all manually
  });

  // Fetch all leaderboard on mount
  useEffect(() => {
    if (isConnected) {
      requestAllLeaderboard();
    }
  }, [isConnected, requestAllLeaderboard]);

  // Scroll to current user's position
  useEffect(() => {
    if (currentUserRank && userRowRef.current) {
      setTimeout(() => {
        userRowRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 500);
    }
  }, [currentUserRank, leaderboard.length]);

  // Filter leaderboard by search term
  const filteredLeaderboard = searchTerm
    ? leaderboard.filter((entry) =>
        (entry.name?.toLowerCase() || entry.email.toLowerCase()).includes(
          searchTerm.toLowerCase()
        )
      )
    : leaderboard;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    requestAllLeaderboard();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <nav className="bg-[#1a1a1a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Full Leaderboard</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">{user?.name || user?.email}</p>
                {currentUserRank && (
                  <p className="text-xs text-green-500 font-semibold">
                    Rank #{currentUserRank}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                🏆 Global Leaderboard
              </h2>
              <p className="text-gray-400">
                {leaderboard.length} {leaderboard.length === 1 ? 'competitor' : 'competitors'} • Real-time updates
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-3 pl-12 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-500 font-semibold">Error loading leaderboard</p>
            <p className="text-white">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {currentUserRank && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Your Rank</p>
              <p className="text-4xl font-bold text-green-500">#{currentUserRank}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Your Points</p>
              <p className="text-4xl font-bold text-white">
                {leaderboard.find(entry => entry.id === user?.id)?.totalPoints || user?.totalPoints || 0}
              </p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Questions Solved</p>
              <p className="text-4xl font-bold text-white">
                {leaderboard.find(entry => entry.id === user?.id)?.currentQuestionIndex || user?.currentQuestionIndex || 0}
              </p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {isLoading && leaderboard.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'No users found matching your search' : 'No leaderboard data available'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
            {/* Table Header - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#0d0d0d] border-b border-gray-800 text-sm font-semibold text-gray-400">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-3 text-center">Points</div>
              <div className="col-span-3 text-center">Questions</div>
            </div>

            {/* Leaderboard Entries */}
            <div className="divide-y divide-gray-800">
              {filteredLeaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.id === user?.id;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

                return (
                  <div
                    key={entry.id}
                    ref={isCurrentUser ? userRowRef : null}
                    className={`
                      grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 transition-all
                      ${isCurrentUser ? 'bg-green-900/20 border-l-4 border-green-500' : 'hover:bg-[#2d2d2d]'}
                    `}
                  >
                    {/* Rank */}
                    <div className="md:col-span-1 flex items-center gap-3 md:gap-0">
                      <span className="text-sm text-gray-400 md:hidden">Rank:</span>
                      <div className="flex items-center gap-2">
                        {medal ? (
                          <span className="text-2xl">{medal}</span>
                        ) : (
                          <span className={`text-lg font-bold ${isCurrentUser ? 'text-green-400' : 'text-gray-400'}`}>
                            #{rank}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Player */}
                    <div className="md:col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {(entry.name?.[0] || entry.email[0]).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold truncate ${isCurrentUser ? 'text-green-400' : 'text-white'}`}>
                          {entry.name || entry.email.split('@')[0]}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-400 truncate">{entry.email}</p>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="md:col-span-3 flex md:justify-center items-center gap-3 md:gap-0">
                      <span className="text-sm text-gray-400 md:hidden">Points:</span>
                      <span className={`text-xl font-bold ${isCurrentUser ? 'text-green-400' : 'text-white'}`}>
                        {entry.totalPoints}
                      </span>
                    </div>

                    {/* Questions */}
                    <div className="md:col-span-3 flex md:justify-center items-center gap-3 md:gap-0">
                      <span className="text-sm text-gray-400 md:hidden">Questions:</span>
                      <span className="text-white font-medium">
                        {entry.currentQuestionIndex}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            Back to Quiz
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
