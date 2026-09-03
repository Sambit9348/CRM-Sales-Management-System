import React, { useState } from 'react';
import { Deal, DealStage } from '../../types';
import { useUpdateDealStageMutation } from '../../store/api/dealApi';
import { formatCurrency, getDealStageColor } from '../../utils/formatters';
import { Building2, Calendar, DollarSign, MoveRight, User, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

interface DealKanbanProps {
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
}

const STAGES: DealStage[] = [
  'Qualification',
  'Discovery',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
];

export const DealKanban: React.FC<DealKanbanProps> = ({ deals, onSelectDeal }) => {
  const [updateDealStage, { isLoading }] = useUpdateDealStageMutation();
  const [lossModalOpen, setLossModalOpen] = useState(false);
  const [targetDeal, setTargetDeal] = useState<Deal | null>(null);
  const [lossReason, setLossReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStageChange = async (deal: Deal, newStage: DealStage) => {
    if (deal.stage === newStage) return;

    if (newStage === 'Lost') {
      setTargetDeal(deal);
      setLossReason('');
      setErrorMsg('');
      setLossModalOpen(true);
      return;
    }

    try {
      await updateDealStage({ id: deal._id, stage: newStage }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || 'Invalid stage transition');
    }
  };

  const handleConfirmLoss = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDeal) return;
    setErrorMsg('');

    try {
      await updateDealStage({
        id: targetDeal._id,
        stage: 'Lost',
        lossReason,
      }).unwrap();

      setLossModalOpen(false);
      setTargetDeal(null);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to update stage');
    }
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Board Grid */}
      <div className="flex gap-4 overflow-x-auto pb-4 max-w-full">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const totalValue = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);

          return (
            <div
              key={stage}
              className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col w-[280px] sm:w-[300px] shrink-0 h-[640px]"
            >
              {/* Stage Header */}
              <div className="pb-3 border-b border-slate-800/80 mb-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{stage}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-emerald-400 mt-1">
                  {formatCurrency(totalValue)}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {stageDeals.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-800 rounded-xl text-center text-[11px] text-slate-500 italic">
                    No deals in {stage}
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal._id}
                      className="p-3.5 rounded-xl glass-card hover:border-indigo-500/50 transition-all duration-200 cursor-pointer shadow-lg space-y-2 group"
                      onClick={() => onSelectDeal(deal)}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {deal.title}
                        </h4>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate">{deal.customer?.company || deal.customer?.name}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-extrabold text-xs text-emerald-400">
                            {formatCurrency(deal.dealValue)}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                            {deal.probability}% Prob
                          </span>
                        </div>
                      </div>

                      {/* Quick Move Controls */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Move to:</span>
                        <select
                          value={deal.stage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleStageChange(deal, e.target.value as DealStage)
                          }
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 focus:outline-none focus:border-indigo-500"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loss Reason Modal */}
      <Modal
        isOpen={lossModalOpen}
        onClose={() => setLossModalOpen(false)}
        title={`Mark Deal as Lost: ${targetDeal?.title || ''}`}
      >
        <form onSubmit={handleConfirmLoss} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Loss Reason *</label>
            <textarea
              required
              rows={3}
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              placeholder="e.g. Competitor pricing lower, project postponed by client..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setLossModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !lossReason.trim()}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-white transition-colors shadow-lg shadow-rose-600/30 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Mark as Lost'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
