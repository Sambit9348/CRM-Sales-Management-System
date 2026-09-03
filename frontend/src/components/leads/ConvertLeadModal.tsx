import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Lead } from '../../types';
import { useConvertLeadMutation } from '../../store/api/leadApi';
import { formatCurrency } from '../../utils/formatters';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({ isOpen, onClose, lead }) => {
  const [dealValue, setDealValue] = useState<number>(50000);
  const [probability, setProbability] = useState<number>(30);
  const [expectedClosingDate, setExpectedClosingDate] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [errorMsg, setErrorMsg] = useState('');

  const [convertLead, { isLoading }] = useConvertLeadMutation();

  if (!lead) return null;

  const expectedRevenue = Math.round(dealValue * (probability / 100));

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await convertLead({
        id: lead._id,
        dealValue,
        probability,
        expectedClosingDate,
      }).unwrap();

      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to convert lead');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Convert Lead: ${lead.fullName}`}
    >
      <form onSubmit={handleConvert} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium">
            {errorMsg}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Conversion Target Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-slate-500 text-[11px] block">Customer Name</span>
              <span className="font-semibold text-white">{lead.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Company</span>
              <span className="font-semibold text-white">{lead.company}</span>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-indigo-300 border-t border-indigo-500/20">
            <span>Lead</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Customer Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Qualification Deal</span>
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Deal Value (₹) *</label>
          <input
            type="number"
            min="0"
            required
            value={dealValue}
            onChange={(e) => setDealValue(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Probability (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={probability}
              onChange={(e) => setProbability(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Expected Closing Date</label>
            <input
              type="date"
              required
              value={expectedClosingDate}
              onChange={(e) => setExpectedClosingDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 font-medium">Calculated Expected Revenue:</span>
          <span className="text-sm font-extrabold text-emerald-400">
            {formatCurrency(expectedRevenue)}
          </span>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || lead.isConverted}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white transition-colors shadow-lg shadow-emerald-600/30 disabled:opacity-50"
          >
            {isLoading ? 'Converting...' : 'Convert Lead Now'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
