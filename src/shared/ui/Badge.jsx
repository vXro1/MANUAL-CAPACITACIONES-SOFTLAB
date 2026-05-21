import { cn } from '@/shared/lib/cn';

const variants = {
  default: 'bg-brand-50 text-brand-700 border border-brand-100',
  blue: 'bg-blue-50 text-blue-700 border border-blue-100',
  green: 'bg-green-50 text-green-700 border border-green-100',
  yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  red: 'bg-red-50 text-red-700 border border-red-100',
  slate: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export function Badge({ variant = 'default', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
