'use client';
import { usePathname } from 'next/navigation';
import StaffSidebar from './StaffSidebar';

export default function StaffLayoutClient({ children }) {
  const pathname = usePathname();
  const isPublic = pathname === '/staff/login';

  if (isPublic) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      <StaffSidebar />
      <div className="flex-1 ml-64 min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
}
