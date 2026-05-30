import Link from 'next/link';

export const metadata = { title: '404 — Page Not Found' };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060912] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-8">
          <span className="text-4xl font-display font-bold text-blue-400">404</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
