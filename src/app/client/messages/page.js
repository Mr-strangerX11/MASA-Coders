'use client';
import { useEffect, useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import Link from 'next/link';

export default function ClientMessagesPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tickets?limit=20&status=open').then(r => r.json()).then(d => setTickets(d.tickets || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Messages</h1>
      <p className="text-slate-400 text-sm mb-8">Communication with the MASA Coders team happens via support tickets.</p>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
            <FiMessageSquare size={16} className="text-blue-400" />
          </div>
          <div>
            <div className="text-white font-medium text-sm">Need to communicate with us?</div>
            <div className="text-slate-400 text-xs">Create or view support tickets</div>
          </div>
        </div>
        <Link href="/client/tickets" className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
          Go to Support Tickets →
        </Link>
      </div>
    </div>
  );
}
