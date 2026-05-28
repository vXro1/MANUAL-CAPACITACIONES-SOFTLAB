import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  animate,
} from 'framer-motion';
import { ArrowRight, Users, FileText, Calendar, MapPin } from 'lucide-react';
import { FocusCarousel } from '@/shared/ui/FocusCarousel';

/* ─── Fallback images ────────────────────────────────────────────────────────── */
const foto1 = new URL('/src/assets/foto1semillero.png', import.meta.url).href;
const foto2 = new URL('/src/assets/foto2semillero.png', import.meta.url).href;
const foto3 = new URL('/src/assets/foto3semillero.png', import.meta.url).href;
const foto4 = new URL('/src/assets/foto4semillero.JPG', import.meta.url).href;
const foto5 = new URL('/src/assets/foto5semillero.JPG', import.meta.url).href;

const FALLBACK_SLIDES = [foto1, foto2, foto3, foto4, foto5].map(src => ({ image: src }));

const EASE = [0.22, 1, 0.36, 1];

/* ─── Orbs reducidos a 3 y sin backdropFilter ───────────────────────────────── */
const ORBS = [
  { id: 1, size: 400, left: '74%', top: '-10%', c1: 'rgba(147,197,253,0.22)', c2: 'rgba(99,140,255,0.07)',  border: 'rgba(147,197,253,0.20)', mx: 24, my: 20, dur: 10, delay: 0 },
  { id: 2, size: 220, left: '92%', top: '56%',  c1: 'rgba(199,215,248,0.26)', c2: 'rgba(147,197,253,0.09)', border: 'rgba(199,215,248,0.22)', mx: 28, my: 22, dur: 12, delay: 1.4 },
  { id: 3, size: 180, left: '44%', top: '-14%', c1: 'rgba(235,243,255,0.32)', c2: 'rgba(199,215,248,0.12)', border: 'rgba(235,243,255,0.28)', mx: 18, my: 12, dur: 11, delay: 2.8 },
];

