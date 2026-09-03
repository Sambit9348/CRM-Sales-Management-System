import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { UserService } from '../services/user.service';
import { sendResponse } from '../utils/apiResponse';

export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await UserService.getAllUsers();
    sendResponse(res, 200, 'Users fetched successfully', users);
  } catch (error) {
    next(error);
  }
};

export const getSalesTeam = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const team = await UserService.getSalesTeam();
    sendResponse(res, 200, 'Sales team fetched successfully', team);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await UserService.createUser(req.body);
    sendResponse(res, 201, 'User created successfully', user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
    sendResponse(res, 200, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};
