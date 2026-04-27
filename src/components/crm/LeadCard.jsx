'use client';
import { useState } from 'react';
import { FiMoreVertical, FiMail, FiPhone, FiMessageSquare, FiTrash2, FiEdit2 } from 'react-icons/fi';
import PlatformIcon from '@/components/inbox/PlatformIcon';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES = {
  low:    'bg-slate-500/20 text-slate-400 border-slate-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high:   'bg-red-500/20   text-red-400   border-red-500/30',
};

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function LeadCard({ lead, onEdit, onDelete, onMove }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const priority = lead.priority || 'medium';

  return (
    <div className="bg-white/5 border border-white/8 rounded-xl p-3 hover:border-white/15 transition-colors group cursor-default">
      {/* Top row */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(lead.contact_name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{lead.contact_name || 'Unknown'}</p>
            {lead.company_name && (
              <p className="text-slate-500 text-[10px] truncate">{lead.company_name}</p>
            )}
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded text-slate-600 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
          >
            <FiMoreVertical className="w-3.5 h-3.5" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-6 z-20 w-36 bg-[#0f1629] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button onClick={() => { setMenuOpen(false); onEdit?.(lead); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                <FiEdit2 className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => { setMenuOpen(false); onDelete?.(lead.id); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                <FiTrash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags row */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize', PRIORITY_STYLES[priority])}>
          {priority}
        </span>
        {lead.platform && <PlatformIcon platform={lead.platform} size="sm" />}
        {lead.estimated_value && (
          <span className="text-[10px] text-green-400 font-semibold ml-auto">
            ${Number(lead.estimated_value).toLocaleString()}
          </span>
        )}
      </div>

      {/* Notes */}
      {lead.notes && (
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-2">{lead.notes}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          {lead.contact_email && (
            <a href={`mailto:${lead.contact_email}`} className="text-slate-600 hover:text-blue-400 transition-colors" title={lead.contact_email}>
              <FiMail className="w-3 h-3" />
            </a>
          )}
          {lead.contact_phone && (
            <a href={`tel:${lead.contact_phone}`} className="text-slate-600 hover:text-green-400 transition-colors" title={lead.contact_phone}>
              <FiPhone className="w-3 h-3" />
            </a>
          )}
          {lead.conversation_id && (
            <span className="text-slate-600" title="Has conversation">
              <FiMessageSquare className="w-3 h-3" />
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-600">{timeAgo(lead.created_at)}</span>
      </div>
    </div>
  );
}
