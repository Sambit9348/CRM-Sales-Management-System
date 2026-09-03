import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { LeadService } from '../services/lead.service';
import { sendResponse } from '../utils/apiResponse';

export const getLeads = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await LeadService.getLeads(req.query, req.user!);
    sendResponse(res, 200, 'Leads fetched successfully', result.leads, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await LeadService.getLeadById(req.params.id, req.user!);
    sendResponse(res, 200, 'Lead details fetched successfully', lead);
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await LeadService.createLead(req.body, req.user!);
    sendResponse(res, 201, 'Lead created successfully', lead);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await LeadService.updateLead(req.params.id, req.body, req.user!);
    sendResponse(res, 200, 'Lead updated successfully', lead);
  } catch (error) {
    next(error);
  }
};

export const assignLead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { assignedTo, reason } = req.body;
    const lead = await LeadService.assignLead(req.params.id, assignedTo, reason, req.user!);
    sendResponse(res, 200, 'Lead assigned successfully', lead);
  } catch (error) {
    next(error);
  }
};

export const addNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { text } = req.body;
    const lead = await LeadService.addNote(req.params.id, text, req.user!);
    sendResponse(res, 200, 'Note added to lead successfully', lead);
  } catch (error) {
    next(error);
  }
};

export const convertLead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await LeadService.convertLead(req.params.id, req.body, req.user!);
    sendResponse(res, 200, 'Lead converted to Customer and Deal successfully', result);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await LeadService.deleteLead(req.params.id, req.user!);
    sendResponse(res, 200, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};
