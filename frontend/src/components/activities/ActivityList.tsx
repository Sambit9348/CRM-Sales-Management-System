import React, { useState } from 'react';
import {
  useGetActivitiesQuery,
  useUpdateActivityMutation,
} from '../../store/api/activityApi';
import { ActivityStatus, ActivityType } from '../../types';
import { formatDateTime, getActivityStatusColor } from '../../utils/formatters';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from '../common/Pagination';
import { ActivityFormModal } from './ActivityFormModal';
import {
  CalendarCheck,
  Plus,
  Phone,
  Mail,
  Users,
  Video,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const ActivityList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | ''>('');

  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useGetActivitiesQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const [updateActivity] = useUpdateActivityMutation();

  const activities = data?.data || [];
  const pagination = data?.pagination;

  const handleToggleComplete = async (activityId: string, currentStatus: ActivityStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateActivity({ id: activityId, data: { status: nextStatus } }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update activity status');
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'CALL':
        return Phone;
      case 'EMAIL':
        return Mail;
      case 'MEETING':
        return Users;
      case 'DEMO':
        return Video;
      case 'REMINDER':
        return Bell;
      default:
        return CalendarCheck;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Sales Activities & Follow-ups</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track scheduled phone calls, meetings, product demos, and automated overdue alerts.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition-colors shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Schedule Activity
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | '')}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ActivityType | '')}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Activity Types</option>
            <option value="CALL">CALL</option>
            <option value="EMAIL">EMAIL</option>
            <option value="MEETING">MEETING</option>
            <option value="DEMO">DEMO</option>
            <option value="REMINDER">REMINDER</option>
          </select>
        </div>
      </div>

      {/* Activity Cards List */}
      {isLoading ? (
        <LoadingSpinner label="Fetching sales activities..." />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No activities scheduled"
          description="Keep your sales velocity high by scheduling phone calls, emails, and meetings."
          actionLabel="Schedule Activity"
          onAction={() => setIsFormOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {activities.map((act) => {
            const Icon = getActivityIcon(act.type);

            return (
              <div
                key={act._id}
                className={`p-4 rounded-2xl glass-card transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  act.status === 'OVERDUE'
                    ? 'border-rose-500/30 bg-rose-950/10'
                    : act.status === 'COMPLETED'
                    ? 'opacity-75'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                      act.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : act.status === 'OVERDUE'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-indigo-500/20 text-indigo-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-bold text-sm text-white ${
                          act.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {act.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] border ${getActivityStatusColor(
                          act.status
                        )}`}
                      >
                        {act.status}
                      </span>
                    </div>

                    {act.description && (
                      <p className="text-xs text-slate-300">{act.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        Due: {formatDateTime(act.dueDate)}
                      </span>

                      {act.relatedLead && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300">
                          Lead: {act.relatedLead.company || act.relatedLead.firstName}
                        </span>
                      )}

                      {act.relatedCustomer && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300">
                          Customer: {act.relatedCustomer.company}
                        </span>
                      )}

                      {act.relatedDeal && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300">
                          Deal: {act.relatedDeal.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 shrink-0">
                  <button
                    onClick={() => handleToggleComplete(act._id, act.status)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors ${
                      act.status === 'COMPLETED'
                        ? 'bg-slate-800 text-slate-400 hover:text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {act.status === 'COMPLETED' ? 'Mark Pending' : 'Complete'}
                  </button>
                </div>
              </div>
            );
          })}

          {pagination && (
            <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
          )}
        </div>
      )}

      <ActivityFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};
