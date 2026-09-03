import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { ActivityService } from '../services/activity.service';
import { sendResponse } from '../utils/apiResponse';

export const getActivities = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await ActivityService.getActivities(req.query, req.user!);
    sendResponse(res, 200, 'Activities fetched successfully', result.activities, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activity = await ActivityService.createActivity(req.body, req.user!);
    sendResponse(res, 201, 'Activity created successfully', activity);
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activity = await ActivityService.updateActivity(req.params.id, req.body, req.user!);
    sendResponse(res, 200, 'Activity updated successfully', activity);
  } catch (error) {
    next(error);
  }
};
