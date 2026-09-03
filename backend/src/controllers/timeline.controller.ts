import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Timeline } from '../models/Timeline';
import { sendResponse } from '../utils/apiResponse';

export const getTimelineEvents = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;

    const events = await Timeline.find({ entityType: entityType.toUpperCase(), entityId })
      .populate('performedBy', 'name email role avatar')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, 'Timeline events fetched successfully', events);
  } catch (error) {
    next(error);
  }
};
