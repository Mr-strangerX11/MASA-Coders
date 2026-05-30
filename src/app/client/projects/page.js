'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiBriefcase, FiSearch, FiCalendar, FiUsers, FiArrowRight, FiCheckCircle, FiClock } from 'react-icons/fi';

function StatusBadge({ status }) {
  const map = {
    active:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    planning:  'bg-blue-500/15 text-blue-400 border-blue-500/20',
    on_hold:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    review:    'bg-purple-500/15 text-purple-400 border-purple-500/20',
    completed: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    draft:     'bg-slate-600/15 text-slate-500 border-slate-600/20',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${map[status] || 'bg-white/5 text-slate-400 border-white/10'}`}>{status?.replace('_', ' ')}</span>;
}

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    fetch('/api/work-projects?limit=50')
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .finally(() => setLoading(false));
  }, []);

  const statuses = ['all', 'planning', 'active', 'on_hold', 'review', 'completed'];

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || p.status === filter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-slate-400 text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/8'}`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-white/3 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <Link key={p._id} href={`/client/projects/${p._id}`} className="block bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: (p.color || '#6366f1') + '20', border: `1px solid ${(p.color || '#6366f1')}30` }}>
                    <FiBriefcase size={16} style={{ color: p.color || '#6366f1' }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm group-hover:text-white">{p.title}</h3>
                    <div className="text-slate-500 text-xs capitalize">{p.type}</div>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>

              {p.description && (
                <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">{p.description}</p>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-white font-medium">{p.progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${p.progress || 0}%` }} />
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {p.deadline && (
                  <span className="flex items-center gap-1">
                    <FiCalendar size={11} />
                    {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                {p.teamIds?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <FiUsers size={11} />
                    {p.teamIds.length} member{p.teamIds.length !== 1 ? 's' : ''}
                  </span>
                )}
                <span className="flex items-center gap-1 ml-auto">
                  <FiCheckCircle size={11} />
                  {p.doneCount || 0}/{p.taskCount || 0} tasks
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
