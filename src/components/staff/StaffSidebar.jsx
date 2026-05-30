'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  FiGrid, FiBriefcase, FiCheckSquare, FiFileText, FiCalendar,
  FiUser, FiLogOut, FiChevronLeft, FiChevronRight, FiClock, FiUmbrella, FiBarChart2,
} from 'react-icons/fi';
import NotificationBell from '@/components/ui/NotificationBell';

const NAV = [
  { href: '/staff/dashboard',      label: 'Dashboard',     icon: FiGrid },
  { href: '/staff/tasks',          label: 'My Tasks',      icon: FiCheckSquare },
  { href: '/staff/projects',       label: 'Projects',      icon: FiBriefcase },
  { href: '/staff/time-tracking',  label: 'Time Tracker',  icon: FiClock },
  { href: '/staff/reports',        label: 'Daily Reports', icon: FiFileText },
  { href: '/staff/attendance',     label: 'Attendance',    icon: FiCalendar },
  { href: '/staff/leaves',         label: 'Leave Requests',icon: FiUmbrella },
  { href: '/staff/profile',        label: 'Profile',       icon: FiUser },
];

export default function StaffSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]         = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [todayStatus, setTodayStatus] = useState(null);

  useEffect(() => {
    fetch('/api/staff/auth').then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
  }, []);

  async function handleLogout() {
    await fetch('/api/staff/auth?action=logout', { method: 'POST' });
    router.push('/staff/login');
  }

  const isActive = (href) => pathname === href || (href !== '/staff/dashboard' && pathname.startsWith(href));

  return (
    <aside className={`fixed top-0 left-0 h-full bg-[#0d1117] border-r border-white/8 z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/8 ${collapsed ? 'justify-center px-3' : ''}`}>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm">MASA Coders</div>
            <div className="text-[10px] text-violet-400 font-medium">Staff Portal</div>
          </div>
        )}
        {collapsed && <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs">S</div>}
        {!collapsed && <NotificationBell portalColor="violet"/>}
        <button onClick={() => setCollapsed(!collapsed)} className={`${collapsed ? '' : 'ml-1'} text-slate-500 hover:text-white`}>
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive(href)
                ? 'bg-violet-600/15 text-violet-400 border border-violet-600/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon className={`shrink-0 ${isActive(href) ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`} size={16} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && label === 'My Tasks' && notifications > 0 && (
              <span className="ml-auto bg-violet-600 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 min-w-4 text-center">{notifications}</span>
            )}
          </Link>
        ))}
      </nav>

      {user && (
        <div className={`p-3 border-t border-white/8 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/3">
              <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-600/30 flex items-center justify-center text-violet-400 font-bold text-xs shrink-0">
                {user.avatar ?  <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{user.name}</div>
                <div className="text-slate-500 text-[10px] truncate capitalize">{user.role} · {user.department || 'Staff'}</div>
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
