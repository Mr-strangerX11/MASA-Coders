'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSend, FiLock, FiZap } from 'react-icons/fi';

const STATUS_COLORS = { open:'bg-blue-500/15 text-blue-400', in_progress:'bg-yellow-500/15 text-yellow-400', resolved:'bg-emerald-500/15 text-emerald-400', closed:'bg-slate-500/15 text-slate-400' };
const STATUSES = ['open','in_progress','waiting_client','resolved','closed'];

export default function AdminTicketDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [ticket, setTicket]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply]     = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [staff, setStaff]       = useState([]);
  const bottomRef = useRef(null);

  async function loadTicket() {
    const res = await fetch(`/api/tickets/${id}`);
    if (!res.ok) { router.push('/admin/tickets'); return; }
    const data = await res.json();
    setTicket(data.ticket);
    setLoading(false);
  }

  useEffect(() => { loadTicket(); }, [id]);
  useEffect(() => { fetch('/api/staff-management').then(r=>r.json()).then(d=>setStaff(d.staff||[])); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [ticket?.messages?.length]);

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message: reply, isInternal }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setTicket(data.ticket); setReply(''); setIsInternal(false);
    } finally { setSending(false); }
  }

  async function updateField(patch) {
    const res = await fetch(`/api/tickets/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(patch) });
    const data = await res.json();
    if (res.ok) { setTicket(data.ticket); toast.success('Updated!'); }
  }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-white/5 rounded-xl"/></div>;
  if (!ticket) return null;

  const t = ticket;

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/tickets" className="text-slate-400 hover:text-white transition-colors"><FiArrowLeft size={16}/></Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs font-mono">{t.ticketNumber}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${STATUS_COLORS[t.status]||'bg-white/5 text-slate-400'}`}>{t.status?.replace('_',' ')}</span>
            </div>
            <h1 className="text-lg font-bold text-white mt-0.5">{t.subject}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={t.status} onChange={e=>updateField({status:e.target.value})}
            className="bg-white/5 border border-white/10 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
          >
            {STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
          </select>
          <select value={t.assignedTo?._id||''} onChange={e=>updateField({assignedTo:e.target.value||null})}
            className="bg-white/5 border border-white/10 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
          >
            <option value="">Unassigned</option>
            {staff.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {(t.messages||[]).map((msg,i)=>{
          const isAdmin = ['admin','manager','editor'].includes(msg.senderRole);
          return (
            <div key={i} className={`flex gap-3 ${isAdmin?'flex-row-reverse':''} ${msg.isInternal?'opacity-70':''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isAdmin?'bg-blue-600/20 text-blue-400':'bg-emerald-600/20 text-emerald-400'}`}>
                {msg.senderId?.name?.[0]?.toUpperCase()||'?'}
              </div>
              <div className={`max-w-lg ${isAdmin?'items-end':''} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-500">{msg.senderId?.name||'Unknown'}</span>
                  {msg.isInternal && <span className="flex items-center gap-0.5 text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded"><FiLock size={8}/>Internal</span>}
                  <span className="text-slate-600 text-[10px]">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm ${isAdmin?'bg-blue-600/15 border border-blue-600/20 text-white':'bg-white/5 border border-white/8 text-slate-200'} ${msg.isInternal?'border-dashed':''}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Reply */}
      {!['closed'].includes(t.status) && (
        <form onSubmit={handleReply} className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <button type="button" onClick={()=>setIsInternal(!isInternal)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors ${isInternal?'bg-orange-500/15 text-orange-400 border border-orange-500/20':'bg-white/5 text-slate-400 hover:text-white'}`}
            >
              <FiLock size={11}/> {isInternal?'Internal note':'Reply to client'}
            </button>
            {/* AI Reply suggestion */}
            <button type="button" disabled={aiLoading}
              onClick={async () => {
                const msgs = t.messages || [];
                const last = msgs.filter(m => !m.isInternal).slice(-1)[0];
                if (!last) { toast.error('No client message to reply to.'); return; }
                setAiLoading(true);
                try {
                  const res  = await fetch('/api/ai/reply', { method:'POST', headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ ticketTitle: t.subject, lastMessage: last.content, clientName: t.clientId?.name }) });
                  const data = await res.json();
                  if (!res.ok) { toast.error(data.error); return; }
                  setReply(data.reply);
                  toast.success('AI reply drafted!');
                } finally { setAiLoading(false); }
              }}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
            >
              <FiZap size={11}/> {aiLoading ? 'Drafting…' : 'AI Draft'}
            </button>
          </div>
          <div className="flex gap-3">
            <textarea rows={2} value={reply} onChange={e=>setReply(e.target.value)} placeholder={isInternal?'Add an internal note (client cannot see this)...':'Type your reply to the client...'}
              className={`flex-1 bg-white/3 border text-white rounded-xl px-4 py-3 text-sm focus:outline-none resize-none placeholder-slate-600 ${isInternal?'border-orange-500/20 focus:border-orange-500/40':'border-white/10 focus:border-white/20'}`}
            />
            <button type="submit" disabled={sending||!reply.trim()} className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors self-end">
              <FiSend size={16}/>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
