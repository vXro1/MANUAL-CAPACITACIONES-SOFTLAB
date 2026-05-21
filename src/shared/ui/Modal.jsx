import { useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

let openModalCount = 0;

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-[95vw] h-[92vh]',
};

export function Modal({ isOpen, onClose, title, children, size = 'md', className }) {
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();
  const isFull = size === 'full';

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      openModalCount += 1;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (isOpen) {
        openModalCount = Math.max(0, openModalCount - 1);
        if (openModalCount === 0) document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  // Save/restore focus
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      // Defer focus so the panel has rendered
      const raf = requestAnimationFrame(() => {
        const first = panelRef.current?.querySelector(FOCUSABLE);
        first?.focus();
      });
      return () => cancelAnimationFrame(raf);
    } else {
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Close on Escape + focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handle = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full bg-white rounded-2xl shadow-2xl flex flex-col',
              isFull ? 'max-w-[95vw] h-[92vh]' : 'max-h-[90vh]',
              !isFull && sizes[size],
              className
            )}
          >
            {/* Header with title */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <h2
                  id={titleId}
                  className="text-base font-semibold text-slate-900 truncate pr-4"
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Cerrar diálogo"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-brand-600"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Floating close when no title */}
            {!title && (
              <button
                onClick={onClose}
                aria-label="Cerrar diálogo"
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 text-slate-600 hover:bg-white shadow-md transition-all shrink-0 focus-visible:outline-2 focus-visible:outline-brand-600"
              >
                <X size={17} aria-hidden="true" />
              </button>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
