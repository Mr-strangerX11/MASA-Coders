'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar, FiUsers, FiCheckCircle, FiClock, FiAlertCircle, FiList, FiFlag } from 'react-icons/fi';

function Badge({ color, children }) {
  const colors = {
    blue:   'bg-blue-500/15 text-blue-400',
    emerald:'bg-emerald-500/15 text-emerald-400',
    yellow: 'bg-yellow-500/15 text-yellow-400',
    red:    'bg-red-500/15 text-red-400',
    slate:  'bg-slate-500/15 text-slate-400',
    purple: 'bg-purple-500/15 text-purple-400',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${colors[color] || colors.slate}`}>{children}</span>;
}

const STATUS_COLOR = { active: 'emerald', planning: 'blue', on_hold: 'yellow', review: 'purple', completed: 'slate', draft: 'slate' };
const PRIORITY_COLOR = { urgent: 'red', high: 'yellow', medium: 'blue', low: 'slate' };
const TASK_STATUS_COLORS = {
  backlog:     'bg-slate-500/20 text-slate-400',
  todo:        'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-yellow-500/20 text-yellow-400',
  review:      'bg-purple-500/20 text-purple-400',
  done:        'bg-emerald-500/20 text-emerald-400',
};

export default function ClientProjectDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function load() {
      const [pRes, tRes] = await Promise.all([
        fetch(`/api/work-projects/${id}`),
        fetch(`/api/tasks?projectId=${id}`),
      ]);
      const [pData, tData] = await Promise.all([pRes.json(), tRes.json()]);
      if (!pRes.ok) { router.push('/client/projects'); return; }
      setProject(pData.project);
      setTasks(tData.tasks || []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-white/5 rounded-xl mb-4" /><div className="h-4 w-80 bg-white/5 rounded-xl" /></div>;
  if (!project) return null;

  const p = project;
  const breakdown = p.taskBreakdown || {};

  return (
    <div className="p-8">
      {/* Back */}
      <Link href="/client/projects" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <FiArrowLeft size={14} /> Back to projects
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: (p.color || '#6366f1') + '20', border: `1px solid ${(p.color || '#6366f1')}30` }}>
            <span style={{ color: p.color || '#6366f1' }} className="font-bold text-lg">{p.title[0]}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{p.title}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge color={STATUS_COLOR[p.status]}>{p.status?.replace('_', ' ')}</Badge>
              <Badge color={PRIORITY_COLOR[p.priority]}>{p.priority}</Badge>
              <span className="text-slate-500 text-xs capitalize">{p.type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium text-sm">Overall Progress</span>
          <span className="text-2xl font-bold text-white">{p.progress || 0}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/8">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${p.progress || 0}%` }} />
        </div>
        <div className="grid grid-cols-5 gap-3 mt-4">
          {Object.entries(breakdown).filter(([k]) => k !== 'total').map(([key, val]) => (
            <div key={key} className="text-center">
              <div className="text-white font-bold text-lg">{val}</div>
              <div className="text-slate-500 text-[10px] capitalize">{key.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/8 pb-0">
        {['overview', 'tasks', 'milestones', 'team'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-white border-white' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <h3 className="text-white font-medium text-sm mb-4">Project Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Start Date',   value: p.startDate   ? new Date(p.startDate).toLocaleDateString()  : '—' },
                { label: 'Deadline',     value: p.deadline    ? new Date(p.deadline).toLocaleDateString()   : '—' },
                { label: 'Budget',       value: p.budget      ? `${p.currency} ${p.budget.toLocaleString()}` : '—' },
                { label: 'Manager',      value: p.managerId   ? p.managerId.name : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
          {p.description && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h3 className="text-white font-medium text-sm mb-3">Description</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{p.description}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No tasks yet.</div>
          ) : tasks.map(task => (
            <div key={task._id} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <div className="flex-1">
                <div className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</div>
                {task.dueDate && <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><FiCalendar size={10} />{new Date(task.dueDate).toLocaleDateString()}</div>}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${TASK_STATUS_COLORS[task.status]}`}>{task.status?.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-3">
          {(!p.milestones || p.milestones.length === 0) ? (
            <div className="text-center py-12 text-slate-500">No milestones defined.</div>
          ) : p.milestones.map((m, i) => (
            <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.status === 'completed' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-white/8 text-slate-400'}`}>
                <FiCheckCircle size={14} />
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{m.title}</div>
                {m.description && <div className="text-slate-500 text-xs mt-0.5">{m.description}</div>}
              </div>
              {m.dueDate && <span className="text-slate-500 text-xs">{new Date(m.dueDate).toLocaleDateString()}</span>}
              <Badge color={m.status === 'completed' ? 'emerald' : m.status === 'in_progress' ? 'yellow' : 'slate'}>{m.status?.replace('_', ' ')}</Badge>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'team' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...(p.teamIds || []), p.managerId].filter(Boolean).map((member, i) => (
            <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {member.avatar ?  <img src={member.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : member.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-white text-sm font-medium">{member.name}</div>
                <div className="text-slate-500 text-xs">{member.jobTitle || 'Team member'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
