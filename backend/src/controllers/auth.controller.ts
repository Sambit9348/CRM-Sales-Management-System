import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';
import { sendResponse } from '../utils/apiResponse';
import { config } from '../config/env';
import { AuthenticatedRequest } from '../middlewares/auth';

const generateToken = (userId: string): string => {
  const expiresIn = (config.jwtExpiresIn || '7d') as any;
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn,
  });
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'Please provide email and password.'));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid email or password or account deactivated.'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    const token = generateToken(user._id.toString());
    const userObj: any = user.toObject();
    delete userObj.password;

    sendResponse(res, 200, 'Login successful', {
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendResponse(res, 200, 'Current user profile fetched', req.user);
  } catch (error) {
    next(error);
  }
};
