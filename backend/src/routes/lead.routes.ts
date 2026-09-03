import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  assignLead,
  addNote,
  convertLead,
  deleteLead,
} from '../controllers/lead.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/role';
import { createLeadValidator } from '../validators/lead.validator';
import { validateRequest } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

router.get('/', getLeads);
router.post('/', createLeadValidator, validateRequest, createLead);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.post('/:id/assign', authorize('ADMIN', 'SALES_MANAGER'), assignLead);
router.post('/:id/notes', addNote);
router.post('/:id/convert', convertLead);
router.delete('/:id', authorize('ADMIN', 'SALES_MANAGER'), deleteLead);

export default router;
