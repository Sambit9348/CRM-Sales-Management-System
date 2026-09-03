import React from 'react';
import { Modal } from '../common/Modal';
import { Deal } from '../../types';
import { formatCurrency, formatDate, getDealStageColor } from '../../utils/formatters';
import { useGetTimelineEventsQuery } from '../../store/api/timelineApi';
import { Building2, Calendar, DollarSign, User, AlertCircle, History } from 'lucide-react';

interface DealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({ isOpen, onClose, deal }) => {
  const { data: timelineData } = useGetTimelineEventsQuery(
    { entityType: 'DEAL', entityId: deal?._id || '' },
    { skip: !deal || !isOpen }
  );

  if (!deal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deal Details: ${deal.title}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Deal Header Summary */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between">
          <div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold border text-[11px] ${getDealStageColor(
                deal.stage
              )}`}
            >
              {deal.stage} Stage
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">{deal.title}</h3>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-emerald-400 block">
              {formatCurrency(deal.dealValue)}
            </span>
            <span className="text-[10px] text-slate-400">Prob: {deal.probability}%</span>
          </div>
        </div>

        {deal.lossReason && deal.stage === 'Lost' && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Loss Reason: {deal.lossReason}</span>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-400 uppercase text-[10px]">Financial Breakdown</h4>
            <div className="flex items-center space-x-2 text-slate-300">
              <DollarSign className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Deal Value: <strong className="text-white">{formatCurrency(deal.dealValue)}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <DollarSign className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Expected Revenue: <strong className="text-emerald-400">{formatCurrency(deal.expectedRevenue)}</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-400 uppercase text-[10px]">Stakeholders & Schedule</h4>
            <div className="flex items-center space-x-2 text-slate-300">
              <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Customer: <strong className="text-white">{deal.customer?.company || deal.customer?.name}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <User className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Assigned: <strong className="text-white">{deal.assignedTo?.name || 'Unassigned'}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Expected Close: <strong className="text-white">{formatDate(deal.expectedClosingDate)}</strong></span>
            </div>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
            <History className="w-4 h-4 text-indigo-400" />
            Audit History & Stage Changes
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {timelineData?.data?.length === 0 ? (
              <div className="p-4 text-center text-slate-500 italic">No timeline records logged yet.</div>
            ) : (
              timelineData?.data?.map((ev) => (
                <div key={ev._id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{ev.title}</span>
                      <span className="text-[10px] text-slate-500">{formatDate(ev.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5">{ev.description}</p>
                    <span className="text-[10px] text-indigo-400">By {ev.performedBy?.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
