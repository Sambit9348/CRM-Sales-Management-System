import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Activity, ActivityType } from '../../types';
import { useCreateActivityMutation } from '../../store/api/activityApi';
import { useGetLeadsQuery } from '../../store/api/leadApi';
import { useGetCustomersQuery } from '../../store/api/customerApi';
import { useGetDealsQuery } from '../../store/api/dealApi';
import { useGetSalesTeamQuery } from '../../store/api/userApi';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('CALL');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [relatedLead, setRelatedLead] = useState('');
  const [relatedCustomer, setRelatedCustomer] = useState('');
  const [relatedDeal, setRelatedDeal] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [createActivity, { isLoading }] = useCreateActivityMutation();
  const { data: leadsData } = useGetLeadsQuery({ limit: 50 });
  const { data: customersData } = useGetCustomersQuery({ limit: 50 });
  const { data: dealsData } = useGetDealsQuery({ limit: 50 });
  const { data: teamData } = useGetSalesTeamQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await createActivity({
        title,
        type,
        description,
        dueDate,
        relatedLead: relatedLead || undefined,
        relatedCustomer: relatedCustomer || undefined,
        relatedDeal: relatedDeal || undefined,
        assignedTo: assignedTo || undefined,
      }).unwrap();

      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to schedule activity');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Sales Activity">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Activity Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            placeholder="e.g. Technical Product Demo Call"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Activity Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="CALL">CALL</option>
              <option value="EMAIL">EMAIL</option>
              <option value="MEETING">MEETING</option>
              <option value="DEMO">DEMO</option>
              <option value="REMINDER">REMINDER</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Due Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            placeholder="Key discussion points, agenda, or link..."
          />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h4 className="font-bold text-slate-400 uppercase text-[10px]">Link Entity (Optional)</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Related Lead</label>
              <select
                value={relatedLead}
                onChange={(e) => setRelatedLead(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none"
              >
                <option value="">None</option>
                {leadsData?.data?.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.fullName} ({l.company})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Related Customer</label>
              <select
                value={relatedCustomer}
                onChange={(e) => setRelatedCustomer(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none"
              >
                <option value="">None</option>
                {customersData?.data?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Related Deal</label>
              <select
                value={relatedDeal}
                onChange={(e) => setRelatedDeal(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none"
              >
                <option value="">None</option>
                {dealsData?.data?.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Assigned Representative</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Self / Default</option>
            {teamData?.data?.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
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
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {isLoading ? 'Scheduling...' : 'Schedule Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
