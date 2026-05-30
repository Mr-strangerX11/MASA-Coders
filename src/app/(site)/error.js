'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SiteError({ error, reset }) {
  useEffect(() => {
    console.error('[Site Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060912] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <span className="text-2xl">⚠</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-3">
          Something went wrong
        </h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or go back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
