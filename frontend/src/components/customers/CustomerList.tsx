import React, { useState } from 'react';
import { useGetCustomersQuery, useGetCustomerByIdQuery } from '../../store/api/customerApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { formatDate } from '../../utils/formatters';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { CustomerDetailModal } from './CustomerDetailModal';
import { Building2, Search, Mail, Phone, Eye, Calendar, User } from 'lucide-react';

export const CustomerList: React.FC = () => {
  const globalSearch = useSelector((state: RootState) => state.ui.globalSearch);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const activeSearch = search || globalSearch;

  const { data, isLoading } = useGetCustomersQuery({
    page,
    limit: 10,
    search: activeSearch,
  });

  const { data: detailData } = useGetCustomerByIdQuery(selectedCustomerId!, {
    skip: !selectedCustomerId,
  });

  const customers = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Customer Accounts</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active corporate accounts converted from qualified lead pipeline.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative max-w-md text-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by company or contact name..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Customer List Table */}
      {isLoading ? (
        <LoadingSpinner label="Fetching customer directory..." />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No customers found"
          description="Customers created from qualified lead conversions will appear here."
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">Company & Account</th>
                  <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Primary Contact</th>
                  <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">Phone</th>
                  <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Assigned Representative</th>
                  <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">Converted Date</th>
                  <th className="py-3.5 px-4 text-right min-w-[100px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span
                          onClick={() => setSelectedCustomerId(cust._id)}
                          className="font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          {cust.company}
                        </span>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">{cust.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        {cust.email}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                        {cust.phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {cust.assignedTo ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {cust.assignedTo.name.charAt(0)}
                          </div>
                          <span className="whitespace-nowrap">{cust.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(cust.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomerId(cust._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        title="View Customer Details & Deals"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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

      {/* Customer Details Modal */}
      <CustomerDetailModal
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        data={detailData?.data || null}
      />
    </div>
  );
};
