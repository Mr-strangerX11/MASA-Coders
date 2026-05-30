'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiBriefcase, FiFileText, FiHelpCircle, FiCheckCircle, FiClock, FiAlertCircle, FiArrowRight, FiDollarSign } from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, sub, color, href }) {
  const inner = (
    <div className={`bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="text-white" size={17} />
        </div>
        {href && <FiArrowRight size={14} className="text-slate-600 mt-1" />}
      </div>
      <div className="text-2xl font-bold text-white">{value ?? '—'}</div>
      <div className="text-xs text-slate-400 font-medium mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function StatusBadge({ status }) {
  const map = {
    active:     'bg-emerald-500/15 text-emerald-400',
    planning:   'bg-blue-500/15 text-blue-400',
    on_hold:    'bg-yellow-500/15 text-yellow-400',
    review:     'bg-purple-500/15 text-purple-400',
    completed:  'bg-slate-500/15 text-slate-400',
    draft:      'bg-slate-500/15 text-slate-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${map[status] || 'bg-white/5 text-slate-400'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export default function ClientDashboardPage() {
  const [user, setUser]         = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [uRes, pRes, iRes, tRes] = await Promise.all([
          fetch('/api/client/auth'),
          fetch('/api/work-projects?limit=5'),
          fetch('/api/invoices?limit=5'),
          fetch('/api/tickets?limit=5'),
        ]);
        const [uData, pData, iData, tData] = await Promise.all([uRes.json(), pRes.json(), iRes.json(), tRes.json()]);
        setUser(uData.user);
        setProjects(pData.projects || []);
        setInvoices(iData.invoices || []);
        setTickets(tData.tickets || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/3 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const activeProjects  = projects.filter(p => p.status === 'active').length;
  const unpaidInvoices  = invoices.filter(i => ['sent', 'viewed', 'overdue'].includes(i.status)).length;
  const openTickets     = tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length;
  const doneProjects    = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Here&apos;s what&apos;s happening with your projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiBriefcase}    label="Active Projects"  value={activeProjects}  color="bg-blue-600"    href="/client/projects" />
        <StatCard icon={FiCheckCircle}  label="Completed"        value={doneProjects}    color="bg-emerald-600" sub="All time" />
        <StatCard icon={FiFileText}     label="Unpaid Invoices"  value={unpaidInvoices}  color={unpaidInvoices > 0 ? 'bg-orange-600' : 'bg-slate-700'} href="/client/invoices" />
        <StatCard icon={FiHelpCircle}   label="Open Tickets"     value={openTickets}     color={openTickets > 0 ? 'bg-purple-600' : 'bg-slate-700'}   href="/client/tickets" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-sm">Your Projects</h2>
            <Link href="/client/projects" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">View all <FiArrowRight size={12} /></Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No projects yet.</div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0,4).map(p => (
                <Link key={p._id} href={`/client/projects/${p._id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + '20', borderColor: p.color + '30', border: '1px solid' }}>
                    <FiBriefcase size={14} style={{ color: p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{p.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-20 h-1 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.progress || 0}%` }} />
                      </div>
                      <span className="text-slate-500 text-[10px]">{p.progress || 0}%</span>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-sm">Recent Invoices</h2>
            <Link href="/client/invoices" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">View all <FiArrowRight size={12} /></Link>
          </div>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No invoices yet.</div>
          ) : (
            <div className="space-y-3">
              {invoices.slice(0,4).map(inv => (
                <Link key={inv._id} href={`/client/invoices/${inv._id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-600/20 flex items-center justify-center shrink-0">
                    <FiFileText size={14} className="text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium">{inv.invoiceNumber}</div>
                    <div className="text-slate-500 text-xs">{inv.currency} {inv.total?.toFixed(2)}</div>
                  </div>
                  <InvoiceStatusBadge status={inv.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function InvoiceStatusBadge({ status }) {
  const map = {
    draft:    'bg-slate-500/15 text-slate-400',
    sent:     'bg-blue-500/15 text-blue-400',
    viewed:   'bg-purple-500/15 text-purple-400',
    paid:     'bg-emerald-500/15 text-emerald-400',
    overdue:  'bg-red-500/15 text-red-400',
    cancelled:'bg-slate-500/15 text-slate-500',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${map[status] || 'bg-white/5 text-slate-400'}`}>{status}</span>;
}
