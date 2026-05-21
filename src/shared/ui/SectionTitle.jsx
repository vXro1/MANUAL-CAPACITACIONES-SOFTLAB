import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

export function SectionTitle({ label, title, description, align = 'left', className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      {label && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
          <span className="w-8 h-px bg-brand-600" />
          {label}
          <span className="w-8 h-px bg-brand-600" />
        </span>
      )}
      <h2
        className={cn(
          'text-3xl md:text-4xl font-bold text-slate-900 leading-tight',
          align === 'left' && 'max-w-xl'
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'text-slate-500 text-base leading-relaxed',
            align === 'center' ? 'max-w-2xl' : 'max-w-xl'
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
