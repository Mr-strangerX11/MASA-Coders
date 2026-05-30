'use client';
import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FiDollarSign, FiBriefcase, FiUsers, FiCheckSquare, FiHelpCircle, FiFileText, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

const COLORS = {
  revenue:    '#10b981',
  pending:    '#6366f1',
  overdue:    '#ef4444',
  active:     '#10b981',
  planning:   '#6366f1',
  on_hold:    '#f59e0b',
  review:     '#8b5cf6',
  completed:  '#64748b',
  cancelled:  '#ef4444',
  backlog:    '#475569',
  todo:       '#6366f1',
  in_progress:'#f59e0b',
  done:       '#10b981',
  open:       '#6366f1',
  resolved:   '#10b981',
  closed:     '#64748b',
};

const PIE_PALETTE = ['#6366f1','#10b981','#f59e0b','#8b5cf6','#ef4444','#14b8a6','#f97316','#64748b'];

function StatCard({ icon: Icon, label, value, sub, color = 'bg-blue-600', trend }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="text-white" size={17}/>
      </div>
      <div className="text-2xl font-bold text-white">{value ?? '—'}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/15 rounded-xl p-3 shadow-xl">
      <p className="text-slate-400 text-xs mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('revenue')
            ? `$${p.value.toLocaleString()}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminAnalyticsPage() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('monthly');

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse mb-8"/>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_,i) => <div key={i} className="h-28 bg-white/3 rounded-2xl animate-pulse"/>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_,i) => <div key={i} className="h-72 bg-white/3 rounded-2xl animate-pulse"/>)}
        </div>
      </div>
    );
  }

  const s = data?.summary || {};
  const c = data?.charts  || {};
  const r = data?.recent  || {};

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Business intelligence & performance metrics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiDollarSign}  label="Total Revenue"    value={`$${(s.totalRevenue||0).toLocaleString()}`}     color="bg-emerald-600" sub="All paid invoices"/>
        <StatCard icon={FiDollarSign}  label="Pending Revenue"  value={`$${(s.pendingRevenue||0).toLocaleString()}`}   color="bg-blue-600"    sub="Sent + viewed"/>
        <StatCard icon={FiAlertCircle} label="Overdue Revenue"  value={`$${(s.overdueRevenue||0).toLocaleString()}`}   color={s.overdueRevenue > 0 ? 'bg-red-600' : 'bg-slate-700'} sub="Overdue invoices"/>
        <StatCard icon={FiBriefcase}   label="Active Projects"  value={s.activeProjects}     color="bg-violet-600"  sub={`${s.totalProjects} total`}/>
        <StatCard icon={FiCheckSquare} label="Tasks Completed"  value={s.tasksCompletedThisMonth} color="bg-blue-600" sub="This month"/>
        <StatCard icon={FiUsers}       label="Team Members"     value={s.staffCount}         color="bg-slate-700"   sub={`${s.clientCount} clients`}/>
        <StatCard icon={FiHelpCircle}  label="Open Tickets"     value={s.openTickets}        color={s.openTickets > 0 ? 'bg-orange-600' : 'bg-slate-700'} sub="Need attention"/>
        <StatCard icon={FiFileText}    label="Reports This Week"value={s.reportsThisWeek}    color="bg-teal-600"    sub="Daily reports"/>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue area chart */}
        <div className="lg:col-span-2 bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-5">Revenue — Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={c.revenue || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Project status pie */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-5">Project Status</h3>
          {(!c.projectStatus?.length) ? (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={c.projectStatus} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name">
                  {c.projectStatus.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name] || PIE_PALETTE[i % PIE_PALETTE.length]}/>
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }}
                  formatter={v => v.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Task completion bar — last 7 days */}
        <div className="lg:col-span-2 bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-5">Tasks Completed — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={c.taskTrend || []} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="completed" name="Tasks done" fill="#6366f1" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket status pie */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-5">Support Tickets</h3>
          {(!c.ticketStatus?.length) ? (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">No tickets yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={c.ticketStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" nameKey="name">
                  {c.ticketStatus.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name] || PIE_PALETTE[i % PIE_PALETTE.length]}/>
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }}
                  formatter={v => v.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Task status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-5">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={c.taskStatus || []} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              />
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="value" name="Tasks" radius={[0,4,4,0]}>
                {(c.taskStatus || []).map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.name] || PIE_PALETTE[i % PIE_PALETTE.length]}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Invoices by count */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-5">Invoice Count by Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={c.revenue || []} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="invoices" name="Invoices" fill="#8b5cf6" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent data tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active projects */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-4">Active Projects</h3>
          {!r.projects?.length ? <div className="text-slate-600 text-sm text-center py-6">No active projects</div> :
          <div className="space-y-3">
            {r.projects.map(p => (
              <div key={p._id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: (p.color||'#6366f1')+'20', color: p.color||'#6366f1' }}>
                  {p.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">{p.title}</div>
                  <div className="w-full h-1 rounded-full bg-white/8 mt-1">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.progress||0}%` }}/>
                  </div>
                </div>
                <span className="text-slate-500 text-xs shrink-0">{p.progress||0}%</span>
              </div>
            ))}
          </div>}
        </div>

        {/* Pending invoices */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-4">Pending Invoices</h3>
          {!r.invoices?.length ? <div className="text-slate-600 text-sm text-center py-6">No pending invoices</div> :
          <div className="space-y-2">
            {r.invoices.map(inv => {
              const isOverdue = inv.status === 'overdue';
              return (
                <div key={inv._id} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="min-w-0">
                    <div className="text-white text-xs font-medium">{inv.invoiceNumber}</div>
                    <div className="text-slate-500 text-[10px]">{inv.clientId?.name} · {inv.clientId?.company}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-white text-xs font-bold">{inv.currency} {inv.total?.toFixed(0)}</div>
                    <div className={`text-[10px] ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                      Due {new Date(inv.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                      {isOverdue && ' ⚠️'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}
        </div>
      </div>
    </div>
  );
}
