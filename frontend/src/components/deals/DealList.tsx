import React, { useState } from 'react';
import { useGetDealsQuery } from '../../store/api/dealApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Deal, DealStage } from '../../types';
import { formatCurrency, formatDate, getDealStageColor } from '../../utils/formatters';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from '../common/Pagination';
import { DealKanban } from './DealKanban';
import { DealFormModal } from './DealFormModal';
import { DealDetailModal } from './DealDetailModal';
import {
  Plus,
  Search,
  Kanban,
  Table as TableIcon,
  TrendingUp,
  Building2,
  Eye,
  Edit2,
} from 'lucide-react';

export const DealList: React.FC = () => {
  const globalSearch = useSelector((state: RootState) => state.ui.globalSearch);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<DealStage | ''>('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const activeSearch = search || globalSearch;

  const { data, isLoading } = useGetDealsQuery({
    page: viewMode === 'table' ? page : 1,
    limit: viewMode === 'table' ? 10 : 100,
    search: activeSearch,
    stage: stageFilter || undefined,
  });

  const deals = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Deals & Sales Pipeline</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track deal stages, revenue probability, and closing timelines.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table View
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedDeal(null);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Create Deal
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals by title or company..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as DealStage | '')}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Pipeline Stages</option>
            <option value="Qualification">Qualification</option>
            <option value="Discovery">Discovery</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <LoadingSpinner label="Loading pipeline..." />
      ) : deals.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No deals found"
          description="Create a deal or convert a qualified lead to start building your pipeline."
          actionLabel="Create Deal"
          onAction={() => {
            setSelectedDeal(null);
            setIsFormOpen(true);
          }}
        />
      ) : viewMode === 'kanban' ? (
        <DealKanban
          deals={deals}
          onSelectDeal={(deal) => {
            setSelectedDeal(deal);
            setIsDetailOpen(true);
          }}
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Deal Title</th>
                  <th className="py-3.5 px-4">Customer Account</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Value</th>
                  <th className="py-3.5 px-4">Prob / Exp Revenue</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deals.map((deal) => (
                  <tr key={deal._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span
                        onClick={() => {
                          setSelectedDeal(deal);
                          setIsDetailOpen(true);
                        }}
                        className="font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {deal.title}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{deal.customer?.company || deal.customer?.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold border text-[11px] ${getDealStageColor(
                          deal.stage
                        )}`}
                      >
                        {deal.stage}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                      {formatCurrency(deal.dealValue)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>
                        <span className="font-semibold text-white">
                          {formatCurrency(deal.expectedRevenue)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({deal.probability}% probability)
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {deal.assignedTo?.name || 'Unassigned'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedDeal(deal);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDeal(deal);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="Edit Deal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
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
      <DealFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        deal={selectedDeal}
      />
      <DealDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        deal={selectedDeal}
      />
    </div>
  );
};
