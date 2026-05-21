import { useResolvedImage } from '@/shared/hooks/useResolvedImage';
import { cn } from '@/shared/lib/cn';
import { User } from 'lucide-react';

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const radiuses = {
  rounded: 'rounded-full',
  square: 'rounded-xl',
  lg: 'rounded-2xl',
};

export function Avatar({
  photo,
  name,
  size = 'md',
  shape = 'square',
  className,
  fallbackIcon,
}) {
  const resolvedUrl = useResolvedImage(photo);
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : null;

  return (
    <div
      className={cn(
        'overflow-hidden bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0',
        sizes[size],
        radiuses[shape],
        className
      )}
    >
      {resolvedUrl ? (
        <img
          src={resolvedUrl}
          alt={name ?? ''}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : initials ? (
        <span className="font-bold text-brand-600 leading-none select-none">
          {initials}
        </span>
      ) : (
        <User size={size === 'sm' ? 14 : size === 'xl' ? 24 : 18} className="text-brand-300" />
      )}
    </div>
  );
}
