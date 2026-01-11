import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from "../middleware/validation.middleware";
import {
  signupSchema,
  loginSchema,
  googleLoginSchema,
  refreshTokenSchema,
} from "../middleware/validation.middleware.ts";

const router = Router();

router.post('/signup',validate(signupSchema), authController.signup);
router.post('/login',validate(loginSchema), authController.login);
router.post('/google',validate(googleLoginSchema), authController.googleLogin);
router.post('/refresh',validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getCurrentUser);

export default router;
