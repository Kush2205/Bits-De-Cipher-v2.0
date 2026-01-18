import { Server, Socket } from 'socket.io';
import { getQuestionByIndex, getUserStats } from '../services/quiz.service';
import { getTopLeaderboard, getAllLeaderboard } from '../services/leaderboard.service';
import prisma from '@repo/db/client';

export const setupSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    const role = socket.data.role;
    console.log(`Socket connected: ${socket.id}, userId: ${userId} , role:${role}`);

    if(role=="USER"){
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
          const leaderboard = await getTopLeaderboard(200); //as per participants

          let hintUsage = { hint1Used: false, hint2Used: false };
          if (currentQuestion) {
            const hints = await prisma.userHintsData.findFirst({
              where: { userId, questionId: currentQuestion.id },
            });
            if (hints) {
              hintUsage = { hint1Used: hints.hint1Used, hint2Used: hints.hint2Used };
            }
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
            hintUsage,
          });

          io.to('game-room').emit('leaderboardData', { leaderboard });
        } catch (error) {
          console.error('Error in joinQuiz:', error);
          socket.emit('error', { message: 'Failed to load quiz data' });
        }
      });
    }else{
      socket.on('joinQuiz' , async()=>{
        socket.join('game-room');
        const leaderboard = await getTopLeaderboard(10);
        socket.emit('initialData', {
            leaderboard,
        });

        io.to('game-room').emit('leaderboardData', { leaderboard: await getTopLeaderboard(200) });
      })
    }


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
