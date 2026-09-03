import mongoose from 'mongoose';
import { Deal, IDeal, DealStage } from '../models/Deal';
import { IUser } from '../models/User';
import { ApiError } from '../utils/apiError';
import { logTimelineEvent } from './timeline.service';
import { createNotification } from './notification.service';

export interface GetDealsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  stage?: DealStage;
  assignedTo?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

const VALID_STAGES: DealStage[] = ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];

const ALLOWED_TRANSITIONS: Record<DealStage, DealStage[]> = {
  Qualification: ['Discovery', 'Lost'],
  Discovery: ['Proposal', 'Qualification', 'Lost'],
  Proposal: ['Negotiation', 'Discovery', 'Lost'],
  Negotiation: ['Won', 'Lost', 'Proposal'],
  Won: ['Negotiation', 'Proposal'], // Reopening allowed
  Lost: ['Qualification', 'Discovery', 'Proposal', 'Negotiation'], // Reopening allowed
};

export class DealService {
  static async getDeals(query: GetDealsQuery, currentUser: IUser) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (currentUser.role === 'SALES_EXECUTIVE') {
      filter.assignedTo = currentUser._id;
    } else if (query.assignedTo) {
      filter.assignedTo = query.assignedTo;
    }

    if (query.stage) filter.stage = query.stage;

    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      filter.dealValue = {};
      if (query.minAmount !== undefined) filter.dealValue.$gte = Number(query.minAmount);
      if (query.maxAmount !== undefined) filter.dealValue.$lte = Number(query.maxAmount);
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.title = searchRegex;
    }

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortOrder };

    const total = await Deal.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const deals = await Deal.find(filter)
      .populate('customer', 'name email company phone')
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return {
      deals,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async getDealById(dealId: string, currentUser: IUser) {
    const deal = await Deal.findById(dealId)
      .populate('customer')
      .populate('originalLead')
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name email');

    if (!deal) {
      throw new ApiError(404, 'Deal not found');
    }

    if (
      currentUser.role === 'SALES_EXECUTIVE' &&
      deal.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, 'Access denied. You can only view deals assigned to you.');
    }

    return deal;
  }

  static async createDeal(data: Partial<IDeal>, currentUser: IUser) {
    if (data.dealValue === undefined || data.dealValue < 0) {
      throw new ApiError(400, 'Deal value must be a non-negative number.');
    }

    if (data.probability !== undefined && (data.probability < 0 || data.probability > 100)) {
      throw new ApiError(400, 'Probability must be between 0 and 100.');
    }

    const probability = data.probability ?? 20;
    const expectedRevenue = Math.round(data.dealValue * (probability / 100) * 100) / 100;

    const newDeal = await Deal.create({
      ...data,
      probability,
      expectedRevenue,
      stage: data.stage || 'Qualification',
      assignedTo: data.assignedTo || currentUser._id,
      createdBy: currentUser._id,
    });

    await logTimelineEvent({
      entityType: 'DEAL',
      entityId: newDeal._id,
      eventType: 'CREATED',
      title: 'Deal Created',
      description: `Deal '${newDeal.title}' created with value ₹${newDeal.dealValue.toLocaleString()} at stage '${newDeal.stage}'.`,
      performedBy: currentUser._id,
    });

    return Deal.findById(newDeal._id)
      .populate('customer', 'name email company')
      .populate('assignedTo', 'name email role avatar');
  }

  static async updateDealStage(
    dealId: string,
    newStage: DealStage,
    lossReason?: string,
    currentUser?: IUser
  ) {
    const deal = await Deal.findById(dealId);
    if (!deal) {
      throw new ApiError(404, 'Deal not found');
    }

    if (
      currentUser &&
      currentUser.role === 'SALES_EXECUTIVE' &&
      deal.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, 'Access denied. You can only update deals assigned to you.');
    }

    if (!VALID_STAGES.includes(newStage)) {
      throw new ApiError(400, `Invalid stage '${newStage}'. Must be one of: ${VALID_STAGES.join(', ')}`);
    }

    const currentStage = deal.stage;

    if (currentStage === newStage) {
      return deal;
    }

    // Validate Stage Transition Policy
    const allowed = ALLOWED_TRANSITIONS[currentStage] || [];
    if (!allowed.includes(newStage)) {
      throw new ApiError(
        400,
        `Invalid stage transition from '${currentStage}' to '${newStage}'. Allowed next stages: ${allowed.join(
          ', '
        )}.`
      );
    }

    deal.stage = newStage;

    if (newStage === 'Won') {
      deal.closedAt = new Date();
      deal.probability = 100;
      deal.expectedRevenue = deal.dealValue;
    } else if (newStage === 'Lost') {
      deal.closedAt = new Date();
      deal.probability = 0;
      deal.expectedRevenue = 0;
      deal.lossReason = lossReason || 'No specific reason provided';
    } else {
      // Reopened or active pipeline stage
      deal.closedAt = undefined;
      deal.lossReason = '';
      if (newStage === 'Qualification') deal.probability = 20;
      else if (newStage === 'Discovery') deal.probability = 40;
      else if (newStage === 'Proposal') deal.probability = 60;
      else if (newStage === 'Negotiation') deal.probability = 80;

      deal.expectedRevenue = Math.round(deal.dealValue * (deal.probability / 100) * 100) / 100;
    }

    await deal.save();

    const isClosed = newStage === 'Won' || newStage === 'Lost';
    const eventType = isClosed ? 'DEAL_CLOSED' : 'DEAL_STAGE_CHANGED';
    const desc = isClosed
      ? `Deal closed as '${newStage}'${newStage === 'Lost' && lossReason ? `. Reason: ${lossReason}` : ''}.`
      : `Stage updated from '${currentStage}' to '${newStage}'.`;

    if (currentUser) {
      await logTimelineEvent({
        entityType: 'DEAL',
        entityId: deal._id,
        eventType,
        title: isClosed ? `Deal ${newStage}` : 'Deal Stage Updated',
        description: desc,
        performedBy: currentUser._id,
        metadata: { from: currentStage, to: newStage, lossReason },
      });

      if (deal.assignedTo && deal.assignedTo.toString() !== currentUser._id.toString()) {
        await createNotification({
          recipient: deal.assignedTo,
          sender: currentUser._id,
          title: `Deal Stage Updated to ${newStage}`,
          message: `Deal '${deal.title}' stage changed to ${newStage} by ${currentUser.name}.`,
          type: 'DEAL_STAGE',
          link: `/deals/${deal._id}`,
        });
      }
    }

    return Deal.findById(dealId)
      .populate('customer', 'name email company')
      .populate('assignedTo', 'name email role avatar');
  }

  static async updateDeal(dealId: string, data: Partial<IDeal>, currentUser: IUser) {
    const deal = await Deal.findById(dealId);
    if (!deal) {
      throw new ApiError(404, 'Deal not found');
    }

    if (
      currentUser.role === 'SALES_EXECUTIVE' &&
      deal.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, 'Access denied. You can only update deals assigned to you.');
    }

    // If deal is closed (Won/Lost), only Admins/Managers can alter values unless stage is being reopened
    if (
      (deal.stage === 'Won' || deal.stage === 'Lost') &&
      currentUser.role === 'SALES_EXECUTIVE' &&
      (data.dealValue !== undefined || data.probability !== undefined)
    ) {
      throw new ApiError(403, 'Cannot modify financial values of a closed deal.');
    }

    if (data.dealValue !== undefined && data.dealValue < 0) {
      throw new ApiError(400, 'Deal value cannot be negative.');
    }

    if (data.probability !== undefined && (data.probability < 0 || data.probability > 100)) {
      throw new ApiError(400, 'Probability must be between 0 and 100.');
    }

    // If stage is being updated, pass through updateDealStage validation
    if (data.stage && data.stage !== deal.stage) {
      await this.updateDealStage(dealId, data.stage, data.lossReason, currentUser);
    }

    // Apply remaining fields
    delete data.stage; // handled above if changed
    Object.assign(deal, data);

    if (data.dealValue !== undefined || data.probability !== undefined) {
      const probDecimal = (deal.probability || 0) / 100;
      deal.expectedRevenue = Math.round((deal.dealValue || 0) * probDecimal * 100) / 100;
    }

    await deal.save();

    await logTimelineEvent({
      entityType: 'DEAL',
      entityId: deal._id,
      eventType: 'UPDATED',
      title: 'Deal Updated',
      description: `Deal details updated by ${currentUser.name}.`,
      performedBy: currentUser._id,
    });

    return Deal.findById(dealId)
      .populate('customer', 'name email company')
      .populate('assignedTo', 'name email role avatar');
  }
}
