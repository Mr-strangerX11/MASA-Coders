'use client';
import { usePathname } from 'next/navigation';
import ClientSidebar from './ClientSidebar';

const PUBLIC_PATHS = ['/client/login', '/client/register'];

export default function ClientLayoutClient({ children }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (isPublic) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      <ClientSidebar />
      <div className="flex-1 ml-64 min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
}
