import { Server, Socket } from 'socket.io';
import { getQuestionByIndex, getUserStats } from '../services/quiz.service';
import { getTopLeaderboard, getAllLeaderboard } from '../services/leaderboard.service';

export const setupSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`Socket connected: ${socket.id}, userId: ${userId}`);

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

        socket.emit('initialData', {
          currentQuestion,
          userStats: {
            totalPoints: userStats.totalPoints,
            currentQuestionIndex: userStats.currentQuestionIndex,
            name: userStats.name,
            email: userStats.email,
          },
          leaderboard,
        });
      } catch (error) {
        console.error('Error in joinQuiz:', error);
        socket.emit('error', { message: 'Failed to load quiz data' });
      }
    });

    socket.on('requestLeaderboard', async (data: { limit?: number }) => {
      try {
        const leaderboard = await getTopLeaderboard(data?.limit || 15);
        socket.emit('leaderboardData', { leaderboard });
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch leaderboard' });
      }
    });

    socket.on('requestAllLeaderboard', async () => {
      try {
        const leaderboard = await getAllLeaderboard();
        socket.emit('allLeaderboardData', { leaderboard });
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch full leaderboard' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
