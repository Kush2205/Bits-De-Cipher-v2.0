import { Server } from "socket.io";
import http from "http";
import { socketAuthMiddleware } from "../middleware/socketAuth.middleware";
import { quizSockets } from "./quiz.socket";

export const initSockets = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  quizSockets(io);

  return io;
};
