'use client';
import { useState, useEffect } from 'react';
import { timeUntil } from '@/lib/utils';

export default function CountdownTimer({ endDate, className = '' }) {
  const [time, setTime] = useState(timeUntil(endDate));

  useEffect(() => {
    const timer = setInterval(() => setTime(timeUntil(endDate)), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (time.expired) return <span className={`text-red-500 font-semibold text-sm ${className}`}>Offer Expired</span>;

  const blocks = [
    { label: 'Days',    value: time.days },
    { label: 'Hours',   value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {blocks.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="bg-slate-900 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-lg font-mono">
              {String(value).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">{label}</span>
          </div>
          {i < 3 && <span className="text-slate-400 font-bold mb-4">:</span>}
        </div>
      ))}
    </div>
  );
}
