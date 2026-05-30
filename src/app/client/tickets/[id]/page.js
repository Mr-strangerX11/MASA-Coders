'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSend, FiUser } from 'react-icons/fi';

function StatusBadge({ status }) {
  const map = { open:'bg-blue-500/15 text-blue-400', in_progress:'bg-yellow-500/15 text-yellow-400', resolved:'bg-emerald-500/15 text-emerald-400', closed:'bg-slate-500/15 text-slate-400' };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${map[status] || 'bg-white/5 text-slate-400'}`}>{status?.replace('_', ' ')}</span>;
}

export default function ClientTicketDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply]   = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  async function loadTicket() {
    const res = await fetch(`/api/tickets/${id}`);
    if (!res.ok) { router.push('/client/tickets'); return; }
    const data = await res.json();
    setTicket(data.ticket);
    setLoading(false);
  }

  useEffect(() => { loadTicket(); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket?.messages?.length]);

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setTicket(data.ticket);
      setReply('');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-white/5 rounded-xl" /></div>;
  if (!ticket) return null;

  const t = ticket;
  const publicMessages = t.messages?.filter(m => !m.isInternal) || [];

  return (
    <div className="p-8 h-screen flex flex-col">
      <Link href="/client/tickets" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <FiArrowLeft size={14} /> Back to tickets
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-slate-500 text-xs font-mono">{t.ticketNumber}</span>
            <StatusBadge status={t.status} />
          </div>
          <h1 className="text-xl font-bold text-white">{t.subject}</h1>
          <div className="text-slate-400 text-xs mt-1 capitalize">{t.category?.replace('_', ' ')} · {t.priority} priority</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {publicMessages.map((msg, i) => {
          const isClient = msg.senderRole === 'client';
          return (
            <div key={i} className={`flex gap-3 ${isClient ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isClient ? 'bg-emerald-600/20 text-emerald-400' : 'bg-blue-600/20 text-blue-400'}`}>
                {msg.senderId?.avatar ?  <img src={msg.senderId.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : (msg.senderId?.name?.[0]?.toUpperCase() || '?')}
              </div>
              <div className={`max-w-lg ${isClient ? 'items-end' : ''} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-500">{msg.senderId?.name || (isClient ? 'You' : 'Support')}</span>
                  <span className="text-slate-600 text-[10px]">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isClient ? 'bg-emerald-600/15 border border-emerald-600/20 text-white' : 'bg-white/5 border border-white/8 text-slate-200'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {!['resolved', 'closed'].includes(t.status) ? (
        <form onSubmit={handleReply} className="flex gap-3">
          <input
            value={reply} onChange={e => setReply(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/3 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
          />
          <button type="submit" disabled={sending || !reply.trim()} className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors">
            <FiSend size={16} />
          </button>
        </form>
      ) : (
        <div className="text-center text-slate-500 text-sm py-3 bg-white/3 rounded-xl border border-white/8">
          This ticket is {t.status}. <Link href="/client/tickets" className="text-blue-400 hover:text-blue-300">Open a new ticket</Link> if you need more help.
        </div>
      )}
    </div>
  );
}
