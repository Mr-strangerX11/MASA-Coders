'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiGrid, FiBriefcase, FiTag, FiSettings, FiMessageSquare,
  FiUsers, FiFileText, FiLogOut, FiGlobe, FiStar, FiInbox,
  FiCheckSquare, FiDollarSign, FiFolder, FiAward, FiHelpCircle,
  FiUserCheck, FiUserPlus, FiChevronDown, FiChevronRight, FiTrendingUp, FiCheckCircle,
} from 'react-icons/fi';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/ui/NotificationBell';
import CommandPalette from '@/components/admin/CommandPalette';

const GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',      href: '/admin/dashboard',      icon: FiGrid },
      { label: 'Inbox',          href: '/admin/inbox',          icon: FiInbox },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Work Projects',  href: '/admin/work-projects',  icon: FiCheckSquare },
      { label: 'Approvals',      href: '/admin/approvals',      icon: FiCheckCircle },
      { label: 'Staff',          href: '/admin/staff',          icon: FiUserCheck },
      { label: 'Users',          href: '/admin/users',          icon: FiUserPlus },
      { label: 'CRM / Leads',    href: '/admin/crm',            icon: FiUsers },
      { label: 'Support',        href: '/admin/tickets',        icon: FiHelpCircle },
      { label: 'Leaderboard',    href: '/admin/leaderboard',    icon: FiAward },
      { label: 'Analytics',      href: '/admin/analytics',      icon: FiTrendingUp },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Invoices',       href: '/admin/finance',        icon: FiDollarSign },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Portfolio',      href: '/admin/projects',       icon: FiBriefcase },
      { label: 'Services',       href: '/admin/services',       icon: FiGlobe },
      { label: 'Blog Posts',     href: '/admin/blog',           icon: FiFileText },
      { label: 'Testimonials',   href: '/admin/testimonials',   icon: FiStar },
      { label: 'Offers',         href: '/admin/offers',         icon: FiTag },
      { label: 'Inquiries',      href: '/admin/inquiries',      icon: FiMessageSquare },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Documents',      href: '/admin/documents',      icon: FiFolder },
      { label: 'Settings',       href: '/admin/settings',       icon: FiSettings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [collapsed, setCollapsed] = useState({});

  function toggleGroup(label) {
    setCollapsed(prev => ({...prev, [label]: !prev[label]}));
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out successfully');
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0f1e] border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 h-16 flex items-center border-b border-white/5">
        <Link href="/" target="_blank" className="flex items-center gap-2 group flex-1 min-w-0">
          <Image src="/logo.png" alt="MASA Coders" width={32} height={32} style={{ width: 'auto', height: 'auto' }} />
          <div className="min-w-0">
            <span className="font-display font-bold text-white text-base">MASA Coders</span>
            <span className="block text-[10px] text-slate-600 -mt-0.5">Admin Panel</span>
          </div>
        </Link>
        <NotificationBell portalColor="blue"/>
      </div>

      {/* Command palette search */}
      <div className="px-3 py-2 border-b border-white/5">
        <CommandPalette />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {GROUPS.map(group => {
          const isCollapsed = collapsed[group.label];
          return (
            <div key={group.label} className="mb-3">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-400 transition-colors"
              >
                {group.label}
                {isCollapsed ? <FiChevronRight size={11}/> : <FiChevronDown size={11}/>}
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5 mt-1">
                  {group.items.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
                    return (
                      <Link key={href} href={href} className={cn('admin-sidebar-link', active && 'active')}>
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-2 pt-3 border-t border-white/5">
          <Link href="/" target="_blank" className="admin-sidebar-link">
            <FiGlobe className="w-4 h-4" />
            View Website
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <button onClick={handleLogout} className="admin-sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
