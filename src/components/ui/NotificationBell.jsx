'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { FiBell, FiX, FiCheck, FiCheckCircle } from 'react-icons/fi';

const TYPE_ICONS = {
  task_assigned:    '✅',
  task_completed:   '🎉',
  task_overdue:     '⚠️',
  project_update:   '🚀',
  project_completed:'🏁',
  invoice_sent:     '💰',
  invoice_paid:     '✅',
  invoice_overdue:  '🔴',
  ticket_reply:     '💬',
  ticket_resolved:  '✅',
  message:          '📩',
  mention:          '@',
  approval_request: '📋',
  approval_done:    '✔️',
  leave_approved:   '🌴',
  leave_rejected:   '❌',
  announcement:     '📢',
  system:           '⚙️',
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell({ portalColor = 'violet' }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const dropdownRef = useRef(null);
  const pollRef     = useRef(null);

  const accentClass = {
    violet:  'bg-violet-600',
    emerald: 'bg-emerald-600',
    blue:    'bg-blue-600',
  }[portalColor] || 'bg-violet-600';

  async function fetchNotifications() {
    try {
      const res  = await fetch('/api/notifications?limit=15');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  }

  async function markOneRead(id) {
    await fetch('/api/notifications', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  }

  // Initial fetch + poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/8"
        aria-label="Notifications"
      >
        <FiBell size={16}/>
        {unread > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 ${accentClass} text-white text-[9px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-1`}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">Notifications</span>
              {unread > 0 && (
                <span className={`${accentClass} text-white text-[9px] font-bold rounded-full px-1.5 py-0.5`}>{unread}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-slate-400 hover:text-white text-xs transition-colors flex items-center gap-1">
                  <FiCheckCircle size={11}/> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <FiX size={14}/>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                <FiBell size={24} className="mb-2"/>
                <span className="text-sm">No notifications yet</span>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`flex gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors cursor-pointer group ${!n.isRead ? 'bg-white/[0.02]' : ''}`}
                  onClick={() => { if (!n.isRead) markOneRead(n._id); }}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-base shrink-0 mt-0.5">
                    {TYPE_ICONS[n.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium leading-snug ${n.isRead ? 'text-slate-300' : 'text-white'}`}>{n.title}</div>
                    {n.body && <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{n.body}</div>}
                    <div className="text-slate-600 text-[10px] mt-1">{timeAgo(n.createdAt)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!n.isRead && <div className={`w-1.5 h-1.5 rounded-full ${accentClass} mt-1.5`}/>}
                    {n.link && (
                      <Link href={n.link} onClick={() => setOpen(false)}
                        className="text-[10px] text-slate-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/8 text-center">
              <span className="text-slate-600 text-xs">Last updated just now · auto-refreshes every 30s</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
