'use client';
import { useState, useEffect } from 'react';
import LeadPipeline from '@/components/crm/LeadPipeline';
import { FiTrendingUp, FiUsers, FiDollarSign, FiLoader } from 'react-icons/fi';

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-white font-bold text-xl leading-none">{value}</p>
        <p className="text-slate-400 text-xs mt-0.5">{label}</p>
        {sub && <p className="text-slate-600 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function CRMPage() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('pipeline');

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('/api/crm/leads?limit=1');
        const data = await res.json();
        setStats({
          total:    data.pagination?.total || 0,
          won:      data.stats?.won  || 0,
          revenue:  data.stats?.revenue || 0,
        });
      } catch { /**/ }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/8 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-bold text-lg">CRM</h1>
            <p className="text-slate-500 text-xs mt-0.5">Manage your lead pipeline</p>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <FiLoader className="w-3.5 h-3.5 animate-spin" /> Loading stats…
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total Leads"   value={stats?.total ?? '—'}  icon={FiUsers}      color="bg-blue-600/20 text-blue-400"  />
            <StatCard label="Won"           value={stats?.won ?? '—'}    icon={FiTrendingUp} color="bg-green-600/20 text-green-400" />
            <StatCard label="Est. Revenue"  value={stats?.revenue ? `$${Number(stats.revenue).toLocaleString()}` : '—'} icon={FiDollarSign} color="bg-amber-600/20 text-amber-400" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {['pipeline'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${tab === t ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'pipeline' && <LeadPipeline />}
      </div>
    </div>
  );
}
