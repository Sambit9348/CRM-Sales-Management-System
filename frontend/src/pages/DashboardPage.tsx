import React from 'react';
import { useGetDashboardQuery } from '../store/api/dashboardApi';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';
import {
  TrendingUp,
  Users,
  DollarSign,
  CalendarCheck,
  Award,
  Building2,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const DashboardPage: React.FC = () => {
  const { data, isLoading } = useGetDashboardQuery();

  if (isLoading) {
    return <LoadingSpinner label="Compiling executive sales metrics..." />;
  }

  const metrics = data?.data;
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Sales Overview</h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics, pipeline health, and team performance analytics.
        </p>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Won Revenue"
          value={formatCurrency(metrics.deals.wonRevenue)}
          subtitle={`${metrics.deals.won} Won Deals`}
          icon={DollarSign}
          iconBg="bg-emerald-500/20 text-emerald-400"
          trend="+18.4%"
        />
        <StatCard
          title="Open Pipeline Value"
          value={formatCurrency(metrics.deals.pipelineValue)}
          subtitle={`Expected: ${formatCurrency(metrics.deals.expectedRevenue)}`}
          icon={TrendingUp}
          iconBg="bg-indigo-500/20 text-indigo-400"
          trend="+12.1%"
        />
        <StatCard
          title="Lead Conversion Rate"
          value={`${metrics.leads.conversionRate}%`}
          subtitle={`${metrics.leads.converted} / ${metrics.leads.total} Leads Converted`}
          icon={Users}
          iconBg="bg-cyan-500/20 text-cyan-400"
          trend="+4.2%"
        />
        <StatCard
          title="Pending Activities"
          value={metrics.activities.pending}
          subtitle={`${metrics.activities.overdue} Overdue Alerts`}
          icon={CalendarCheck}
          iconBg="bg-amber-500/20 text-amber-400"
          isPositive={metrics.activities.overdue === 0}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Pipeline Stage Breakdown Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Pipeline Value by Stage
              </h3>
              <p className="text-[11px] text-slate-400">Total deal value in each sales stage</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.pipelineBreakdown}>
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Total Value']}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Lead Sources Distribution Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Lead Acquisition Sources
            </h3>
            <p className="text-[11px] text-slate-400">Distribution of inbound lead channels</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.leadSourcesBreakdown}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {metrics.leadSourcesBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {metrics.leadSourcesBreakdown.map((item, idx) => (
              <div key={item.source} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-300 truncate">{item.source}:</span>
                <span className="font-bold text-white ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Leaderboard Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Sales Team Performance Leaderboard
            </h3>
            <p className="text-[11px] text-slate-400">
              Individual representative conversion rates and closed revenue metrics.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 min-w-[220px] whitespace-nowrap">Sales Representative</th>
                <th className="py-3 px-3 text-center min-w-[110px] whitespace-nowrap">Assigned Leads</th>
                <th className="py-3 px-3 text-center min-w-[110px] whitespace-nowrap">Converted Leads</th>
                <th className="py-3 px-3 text-center min-w-[110px] whitespace-nowrap">Conversion %</th>
                <th className="py-3 px-3 text-center min-w-[100px] whitespace-nowrap">Won Deals</th>
                <th className="py-3 px-3 text-right min-w-[130px] whitespace-nowrap">Won Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metrics.teamPerformance.map((member) => (
                <tr key={member.userId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-md ring-2 ring-indigo-500/30 shrink-0 uppercase">
                        {member.name ? member.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-white block whitespace-nowrap">{member.name}</span>
                        <span className="text-[10px] text-slate-500 block whitespace-nowrap">{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300 font-medium whitespace-nowrap">
                    {member.assignedLeads}
                  </td>
                  <td className="py-3 px-3 text-center text-indigo-400 font-semibold whitespace-nowrap">
                    {member.convertedLeads}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                      {member.conversionRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300 font-semibold whitespace-nowrap">
                    {member.wonDealsCount}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-emerald-400 whitespace-nowrap">
                    {formatCurrency(member.wonRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
