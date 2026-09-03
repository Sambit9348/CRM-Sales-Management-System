import { body } from 'express-validator';

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email address is required').trim().toLowerCase(),
  body('password').notEmpty().withMessage('Password is required'),
];
