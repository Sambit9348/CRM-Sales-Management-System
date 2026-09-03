import mongoose from 'mongoose';
import { Lead, ILead, LeadStatus, LeadPriority, LeadSource } from '../models/Lead';
import { Customer } from '../models/Customer';
import { Deal } from '../models/Deal';
import { User, IUser } from '../models/User';
import { ApiError } from '../utils/apiError';
import { logTimelineEvent } from './timeline.service';
import { createNotification } from './notification.service';

export interface GetLeadsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

export class LeadService {
  static async getLeads(query: GetLeadsQuery, currentUser: IUser) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Role-based visibility
    if (currentUser.role === 'SALES_EXECUTIVE') {
      filter.assignedTo = currentUser._id;
    } else if (query.assignedTo) {
      filter.assignedTo = query.assignedTo;
    }

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.source) filter.source = query.source;

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { phone: searchRegex },
      ];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortOrder };

    const total = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return {
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async getLeadById(leadId: string, currentUser: IUser) {
    const lead = await Lead.findById(leadId)
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('notes.createdBy', 'name email');

    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }

    // Role check
    if (
      currentUser.role === 'SALES_EXECUTIVE' &&
      lead.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, 'Access denied. You can only view leads assigned to you.');
    }

    return lead;
  }

  static async createLead(data: Partial<ILead>, currentUser: IUser) {
    let assignedToId = data.assignedTo || (currentUser.role === 'SALES_EXECUTIVE' ? currentUser._id : undefined);

    const newLead = await Lead.create({
      ...data,
      assignedTo: assignedToId,
      createdBy: currentUser._id,
      updatedBy: currentUser._id,
    });

    await logTimelineEvent({
      entityType: 'LEAD',
      entityId: newLead._id,
      eventType: 'CREATED',
      title: 'Lead Created',
      description: `Lead '${newLead.firstName} ${newLead.lastName}' was created.`,
      performedBy: currentUser._id,
    });

    if (assignedToId && assignedToId.toString() !== currentUser._id.toString()) {
      await createNotification({
        recipient: assignedToId,
        sender: currentUser._id,
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${newLead.firstName} ${newLead.lastName} (${newLead.company})`,
        type: 'ASSIGNMENT',
        link: `/leads/${newLead._id}`,
      });
    }

    return Lead.findById(newLead._id).populate('assignedTo', 'name email role avatar');
  }

  static async updateLead(leadId: string, data: Partial<ILead>, currentUser: IUser) {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }

    if (
      currentUser.role === 'SALES_EXECUTIVE' &&
      lead.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, 'Access denied. You can only update leads assigned to you.');
    }

    const previousStatus = lead.status;
    const previousPriority = lead.priority;

    Object.assign(lead, data, { updatedBy: currentUser._id });
    await lead.save();

    // Timeline event for status change
    if (data.status && data.status !== previousStatus) {
      await logTimelineEvent({
        entityType: 'LEAD',
        entityId: lead._id,
        eventType: 'STATUS_CHANGED',
        title: 'Lead Status Changed',
        description: `Status changed from '${previousStatus}' to '${data.status}'.`,
        performedBy: currentUser._id,
        metadata: { from: previousStatus, to: data.status },
      });
    }

    // Timeline event for priority change
    if (data.priority && data.priority !== previousPriority) {
      await logTimelineEvent({
        entityType: 'LEAD',
        entityId: lead._id,
        eventType: 'PRIORITY_CHANGED',
        title: 'Lead Priority Changed',
        description: `Priority changed from '${previousPriority}' to '${data.priority}'.`,
        performedBy: currentUser._id,
        metadata: { from: previousPriority, to: data.priority },
      });
    }

    return Lead.findById(leadId)
      .populate('assignedTo', 'name email role avatar')
      .populate('notes.createdBy', 'name email');
  }

  static async assignLead(leadId: string, newAssigneeId: string, reason: string, currentUser: IUser) {
    if (currentUser.role === 'SALES_EXECUTIVE') {
      throw new ApiError(403, 'Sales Executives cannot assign or reassign leads.');
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }

    const newAssignee = await User.findById(newAssigneeId);
    if (!newAssignee) {
      throw new ApiError(404, 'Target assigned user not found');
    }

    const previousAssigneeId = lead.assignedTo;
    let previousAssigneeName = 'Unassigned';
    if (previousAssigneeId) {
      const prevUser = await User.findById(previousAssigneeId);
      if (prevUser) previousAssigneeName = prevUser.name;
    }

    lead.assignedTo = new mongoose.Types.ObjectId(newAssigneeId);
    lead.updatedBy = currentUser._id;
    await lead.save();

    const isReassignment = !!previousAssigneeId;
    const eventType = isReassignment ? 'REASSIGNED' : 'ASSIGNED';
    const desc = isReassignment
      ? `Reassigned from ${previousAssigneeName} to ${newAssignee.name}.${reason ? ` Reason: ${reason}` : ''}`
      : `Assigned to ${newAssignee.name}.${reason ? ` Reason: ${reason}` : ''}`;

    await logTimelineEvent({
      entityType: 'LEAD',
      entityId: lead._id,
      eventType,
      title: isReassignment ? 'Lead Reassigned' : 'Lead Assigned',
      description: desc,
      performedBy: currentUser._id,
      metadata: { previousAssigneeId, newAssigneeId, reason },
    });

    await createNotification({
      recipient: newAssigneeId,
      sender: currentUser._id,
      title: isReassignment ? 'Lead Reassigned to You' : 'Lead Assigned to You',
      message: `Lead ${lead.firstName} ${lead.lastName} (${lead.company}) was assigned to you by ${currentUser.name}.`,
      type: 'ASSIGNMENT',
      link: `/leads/${lead._id}`,
    });

    return Lead.findById(leadId).populate('assignedTo', 'name email role avatar');
  }

  static async addNote(leadId: string, text: string, currentUser: IUser) {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }

    if (
      currentUser.role === 'SALES_EXECUTIVE' &&
      lead.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, 'Access denied.');
    }

    lead.notes.push({
      text,
      createdBy: currentUser._id,
      createdAt: new Date(),
    });

    await lead.save();

    await logTimelineEvent({
      entityType: 'LEAD',
      entityId: lead._id,
      eventType: 'NOTE_ADDED',
      title: 'Note Added',
      description: `New note added: "${text.length > 50 ? text.substring(0, 50) + '...' : text}"`,
      performedBy: currentUser._id,
    });

    return Lead.findById(leadId).populate('notes.createdBy', 'name email');
  }

  static async convertLead(
    leadId: string,
    conversionData: { dealValue: number; probability?: number; expectedClosingDate?: string },
    currentUser: IUser
  ) {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }

    if (
      currentUser.role === 'SALES_EXECUTIVE' &&
      lead.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, 'Access denied. You can only convert leads assigned to you.');
    }

    // Check duplicate conversion rule
    if (lead.isConverted) {
      throw new ApiError(400, 'This lead has already been converted into a Customer and Deal.');
    }

    const customerName = `${lead.firstName} ${lead.lastName}`.trim();

    // Create Customer
    const customer = await Customer.create({
      name: customerName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      originalLead: lead._id,
      assignedTo: lead.assignedTo,
      createdBy: currentUser._id,
    });

    const probability = conversionData.probability ?? 30;
    const dealValue = conversionData.dealValue || 0;
    const expectedClosingDate = conversionData.expectedClosingDate
      ? new Date(conversionData.expectedClosingDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    // Create Deal
    const deal = await Deal.create({
      title: `${lead.company || customerName} - Initial Deal`,
      customer: customer._id,
      originalLead: lead._id,
      assignedTo: lead.assignedTo,
      dealValue,
      probability,
      expectedRevenue: Math.round(dealValue * (probability / 100) * 100) / 100,
      expectedClosingDate,
      stage: 'Qualification',
      createdBy: currentUser._id,
    });

    // Update Lead
    lead.status = 'QUALIFIED';
    lead.isConverted = true;
    lead.convertedCustomerId = customer._id;
    lead.convertedDealId = deal._id;
    lead.updatedBy = currentUser._id;
    await lead.save();

    // Create Timeline events for Lead, Customer, Deal
    await logTimelineEvent({
      entityType: 'LEAD',
      entityId: lead._id,
      eventType: 'CONVERTED',
      title: 'Lead Converted',
      description: `Lead converted to Customer '${customer.name}' and Deal '${deal.title}'.`,
      performedBy: currentUser._id,
      metadata: { customerId: customer._id, dealId: deal._id },
    });

    await logTimelineEvent({
      entityType: 'CUSTOMER',
      entityId: customer._id,
      eventType: 'CREATED',
      title: 'Customer Created via Conversion',
      description: `Customer created from Lead '${customerName}'.`,
      performedBy: currentUser._id,
      metadata: { originalLeadId: lead._id },
    });

    await logTimelineEvent({
      entityType: 'DEAL',
      entityId: deal._id,
      eventType: 'CREATED',
      title: 'Deal Created via Conversion',
      description: `Deal created with initial value ₹${dealValue.toLocaleString()} at Stage 'Qualification'.`,
      performedBy: currentUser._id,
      metadata: { customerId: customer._id, originalLeadId: lead._id },
    });

    if (lead.assignedTo && lead.assignedTo.toString() !== currentUser._id.toString()) {
      await createNotification({
        recipient: lead.assignedTo,
        sender: currentUser._id,
        title: 'Lead Converted',
        message: `Lead ${lead.firstName} ${lead.lastName} has been converted into a Customer and Deal by ${currentUser.name}.`,
        type: 'CONVERSION',
        link: `/deals/${deal._id}`,
      });
    }

    return {
      lead,
      customer,
      deal,
    };
  }

  static async deleteLead(leadId: string, currentUser: IUser) {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SALES_MANAGER') {
      throw new ApiError(403, 'Only Admins and Managers can delete leads.');
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }

    if (lead.isConverted) {
      throw new ApiError(400, 'Cannot delete a lead that has already been converted to a customer/deal.');
    }

    await lead.deleteOne();
    return true;
  }
}
