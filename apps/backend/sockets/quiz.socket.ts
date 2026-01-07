import { Server, Socket } from "socket.io";
import {
  getCurrentQuestion,
  getUserStats,
  useHint,
  submitAnswer,
} from "../services/quiz.service";
import { getGlobalLeaderboard } from "../services/leaderboard.service";


export const quizSockets = (io: Server) => {
  io.on("connection", (socket: Socket) => {

    const userId = socket.data.userId;
    console.log(`Socket connected: ${socket.id}, userId: ${userId}`);

    socket.join("quiz-room");

    socket.on("joinQuiz", async () => {
      try {
        console.log(`User ${userId} joined game-room`);
        const question = await getCurrentQuestion(userId);
        const userStats = await getUserStats(userId);
        const leaderboard = await getGlobalLeaderboard(10);

        socket.emit("initialData", {
          question,
          userStats,
          leaderboard
        });
      } catch {
        socket.emit("error", { message: "Failed to load quiz" });
      }
    });

    socket.on("requestHint", async ({ questionId, hintNumber }) => {
      try {
        const result = await useHint(userId, questionId, hintNumber);
        socket.emit("hintData", result);
      } catch {
        socket.emit("error", { message: "Hint failed" });
      }
    });

    socket.on("submitAnswer", async ({ questionId, answer }) => {
      try {
        const result = await submitAnswer(userId, questionId, answer);
        socket.emit("answerResult", result);

        if (result.isCorrect) {
          const leaderboard = await getGlobalLeaderboard(10);
          io.to("quiz-room").emit("leaderboardUpdate" , leaderboard);
        }
      } catch {
        socket.emit("error", { message: "Submission failed" });
      }
    });

    socket.on('requestLeaderboard', async (data: { limit?: number }) => {
      try {
        const leaderboard = await getGlobalLeaderboard(data?.limit || 15);
        socket.emit('leaderboardData', { leaderboard });
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch leaderboard' });
      }
    });

    socket.on('requestAllLeaderboard', async () => {
      try {
        const leaderboard = await getGlobalLeaderboard();
        socket.emit('allLeaderboardData', { leaderboard });
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch full leaderboard' });
      }
    });



    socket.on("disconnect", () => {
      console.log("Socket disconnected:", userId);
    });
  });
};
