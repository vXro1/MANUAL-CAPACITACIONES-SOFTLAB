/**
 * FocusCarousel — 3D centered-focus carousel
 *
 * Props
 *   items      { image, title?, subtitle?, badge?, alt? }[]
 *   autoplay   boolean  (default false)
 *   interval   number   ms between slides (default 5000)
 *
 * Depth layers
 *   pos  0  → center  : scale 1.00, opacity 1,    z 30, rotateY   0°
 *   pos ±1  → side    : scale 0.80, opacity 0.62,  z 10, rotateY ±10°
 *   pos ±2  → far     : scale 0.62, opacity 0.22,  z  0, rotateY ±20°
 *   |pos|>2 → hidden  : opacity 0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── Spring preset ──────────────────────────────────────────────────────── */
const SPRING      = { type: 'spring', stiffness: 290, damping: 32, mass: 0.88 };
const SPRING_FAST = { type: 'spring', stiffness: 340, damping: 36, mass: 0.72 };

/* ─── Layer resolver ─────────────────────────────────────────────────────── */
function resolveLayer(relPos, isMobile) {
  const abs  = Math.abs(relPos);
  const sign = relPos < 0 ? -1 : 1;

  if (abs === 0) return {
    x: '0%', y: '0%', scale: 1, opacity: 1, zIndex: 30, rotateY: 0,
    brightness: 1, blur: 0,
    boxShadow: '0 28px 80px -8px rgba(37,99,235,0.32), 0 8px 28px rgba(15,23,42,0.12), 0 0 0 1.5px rgba(59,130,246,0.18)',
    border: '1.5px solid rgba(59,130,246,0.22)',
    clickable: false,
  };

  if (abs === 1) {
    const xPct = isMobile ? sign * 64 : sign * 52;
    return {
      x: `${xPct}%`, y: '1.5%',
      scale: isMobile ? 0.76 : 0.83,
      opacity: isMobile ? 0.52 : 0.72,
      zIndex: 10, rotateY: sign * -10,
      brightness: 0.84, blur: 0.3,
      boxShadow: '0 8px 28px rgba(15,23,42,0.08)',
      border: '1px solid rgba(203,213,225,0.45)',
      clickable: true,
    };
  }

  if (abs === 2) {
    const xPct = isMobile ? sign * 110 : sign * 92;
    return {
      x: `${xPct}%`, y: '3%',
      scale: 0.64, opacity: 0.24,
      zIndex: 0, rotateY: sign * -20,
      brightness: 0.64, blur: 1.8,
      boxShadow: 'none', border: '1px solid transparent',
      clickable: false,
    };
  }

  return {
    x: `${sign * 132}%`, y: '0%',
    scale: 0.5, opacity: 0,
    zIndex: -1, rotateY: 0,
    brightness: 0.5, blur: 4,
    boxShadow: 'none', border: '1px solid transparent',
    clickable: false,
  };
}

/* ─── Nav button — sin backdropFilter ───────────────────────────────────── */
function NavBtn({ onClick, label, children, dark = false }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{
        scale: 1.08,
        backgroundColor: dark ? 'rgba(96,165,250,0.18)' : 'rgba(239,246,255,0.98)',
      }}
      whileTap={{ scale: 0.91 }}
      aria-label={label}
      style={{
        width: 34, height: 34, padding: 0,
        borderRadius: 10,
        border: dark ? '1px solid rgba(96,165,250,0.28)' : '1px solid rgba(203,213,225,0.68)',
        background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(248,250,255,0.96)',
        color: dark ? '#93C5FD' : '#334155',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.20)' : '0 2px 8px rgba(15,23,42,0.05)',
        flexShrink: 0,
        transition: 'background 0.14s',
        backdropFilter: dark ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: dark ? 'blur(8px)' : 'none',
      }}
    >
      {children}
    </motion.button>
  );
}

