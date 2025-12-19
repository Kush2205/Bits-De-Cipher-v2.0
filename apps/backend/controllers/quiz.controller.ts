import { Request, Response, NextFunction } from 'express';
import prisma from '@repo/db/client';
import {
  getQuestionByIndex,
  getUserStats,
  submitAnswer as submitAnswerService,
  useHint,
  getHintsForQuestion,
  getUserHintUsage,
  getUserAnswers,
  getTotalQuestionsCount,
  resetUserProgress,
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

    const result = await submitAnswerService({
      userId,
      questionId,
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

    const usage = await useHint(userId, questionId, hintNumber);
    res.json({ success: true, usage });
  } catch (error) {
    next(error);
  }
};

export const getHints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const questionId = Number(req.params.questionId);

    if (!questionId) {
      return res.status(400).json({ message: 'Invalid question ID' });
    }

    const hints = await getHintsForQuestion(questionId);
    const hintUsage = await getUserHintUsage(userId, questionId);

    res.json({ 
      hints,
      hintUsage: {
        hint1Used: hintUsage?.hint1Used || false,
        hint2Used: hintUsage?.hint2Used || false,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAnswers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const answers = await getUserAnswers(userId);
    res.json({ answers });
  } catch (error) {
    next(error);
  }
};

export const getTotalQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await getTotalQuestionsCount();
    res.json({ total });
  } catch (error) {
    next(error);
  }
};

export const getAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        correctAnswer: true,
        maxPoints: true,
      },
    });
    res.json({ questions });
  } catch (error) {
    next(error);
  }
};

export const resetQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    await resetUserProgress(userId);
    res.json({ success: true, message: 'Quiz progress reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const skipQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId as string;
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({ message: 'Question ID is required' });
    }

    // Move user to next question without awarding points
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentQuestionIndex: { increment: 1 },
      },
    });

    res.json({ success: true, message: 'Question skipped' });
  } catch (error) {
    next(error);
  }
};
