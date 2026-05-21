import { cn } from '@/shared/lib/cn';

export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div
      className={cn(
        'border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin',
        sizes[size],
        className
      )}
    />
  );
}
