import React from 'react';
import { Modal } from '../common/Modal';
import { Customer, Deal } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Building2, Mail, Phone, MapPin, User, TrendingUp, Calendar } from 'lucide-react';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { customer: Customer; deals: Deal[] } | null;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!data) return null;
  const { customer, deals } = data;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customer Account: ${customer.name}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Company Header */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
              Company
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{customer.company}</h3>
          </div>
          <span className="text-slate-400 text-[11px]">
            Created: {formatDate(customer.createdAt)}
          </span>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-400 uppercase text-[10px]">Contact Info</h4>
            <div className="flex items-center space-x-2 text-slate-300">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{customer.phone}</span>
            </div>
            {customer.address && (
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-400 uppercase text-[10px]">CRM Details</h4>
            <div className="flex items-center space-x-2 text-slate-300">
              <User className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Assigned Executive: <strong className="text-white">{customer.assignedTo?.name || 'Unassigned'}</strong></span>
            </div>
            {customer.originalLead && (
              <div className="flex items-center space-x-2 text-slate-300">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Converted from Lead: <strong className="text-white">{customer.originalLead.company}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Associated Deals */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Associated Sales Deals ({deals.length})
          </h4>

          {deals.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-center italic">
              No deals associated with this customer yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {deals.map((deal) => (
                <div
                  key={deal._id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-white text-xs">{deal.title}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>Stage: <strong className="text-indigo-400">{deal.stage}</strong></span>
                      <span>•</span>
                      <span>Prob: {deal.probability}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 text-xs block">
                      {formatCurrency(deal.dealValue)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Exp Revenue: {formatCurrency(deal.expectedRevenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
