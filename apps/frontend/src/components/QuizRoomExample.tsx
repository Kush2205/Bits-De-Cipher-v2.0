/**
 * Example: Quiz Room Component
 * 
 * Demonstrates how to use the quiz hooks for a complete quiz experience.
 * This is a reference implementation showing best practices.
 */

import { useState } from 'react';
import { useQuizRoom } from '../hooks/useQuizRoom';
import { useAuth } from '../hooks/useAuth';
import LiveLeaderboard from './LiveLeaderboard';

export const QuizRoomExample = () => {
  const { user } = useAuth();
  const [answer, setAnswer] = useState('');

  // Single hook provides everything needed for quiz room
  const {
    // Connection
    isConnected,

    // Quiz state
    currentQuestion,
    userStats,
    isJoined,

    // Leaderboard
    leaderboard,
    currentUserRank,

    // Actions
    submitAnswer,
    isSubmitting,
    lastSubmitResult,
    refreshLeaderboard,

    // Error handling
    error,
  } = useQuizRoom({
    userId: user?.id,
    autoJoin: true,
    leaderboardLimit: 10,
  });

  // Handle answer submission
  const handleSubmit = async () => {
    if (!currentQuestion || !answer.trim()) return;

    const result = await submitAnswer(currentQuestion.id, answer.trim());

    if (result?.isCorrect) {
      console.log('Correct! Points earned:', result.awardedPoints);
      setAnswer(''); // Clear input
    } else if (result?.alreadyCompleted) {
      console.log('Already answered this question');
    } else {
      console.log('Incorrect answer');
    }
  };

  if (!isConnected) {
    return <div>Connecting to server...</div>;
  }

  if (!isJoined) {
    return <div>Joining quiz...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentQuestion) {
    return <div>Quiz completed!</div>;
  }

  return (
    <div className="quiz-room">
      {/* Connection Status */}
      <div className="connection-status">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* User Stats */}
      <div className="user-stats">
        <p>Points: {userStats?.totalPoints || 0}</p>
        <p>Questions Answered: {userStats?.currentQuestionIndex || 0}</p>
        {currentUserRank && <p>Current Rank: #{currentUserRank}</p>}
      </div>

      {/* Current Question */}
      <div className="question">
        <h2>{currentQuestion.name}</h2>
        {currentQuestion.imageUrl && (
          <img src={currentQuestion.imageUrl} alt="Question" />
        )}
        <p>Points: {currentQuestion.points} / {currentQuestion.maxPoints}</p>

        {/* Hints */}
        {currentQuestion.hints && currentQuestion.hints.length > 0 && (
          <div className="hints">
            {currentQuestion.hints.map((hint) => (
              <div key={hint.id} className="hint">
                <strong>{hint.name}:</strong> {hint.hintText}
              </div>
            ))}
          </div>
        )}

        {/* Answer Input */}
        <div className="answer-input">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer"
            disabled={isSubmitting}
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !answer.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>

        {/* Last Submit Result */}
        {lastSubmitResult && (
          <div className={`result ${lastSubmitResult.isCorrect ? 'correct' : 'incorrect'}`}>
            {lastSubmitResult.isCorrect
              ? `Correct! +${lastSubmitResult.awardedPoints} points`
              : 'Incorrect answer'}
          </div>
        )}
      </div>

      {/* Live Leaderboard */}
      <div className="leaderboard-section">
        <LiveLeaderboard
          participants={leaderboard}
          currentUserId={user?.id || ''}
          limit={10}
        />
        <button onClick={refreshLeaderboard}>
          Refresh Leaderboard
        </button>
      </div>
    </div>
  );
};
