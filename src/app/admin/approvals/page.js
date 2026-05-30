'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiSearch, FiPlus, FiClock, FiFilter, FiPaperclip, FiX } from 'react-icons/fi';

const TYPE_ICONS = { task:'✅', file:'📎', contract:'📄', invoice:'💰', leave:'🌴', design:'🎨', project_milestone:'🏁', expense:'💸' };
const STATUS_COLORS = {
  pending:           'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  approved:          'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  rejected:          'bg-red-500/15 text-red-400 border-red-500/20',
  revision_requested:'bg-orange-500/15 text-orange-400 border-orange-500/20',
};
const PRIORITY_COLORS = { urgent:'text-red-400', high:'text-orange-400', medium:'text-yellow-400', low:'text-slate-400' };

function ApprovalCard({ approval, onAction }) {
  const [reviewNote, setReviewNote] = useState('');
  const [showNote, setShowNote]     = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(false);

  async function act(action) {
    if ((action === 'reject' || action === 'request_revision') && !reviewNote.trim()) {
      toast.error('Please add a note explaining your decision.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/approvals/${approval._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNote }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(action === 'approve' ? 'Approved!' : action === 'reject' ? 'Rejected.' : 'Revision requested.');
      onAction(approval._id, data.approval);
      setShowNote(false); setReviewNote(''); setPendingAction(null);
    } finally { setLoading(false); }
  }

  const a = approval;
  const isPending = a.status === 'pending' || a.status === 'revision_requested';

  return (
    <div className={`bg-white/3 border rounded-2xl p-5 transition-all ${isPending ? 'border-white/10' : 'border-white/5 opacity-70'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{TYPE_ICONS[a.type] || '📋'}</span>
          <div>
            <div className="text-white font-medium text-sm">{a.title}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-slate-500 text-xs capitalize">{a.type.replace('_', ' ')}</span>
              {a.projectId && <span className="text-slate-600 text-xs">· {a.projectId.title}</span>}
              <span className={`text-xs font-medium ${PRIORITY_COLORS[a.priority]}`}>{a.priority}</span>
            </div>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${STATUS_COLORS[a.status]}`}>
          {a.status.replace('_', ' ')}
        </span>
      </div>

      {a.description && <p className="text-slate-400 text-xs mb-3 leading-relaxed">{a.description}</p>}

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
        <span className="flex items-center gap-1">
          By: <span className="text-slate-300">{a.requestedBy?.name}</span>
        </span>
        <span className="flex items-center gap-1"><FiClock size={10}/>{new Date(a.createdAt).toLocaleDateString()}</span>
        {a.dueDate && <span className={`flex items-center gap-1 ${new Date(a.dueDate) < new Date() ? 'text-red-400' : ''}`}>
          Due: {new Date(a.dueDate).toLocaleDateString()}
        </span>}
        {a.attachments?.length > 0 && <span className="flex items-center gap-1"><FiPaperclip size={10}/>{a.attachments.length} file{a.attachments.length !== 1 ? 's' : ''}</span>}
      </div>

      {a.attachments?.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {a.attachments.map((f, i) => (
            <a key={i} href={f.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300 transition-colors"
            >
              <FiPaperclip size={10}/>{f.name || `File ${i+1}`}
            </a>
          ))}
        </div>
      )}

      {a.revisions?.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2 mb-3">
          <div className="text-orange-400 text-xs font-medium mb-1">Revision requested:</div>
          <div className="text-slate-300 text-xs">{a.revisions[a.revisions.length - 1].note}</div>
        </div>
      )}

      {a.reviewNote && a.status !== 'pending' && (
        <div className="bg-white/3 border border-white/8 rounded-xl px-3 py-2 mb-3">
          <div className="text-slate-500 text-xs">Review note: <span className="text-slate-300">{a.reviewNote}</span></div>
        </div>
      )}

      {isPending && (
        <div>
          {showNote ? (
            <div className="space-y-2">
              <textarea
                value={reviewNote} onChange={e => setReviewNote(e.target.value)}
                placeholder="Add a note (required for reject / revision)..."
                rows={2}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:border-white/20 placeholder-slate-600"
              />
              <div className="flex gap-2">
                <button onClick={() => act('approve')} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-400 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <FiCheckCircle size={12}/> Approve
                </button>
                <button onClick={() => act('request_revision')} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/30 text-orange-400 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw size={12}/> Revision
                </button>
                <button onClick={() => act('reject')} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <FiXCircle size={12}/> Reject
                </button>
                <button onClick={() => { setShowNote(false); setReviewNote(''); }}
                  className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                ><FiX size={12}/></button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNote(true)}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              Review this approval
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('pending');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch]       = useState('');
  const [showNew, setShowNew]     = useState(false);
  const [projects, setProjects]   = useState([]);
  const [staff, setStaff]         = useState([]);
  const [newForm, setNewForm]     = useState({ type:'task', title:'', description:'', priority:'medium', approvers:[], dueDate:'', projectId:'' });
  const [creating, setCreating]   = useState(false);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams({ limit: '50', ...(filter && { status: filter }), ...(typeFilter && { type: typeFilter }) });
    const res = await fetch(`/api/approvals?${qs}`);
    const d   = await res.json();
    setApprovals(d.approvals || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter, typeFilter]);
  useEffect(() => {
    fetch('/api/work-projects?limit=30').then(r => r.json()).then(d => setProjects(d.projects || []));
    fetch('/api/staff-management').then(r => r.json()).then(d => setStaff(d.staff || []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onAction(id, updated) {
    setApprovals(prev => prev.map(a => a._id === id ? updated : a));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Approval request created!');
      setShowNew(false);
      setNewForm({ type:'task', title:'', description:'', priority:'medium', approvers:[], dueDate:'', projectId:'' });
      load();
    } finally { setCreating(false); }
  }

  const TYPES = ['task','file','contract','invoice','leave','design','project_milestone','expense'];
  const filtered = approvals.filter(a => !search ||
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.requestedBy?.name.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    pending:  approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
    revision_requested: approvals.filter(a => a.status === 'revision_requested').length,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Approval Workflows</h1>
          <p className="text-slate-400 text-sm mt-0.5">Review and manage all approval requests</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
          <FiPlus size={15}/> New Approval
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Object.entries(counts).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(filter === k ? '' : k)}
            className={`p-4 rounded-2xl border text-left transition-all ${filter === k ? 'border-blue-500/30 bg-blue-600/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}
          >
            <div className="text-2xl font-bold text-white">{v}</div>
            <div className="text-xs text-slate-400 mt-0.5 capitalize">{k.replace('_', ' ')}</div>
          </button>
        ))}
      </div>

      {/* New Approval Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">New Approval Request</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-white"><FiX size={18}/></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                  <select value={newForm.type} onChange={e => setNewForm(p => ({...p, type: e.target.value}))} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                  <select value={newForm.priority} onChange={e => setNewForm(p => ({...p, priority: e.target.value}))} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
                    {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title *</label>
                <input required value={newForm.title} onChange={e => setNewForm(p => ({...p, title: e.target.value}))} placeholder="What needs approval?"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea rows={2} value={newForm.description} onChange={e => setNewForm(p => ({...p, description: e.target.value}))} placeholder="Additional context..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Project</label>
                  <select value={newForm.projectId} onChange={e => setNewForm(p => ({...p, projectId: e.target.value}))} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="">No project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                  <input type="date" value={newForm.dueDate} onChange={e => setNewForm(p => ({...p, dueDate: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Assign Approvers</label>
                <div className="flex flex-wrap gap-2">
                  {staff.map(s => (
                    <button type="button" key={s._id}
                      onClick={() => setNewForm(p => ({...p, approvers: p.approvers.includes(s._id) ? p.approvers.filter(x => x !== s._id) : [...p.approvers, s._id]}))}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-colors ${newForm.approvers.includes(s._id) ? 'border-blue-500/40 bg-blue-600/15 text-blue-400' : 'border-white/10 text-slate-400 hover:border-white/20'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowNew(false)} className="flex-1 py-2 bg-white/5 text-slate-400 rounded-xl text-sm hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
                  {creating ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search approvals..."
            className="w-full bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-white/3 border border-white/8 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All types</option>
          {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
        {(filter || typeFilter) && (
          <button onClick={() => { setFilter(''); setTypeFilter(''); }} className="px-3 py-2 bg-white/5 text-slate-400 hover:text-white rounded-xl text-xs transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-white/3 rounded-2xl animate-pulse"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No approval requests found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => <ApprovalCard key={a._id} approval={a} onAction={onAction}/>)}
        </div>
      )}
    </div>
  );
}
