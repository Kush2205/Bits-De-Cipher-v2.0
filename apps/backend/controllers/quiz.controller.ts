import { Request, Response, NextFunction } from 'express';
import {
  getQuestionByIndex,
  getUserStats,
  submitAnswer as submitAnswerService,
  useHint,
} from '../services/quiz.service';

export const getCurrentQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const userStats = await getUserStats(userId);
    
    if (!userStats) {
      return res.status(404).json({ message: 'User not found' });
    }

    const question = await getQuestionByIndex(userStats.currentQuestionIndex);

    if (!question) {
      return res.status(404).json({ message: 'No more questions available' });
    }

    res.json({ question });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const { questionId, submittedText, usedHint1 = false, usedHint2 = false } = req.body;

    const qid = Number(questionId);

    if (!qid || !submittedText) {
      return res.status(400).json({ message: 'questionId and submittedText are required' });
    }

    const result = await submitAnswerService({
      userId,
      questionId: qid,
      submittedText,
      usedHint1,
      usedHint2,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const markHintUsed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const { questionId, hintNumber } = req.body;

    const qid = Number(questionId);

    if (!qid || (hintNumber !== 1 && hintNumber !== 2)) {
      return res.status(400).json({ message: 'questionId and hintNumber (1|2) are required' });
    }

    const usage = await useHint(userId, qid, hintNumber);
    res.json({ usage });
  } catch (error) {
    next(error);
  }
};
