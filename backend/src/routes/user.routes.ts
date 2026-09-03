import { Router } from 'express';
import { getUsers, getSalesTeam, createUser, updateUser } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/role';

const router = Router();

router.use(authenticate);

router.get('/team', getSalesTeam);
router.get('/', authorize('ADMIN'), getUsers);
router.post('/', authorize('ADMIN'), createUser);
router.put('/:id', authorize('ADMIN'), updateUser);

export default router;
