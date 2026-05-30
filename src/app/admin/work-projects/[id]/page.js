'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiCalendar, FiSearch } from 'react-icons/fi';

const COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
const COL_COLORS = { 'Backlog':'slate', 'To Do':'blue', 'In Progress':'yellow', 'Review':'purple', 'Done':'emerald' };
const PRIORITY_DOT = { urgent:'bg-red-500', high:'bg-orange-500', medium:'bg-yellow-500', low:'bg-slate-500' };

export default function AdminWorkProjectDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [project, setProject]   = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [staff, setStaff]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('kanban');
  const [newTask, setNewTask]   = useState({ title:'', column:'Backlog', priority:'medium', type:'task' });
  const [showTaskForm, setShowTaskForm] = useState(null); // column name
  const [editProgress, setEditProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  async function load() {
    const [pRes, tRes, sRes] = await Promise.all([
      fetch(`/api/work-projects/${id}`),
      fetch(`/api/tasks?projectId=${id}`),
      fetch('/api/staff-management'),
    ]);
    if (!pRes.ok) { router.push('/admin/work-projects'); return; }
    const [pData, tData, sData] = await Promise.all([pRes.json(), tRes.json(), sRes.json()]);
    setProject(pData.project);
    setProgress(pData.project.progress || 0);
    setTasks(tData.tasks || []);
    setStaff(sData.staff || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function createTask(col) {
    if (!newTask.title.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ projectId: id, ...newTask, column: col }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    setTasks(prev => [...prev, data.task]);
    setNewTask({ title:'', column:'Backlog', priority:'medium', type:'task' });
    setShowTaskForm(null);
    toast.success('Task created!');
  }

  async function moveTask(taskId, newColumn) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ column: newColumn }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks(prev => prev.map(t => t._id === taskId ? data.task : t));
    }
  }

  async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    if (res.ok) { setTasks(prev => prev.filter(t => t._id !== taskId)); toast.success('Task deleted.'); }
  }

  async function updateProgress() {
    const res = await fetch(`/api/work-projects/${id}`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ progress }),
    });
    if (res.ok) { toast.success('Progress updated!'); setEditProgress(false); }
  }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-white/5 rounded-xl"/></div>;
  if (!project) return null;

  const p = project;

  return (
    <div className="p-8">
      <Link href="/admin/work-projects" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <FiArrowLeft size={14}/> All Projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{background:(p.color||'#6366f1')+'20',border:`1px solid ${(p.color||'#6366f1')}30`}}>
            <span style={{color:p.color||'#6366f1'}} className="font-bold text-xl">{p.title[0]}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{p.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              {p.clientId?.name && <span>Client: {p.clientId.name}</span>}
              {p.deadline && <span>Due: {new Date(p.deadline).toLocaleDateString()}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {editProgress ? (
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="100" value={progress} onChange={e=>setProgress(+e.target.value)} className="w-32" />
              <span className="text-white text-sm w-10">{progress}%</span>
              <button onClick={updateProgress} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs">Save</button>
              <button onClick={()=>setEditProgress(false)} className="px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg text-xs">Cancel</button>
            </div>
          ) : (
            <button onClick={()=>setEditProgress(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-slate-400 hover:text-white rounded-xl text-xs transition-colors">
              <FiEdit2 size={12}/> {p.progress||0}% Progress
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/8 mb-6">
        {['kanban', 'list', 'milestones', 'team', 'details'].map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab===tab ? 'text-white border-white' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(p.columns || COLUMNS).map(col => {
            const colTasks = tasks.filter(t => (t.column === col) || (col === 'Backlog' && !t.column));
            return (
              <div key={col} className="w-72 shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${COL_COLORS[col]||'slate'}-500`} />
                    <span className="text-slate-300 text-sm font-medium">{col}</span>
                    <span className="bg-white/8 text-slate-500 text-[10px] rounded-full px-1.5 py-0.5">{colTasks.length}</span>
                  </div>
                  <button onClick={()=>setShowTaskForm(showTaskForm===col?null:col)} className="text-slate-500 hover:text-white">
                    <FiPlus size={14}/>
                  </button>
                </div>

                {showTaskForm === col && (
                  <div className="mb-2 bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                    <input value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))} placeholder="Task title..."
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none placeholder-slate-600" autoFocus
                      onKeyDown={e=>{ if(e.key==='Enter') createTask(col); if(e.key==='Escape') setShowTaskForm(null); }}
                    />
                    <div className="flex gap-1.5">
                      <select value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))} className="flex-1 bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none">
                        {['low','medium','high','urgent'].map(p=><option key={p} value={p}>{p}</option>)}
                      </select>
                      <button onClick={()=>createTask(col)} className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-medium">Add</button>
                      <button onClick={()=>setShowTaskForm(null)} className="px-2 py-1.5 bg-white/5 text-slate-400 rounded-lg text-[10px]">✕</button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 flex-1">
                  {colTasks.map(task => (
                    <div key={task._id} className="bg-[#0d1117] border border-white/8 rounded-xl p-3 hover:border-white/15 transition-all group">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-white text-xs font-medium leading-snug flex-1">{task.title}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={()=>deleteTask(task._id)} className="text-slate-600 hover:text-red-400 transition-colors"><FiTrash2 size={11}/></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]||'bg-slate-500'}`}/>
                        <span className="text-slate-600 text-[10px]">{task.priority}</span>
                        {task.dueDate && <span className="text-slate-600 text-[10px] flex items-center gap-0.5"><FiCalendar size={9}/>{new Date(task.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>}
                      </div>
                      {/* Move buttons */}
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(p.columns||COLUMNS).filter(c=>c!==col).map(c=>(
                          <button key={c} onClick={()=>moveTask(task._id,c)} title={`Move to ${c}`}
                            className="px-1.5 py-0.5 bg-white/5 hover:bg-white/15 text-slate-500 hover:text-white rounded text-[9px] transition-colors truncate max-w-[4rem]"
                          >{c}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="space-y-2">
          {tasks.length === 0 ? <div className="text-center py-12 text-slate-500">No tasks. Create one from the Kanban view.</div> :
          tasks.map(task => (
            <div key={task._id} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`}/>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${task.status==='done'?'line-through text-slate-500':'text-white'}`}>{task.title}</div>
                <div className="text-slate-500 text-xs flex items-center gap-2 mt-0.5">
                  <span className="capitalize">{task.column}</span>
                  {task.dueDate && <span className="flex items-center gap-1"><FiCalendar size={9}/>{new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
              <select value={task.column} onChange={e=>moveTask(task._id,e.target.value)} className="bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none">
                {(p.columns||COLUMNS).map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={()=>deleteTask(task._id)} className="text-slate-600 hover:text-red-400 transition-colors"><FiTrash2 size={14}/></button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <h3 className="text-white font-medium text-sm mb-4">Project Info</h3>
            {[
              { label:'Status',    value: p.status?.replace('_',' ') },
              { label:'Priority',  value: p.priority },
              { label:'Type',      value: p.type },
              { label:'Client',    value: p.clientId?.name || '—' },
              { label:'Manager',   value: p.managerId?.name || '—' },
              { label:'Start',     value: p.startDate ? new Date(p.startDate).toLocaleDateString() : '—' },
              { label:'Deadline',  value: p.deadline ? new Date(p.deadline).toLocaleDateString() : '—' },
              { label:'Budget',    value: p.budget ? `${p.currency} ${p.budget.toLocaleString()}` : '—' },
            ].map(({label,value})=>(
              <div key={label} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                <span className="text-slate-400">{label}</span>
                <span className="text-white capitalize">{value}</span>
              </div>
            ))}
          </div>
          {p.description && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h3 className="text-white font-medium text-sm mb-3">Description</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{p.description}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'team' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...(p.teamIds||[]),p.managerId].filter(Boolean).map((m,i)=>(
            <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {m.avatar?<img src={m.avatar} className="w-full h-full rounded-full object-cover" alt=""/>:m.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-white text-sm font-medium">{m.name}</div>
                <div className="text-slate-500 text-xs">{m.jobTitle||'Member'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
