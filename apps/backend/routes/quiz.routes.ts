import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as quizController from '../controllers/quiz.controller';
import { validate, submitAnswerSchema, useHintSchema, questionIdParamSchema } from '../middleware/validation.middleware';

const router = Router();

router.get('/current-question', authenticate, quizController.getCurrentQuestion);
router.get('/my-answers', authenticate, quizController.getMyAnswers);
router.get('/total-questions', authenticate, quizController.getTotalQuestions);
router.get('/all-questions', authenticate, quizController.getAllQuestions);
router.get('/:questionId/hints', authenticate, validate(questionIdParamSchema, 'params'), quizController.getHints);
router.post('/submit-answer', authenticate, validate(submitAnswerSchema), quizController.submitAnswer);
router.post('/skip-question', authenticate, quizController.skipQuestion);
router.post('/:questionId/use-hint', authenticate, validate(questionIdParamSchema, 'params'), quizController.markHintUsed);
router.post('/reset', authenticate, quizController.resetQuiz);

export default router;
