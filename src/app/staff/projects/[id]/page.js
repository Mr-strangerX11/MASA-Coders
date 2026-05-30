'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';

const TASK_STATUS_COLORS = { backlog:'bg-slate-500/20 text-slate-400', todo:'bg-blue-500/20 text-blue-400', in_progress:'bg-yellow-500/20 text-yellow-400', review:'bg-purple-500/20 text-purple-400', done:'bg-emerald-500/20 text-emerald-400' };

export default function StaffProjectDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pRes, tRes] = await Promise.all([fetch(`/api/work-projects/${id}`), fetch(`/api/tasks?projectId=${id}`)]);
      if (!pRes.ok) { router.push('/staff/projects'); return; }
      const [pData, tData] = await Promise.all([pRes.json(), tRes.json()]);
      setProject(pData.project);
      setTasks(tData.tasks || []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function markTaskDone(taskId) {
    const res = await fetch(`/api/tasks/${taskId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'done',column:'Done'}) });
    if (res.ok) {
      toast.success('+10 points!');
      setTasks(prev => prev.map(t => t._id === taskId ? {...t, status:'done', column:'Done'} : t));
    }
  }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-white/5 rounded-xl"/></div>;
  if (!project) return null;

  const p = project;
  const myTasks = tasks.filter(t => t.status !== 'done');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="p-8">
      <Link href="/staff/projects" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <FiArrowLeft size={14} /> Back to projects
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{background:(p.color||'#6366f1')+'20',border:`1px solid ${(p.color||'#6366f1')}30`}}>
          <span style={{color:p.color||'#6366f1'}} className="font-bold text-xl">{p.title[0]}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{p.title}</h1>
          <p className="text-slate-400 text-sm mt-1">{p.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">Progress</span><span className="text-white font-bold">{p.progress||0}%</span></div>
          <div className="w-full h-2 rounded-full bg-white/8"><div className="h-full rounded-full bg-violet-500 transition-all" style={{width:`${p.progress||0}%`}}/></div>
        </div>
        <div className="text-right">
          <div className="text-white font-bold text-lg">{doneTasks.length}/{tasks.length}</div>
          <div className="text-slate-500 text-xs">tasks done</div>
        </div>
      </div>

      {/* Active tasks */}
      <div className="mb-6">
        <h2 className="text-white font-semibold text-sm mb-3">My Tasks ({myTasks.length})</h2>
        {myTasks.length === 0 ? <div className="text-center py-8 text-slate-500 text-sm bg-white/3 rounded-xl">No active tasks.</div> :
        <div className="space-y-2">
          {myTasks.map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
            return (
              <div key={task._id} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-4">
                <button onClick={() => markTaskDone(task._id)} className="text-slate-600 hover:text-emerald-400 transition-colors shrink-0"><FiCheckCircle size={18}/></button>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{task.title}</div>
                  {task.dueDate && <div className={`text-xs flex items-center gap-1 mt-0.5 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}><FiCalendar size={10}/>{new Date(task.dueDate).toLocaleDateString()}{isOverdue && ' ⚠️ Overdue'}</div>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${TASK_STATUS_COLORS[task.status]}`}>{task.status?.replace('_',' ')}</span>
              </div>
            );
          })}
        </div>}
      </div>

      {doneTasks.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-sm mb-3">Completed ({doneTasks.length})</h2>
          <div className="space-y-2">
            {doneTasks.map(task => (
              <div key={task._id} className="bg-white/3 border border-white/5 rounded-xl p-4 flex items-center gap-4 opacity-60">
                <FiCheckCircle size={18} className="text-emerald-500 shrink-0"/>
                <div className="text-slate-500 text-sm line-through">{task.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
