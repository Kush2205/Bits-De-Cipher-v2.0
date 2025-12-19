import { Request, Response, NextFunction } from 'express';
import {
  getContestStatus,
  getTotalQuestions,
  getUserProgress,
  getContestStats,
} from '../services/contest.service';

export const getContestStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await getContestStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
};

export const getUserProgressHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const progress = await getUserProgress(userId);
    res.json(progress);
  } catch (error) {
    next(error);
  }
};

export const getContestStatsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getContestStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
