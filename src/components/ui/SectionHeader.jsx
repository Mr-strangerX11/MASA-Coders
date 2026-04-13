import { cn } from '@/lib/utils';

export default function SectionHeader({
  badge,
  title,
  subtitle,
  center = true,
  dark = false,
  className = '',
}) {
  return (
    <div className={cn('mb-14', center && 'text-center', className)}>
      {badge && (
        <div className={cn(
          'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4',
          dark
            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            : 'bg-blue-50 text-blue-700 border border-blue-100'
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          {badge}
        </div>
      )}
      <h2 className={cn(
        'text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight',
        dark ? 'text-white' : 'text-slate-900'
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'mt-4 text-lg max-w-2xl leading-relaxed',
          center && 'mx-auto',
          dark ? 'text-slate-400' : 'text-slate-500'
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
