'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  FiGrid, FiBriefcase, FiTag, FiSettings, FiMessageSquare,
  FiUsers, FiFileText, FiLogOut, FiGlobe, FiStar
} from 'react-icons/fi';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard',    href: '/admin/dashboard',    icon: FiGrid },
  { label: 'Projects',     href: '/admin/projects',     icon: FiBriefcase },
  { label: 'Offers',       href: '/admin/offers',       icon: FiTag },
  { label: 'Services',     href: '/admin/services',     icon: FiGlobe },
  { label: 'Testimonials', href: '/admin/testimonials', icon: FiStar },
  { label: 'Blog Posts',   href: '/admin/blog',         icon: FiFileText },
  { label: 'Inquiries',    href: '/admin/inquiries',    icon: FiMessageSquare },
  { label: 'Settings',     href: '/admin/settings',     icon: FiSettings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

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
        <Link href="/" target="_blank" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="MASA Coders" width={32} height={32} />
          <div>
            <span className="font-display font-bold text-white text-base">MASA Coders</span>
            <span className="block text-[10px] text-slate-600 -mt-0.5">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn('admin-sidebar-link', active && 'active')}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5">
          <Link href="/" target="_blank" className="admin-sidebar-link">
            <FiGlobe className="w-4 h-4" />
            View Website
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="admin-sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
