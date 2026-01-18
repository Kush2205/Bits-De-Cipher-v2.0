import { Request, Response, NextFunction } from 'express';
import { getTopLeaderboard, getAllLeaderboard } from '../services/leaderboard.service';

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const leaderboard = await getTopLeaderboard(limit);
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

export const getAllLeaderboardUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await getAllLeaderboard();
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};
