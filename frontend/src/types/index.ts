export type UserRole = 'ADMIN' | 'SALES_MANAGER' | 'SALES_EXECUTIVE';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type LeadSource = 'Website' | 'Referral' | 'Social Media' | 'Email' | 'Phone';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'LOST';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface LeadNote {
  _id?: string;
  text: string;
  createdBy: User;
  createdAt: string;
}

export interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo?: User;
  notes: LeadNote[];
  isConverted: boolean;
  convertedCustomerId?: string;
  convertedDealId?: string;
  createdBy: User;
  updatedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address?: string;
  originalLead?: Lead;
  assignedTo?: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export type DealStage = 'Qualification' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
  _id: string;
  title: string;
  customer: Customer;
  originalLead?: Lead;
  assignedTo?: User;
  dealValue: number;
  probability: number;
  expectedRevenue: number;
  expectedClosingDate?: string;
  stage: DealStage;
  closedAt?: string;
  lossReason?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'DEMO' | 'REMINDER';
export type ActivityStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';

export interface Activity {
  _id: string;
  type: ActivityType;
  title: string;
  description?: string;
  relatedLead?: Lead;
  relatedCustomer?: Customer;
  relatedDeal?: Deal;
  assignedTo?: User;
  dueDate: string;
  status: ActivityStatus;
  completedAt?: string;
  createdBy: User;
  createdAt: string;
}

export interface TimelineEvent {
  _id: string;
  entityType: 'LEAD' | 'CUSTOMER' | 'DEAL';
  entityId: string;
  eventType: string;
  title: string;
  description: string;
  metadata?: any;
  performedBy: User;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  sender?: User;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'CONVERSION' | 'DEAL_STAGE' | 'ACTIVITY_DUE' | 'SYSTEM';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardMetrics {
  leads: {
    total: number;
    new: number;
    qualified: number;
    converted: number;
    lostUnqualified: number;
    conversionRate: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
  deals: {
    total: number;
    open: number;
    won: number;
    lost: number;
    pipelineValue: number;
    wonRevenue: number;
    expectedRevenue: number;
  };
  activities: {
    pending: number;
    completed: number;
    overdue: number;
  };
  pipelineBreakdown: { stage: DealStage; count: number; value: number }[];
  leadSourcesBreakdown: { source: LeadSource; count: number }[];
  teamPerformance: {
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    assignedLeads: number;
    convertedLeads: number;
    conversionRate: number;
    wonDealsCount: number;
    wonRevenue: number;
  }[];
}
