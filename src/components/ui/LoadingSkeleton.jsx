export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="shimmer h-48 w-full" />
          <div className="p-6 space-y-3">
            <div className="shimmer h-4 w-3/4 rounded-full" />
            <div className="shimmer h-3 w-full rounded-full" />
            <div className="shimmer h-3 w-2/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TextSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`shimmer h-4 rounded-full ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );
}
