import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Images, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const SLIDE = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [dir, setDir] = useState(0);
  const count = images.length;

  const go = useCallback((next) => {
    setDir(next > current ? 1 : -1);
    setCurrent((next + count) % count);
  }, [current, count]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(current - 1);
      if (e.key === 'ArrowRight') go(current + 1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, go, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/60 text-sm tabular-nums">{current + 1} / {count}</span>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-white/10 transition-colors">
          Cerrar ✕
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence custom={dir} mode="popLayout">
          <motion.img
            key={current}
            custom={dir}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            src={images[current]}
            alt={`Evidencia ${current + 1}`}
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              onClick={() => go(current - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => go(current + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto justify-center" onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={cn(
                'shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all',
                i === current ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
              )}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function Gallery({ images = [], title = 'Galería de Evidencias' }) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const intervalRef = useRef(null);
  const count = images.length;

  const go = useCallback((next) => {
    const idx = ((next % count) + count) % count;
    setDir(next > current ? 1 : -1);
    setCurrent(idx);
  }, [current, count]);

  const prev = useCallback(() => go(current - 1), [go, current]);
  const next = useCallback(() => go(current + 1), [go, current]);

  useEffect(() => {
    if (count <= 1) return;
    intervalRef.current = setInterval(() => go(current + 1), 4000);
    return () => clearInterval(intervalRef.current);
  }, [current, count, go]);

  const pause = () => clearInterval(intervalRef.current);
  const resume = () => {
    if (count <= 1) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => go(current + 1), 4000);
  };

  if (!images || count === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-xl border-2 border-dashed border-slate-200">
        <Images size={28} className="text-slate-300" />
        <p className="text-sm text-slate-400">Sin imágenes disponibles</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
            <Images size={14} className="text-brand-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <span className="ml-auto text-xs text-slate-400 tabular-nums shrink-0">
            {current + 1} / {count}
          </span>
        </div>

        {/* Carrusel */}
        <div
          className="relative rounded-xl overflow-hidden bg-slate-900 group select-none"
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          {/* Imagen principal */}
          <div className="aspect-video relative overflow-hidden">
            <AnimatePresence custom={dir} mode="popLayout">
              <motion.img
                key={current}
                custom={dir}
                variants={SLIDE}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) next();
                  else if (info.offset.x > 50) prev();
                }}
                src={images[current]}
                alt={`Evidencia ${current + 1}`}
                className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
                draggable={false}
              />
            </AnimatePresence>

            {/* Degradado inferior */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            {/* Botón expandir */}
            <button
              onClick={() => setLightbox(current)}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all z-10"
              aria-label="Ver pantalla completa"
            >
              <Expand size={14} />
            </button>

            {/* Flechas */}
            {count > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-black/55 transition-all z-10"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-black/55 transition-all z-10"
                  aria-label="Siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Dots */}
            {count > 1 && count <= 12 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    aria-label={`Ir a imagen ${i + 1}`}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/45 hover:bg-white/75'
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tira de miniaturas */}
          {count > 1 && (
            <div className="flex gap-1.5 p-2 bg-slate-950 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}>
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  className={cn(
                    'shrink-0 w-14 h-10 sm:w-16 sm:h-11 rounded-md overflow-hidden border-2 transition-all duration-200',
                    i === current
                      ? 'border-brand-400 opacity-100'
                      : 'border-transparent opacity-45 hover:opacity-80'
                  )}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox images={images} startIndex={lightbox} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
