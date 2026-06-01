export default function ClientLoading() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-900 border-t-emerald-500 animate-spin"/>
        <p className="text-slate-600 text-sm">Loading…</p>
      </div>
    </div>
  );
}