/* ─── Glass Orb — sin backdropFilter, CSS float animation ───────────────────── */
function GlassOrb({ springX, springY, size, left, top, c1, c2, border, mx, my, dur, delay }) {
  const x = useTransform(springX, [-0.5, 0.5], [-mx, mx]);
  const y = useTransform(springY, [-0.5, 0.5], [-my, my]);
  return (
    <motion.div
      aria-hidden="true"
      animate={{ y: [0, -14, 0], scale: [1, 1.025, 1] }}
      transition={{
        y:     { duration: dur,       delay, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: dur * 1.2, delay: delay + 0.4, repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{
        position: 'absolute', left, top,
        width: size, height: size, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, ${c1} 0%, ${c2} 50%, transparent 82%)`,
        border: `1px solid ${border}`,
        pointerEvents: 'none',
        marginLeft: -size / 2, marginTop: -size / 2,
        x, y, willChange: 'transform',
      }}
    />
  );
}

/* ─── Counter — usa useMotionValue de Framer Motion (sin setState por frame) ── */
function Counter({ end, suffix = '+', delay = 0 }) {
  const ref        = useRef(null);
  const motionVal  = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!end) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const controls = animate(motionVal, end, {
        duration: 1.3,
        delay: delay / 1000,
        ease: [0, 0.4, 0.8, 1],
        onUpdate: (v) => setDisplay(Math.round(v)),
      });
      return controls.stop;
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, delay, motionVal]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {display}{suffix}
    </span>
  );
}

/* ─── Responsive hook — una única implementación compartible ─────────────────── */
function useBreakpoint(px) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= px : false
  );
  useEffect(() => {
    const mq      = window.matchMedia(`(max-width: ${px}px)`);
    const handler = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [px]);
  return matches;
}

/* ─── HeroSection ─────────────────────────────────────────────────────────────── */
export function HeroSection({ slides: apiSlides = [] }) {
  const carouselItems = (apiSlides.length > 0 ? apiSlides : FALLBACK_SLIDES).map(s =>
    s.image ? s : { image: s.src, alt: s.alt }
  );

  const isMobile = useBreakpoint(640);
  const isTablet = useBreakpoint(960);

  const sectionRef = useRef(null);
  const rectRef    = useRef(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const imgY     = useTransform(scrollYProgress, [0, 1], ['0px', '-48px']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0px', '-24px']);

  const mouseXMv = useMotionValue(0);
  const mouseYMv = useMotionValue(0);
  const springX  = useSpring(mouseXMv, { stiffness: 28, damping: 25, mass: 1 });
  const springY  = useSpring(mouseYMv, { stiffness: 28, damping: 25, mass: 1 });

  /* Cachear rect con ResizeObserver — evita getBoundingClientRect en cada mousemove */
  useEffect(() => {
    const update = () => { rectRef.current = sectionRef.current?.getBoundingClientRect() ?? null; };
    update();
    const ro = new ResizeObserver(update);
    if (sectionRef.current) ro.observe(sectionRef.current);
    return () => ro.disconnect();
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = rectRef.current;
    if (!rect) return;
    mouseXMv.set((e.clientX - rect.left) / rect.width  - 0.5);
    mouseYMv.set((e.clientY - rect.top)  / rect.height - 0.5);
  }, [mouseXMv, mouseYMv]);

  /* Stats leídas desde localStorage (ya sincronizadas por syncAll) — sin peticiones extra */
  const [stats] = useState(() => {
    const read = (key) => {
      try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; }
    };
    return [
      { icon: FileText, label: 'Manuales',             value: read('softlab_manuals')?.length       ?? 2, color: '#2563EB', bg: 'rgba(37,99,235,0.08)'  },
      { icon: Users,    label: 'Participantes activos', value: read('softlab_participants')?.length   ?? 8, color: '#1A3FAA', bg: 'rgba(26,63,170,0.08)'  },
      { icon: Calendar, label: 'Eventos',               value: read('softlab_events')?.length         ?? 4, color: '#4F7BE8', bg: 'rgba(79,123,232,0.08)' },
    ];
  });

  return (
    <section
      ref={sectionRef}
      aria-label="Biblioteca digital de capacitaciones Softlab"
      onMouseMove={handleMouseMove}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#ffffff',
        paddingTop: 64,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid sutil */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(99,140,255,0.022) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,140,255,0.022) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }} />

      {/* Glows atmosféricos */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-20%', right: '-12%',
        width: 'min(78vw, 840px)', height: 'min(78vw, 840px)', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,197,253,0.20) 0%, rgba(99,140,255,0.05) 42%, transparent 68%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-18%', left: '-8%',
        width: 'min(58vw, 640px)', height: 'min(58vw, 640px)', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(199,215,248,0.16) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Glass orbs — solo desktop, solo 3, sin backdropFilter */}
      {!isMobile && ORBS.map(orb => (
        <GlassOrb key={orb.id} {...orb} springX={springX} springY={springY} />
      ))}

      {/* Fade inferior */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, zIndex: 1,
        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))',
        pointerEvents: 'none',
      }} />

      {/* ── Layout ──────────────────────────────────────────────────────── */}
      <div
        className="hero-layout"
        style={{
          position: 'relative', zIndex: 2,
          maxWidth: 1200, margin: '0 auto', width: '100%',
          padding: isMobile
            ? '44px 20px 80px'
            : isTablet
              ? 'clamp(48px, 7vw, 72px) clamp(20px, 4vw, 40px) clamp(56px, 7vw, 80px)'
              : 'clamp(68px, 7.5vw, 100px) clamp(20px, 5vw, 48px)',
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '50% 50%',
          gap: isMobile ? '36px' : isTablet ? '44px' : 'clamp(40px, 4vw, 60px)',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >

        {/* ════ LEFT — Text content ════ */}
        <motion.div style={{ y: contentY, order: isTablet ? 1 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.2vw, 26px)' }}>

            {/* Pill */}
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.06, duration: 0.68, ease: EASE }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 16px 7px 8px', borderRadius: 999,
                border: '1px solid rgba(26,63,170,0.12)',
                background: 'rgba(239,246,255,0.92)',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#1D4ED8',
                fontFamily: 'DM Sans, sans-serif',
                boxShadow: '0 2px 12px rgba(26,63,170,0.07)',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #1A3FAA, #3B82F6)',
                }}>
                  <MapPin size={10} color="#fff" aria-hidden="true" />
                </span>
                Semillero · Uniautónoma del Cauca
              </span>
            </motion.div>

            {/* Heading */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.80, ease: EASE }}
                style={{
                  fontFamily: 'Syne, sans-serif', margin: 0,
                  fontSize: isMobile
                    ? 'clamp(28px, 8vw, 38px)'
                    : isTablet
                      ? 'clamp(36px, 5.5vw, 50px)'
                      : 'clamp(36px, 3.6vw, 50px)',
                  fontWeight: 800, lineHeight: 1.06, letterSpacing: '-1.8px',
                  color: '#0F172A',
                }}
              >
                Biblioteca{' '}
                <span style={{
                  background: 'linear-gradient(128deg, #1A3FAA 0%, #3B82F6 52%, #60A5FA 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Digital
                </span>
              </motion.h1>
              <motion.span
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.80, ease: EASE }}
                style={{
                  display: 'block', fontFamily: 'Syne, sans-serif',
                  fontSize: isMobile
                    ? 'clamp(28px, 8vw, 38px)'
                    : isTablet
                      ? 'clamp(36px, 5.5vw, 50px)'
                      : 'clamp(36px, 3.6vw, 50px)',
                  fontWeight: 800, lineHeight: 1.06, letterSpacing: '-1.8px',
                  color: '#0F172A',
                }}
              >
                de Capacitaciones
              </motion.span>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48, duration: 0.62, ease: EASE }}
              style={{
                fontSize: 'clamp(14px, 1.2vw, 16px)', lineHeight: 1.78,
                color: '#475569', maxWidth: 420, margin: 0,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Manuales técnicos documentados por el semillero{' '}
              <strong style={{ color: '#1D4ED8', fontWeight: 600 }}>Softlab</strong>{' '}
              de la Corporación Universitaria Autónoma del Cauca.
              Conocimiento estructurado, accesible y de libre uso.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.50, ease: EASE }}
              className="hero-ctas"
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <Link to="/manuales" style={{ textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 20px 44px rgba(26,63,170,0.30)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px 28px', width: isMobile ? '100%' : 'auto',
                    background: 'linear-gradient(135deg, #1A3FAA 0%, #2563EB 100%)',
                    color: '#fff', border: 'none', borderRadius: 14,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    boxShadow: '0 8px 28px rgba(26,63,170,0.24)',
                    transition: 'box-shadow 0.22s', whiteSpace: 'nowrap',
                  }}
                >
                  Explorar manuales <ArrowRight size={15} aria-hidden="true" />
                </motion.button>
              </Link>

              <Link to="/nosotros" style={{ textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                <motion.button
                  whileHover={{ y: -2, background: 'rgba(239,246,255,0.96)', borderColor: 'rgba(59,130,246,0.28)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px 24px', width: isMobile ? '100%' : 'auto',
                    background: 'rgba(248,250,255,0.94)',
                    color: '#1E3A8A',
                    border: '1.5px solid rgba(203,213,225,0.75)',
                    borderRadius: 14, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Users size={15} aria-hidden="true" /> Conocer el equipo
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.86, duration: 0.50 }}
              className="hero-stats"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: isMobile ? 8 : 12,
                paddingTop: isMobile ? 18 : 'clamp(18px, 2vw, 26px)',
                borderTop: '1px solid rgba(203,213,225,0.55)',
              }}
            >
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 8,
                      padding: isMobile ? '11px 10px' : '14px 16px',
                      borderRadius: 14,
                      backgroundColor: 'rgba(245,248,255,0.94)',
                      border: '1px solid rgba(226,232,240,0.75)',
                      boxShadow: '0 2px 10px rgba(100,120,200,0.05)',
                      cursor: 'default',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: s.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={13} color={s.color} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{
                        fontSize: isMobile ? 'clamp(17px, 5vw, 21px)' : 'clamp(19px, 2vw, 24px)',
                        fontWeight: 800, fontFamily: 'Syne, sans-serif',
                        color: '#0F172A', letterSpacing: '-0.5px', lineHeight: 1,
                      }}>
                        <Counter end={s.value} delay={i * 180} />
                      </div>
                      <div style={{
                        fontSize: isMobile ? 9 : 10, color: '#64748B',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                        marginTop: 4, letterSpacing: '0.01em', lineHeight: 1.3,
                      }}>
                        {s.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </motion.div>

        {/* ════ RIGHT — 3D Focus Carousel ════ */}
        <motion.div
          initial={{ opacity: 0, x: isTablet ? 0 : 36, y: isTablet ? 14 : 0, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ delay: 0.28, duration: 0.88, ease: EASE }}
          className="hero-visual"
          style={{
            y: imgY,
            order: isTablet ? 0 : 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: isMobile ? '100%' : isTablet ? 500 : 'none' }}>
            <FocusCarousel items={carouselItems} autoplay />
          </div>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: 26, left: '50%',
          transform: 'translateX(-50%)', zIndex: 3,
        }}
      >
        <div style={{
          width: 20, height: 32, borderRadius: 10,
          border: '1.5px solid rgba(26,63,170,0.18)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '5px 0 0',
          background: 'rgba(248,250,255,0.92)',
        }}>
          <motion.div
            animate={{ opacity: [1, 0, 1], y: [0, 10, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 4, height: 7, borderRadius: 2, background: 'rgba(26,63,170,0.36)' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
