import { body } from 'express-validator';

export const createDealValidator = [
  body('title').trim().notEmpty().withMessage('Deal title is required'),
  body('customer').isMongoId().withMessage('Valid customer ID is required'),
  body('dealValue').isFloat({ min: 0 }).withMessage('Deal value must be a non-negative number'),
  body('probability')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Probability must be between 0 and 100'),
  body('stage')
    .optional()
    .isIn(['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'])
    .withMessage('Invalid pipeline stage'),
];
