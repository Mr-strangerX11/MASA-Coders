'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiPlay, FiSquare, FiClock, FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiDollarSign } from 'react-icons/fi';

function formatDuration(minutes) {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function Timer({ seconds }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return (
    <span className="font-mono tabular-nums">
      {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </span>
  );
}

export default function StaffTimeTrackingPage() {
  const [projects, setProjects]   = useState([]);
  const [tasks, setTasks]         = useState([]);
  const [entries, setEntries]     = useState([]);
  const [running, setRunning]     = useState(null);
  const [elapsed, setElapsed]     = useState(0);
  const [loading, setLoading]     = useState(true);
  const [starting, setStarting]   = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask]       = useState('');
  const [description, setDescription]         = useState('');
  const [isBillable, setIsBillable]           = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ projectId:'', description:'', startTime:'', endTime:'', isBillable:true });
  const timerRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [pRes, eRes, rRes] = await Promise.all([
        fetch('/api/work-projects?limit=30'),
        fetch('/api/time-entries'),
        fetch('/api/time-entries?running=true'),
      ]);
      const [pData, eData, rData] = await Promise.all([pRes.json(), eRes.json(), rRes.json()]);
      setProjects(pData.projects || []);
      setEntries(eData.entries || []);
      const runningEntry = (rData.entries || [])[0] || null;
      setRunning(runningEntry);
      if (runningEntry) {
        setElapsed(Math.floor((Date.now() - new Date(runningEntry.startTime)) / 1000));
        setSelectedProject(runningEntry.projectId?._id || runningEntry.projectId || '');
        setDescription(runningEntry.description || '');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Load tasks when project changes
  useEffect(() => {
    if (selectedProject) {
      fetch(`/api/tasks?projectId=${selectedProject}`).then(r => r.json()).then(d => setTasks(d.tasks || []));
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  // Live timer tick
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  async function handleStart() {
    if (!selectedProject) { toast.error('Select a project first.'); return; }
    setStarting(true);
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', projectId: selectedProject, taskId: selectedTask || null, description, isBillable }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setRunning(data.entry);
      setElapsed(0);
      toast.success('Timer started!');
    } finally { setStarting(false); }
  }

  async function handleStop() {
    setStarting(true);
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop', description }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setRunning(null); setElapsed(0);
      setEntries(prev => [data.entry, ...prev.filter(e => e._id !== data.entry._id)]);
      toast.success(`Logged ${formatDuration(data.entry.duration)}`);
    } finally { setStarting(false); }
  }

  async function deleteEntry(id) {
    const res = await fetch(`/api/time-entries/${id}`, { method: 'DELETE' });
    if (res.ok) { setEntries(prev => prev.filter(e => e._id !== id)); toast.success('Entry deleted.'); }
  }

  async function handleManual(e) {
    e.preventDefault();
    const res = await fetch('/api/time-entries', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'manual', ...manualForm }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    setEntries(prev => [data.entry, ...prev]);
    setShowManual(false);
    setManualForm({ projectId:'', description:'', startTime:'', endTime:'', isBillable:true });
    toast.success('Time entry logged!');
  }

  // Group entries by date
  const grouped = entries.reduce((acc, entry) => {
    const date = new Date(entry.startTime).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
    if (!acc[date]) acc[date] = { entries: [], total: 0 };
    acc[date].entries.push(entry);
    acc[date].total += entry.duration || 0;
    return acc;
  }, {});

  const todayTotal = Object.values(grouped)[0]?.total || 0;
  const weekTotal  = entries.slice(0, 50).reduce((s, e) => s + (e.duration || 0), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Time Tracking</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track billable hours across projects</p>
        </div>
        <button onClick={() => setShowManual(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm hover:bg-white/10 transition-colors">
          <FiPlus size={14}/> Manual Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Today's hours",  value: formatDuration(todayTotal), color: 'text-violet-400' },
          { label: "This week",       value: formatDuration(weekTotal),  color: 'text-blue-400' },
          { label: "Total entries",   value: entries.length,             color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Timer widget */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className={`text-4xl font-bold tabular-nums ${running ? 'text-violet-400' : 'text-white/40'}`}>
            <Timer seconds={elapsed}/>
          </div>
          {running && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
              <span className="text-red-400 text-sm font-medium">Recording</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} disabled={!!running}
            className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select project…</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>

          <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)} disabled={!!running || !selectedProject}
            className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select task (optional)…</option>
            {tasks.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
          </select>

          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What are you working on?"
            className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
          />
        </div>

        <div className="flex items-center gap-3">
          {running ? (
            <button onClick={handleStop} disabled={starting}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <FiSquare size={14}/> Stop Timer
            </button>
          ) : (
            <button onClick={handleStart} disabled={starting || !selectedProject}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <FiPlay size={14}/> Start Timer
            </button>
          )}

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div onClick={() => setIsBillable(!isBillable)}
              className={`w-9 h-5 rounded-full flex items-center transition-colors ${isBillable ? 'bg-emerald-600 justify-end' : 'bg-white/15 justify-start'} p-0.5`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow"/>
            </div>
            <span className={`text-xs font-medium ${isBillable ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isBillable ? 'Billable' : 'Non-billable'}
            </span>
          </label>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManual && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Manual Time Entry</h2>
              <button onClick={() => setShowManual(false)} className="text-slate-400 hover:text-white"><FiX size={18}/></button>
            </div>
            <form onSubmit={handleManual} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Project *</label>
                <select required value={manualForm.projectId} onChange={e => setManualForm(p => ({...p, projectId: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                >
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <input value={manualForm.description} onChange={e => setManualForm(p => ({...p, description: e.target.value}))} placeholder="What did you work on?"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none placeholder-slate-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Start Time *</label>
                  <input required type="datetime-local" value={manualForm.startTime} onChange={e => setManualForm(p => ({...p, startTime: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">End Time</label>
                  <input type="datetime-local" value={manualForm.endTime} onChange={e => setManualForm(p => ({...p, endTime: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={manualForm.isBillable} onChange={e => setManualForm(p => ({...p, isBillable: e.target.checked}))} className="rounded"/>
                <span className="text-slate-300 text-sm">Mark as billable</span>
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowManual(false)} className="flex-1 py-2.5 bg-white/5 text-slate-400 rounded-xl text-sm hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors">Log Time</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entries grouped by date */}
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/3 rounded-2xl animate-pulse"/>)}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No time entries yet. Start your first timer above.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, { entries: dayEntries, total }]) => (
            <div key={date}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">{date}</span>
                <span className="text-white text-sm font-bold">{formatDuration(total)}</span>
              </div>
              <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                {dayEntries.map((entry, i) => (
                  <div key={entry._id} className={`flex items-center gap-4 px-5 py-3.5 group hover:bg-white/5 transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${entry.isBillable ? 'bg-emerald-500' : 'bg-slate-600'}`} title={entry.isBillable ? 'Billable' : 'Non-billable'}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{entry.description || entry.taskId?.title || 'No description'}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span style={{ color: entry.projectId?.color || '#6366f1' }}>{entry.projectId?.title || '—'}</span>
                        {entry.taskId && <span className="text-slate-600">· {entry.taskId.title}</span>}
                        {entry.startTime && <span>{formatTime(entry.startTime)}{entry.endTime ? ` – ${formatTime(entry.endTime)}` : ''}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {entry.isBillable && <FiDollarSign size={12} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"/>}
                      <span className="text-white font-medium text-sm tabular-nums">{formatDuration(entry.duration)}</span>
                      <button onClick={() => deleteEntry(entry._id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                        <FiTrash2 size={13}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
