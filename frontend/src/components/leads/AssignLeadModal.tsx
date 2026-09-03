import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Lead } from '../../types';
import { useAssignLeadMutation } from '../../store/api/leadApi';
import { useGetSalesTeamQuery } from '../../store/api/userApi';

interface AssignLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export const AssignLeadModal: React.FC<AssignLeadModalProps> = ({ isOpen, onClose, lead }) => {
  const [assignedTo, setAssignedTo] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [assignLead, { isLoading }] = useAssignLeadMutation();
  const { data: teamData } = useGetSalesTeamQuery();

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !assignedTo) return;
    setErrorMsg('');

    try {
      await assignLead({ id: lead._id, assignedTo, reason }).unwrap();
      setReason('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to assign lead');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign / Reassign Lead: ${lead?.fullName || ''}`}
    >
      <form onSubmit={handleAssign} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Current Assignee</label>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            {lead?.assignedTo ? `${lead.assignedTo.name} (${lead.assignedTo.role})` : 'Unassigned'}
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Select New Representative *</label>
          <select
            required
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select sales executive...</option>
            {teamData?.data?.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Reason / Reassignment Note</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Territory realignment, workload rebalancing..."
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          />
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
            disabled={isLoading || !assignedTo}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {isLoading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
