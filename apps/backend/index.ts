import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { QuizSocket } from './sockets/quiz.socket';
import HTTPServer from 'http';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = HTTPServer.createServer(app);
const quizSocket = new QuizSocket(server);
quizSocket.initializeSockets();
// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Route setup
app.use('/api/auth', authRoutes);



app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
