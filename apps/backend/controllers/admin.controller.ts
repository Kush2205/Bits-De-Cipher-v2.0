import { Request, Response, NextFunction } from 'express';
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestionById,
  createHint,
  updateHint,
  deleteHint,
  resetUserProgress,
  resetAllProgress,
} from '../services/admin.service';

export const createQuestionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, imageUrl, correctAnswer, maxPoints, hints } = req.body;

    const question = await createQuestion({
      name,
      imageUrl,
      correctAnswer,
      maxPoints,
      hints,
    });

    res.status(201).json({ 
      message: 'Question created successfully', 
      question 
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questionId = Number(req.params.id);
    const updates = req.body;

    const question = await updateQuestion(questionId, updates);

    res.json({ 
      message: 'Question updated successfully', 
      question 
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questionId = Number(req.params.id);

    await deleteQuestion(questionId);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllQuestionsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await getAllQuestions();

    res.json({ questions });
  } catch (error) {
    next(error);
  }
};

export const getQuestionByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questionId = Number(req.params.id);

    const question = await getQuestionById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ question });
  } catch (error) {
    next(error);
  }
};

export const createHintHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questionId = Number(req.params.questionId);
    const { name, hintText } = req.body;

    const hint = await createHint({ questionId, name, hintText });

    res.status(201).json({ 
      message: 'Hint created successfully', 
      hint 
    });
  } catch (error) {
    next(error);
  }
};

export const updateHintHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hintId = Number(req.params.id);
    const { name, hintText } = req.body;

    const hint = await updateHint(hintId, { name, hintText });

    res.json({ 
      message: 'Hint updated successfully', 
      hint 
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHintHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hintId = Number(req.params.id);

    await deleteHint(hintId);

    res.json({ message: 'Hint deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const resetUserProgressHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;

    await resetUserProgress(userId);

    res.json({ message: 'User progress reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const resetAllProgressHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await resetAllProgress();

    res.json({ message: 'All user progress reset successfully' });
  } catch (error) {
    next(error);
  }
};
