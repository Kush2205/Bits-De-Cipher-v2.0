import { Server, Socket } from 'socket.io';
import { getQuestionByIndex, getUserStats, getUserHintUsage } from '../services/quiz.service';
import { getTopLeaderboard, getAllLeaderboard } from '../services/leaderboard.service';

export const setupSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`Socket connected: ${socket.id}, userId: ${userId}`);

    // Join quiz room
    socket.on('joinQuiz', async () => {
      try {
        socket.join('game-room');
        console.log(`User ${userId} joined game-room`);

        const userStats = await getUserStats(userId);
        if (!userStats) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        const currentQuestion = await getQuestionByIndex(userStats.currentQuestionIndex);
        const leaderboard = await getTopLeaderboard(10);

        // Get hint usage for current question
        let hintUsage = null;
        if (currentQuestion) {
          hintUsage = await getUserHintUsage(userId, currentQuestion.id);
        }

        socket.emit('initialData', {
          currentQuestion,
          userStats: {
            totalPoints: userStats.totalPoints,
            currentQuestionIndex: userStats.currentQuestionIndex,
            name: userStats.name,
            email: userStats.email,
          },
          leaderboard,
          hintUsage: {
            hint1Used: hintUsage?.hint1Used || false,
            hint2Used: hintUsage?.hint2Used || false,
          },
        });

        // Notify room that a user joined
        socket.to('game-room').emit('userJoined', {
          userId,
          userName: userStats.name || userStats.email,
        });
      } catch (error) {
        console.error('Error in joinQuiz:', error);
        socket.emit('error', { message: 'Failed to load quiz data' });
      }
    });

    // Request current question
    socket.on('requestCurrentQuestion', async () => {
      try {
        const userStats = await getUserStats(userId);
        if (!userStats) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        const currentQuestion = await getQuestionByIndex(userStats.currentQuestionIndex);
        
        if (!currentQuestion) {
          socket.emit('noMoreQuestions', { message: 'No more questions available' });
          return;
        }

        const hintUsage = await getUserHintUsage(userId, currentQuestion.id);

        socket.emit('currentQuestion', {
          question: currentQuestion,
          hintUsage: {
            hint1Used: hintUsage?.hint1Used || false,
            hint2Used: hintUsage?.hint2Used || false,
          },
        });
      } catch (error) {
        console.error('Error in requestCurrentQuestion:', error);
        socket.emit('error', { message: 'Failed to fetch question' });
      }
    });

    // Notify when user submits answer (called from quiz controller)
    socket.on('answerSubmitted', async (data: { questionId: number; isCorrect: boolean; awardedPoints: number }) => {
      try {
        const userStats = await getUserStats(userId);
        
        // Broadcast to all users in room
        socket.to('game-room').emit('userAnswered', {
          userId,
          userName: userStats?.name || userStats?.email,
          questionId: data.questionId,
          isCorrect: data.isCorrect,
          awardedPoints: data.awardedPoints,
        });
      } catch (error) {
        console.error('Error in answerSubmitted:', error);
      }
    });

    // Request leaderboard (with limit)
    socket.on('requestLeaderboard', async (data: { limit?: number }) => {
      try {
        const leaderboard = await getTopLeaderboard(data?.limit || 15);
        socket.emit('leaderboardData', { leaderboard });
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch leaderboard' });
      }
    });

    // Request full leaderboard
    socket.on('requestAllLeaderboard', async () => {
      try {
        const leaderboard = await getAllLeaderboard();
        socket.emit('allLeaderboardData', { leaderboard });
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch full leaderboard' });
      }
    });

    // User is typing (for live activity indication)
    socket.on('typing', () => {
      socket.to('game-room').emit('userTyping', { userId });
    });

    // User stopped typing
    socket.on('stopTyping', () => {
      socket.to('game-room').emit('userStoppedTyping', { userId });
    });

    // Request user stats
    socket.on('requestUserStats', async () => {
      try {
        const userStats = await getUserStats(userId);
        if (!userStats) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        socket.emit('userStats', {
          totalPoints: userStats.totalPoints,
          currentQuestionIndex: userStats.currentQuestionIndex,
          answeredQuestionsCount: (userStats as any).answeredQuestionsCount,
          name: userStats.name,
          email: userStats.email,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch user stats' });
      }
    });

    // Request hint usage for a question
    socket.on('requestHintUsage', async (data: { questionId: number }) => {
      try {
        const hintUsage = await getUserHintUsage(userId, data.questionId);
        socket.emit('hintUsageData', {
          questionId: data.questionId,
          hint1Used: hintUsage?.hint1Used || false,
          hint2Used: hintUsage?.hint2Used || false,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch hint usage' });
      }
    });

    // Broadcast hint usage to user's own socket
    socket.on('hintUsed', async (data: { questionId: number; hintNumber: 1 | 2 }) => {
      socket.emit('hintMarked', {
        questionId: data.questionId,
        hintNumber: data.hintNumber,
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      socket.to('game-room').emit('userLeft', { userId });
    });
  });
};

