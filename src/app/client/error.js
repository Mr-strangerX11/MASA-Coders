'use client';
import { useEffect } from 'react';

export default function ClientError({ error, reset }) {
  useEffect(() => { console.error('[Client Error]', error); }, [error]);
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="text-center max-w-md bg-white/5 border border-white/10 rounded-2xl p-10">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <span className="text-xl">⚠</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 text-sm mb-6">An unexpected error occurred in the client portal.</p>
        <button onClick={reset} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-sm">
          Try Again
        </button>
      </div>
    </div>
  );
}
