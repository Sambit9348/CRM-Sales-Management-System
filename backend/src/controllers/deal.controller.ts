import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { DealService } from '../services/deal.service';
import { sendResponse } from '../utils/apiResponse';

export const getDeals = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await DealService.getDeals(req.query, req.user!);
    sendResponse(res, 200, 'Deals fetched successfully', result.deals, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getDealById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deal = await DealService.getDealById(req.params.id, req.user!);
    sendResponse(res, 200, 'Deal details fetched successfully', deal);
  } catch (error) {
    next(error);
  }
};

export const createDeal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deal = await DealService.createDeal(req.body, req.user!);
    sendResponse(res, 201, 'Deal created successfully', deal);
  } catch (error) {
    next(error);
  }
};

export const updateDeal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deal = await DealService.updateDeal(req.params.id, req.body, req.user!);
    sendResponse(res, 200, 'Deal updated successfully', deal);
  } catch (error) {
    next(error);
  }
};

export const updateDealStage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stage, lossReason } = req.body;
    const deal = await DealService.updateDealStage(req.params.id, stage, lossReason, req.user!);
    sendResponse(res, 200, 'Deal stage updated successfully', deal);
  } catch (error) {
    next(error);
  }
};
