'use client';
import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import PlatformIcon from './PlatformIcon';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

const INTENT_COLORS = {
  sales:   'text-green-400',
  support: 'text-blue-400',
  inquiry: 'text-amber-400',
  spam:    'text-red-400',
};

const SENTIMENT_DOTS = {
  positive: 'bg-green-400',
  neutral:  'bg-slate-400',
  negative: 'bg-red-400',
};

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function ConversationList({ selectedId, onSelect }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [platform, setPlatform]   = useState('');
  const [status, setStatus]       = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { socket }                = useSocket();

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search)   params.set('search',   search);
    if (platform) params.set('platform', platform);
    if (status)   params.set('status',   status);
    const res  = await fetch(`/api/inbox?${params}`);
    const data = await res.json();
    setConversations(data.conversations || []);
    setLoading(false);
  }, [search, platform, status]);

  useEffect(() => { load(); }, [load]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on('new_message',  refresh);
    socket.on('conv_updated', refresh);
    return () => { socket.off('new_message', refresh); socket.off('conv_updated', refresh); };
  }, [socket, load]);

  const filtered = unreadOnly ? conversations.filter((c) => c.unread_count > 0) : conversations;

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-white/8 space-y-2">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts…"
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs focus:outline-none focus:border-blue-500">
            <option value="">All channels</option>
            {['whatsapp','messenger','instagram','email','livechat'].map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs focus:outline-none focus:border-blue-500">
            <option value="">All status</option>
            {['new','active','waiting','resolved','closed'].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
            ))}
          </select>
          <button onClick={() => setUnreadOnly((v) => !v)}
            className={cn('px-2 py-1.5 rounded-lg text-xs border transition-colors',
              unreadOnly ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-slate-500')}>
            Unread
          </button>
          <button onClick={load} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-colors">
            <FiRefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3 border-b border-white/5 animate-pulse">
              <div className="flex gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <div className="h-2.5 bg-white/10 rounded w-2/3" />
                  <div className="h-2 bg-white/5 rounded w-full" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <FiFilter className="w-8 h-8 mb-2" />
            <p className="text-sm">No conversations</p>
          </div>
        ) : filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              'w-full text-left p-3 border-b border-white/5 hover:bg-white/4 transition-colors relative',
              selectedId === conv.id && 'bg-blue-600/10 border-l-2 border-l-blue-500'
            )}
          >
            <div className="flex items-start gap-2.5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {(conv.contact_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5">
                  <PlatformIcon platform={conv.platform} size="sm" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={cn('text-xs font-semibold truncate', conv.unread_count > 0 ? 'text-white' : 'text-slate-300')}>
                    {conv.contact_name || 'Unknown'}
                  </span>
                  <span className="text-[10px] text-slate-600 shrink-0">{timeAgo(conv.last_message_at)}</span>
                </div>
                <p className={cn('text-[11px] truncate', conv.unread_count > 0 ? 'text-slate-300' : 'text-slate-500')}>
                  {conv.last_message_preview || '—'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {conv.intent && (
                    <span className={cn('text-[10px] font-medium capitalize', INTENT_COLORS[conv.intent] || 'text-slate-500')}>
                      {conv.intent}
                    </span>
                  )}
                  {conv.sentiment && (
                    <span className={cn('w-1.5 h-1.5 rounded-full', SENTIMENT_DOTS[conv.sentiment] || 'bg-slate-500')} />
                  )}
                </div>
              </div>

              {/* Unread badge */}
              {conv.unread_count > 0 && (
                <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {conv.unread_count > 99 ? '99+' : conv.unread_count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
