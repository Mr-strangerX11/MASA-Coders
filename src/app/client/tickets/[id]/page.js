'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSend, FiPaperclip, FiX, FiExternalLink } from 'react-icons/fi';

function StatusBadge({ status }) {
  const map = { open:'bg-blue-500/15 text-blue-400', in_progress:'bg-yellow-500/15 text-yellow-400', resolved:'bg-emerald-500/15 text-emerald-400', closed:'bg-slate-500/15 text-slate-400' };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${map[status] || 'bg-white/5 text-slate-400'}`}>{status?.replace('_', ' ')}</span>;
}

export default function ClientTicketDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [ticket, setTicket]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [reply, setReply]       = useState('');
  const [attachments, setAttachments] = useState([]); // [{url, name}]
  const [uploading, setUploading] = useState(false);
  const [sending, setSending]   = useState(false);
  const fileInputRef = useRef(null);
  const bottomRef    = useRef(null);

  async function loadTicket() {
    const res = await fetch(`/api/tickets/${id}`);
    if (!res.ok) { router.push('/client/tickets'); return; }
    const data = await res.json();
    setTicket(data.ticket);
    setLoading(false);
  }

  useEffect(() => { loadTicket(); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket?.messages?.length]);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large — max 10 MB.'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Upload failed.'); return; }
      setAttachments(prev => [...prev, { url: data.url, name: file.name }]);
      toast.success('File attached!');
    } finally { setUploading(false); e.target.value = ''; }
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim() && attachments.length === 0) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply || '(attachment)', attachments }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setTicket(data.ticket);
      setReply('');
      setAttachments([]);
    } finally { setSending(false); }
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
                {msg.senderId?.avatar
                  ? <img src={msg.senderId.avatar} className="w-full h-full rounded-full object-cover" alt=""/>
                  : (msg.senderId?.name?.[0]?.toUpperCase() || '?')}
              </div>
              <div className={`max-w-lg ${isClient ? 'items-end' : ''} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-500">{msg.senderId?.name || (isClient ? 'You' : 'Support')}</span>
                  <span className="text-slate-600 text-[10px]">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isClient ? 'bg-emerald-600/15 border border-emerald-600/20 text-white' : 'bg-white/5 border border-white/8 text-slate-200'}`}>
                  {msg.content}
                  {msg.attachments?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((a, ai) => (
                        <a key={ai} href={a.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          <FiExternalLink size={11}/>{a.name || 'Attachment'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {!['resolved', 'closed'].includes(t.status) ? (
        <form onSubmit={handleReply} className="space-y-2">
          {/* Pending attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                  <FiPaperclip size={10}/>{a.name}
                  <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}>
                    <FiX size={10} className="hover:text-white"/>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your message…"
              className="flex-1 bg-white/3 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
            />
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect}/>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              title="Attach file"
              className="px-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-xl transition-colors disabled:opacity-50"
            >
              <FiPaperclip size={16}/>
            </button>
            <button type="submit" disabled={sending || (!reply.trim() && attachments.length === 0)}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              <FiSend size={16}/>
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center text-slate-500 text-sm py-3 bg-white/3 rounded-xl border border-white/8">
          This ticket is {t.status}. <Link href="/client/tickets" className="text-blue-400 hover:text-blue-300">Open a new ticket</Link> if you need more help.
        </div>
      )}
    </div>
  );
}
