import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { 
  validate, 
  signupSchema, 
  loginSchema, 
  googleAuthSchema,
  refreshTokenSchema 
} from '../middleware/validation.middleware';

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google', validate(googleAuthSchema), authController.googleLogin);
router.get('/google/auth', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getCurrentUser);

export default router;