/* ─── FocusCarousel ──────────────────────────────────────────────────────── */
export function FocusCarousel({ items = [], autoplay = false, interval = 5000, dark = false }) {
  const [active,   setActive]   = useState(0);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [paused, setPaused] = useState(false);
  const touchX    = useRef(null);
  const pointerX  = useRef(null);
  const stageRef  = useRef(null);
  const count     = items.length;

  /* responsive breakpoint watcher — usa matchMedia igual que useBreakpoint */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* navigation helpers */
  const go     = useCallback((i) => setActive(((i % count) + count) % count), [count]);
  const goPrev = useCallback(() => go(active - 1), [active, go]);
  const goNext = useCallback(() => go(active + 1), [active, go]);

  /* autoplay — usa setTimeout para resetear naturalmente al navegar */
  useEffect(() => {
    if (!autoplay || paused || count <= 1) return;
    const id = setTimeout(goNext, interval);
    return () => clearTimeout(id);
  }, [active, autoplay, paused, count, interval, goNext]);

  /* keyboard — listener en el contenedor del stage, no en window */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goPrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    };
    stage.addEventListener('keydown', onKey);
    return () => stage.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  if (!count) return null;

  return (
    <div
      style={{ position: 'relative', width: '100%', userSelect: 'none' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── 3D perspective wrapper ─────────────────────────────────────── */}
      <div style={{ perspective: '1400px', perspectiveOrigin: '50% 38%' }}>
        <div
          ref={stageRef}
          role="region"
          aria-roledescription="carrusel"
          aria-label="Galería de fotos"
          tabIndex={0}
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(300px, 46vw, 500px)',
            overflow: 'hidden',
            borderRadius: 20,
            outline: 'none',
          }}
          /* touch swipe */
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 44) dx < 0 ? goNext() : goPrev();
            touchX.current = null;
          }}
          /* pointer drag */
          onPointerDown={(e) => { pointerX.current = e.clientX; }}
          onPointerUp={(e) => {
            if (pointerX.current === null) return;
            const dx = e.clientX - pointerX.current;
            if (Math.abs(dx) > 44) dx < 0 ? goNext() : goPrev();
            pointerX.current = null;
          }}
        >
          {items.map((item, i) => {
            let pos = i - active;
            const half = Math.floor(count / 2);
            if (pos >  half) pos -= count;
            if (pos < -half) pos += count;

            const layer     = resolveLayer(pos, isMobile);
            const isCenter  = pos === 0;
            const isVisible = Math.abs(pos) <= 2;

            return (
              <motion.div
                key={i}
                role={layer.clickable ? 'button' : undefined}
                aria-label={layer.clickable ? `Ver ${item.title ?? `foto ${i + 1}`}` : undefined}
                aria-current={isCenter ? 'true' : undefined}
                onClick={() => layer.clickable && go(i)}
                animate={{
                  x:        layer.x,
                  y:        layer.y,
                  scale:    layer.scale,
                  opacity:  layer.opacity,
                  rotateY:  layer.rotateY,
                  filter:   `brightness(${layer.brightness}) blur(${layer.blur}px)`,
                }}
                transition={SPRING}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex:        layer.zIndex,
                  cursor:        layer.clickable ? 'pointer' : 'default',
                  transformStyle: 'preserve-3d',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border:     layer.border,
                  boxShadow:  layer.boxShadow,
                  background: 'rgba(238,242,255,0.80)',
                  willChange: isVisible ? 'transform, opacity' : 'auto',
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
                whileHover={isCenter ? { scale: 1.015 } : undefined}
              >
                {/* Imagen — LCP hint en slide 0, lazy en el resto */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.alt ?? item.title ?? ''}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'low'}
                    decoding={i === 0 ? 'sync' : 'async'}
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                    draggable={false}
                  />
                )}

                {/* Overlay profundidad en slides laterales */}
                {!isCenter && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(15,23,42,0.10)',
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Shimmer borde en slide activo */}
                {isCenter && (
                  <div aria-hidden="true" style={{
                    position: 'absolute', inset: 0,
                    borderRadius: 'inherit',
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.09) 100%)',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }} />
                )}

                {/* Badge en slide activo */}
                {isCenter && item.badge && (
                  <div style={{
                    position: 'absolute', top: 14, left: 14, zIndex: 8,
                    background: 'rgba(248,250,255,0.96)',
                    border: '1px solid rgba(255,255,255,0.95)',
                    borderRadius: 999,
                    padding: '3px 12px',
                    fontSize: 10, fontWeight: 700,
                    color: '#1D4ED8',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    fontFamily: 'DM Sans, sans-serif',
                    pointerEvents: 'none',
                  }}>
                    {item.badge}
                  </div>
                )}

                {/* Caption en slide activo */}
                {isCenter && item.title && (
                  <motion.div
                    key={`cap-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      padding: '32px 18px 14px',
                      background: 'linear-gradient(to top, rgba(10,17,40,0.80) 0%, transparent 100%)',
                      zIndex: 6,
                      pointerEvents: 'none',
                    }}
                  >
                    <p style={{
                      margin: 0, color: '#fff',
                      fontSize: 13, fontWeight: 600,
                      fontFamily: 'DM Sans, sans-serif',
                      letterSpacing: '-0.01em', lineHeight: 1.35,
                    }}>
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p style={{
                        margin: '3px 0 0',
                        color: 'rgba(255,255,255,0.65)',
                        fontSize: 11,
                        fontFamily: 'DM Sans, sans-serif',
                        lineHeight: 1.4,
                      }}>
                        {item.subtitle}
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        marginTop: 18,
      }}>

        <NavBtn onClick={goPrev} label="Anterior" dark={dark}>
          <ChevronLeft size={15} aria-hidden="true" />
        </NavBtn>

        {/* Progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {items.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => go(i)}
              aria-label={`Ir a foto ${i + 1}`}
              animate={{
                width: i === active ? 20 : 6,
                backgroundColor: i === active
                  ? (dark ? '#60A5FA' : '#1D4ED8')
                  : (dark ? 'rgba(255,255,255,0.28)' : 'rgba(100,116,139,0.26)'),
              }}
              transition={SPRING_FAST}
              style={{
                height: 6, borderRadius: 999,
                border: 'none', padding: 0,
                cursor: 'pointer', flexShrink: 0,
              }}
            />
          ))}
        </div>

        <NavBtn onClick={goNext} label="Siguiente" dark={dark}>
          <ChevronRight size={15} aria-hidden="true" />
        </NavBtn>
      </div>

      {/* Slide counter */}
      <div style={{
        textAlign: 'center',
        marginTop: 8,
        fontFamily: 'Syne, sans-serif',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.09em',
        color: dark ? 'rgba(186,214,254,0.50)' : '#94A3B8',
      }}>
        <span style={{ color: dark ? '#93C5FD' : '#1D4ED8' }}>
          {String(active + 1).padStart(2, '0')}
        </span>
        {' / '}
        {String(count).padStart(2, '0')}
      </div>
    </div>
  );
}
