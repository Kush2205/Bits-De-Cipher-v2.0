import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as adminController from '../controllers/admin.controller';
import { 
  validate, 
  createQuestionSchema, 
  updateQuestionSchema,
  createHintSchema,
  updateHintSchema,
  idParamSchema,
  questionIdParamSchema,
} from '../middleware/validation.middleware';

const router = Router();

// All admin routes require authentication
// In production, add role-based access control middleware

// Question Management
router.get('/questions', authenticate, adminController.getAllQuestionsHandler);
router.get('/questions/:id', authenticate, validate(idParamSchema, 'params'), adminController.getQuestionByIdHandler);
router.post('/questions', authenticate, validate(createQuestionSchema), adminController.createQuestionHandler);
router.put('/questions/:id', authenticate, validate(idParamSchema, 'params'), validate(updateQuestionSchema), adminController.updateQuestionHandler);
router.delete('/questions/:id', authenticate, validate(idParamSchema, 'params'), adminController.deleteQuestionHandler);

// Hint Management
router.post('/questions/:questionId/hints', authenticate, validate(questionIdParamSchema, 'params'), validate(createHintSchema), adminController.createHintHandler);
router.put('/hints/:id', authenticate, validate(idParamSchema, 'params'), validate(updateHintSchema), adminController.updateHintHandler);
router.delete('/hints/:id', authenticate, validate(idParamSchema, 'params'), adminController.deleteHintHandler);

// Progress Management
router.post('/reset-progress/:userId', authenticate, adminController.resetUserProgressHandler);
router.post('/reset-all-progress', authenticate, adminController.resetAllProgressHandler);

export default router;
