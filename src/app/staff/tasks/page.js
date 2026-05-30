'use client';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiCalendar, FiUser, FiFlag, FiMoreVertical, FiCheckCircle } from 'react-icons/fi';

const COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

const PRIORITY_COLORS = {
  urgent: 'border-l-red-500 text-red-400',
  high:   'border-l-orange-500 text-orange-400',
  medium: 'border-l-yellow-500 text-yellow-400',
  low:    'border-l-slate-500 text-slate-400',
};

const PRIORITY_DOT = { urgent: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-slate-500' };

function TaskCard({ task, onMove, onDone }) {
  const [loading, setLoading] = useState(false);

  async function markDone() {
    if (task.status === 'done') return;
    setLoading(true);
    const res = await fetch(`/api/tasks/${task._id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column: 'Done', status: 'done' }),
    });
    if (res.ok) { toast.success('+10 points!'); onDone(task._id); }
    setLoading(false);
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className={`bg-[#0d1117] border border-white/8 rounded-xl p-3.5 border-l-2 ${PRIORITY_COLORS[task.priority] || 'border-l-slate-700'} hover:border-l-2 hover:border-white/15 transition-all group`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-white text-sm font-medium leading-snug flex-1 min-w-0 line-clamp-2">{task.title}</div>
        <button onClick={markDone} disabled={loading || task.status === 'done'} className="shrink-0 text-slate-600 hover:text-emerald-400 transition-colors disabled:opacity-30 mt-0.5">
          <FiCheckCircle size={14} />
        </button>
      </div>

      {task.description && <div className="text-slate-500 text-xs mb-3 line-clamp-2">{task.description}</div>}

      <div className="flex items-center gap-2 flex-wrap">
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            <FiCalendar size={10} />{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {task.priority && (
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
            {task.priority}
          </span>
        )}
        {task.type && task.type !== 'task' && (
          <span className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] text-slate-500 uppercase">{task.type}</span>
        )}
      </div>

      {task.assigneeIds?.length > 0 && (
        <div className="flex items-center gap-1 mt-2.5">
          {task.assigneeIds.slice(0,3).map(a => (
            <div key={a._id} className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-600/20 flex items-center justify-center text-[9px] font-bold text-violet-400" title={a.name}>
              {a.avatar ?  <img src={a.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : a.name?.[0]}
            </div>
          ))}
          {task.assigneeIds.length > 3 && <span className="text-slate-500 text-[9px]">+{task.assigneeIds.length - 3}</span>}
        </div>
      )}
    </div>
  );
}

export default function StaffTasksPage() {
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [view, setView]         = useState('kanban'); // kanban | list

  async function loadTasks() {
    const qs = projectFilter ? `?projectId=${projectFilter}` : '';
    const [tRes, pRes] = await Promise.all([fetch(`/api/tasks${qs}`), fetch('/api/work-projects?limit=20')]);
    const [t, p] = await Promise.all([tRes.json(), pRes.json()]);
    setTasks(t.tasks || []);
    setProjects(p.projects || []);
    setLoading(false);
  }

  useEffect(() => { loadTasks(); }, [projectFilter]);

  function onDone(taskId) {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: 'done', column: 'Done' } : t));
  }

  const filtered = tasks.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-slate-400 text-sm mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'kanban' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}>Kanban</button>
          <button onClick={() => setView('list')}   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'list'   ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}>List</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600 w-56"
          />
        </div>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="bg-white/3 border border-white/8 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex gap-4 flex-1 overflow-x-auto">
          {COLUMNS.map(col => <div key={col} className="w-72 shrink-0 h-96 bg-white/3 rounded-xl animate-pulse" />)}
        </div>
      ) : view === 'kanban' ? (
        <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const colTasks = filtered.filter(t => t.column === col || (col === 'Backlog' && !t.column));
            return (
              <div key={col} className="w-72 shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col === 'Done' ? 'bg-emerald-500' : col === 'In Progress' ? 'bg-yellow-500' : col === 'Review' ? 'bg-purple-500' : col === 'To Do' ? 'bg-blue-500' : 'bg-slate-500'}`} />
                    <span className="text-slate-300 text-sm font-medium">{col}</span>
                    <span className="bg-white/8 text-slate-500 text-[10px] font-medium rounded-full px-1.5 py-0.5">{colTasks.length}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                  {colTasks.map(task => <TaskCard key={task._id} task={task} onDone={onDone} />)}
                  {colTasks.length === 0 && (
                    <div className="border-2 border-dashed border-white/5 rounded-xl py-8 text-center text-slate-600 text-xs">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto">
          {filtered.length === 0 ? <div className="text-center py-20 text-slate-500">No tasks found.</div> :
            filtered.map(task => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
              return (
                <div key={task._id} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:border-white/15 transition-all">
                  <button onClick={() => { if (task.status !== 'done') fetch(`/api/tasks/${task._id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'done',column:'Done'})}).then(()=>onDone(task._id)); }} className={`shrink-0 ${task.status === 'done' ? 'text-emerald-400' : 'text-slate-600 hover:text-emerald-400'} transition-colors`}>
                    <FiCheckCircle size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                      <span>{task.column}</span>
                      {task.dueDate && <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}><FiCalendar size={9} />{new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] || 'bg-slate-500'}`} title={task.priority} />
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
