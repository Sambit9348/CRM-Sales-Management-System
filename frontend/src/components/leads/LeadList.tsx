import React, { useState } from 'react';
import { useGetLeadsQuery, useDeleteLeadMutation } from '../../store/api/leadApi';
import { useGetSalesTeamQuery } from '../../store/api/userApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Lead, LeadPriority, LeadSource, LeadStatus } from '../../types';
import { getLeadStatusColor, getPriorityColor, formatDate } from '../../utils/formatters';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { LeadFormModal } from './LeadFormModal';
import { AssignLeadModal } from './AssignLeadModal';
import { ConvertLeadModal } from './ConvertLeadModal';
import { LeadDetailModal } from './LeadDetailModal';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  UserPlus,
  CheckCircle2,
  Trash2,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';

export const LeadList: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const globalSearch = useSelector((state: RootState) => state.ui.globalSearch);

  // Filters State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [priority, setPriority] = useState<LeadPriority | ''>('');
  const [source, setSource] = useState<LeadSource | ''>('');
  const [assignedTo, setAssignedTo] = useState('');

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const activeSearch = search || globalSearch;

  const { data, isLoading, isFetching } = useGetLeadsQuery({
    page,
    limit: 10,
    search: activeSearch,
    status: status || undefined,
    priority: priority || undefined,
    source: source || undefined,
    assignedTo: assignedTo || undefined,
  });

  const { data: teamData } = useGetSalesTeamQuery();
  const [deleteLead] = useDeleteLeadMutation();

  const leads = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = async (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete lead '${lead.fullName}'?`)) {
      try {
        await deleteLead(lead._id).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || 'Failed to delete lead');
      }
    }
  };

  const isManagerOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SALES_MANAGER';

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Leads Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, filter, assign, and convert sales prospects across your pipeline.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedLead(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition-colors shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Lead
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Local Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus | '')}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="UNQUALIFIED">UNQUALIFIED</option>
            <option value="LOST">LOST</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as LeadPriority | '')}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          {/* Source Filter */}
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as LeadSource | '')}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
          </select>

          {/* Assigned Representative Filter */}
          {isManagerOrAdmin ? (
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Assignees</option>
              {teamData?.data?.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              Assigned to You
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading || isFetching ? (
        <LoadingSpinner label="Fetching leads..." />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="No prospects match your search criteria. Try resetting filters or add a new lead."
          actionLabel="Create Lead"
          onAction={() => {
            setSelectedLead(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">Lead / Company</th>
                  <th className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">Contact</th>
                  <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Source</th>
                  <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 min-w-[120px] whitespace-nowrap">Priority</th>
                  <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Assigned To</th>
                  <th className="py-3.5 px-4 text-right min-w-[180px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsDetailOpen(true);
                          }}
                          className="font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          {lead.fullName}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                          <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                          {lead.company}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      <div className="flex flex-col space-y-0.5">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          {lead.email}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          {lead.phone}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                      {lead.source}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold border text-[11px] ${getLeadStatusColor(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold border text-[11px] ${getPriorityColor(
                          lead.priority
                        )}`}
                      >
                        {lead.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {lead.assignedTo ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {lead.assignedTo.name.charAt(0)}
                          </div>
                          <span className="whitespace-nowrap">{lead.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {isManagerOrAdmin && (
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsAssignOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Assign / Reassign"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}

                        {!lead.isConverted ? (
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsConvertOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Convert to Customer & Deal"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                            Converted
                          </span>
                        )}

                        {isManagerOrAdmin && !lead.isConverted && (
                          <button
                            onClick={() => handleDelete(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="px-4 pb-4">
              <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <LeadFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        lead={selectedLead}
      />
      <AssignLeadModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        lead={selectedLead}
      />
      <ConvertLeadModal
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        lead={selectedLead}
      />
      <LeadDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        lead={selectedLead}
      />
    </div>
  );
};
