export default function SiteLoading() {
  return (
    <div className="min-h-screen bg-[#060912] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
        <p className="text-slate-500 text-sm tracking-wide">Loading…</p>
      </div>
    </div>
  );
}
