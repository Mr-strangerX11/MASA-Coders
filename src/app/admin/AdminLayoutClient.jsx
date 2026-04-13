'use client';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <div className={`min-h-screen bg-[#0d1117] flex`}>
      {!isLoginPage && <AdminSidebar />}
      <div className={`flex-1 min-h-screen overflow-auto ${!isLoginPage && 'ml-64'}`}>
        {children}
      </div>
    </div>
  );
}
