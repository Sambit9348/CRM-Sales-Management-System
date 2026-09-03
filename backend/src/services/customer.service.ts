import { Customer, ICustomer } from '../models/Customer';
import { Deal } from '../models/Deal';
import { IUser } from '../models/User';
import { ApiError } from '../utils/apiError';
import { logTimelineEvent } from './timeline.service';

export interface GetCustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

export class CustomerService {
  static async getCustomers(query: GetCustomersQuery, currentUser: IUser) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (currentUser.role === 'SALES_EXECUTIVE') {
      filter.assignedTo = currentUser._id;
    } else if (query.assignedTo) {
      filter.assignedTo = query.assignedTo;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { phone: searchRegex },
      ];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortOrder };

    const total = await Customer.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const customers = await Customer.find(filter)
      .populate('assignedTo', 'name email role avatar')
      .populate('originalLead', 'firstName lastName status company source')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async getCustomerById(customerId: string, currentUser: IUser) {
    const customer = await Customer.findById(customerId)
      .populate('assignedTo', 'name email role avatar')
      .populate('originalLead')
      .populate('createdBy', 'name email');

    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    if (
      currentUser.role === 'SALES_EXECUTIVE' &&
      customer.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, 'Access denied. You can only view customers assigned to you.');
    }

    const deals = await Deal.find({ customer: customer._id }).sort({ createdAt: -1 });

    return {
      customer,
      deals,
    };
  }

  static async createCustomer(data: Partial<ICustomer>, currentUser: IUser) {
    const newCustomer = await Customer.create({
      ...data,
      assignedTo: data.assignedTo || currentUser._id,
      createdBy: currentUser._id,
    });

    await logTimelineEvent({
      entityType: 'CUSTOMER',
      entityId: newCustomer._id,
      eventType: 'CREATED',
      title: 'Customer Created',
      description: `Customer '${newCustomer.name}' from company '${newCustomer.company}' was created manually.`,
      performedBy: currentUser._id,
    });

    return Customer.findById(newCustomer._id)
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name email');
  }

  static async updateCustomer(customerId: string, data: Partial<ICustomer>, currentUser: IUser) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    if (
      currentUser.role === 'SALES_EXECUTIVE' &&
      customer.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw new ApiError(403, 'Access denied. You can only update customers assigned to you.');
    }

    Object.assign(customer, data);
    await customer.save();

    await logTimelineEvent({
      entityType: 'CUSTOMER',
      entityId: customer._id,
      eventType: 'UPDATED',
      title: 'Customer Updated',
      description: `Customer details updated.`,
      performedBy: currentUser._id,
    });

    return Customer.findById(customerId).populate('assignedTo', 'name email role avatar');
  }
}
