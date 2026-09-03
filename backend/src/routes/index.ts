import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import leadRoutes from './lead.routes';
import customerRoutes from './customer.routes';
import dealRoutes from './deal.routes';
import activityRoutes from './activity.routes';
import dashboardRoutes from './dashboard.routes';
import notificationRoutes from './notification.routes';
import timelineRoutes from './timeline.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/customers', customerRoutes);
router.use('/deals', dealRoutes);
router.use('/activities', activityRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/timeline', timelineRoutes);

export default router;
