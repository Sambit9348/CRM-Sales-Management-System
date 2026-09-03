import { Router } from 'express';
import { getTimelineEvents } from '../controllers/timeline.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/:entityType/:entityId', getTimelineEvents);

export default router;
