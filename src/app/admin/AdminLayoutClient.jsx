'use client';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const isForgotPasswordPage = pathname === '/admin/forgot-password';
  const showSidebar = !isLoginPage && !isForgotPasswordPage;

  return (
    <div className={`min-h-screen bg-[#0d1117] flex`}>
      {showSidebar && <AdminSidebar />}
      <div className={`flex-1 min-h-screen overflow-auto ${showSidebar && 'ml-64'}`}>
        {children}
      </div>
    </div>
  );
}
