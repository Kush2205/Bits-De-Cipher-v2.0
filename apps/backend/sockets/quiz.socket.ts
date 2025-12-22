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

    socket.on("join_quiz", async () => {
      try {
        console.log(`User ${userId} joined game-room`);
        const question = await getCurrentQuestion(userId);
        const userStats = await getUserStats(userId);
        const leaderboard = await getGlobalLeaderboard(10);

        socket.emit("quiz:init", {
          question,
          userStats,
          leaderboard
        });
      } catch {
        socket.emit("quiz:error", { message: "Failed to load quiz" });
      }
    });

    socket.on("request_hint", async ({ questionId, hintNumber }) => {
      try {
        const result = await useHint(userId, questionId, hintNumber);
        socket.emit("quiz:hint", result);
      } catch {
        socket.emit("quiz:error", { message: "Hint failed" });
      }
    });

    socket.on("submit_answer", async ({ questionId, answer }) => {
      try {
        const result = await submitAnswer(userId, questionId, answer);
        socket.emit("quiz:answer_result", result);

        if (result.isCorrect) {
          const leaderboard = await getGlobalLeaderboard(10);
          io.to("quiz-room").emit("quiz:leaderboard_update" , leaderboard);
        }
      } catch {
        socket.emit("quiz:error", { message: "Submission failed" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", userId);
    });
  });
};
