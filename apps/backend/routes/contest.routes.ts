import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as contestController from '../controllers/contest.controller';

const router = Router();

router.get('/status', authenticate, contestController.getContestStatusHandler);
router.get('/progress', authenticate, contestController.getUserProgressHandler);
router.get('/stats', authenticate, contestController.getContestStatsHandler);

export default router;
