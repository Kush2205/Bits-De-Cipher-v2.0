/**
 * Leaderboard Controllers
 *
 * Business logic for leaderboard and ranking operations.
 *
 * getGlobalLeaderboard(req, res, next):
 * - Fetch top 100 users by total score
 * - Aggregate scores from all completed quiz sessions
 * - Include: rank, userId, name, totalScore, quizzesTaken
 * - Cache results in Redis with 5-minute TTL
 * - Return ranked list
 *
 * getQuizLeaderboard(req, res, next):
 * - Extract quizId from params
 * - Fetch top scores for this specific quiz
 * - Order by score DESC, timeTaken ASC
 * - Include: rank, userId, name, score, timeTaken, completedAt
 * - Return ranked list
 *
 * getSessionLeaderboard(req, res, next):
 * - Extract sessionId from params
 * - Fetch all participants in this session
 * - Calculate current rankings based on score
 * - Include: rank, userId, name, currentScore, questionsAnswered
 * - This is called when user first joins (rest is via WebSocket)
 *
 * getUserStats(req, res, next):
 * - Extract userId from params
 * - Calculate global rank for this user
 * - Get total score, average score, quizzes taken
 * - Fetch quiz history with scores
 * - Return comprehensive user statistics
 */
import type { Request, Response, NextFunction } from 'express';
import * as leaderboardServices from "../services/leaderboard.service"

// TODO: Implement controller functions
//user fetch + jwt auth
export const getGlobalLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawLimit = Number(req.query.limit);
    const limit = rawLimit > 0 ? rawLimit : undefined;

    const leaderBoard = await leaderboardServices.getGlobalLeaderboard(limit);

    res.status(200).json({
      success: true,
      data: leaderBoard,
    });
  } catch (error) {
    next(error);
  }
};


export const getQuizLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implementation here
};

export const getSessionLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implementation here
};


export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid User",
      });
    }

    const userStats = await leaderboardServices.getUserStats(userId);

    res.status(200).json({
      success: true,
      data: userStats,
    });
  } catch (error) {
    next(error);
  }
};

