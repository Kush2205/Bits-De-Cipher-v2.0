import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as quizController from '../controllers/quiz.controller';

const router = Router();

router.get('/current', authenticate, quizController.getCurrentQuestion);
router.post('/answer', authenticate, quizController.submitAnswer);
router.post('/hint', authenticate, quizController.markHintUsed);

export default router;
