'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  FiGrid, FiBriefcase, FiFileText, FiMessageSquare, FiHelpCircle,
  FiFolder, FiUser, FiLogOut, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import NotificationBell from '@/components/ui/NotificationBell';

const NAV = [
  { href: '/client/dashboard',  label: 'Dashboard',  icon: FiGrid },
  { href: '/client/projects',   label: 'My Projects', icon: FiBriefcase },
  { href: '/client/invoices',   label: 'Invoices',    icon: FiFileText },
  { href: '/client/tickets',    label: 'Support',     icon: FiHelpCircle },
  { href: '/client/documents',  label: 'Documents',   icon: FiFolder },
  { href: '/client/messages',   label: 'Messages',    icon: FiMessageSquare },
  { href: '/client/profile',    label: 'Profile',     icon: FiUser },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]           = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch('/api/client/auth').then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
  }, []);

  async function handleLogout() {
    await fetch('/api/client/auth?action=logout', { method: 'POST' });
    router.push('/client/login');
  }

  const isActive = (href) => pathname === href || (href !== '/client/dashboard' && pathname.startsWith(href));

  return (
    <aside className={`fixed top-0 left-0 h-full bg-[#0d1117] border-r border-white/8 z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/8 ${collapsed ? 'justify-center px-3' : ''}`}>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm">MASA Coders</div>
            <div className="text-[10px] text-emerald-400 font-medium">Client Portal</div>
          </div>
        )}
        {collapsed && <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">C</div>}
        {!collapsed && <NotificationBell portalColor="emerald"/>}
        <button onClick={() => setCollapsed(!collapsed)} className={`${collapsed ? '' : 'ml-1'} text-slate-500 hover:text-white`}>
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive(href)
                ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-600/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon className={`shrink-0 ${isActive(href) ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} size={16} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* User + logout */}
      {user && (
        <div className={`p-3 border-t border-white/8 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/3">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                {user.avatar ?  <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{user.name}</div>
                <div className="text-slate-500 text-[10px] truncate">{user.email}</div>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                <FiLogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
              <FiLogOut size={16} />
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
