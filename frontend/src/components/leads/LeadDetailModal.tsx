import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Lead } from '../../types';
import { useAddNoteMutation } from '../../store/api/leadApi';
import { useGetTimelineEventsQuery } from '../../store/api/timelineApi';
import { getLeadStatusColor, getPriorityColor, formatDate, formatDateTime } from '../../utils/formatters';
import { Building2, Mail, Phone, User, Calendar, MessageSquare, History, CheckCircle2 } from 'lucide-react';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ isOpen, onClose, lead }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'timeline'>('details');
  const [newNote, setNewNote] = useState('');

  const [addNote, { isLoading: isAddingNote }] = useAddNoteMutation();
  const { data: timelineData } = useGetTimelineEventsQuery(
    { entityType: 'LEAD', entityId: lead?._id || '' },
    { skip: !lead || !isOpen }
  );

  if (!lead) return null;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await addNote({ id: lead._id, text: newNote }).unwrap();
      setNewNote('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Lead Details: ${lead.fullName}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Header Badges */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full font-semibold border ${getLeadStatusColor(lead.status)}`}>
              {lead.status}
            </span>
            <span className={`px-2.5 py-1 rounded-full font-semibold border ${getPriorityColor(lead.priority)}`}>
              {lead.priority} Priority
            </span>
            {lead.isConverted && (
              <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Converted
              </span>
            )}
          </div>
          <span className="text-slate-400">Created: {formatDate(lead.createdAt)}</span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2 font-semibold transition-colors border-b-2 ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Notes ({lead.notes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Timeline Activity
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-slate-400">
                Contact Details
              </h4>
              <div className="flex items-center space-x-2 text-slate-300">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-semibold text-white">{lead.company}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{lead.phone}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-slate-400">
                Assignment & Source
              </h4>
              <div className="flex items-center space-x-2 text-slate-300">
                <User className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Assigned to:{' '}
                  <strong className="text-white">
                    {lead.assignedTo?.name || 'Unassigned'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Source: <strong className="text-white">{lead.source}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <User className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Created by: <strong className="text-white">{lead.createdBy?.name}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type a new internal note..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote || !newNote.trim()}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {isAddingNote ? 'Adding Note...' : 'Add Note'}
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {lead.notes?.length === 0 ? (
                <div className="p-4 text-center text-slate-500 italic">No notes logged yet.</div>
              ) : (
                lead.notes?.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-indigo-400">{note.createdBy?.name || 'User'}</span>
                      <span>{formatDateTime(note.createdAt)}</span>
                    </div>
                    <p className="text-slate-200 text-xs">{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {timelineData?.data?.length === 0 ? (
              <div className="p-4 text-center text-slate-500 italic">No activity history.</div>
            ) : (
              timelineData?.data?.map((event) => (
                <div key={event._id} className="flex space-x-3 items-start p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{event.title}</span>
                      <span className="text-[10px] text-slate-500">{formatDateTime(event.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{event.description}</p>
                    <span className="text-[10px] text-indigo-400">By {event.performedBy?.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
