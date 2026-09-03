import { Activity, IActivity, ActivityType, ActivityStatus } from '../models/Activity';

import { IUser } from '../models/User';
import { ApiError } from '../utils/apiError';
import { logTimelineEvent } from './timeline.service';

export interface GetActivitiesQuery {
  page?: number;
  limit?: number;
  type?: ActivityType;
  status?: ActivityStatus;
  assignedTo?: string;
  relatedLead?: string;
  relatedCustomer?: string;
  relatedDeal?: string;
}

export class ActivityService {
  static async getActivities(query: GetActivitiesQuery, currentUser: IUser) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    // Auto-update pending overdue activities
    await Activity.updateMany(
      { status: 'PENDING', dueDate: { $lt: new Date() } },
      { $set: { status: 'OVERDUE' } }
    );

    const filter: any = {};

    if (currentUser.role === 'SALES_EXECUTIVE') {
      filter.assignedTo = currentUser._id;
    } else if (query.assignedTo) {
      filter.assignedTo = query.assignedTo;
    }

    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.relatedLead) filter.relatedLead = query.relatedLead;
    if (query.relatedCustomer) filter.relatedCustomer = query.relatedCustomer;
    if (query.relatedDeal) filter.relatedDeal = query.relatedDeal;

    const total = await Activity.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const activities = await Activity.find(filter)
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name email')
      .populate('relatedLead', 'firstName lastName company email')
      .populate('relatedCustomer', 'name company email')
      .populate('relatedDeal', 'title dealValue stage')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit);

    return {
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async createActivity(data: Partial<IActivity>, currentUser: IUser) {
    if (!data.dueDate) {
      throw new ApiError(400, 'Due date is required for activity.');
    }

    const dueDate = new Date(data.dueDate);
    const isPastDue = dueDate < new Date();
    const initialStatus: ActivityStatus = data.status || (isPastDue ? 'OVERDUE' : 'PENDING');

    const activity = await Activity.create({
      ...data,
      dueDate,
      status: initialStatus,
      assignedTo: data.assignedTo || currentUser._id,
      createdBy: currentUser._id,
    });

    if (activity.relatedLead) {
      await logTimelineEvent({
        entityType: 'LEAD',
        entityId: activity.relatedLead.toString(),
        eventType: 'ACTIVITY_ADDED',
        title: `Follow-up Activity Scheduled: ${activity.title}`,
        description: `Activity type: ${activity.type}, Due: ${dueDate.toLocaleString()}`,
        performedBy: currentUser._id.toString(),
      });
    }

    if (activity.relatedCustomer) {
      await logTimelineEvent({
        entityType: 'CUSTOMER',
        entityId: activity.relatedCustomer.toString(),
        eventType: 'ACTIVITY_ADDED',
        title: `Activity Scheduled: ${activity.title}`,
        description: `Activity type: ${activity.type}, Due: ${dueDate.toLocaleString()}`,
        performedBy: currentUser._id.toString(),
      });
    }

    if (activity.relatedDeal) {
      await logTimelineEvent({
        entityType: 'DEAL',
        entityId: activity.relatedDeal.toString(),
        eventType: 'ACTIVITY_ADDED',
        title: `Activity Scheduled: ${activity.title}`,
        description: `Activity type: ${activity.type}, Due: ${dueDate.toLocaleString()}`,
        performedBy: currentUser._id.toString(),
      });
    }

    return Activity.findById(activity._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('relatedLead', 'firstName lastName company')
      .populate('relatedCustomer', 'name company')
      .populate('relatedDeal', 'title');
  }

  static async updateActivity(activityId: string, data: Partial<IActivity>, currentUser: IUser) {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new ApiError(404, 'Activity not found');
    }

    if (
      currentUser.role === 'SALES_EXECUTIVE' &&
      activity.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, 'Access denied. You can only update activities assigned to you.');
    }

    if (data.status === 'COMPLETED' && activity.status !== 'COMPLETED') {
      data.completedAt = new Date();
    }

    Object.assign(activity, data);
    await activity.save();

    if (data.status === 'COMPLETED') {
      const logEntity = activity.relatedLead
        ? { type: 'LEAD' as const, id: activity.relatedLead.toString() }
        : activity.relatedCustomer
          ? { type: 'CUSTOMER' as const, id: activity.relatedCustomer.toString() }
          : activity.relatedDeal
            ? { type: 'DEAL' as const, id: activity.relatedDeal.toString() }
            : null;

      if (logEntity) {
        await logTimelineEvent({
          entityType: logEntity.type,
          entityId: logEntity.id,
          eventType: 'ACTIVITY_COMPLETED',
          title: `Activity Completed: ${activity.title}`,
          description: `Activity ${activity.type} marked completed by ${currentUser.name}.`,
          performedBy: currentUser._id.toString(),
        });
      }
    }

    return Activity.findById(activityId)
      .populate('assignedTo', 'name email role avatar')
      .populate('relatedLead', 'firstName lastName company')
      .populate('relatedCustomer', 'name company')
      .populate('relatedDeal', 'title');
  }
}
