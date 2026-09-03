import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { DashboardService } from '../services/dashboard.service';
import { sendResponse } from '../utils/apiResponse';

export const getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await DashboardService.getDashboardMetrics(req.user!);
    sendResponse(res, 200, 'Dashboard metrics fetched successfully', data);
  } catch (error) {
    next(error);
  }
};
