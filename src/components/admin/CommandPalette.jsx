'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiUser, FiCheckSquare, FiFileText, FiHelpCircle,
  FiUsers, FiTrendingUp, FiArrowRight, FiCommand, FiPlus,
  FiGrid, FiDollarSign, FiMessageSquare,
} from 'react-icons/fi';

const TYPE_ICON = {
  user:    { icon: FiUser,        color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  project: { icon: FiGrid,        color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
  task:    { icon: FiCheckSquare, color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
  ticket:  { icon: FiHelpCircle,  color: 'text-red-400',     bg: 'bg-red-500/10'     },
  lead:    { icon: FiTrendingUp,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  inquiry: { icon: FiMessageSquare,color:'text-cyan-400',    bg: 'bg-cyan-500/10'    },
  invoice: { icon: FiDollarSign,  color: 'text-yellow-400',  bg: 'bg-yellow-500/10'  },
};

const QUICK_ACTIONS = [
  { label: 'New Work Project',  url: '/admin/work-projects/create', icon: FiPlus,        color: 'text-violet-400' },
  { label: 'New Staff Member',  url: '/admin/staff/create',         icon: FiUser,        color: 'text-blue-400'   },
  { label: 'Create Invoice',    url: '/admin/finance/invoices/create', icon: FiDollarSign, color: 'text-yellow-400' },
  { label: 'View All Users',    url: '/admin/users',                icon: FiUsers,       color: 'text-slate-400'  },
  { label: 'CRM Pipeline',      url: '/admin/crm',                  icon: FiTrendingUp,  color: 'text-emerald-400'},
  { label: 'Support Tickets',   url: '/admin/tickets',              icon: FiHelpCircle,  color: 'text-red-400'    },
];

export default function CommandPalette() {
  const router  = useRouter();
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef   = useRef(null);
  const debounce   = useRef(null);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery(''); setResults([]); setSelected(0);
    }
  }, [open]);

  const search = useCallback(async (q) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`);
      const data = await res.json();
      setResults(data.results || []);
      setSelected(0);
    } finally { setLoading(false); }
  }, []);

  function handleInput(e) {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(q), 250);
  }

  const items = query.length >= 2 ? results : QUICK_ACTIONS.map(a => ({ ...a, type: 'action' }));

  function navigate(item) {
    router.push(item.url);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, items.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && items[selected]) navigate(items[selected]);
  }

  return (
    <>
      {/* Trigger button in sidebar / header — keyboard shortcut hint */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-slate-500 text-xs hover:border-white/15 hover:text-slate-400 transition-all"
      >
        <FiSearch size={12}/>
        <span className="flex-1 text-left">Search anything…</span>
        <span className="flex items-center gap-0.5 opacity-60">
          <FiCommand size={10}/><span>K</span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl"
            >
              <div className="bg-[#141b2d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
                  <FiSearch size={16} className={`shrink-0 ${loading ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`}/>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={handleInput}
                    onKeyDown={onKeyDown}
                    placeholder="Search users, projects, tasks, tickets…"
                    className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 focus:outline-none"
                  />
                  <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 text-slate-600 text-[10px] font-mono">ESC</kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto py-2">
                  {items.length === 0 && query.length >= 2 && !loading && (
                    <div className="px-4 py-8 text-center text-slate-600 text-sm">No results for &ldquo;{query}&rdquo;</div>
                  )}

                  {query.length < 2 && (
                    <div className="px-4 pb-1 pt-1">
                      <p className="text-[10px] text-slate-700 uppercase tracking-wide font-semibold mb-1">Quick Actions</p>
                    </div>
                  )}

                  {query.length >= 2 && results.length > 0 && (
                    <div className="px-4 pb-1">
                      <p className="text-[10px] text-slate-700 uppercase tracking-wide font-semibold mb-1">{results.length} results</p>
                    </div>
                  )}

                  {items.map((item, i) => {
                    const meta   = TYPE_ICON[item.type] || { icon: FiArrowRight, color: 'text-slate-400', bg: 'bg-white/5' };
                    const Icon   = item.icon || meta.icon;
                    const active = i === selected;
                    return (
                      <button
                        key={i}
                        onClick={() => navigate(item)}
                        onMouseEnter={() => setSelected(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${active ? 'bg-blue-600/15' : 'hover:bg-white/[0.03]'}`}
                      >
                        <div className={`w-7 h-7 rounded-lg ${item.bg || meta.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={13} className={item.color || meta.color}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{item.label}</div>
                          {item.sub && <div className="text-slate-600 text-xs truncate">{item.sub}</div>}
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500 shrink-0 capitalize">{item.badge}</span>
                        )}
                        {active && <FiArrowRight size={12} className="text-blue-400 shrink-0"/>}
                      </button>
                    );
                  })}
                </div>

                <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[10px] text-slate-700">
                  <span className="flex items-center gap-1"><kbd className="font-mono bg-white/5 px-1 rounded">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono bg-white/5 px-1 rounded">↵</kbd> open</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono bg-white/5 px-1 rounded">ESC</kbd> close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
