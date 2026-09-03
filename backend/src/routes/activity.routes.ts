import { Router } from 'express';
import { getActivities, createActivity, updateActivity } from '../controllers/activity.controller';
import { authenticate } from '../middlewares/auth';
import { createActivityValidator } from '../validators/activity.validator';
import { validateRequest } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

router.get('/', getActivities);
router.post('/', createActivityValidator, validateRequest, createActivity);
router.put('/:id', updateActivity);

export default router;
