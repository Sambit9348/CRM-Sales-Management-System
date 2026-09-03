import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Deal, DealStage } from '../../types';
import { useCreateDealMutation, useUpdateDealMutation } from '../../store/api/dealApi';
import { useGetCustomersQuery } from '../../store/api/customerApi';
import { useGetSalesTeamQuery } from '../../store/api/userApi';
import { formatCurrency } from '../../utils/formatters';

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Deal | null;
}

export const DealFormModal: React.FC<DealFormModalProps> = ({ isOpen, onClose, deal }) => {
  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    dealValue: 50000,
    probability: 20,
    stage: 'Qualification' as DealStage,
    expectedClosingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    assignedTo: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  const [createDeal, { isLoading: isCreating }] = useCreateDealMutation();
  const [updateDeal, { isLoading: isUpdating }] = useUpdateDealMutation();
  const { data: customersData } = useGetCustomersQuery({ limit: 100 });
  const { data: teamData } = useGetSalesTeamQuery();

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        customer: deal.customer?._id || '',
        dealValue: deal.dealValue || 0,
        probability: deal.probability || 20,
        stage: deal.stage || 'Qualification',
        expectedClosingDate: deal.expectedClosingDate
          ? new Date(deal.expectedClosingDate).toISOString().split('T')[0]
          : '',
        assignedTo: deal.assignedTo?._id || '',
      });
    } else {
      setFormData({
        title: '',
        customer: '',
        dealValue: 50000,
        probability: 20,
        stage: 'Qualification',
        expectedClosingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        assignedTo: '',
      });
    }
    setErrorMsg('');
  }, [deal, isOpen]);

  const expectedRevenue = Math.round((formData.dealValue || 0) * ((formData.probability || 0) / 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (deal) {
        await updateDeal({ id: deal._id, data: formData }).unwrap();
      } else {
        await createDeal(formData).unwrap();
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to save deal');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deal ? `Edit Deal: ${deal.title}` : 'Create New Deal'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Deal Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            placeholder="e.g. Acme Corp Enterprise Expansion"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Customer Account *</label>
          <select
            required
            value={formData.customer}
            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select Customer...</option>
            {customersData?.data?.map((cust) => (
              <option key={cust._id} value={cust._id}>
                {cust.company} ({cust.name})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Deal Value (₹) *</label>
            <input
              type="number"
              min="0"
              required
              value={formData.dealValue}
              onChange={(e) => setFormData({ ...formData, dealValue: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Probability (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pipeline Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Qualification">Qualification</option>
              <option value="Discovery">Discovery</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Expected Closing Date</label>
            <input
              type="date"
              value={formData.expectedClosingDate}
              onChange={(e) => setFormData({ ...formData, expectedClosingDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Assigned Executive</label>
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Unassigned</option>
            {teamData?.data?.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Calculated Expected Revenue:</span>
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
            disabled={isCreating || isUpdating}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {isCreating || isUpdating ? 'Saving...' : deal ? 'Update Deal' : 'Create Deal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
