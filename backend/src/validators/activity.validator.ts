import { body } from 'express-validator';

export const createActivityValidator = [
  body('title').trim().notEmpty().withMessage('Activity title is required'),
  body('type')
    .isIn(['CALL', 'EMAIL', 'MEETING', 'DEMO', 'REMINDER'])
    .withMessage('Valid activity type is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
];
