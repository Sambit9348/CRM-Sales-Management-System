import { Router } from 'express';
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  updateDealStage,
} from '../controllers/deal.controller';
import { authenticate } from '../middlewares/auth';
import { createDealValidator } from '../validators/deal.validator';
import { validateRequest } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

router.get('/', getDeals);
router.post('/', createDealValidator, validateRequest, createDeal);
router.get('/:id', getDealById);
router.put('/:id', updateDeal);
router.patch('/:id/stage', updateDealStage);

export default router;
