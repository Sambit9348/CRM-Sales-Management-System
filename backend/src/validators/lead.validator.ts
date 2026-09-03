import { body } from 'express-validator';

export const createLeadValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email address is required').trim().toLowerCase(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('source')
    .optional()
    .isIn(['Website', 'Referral', 'Social Media', 'Email', 'Phone'])
    .withMessage('Invalid lead source'),
  body('status')
    .optional()
    .isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'LOST'])
    .withMessage('Invalid lead status'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Invalid lead priority'),
];
