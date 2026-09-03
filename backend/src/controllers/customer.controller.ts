import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { CustomerService } from '../services/customer.service';
import { sendResponse } from '../utils/apiResponse';

export const getCustomers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await CustomerService.getCustomers(req.query, req.user!);
    sendResponse(res, 200, 'Customers fetched successfully', result.customers, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await CustomerService.getCustomerById(req.params.id, req.user!);
    sendResponse(res, 200, 'Customer details fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await CustomerService.createCustomer(req.body, req.user!);
    sendResponse(res, 201, 'Customer created successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await CustomerService.updateCustomer(req.params.id, req.body, req.user!);
    sendResponse(res, 200, 'Customer updated successfully', customer);
  } catch (error) {
    next(error);
  }
};
