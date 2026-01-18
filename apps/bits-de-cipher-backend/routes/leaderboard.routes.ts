import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as leaderboardController from '../controllers/leaderboard.controller';

const router = Router();

router.get('/', authenticate, leaderboardController.getLeaderboard);
router.get('/all', authenticate, leaderboardController.getAllLeaderboardUsers);

export default router;
