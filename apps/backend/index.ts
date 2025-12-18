import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import quizRoutes from './routes/quiz.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import { createServer } from 'http';
import { initSocket } from './socket';
import { socketAuthMiddleware } from './middleware/socket.auth.middleware';
import { setupSockets } from './sockets/contest.socket';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

const io = initSocket(httpServer);

io.use(socketAuthMiddleware);

setupSockets(io);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
