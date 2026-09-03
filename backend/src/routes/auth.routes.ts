import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { loginValidator } from '../validators/auth.validator';
import { validateRequest } from '../middlewares/validate';

const router = Router();

router.post('/login', loginValidator, validateRequest, login);
router.get('/me', authenticate, getMe);

export default router;
