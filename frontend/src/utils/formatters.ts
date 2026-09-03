import { DealStage, LeadPriority, LeadStatus, ActivityStatus } from '../types';

export const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getLeadStatusColor = (status: LeadStatus) => {
  switch (status) {
    case 'NEW':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'CONTACTED':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'QUALIFIED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'UNQUALIFIED':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    case 'LOST':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};

export const getPriorityColor = (priority: LeadPriority) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'LOW':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};

export const getDealStageColor = (stage: DealStage) => {
  switch (stage) {
    case 'Qualification':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'Discovery':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'Proposal':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    case 'Negotiation':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'Won':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Lost':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};

export const getActivityStatusColor = (status: ActivityStatus) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'OVERDUE':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};
