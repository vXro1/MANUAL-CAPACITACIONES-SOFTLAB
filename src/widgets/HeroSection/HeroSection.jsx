import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { ArrowRight, Users, FileText, Star, MapPin } from 'lucide-react';
import { manualsRepository } from '@/storage/localStorageRepository';

const foto1 = new URL('/src/assets/foto1semillero.png', import.meta.url).href;
const foto2 = new URL('/src/assets/foto2semillero.png', import.meta.url).href;
const foto3 = new URL('/src/assets/foto3semillero.png', import.meta.url).href;
const foto4 = new URL('/src/assets/foto4semillero.JPG', import.meta.url).href;
const foto5 = new URL('/src/assets/foto5semillero.JPG', import.meta.url).href;

const SLIDES = [foto1, foto2, foto3, foto4, foto5];
const EASE = [0.22, 1, 0.36, 1];

// Glass orb config — each has gradient colors, border, glow, and parallax speed
const ORBS = [
  { id: 1, size: 520, left: '68%', top: '-8%',  c1: 'rgba(139,172,255,0.22)', c2: 'rgba(79,123,232,0.12)', border: 'rgba(147,197,253,0.20)', glow: '0 0 90px rgba(99,140,255,0.10)', mx: 22, my: 18, dur: 9,  delay: 0 },
  { id: 2, size: 340, left: '91%', top: '52%',  c1: 'rgba(99,140,255,0.18)',  c2: 'rgba(26,63,170,0.09)',  border: 'rgba(99,140,255,0.16)',  glow: '0 0 65px rgba(26,63,170,0.10)',  mx: 28, my: 24, dur: 11, delay: 1.2 },
  { id: 3, size: 265, left: '7%',  top: '74%',  c1: 'rgba(147,197,253,0.20)', c2: 'rgba(99,140,255,0.10)',  border: 'rgba(147,197,253,0.18)', glow: '0 0 55px rgba(99,140,255,0.08)',  mx: 16, my: 22, dur: 13, delay: 2.4 },
  { id: 4, size: 190, left: '1%',  top: '12%',  c1: 'rgba(99,140,255,0.16)',  c2: 'rgba(26,63,170,0.08)',  border: 'rgba(99,140,255,0.14)',  glow: '0 0 45px rgba(26,63,170,0.08)',  mx: 12, my: 15, dur: 8,  delay: 0.8 },
  { id: 5, size: 155, left: '54%', top: '91%',  c1: 'rgba(147,197,253,0.22)', c2: 'rgba(99,140,255,0.12)',  border: 'rgba(147,197,253,0.20)', glow: '0 0 35px rgba(99,140,255,0.09)',  mx: 30, my: 20, dur: 7,  delay: 1.8 },
  { id: 6, size: 230, left: '42%', top: '-12%', c1: 'rgba(199,215,248,0.32)', c2: 'rgba(147,197,253,0.16)', border: 'rgba(199,215,248,0.28)', glow: '0 0 55px rgba(99,140,255,0.06)',  mx: 20, my: 14, dur: 10, delay: 3.0 },
];

// Glass sphere — realistic translucent orb with shine highlight
function GlassOrb({ springX, springY, size, left, top, c1, c2, border, glow, mx, my, dur, delay }) {
  const x = useTransform(springX, [-0.5, 0.5], [-mx, mx]);
  const y = useTransform(springY, [-0.5, 0.5], [-my, my]);

  return (
    <motion.div
      aria-hidden="true"
      animate={{ y: [0, -16, 0], scale: [1, 1.032, 1] }}
      transition={{
        y:     { duration: dur,       delay, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: dur * 1.2, delay: delay + 0.5, repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{
        position: 'absolute',
        left, top,
        width: size, height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, ${c1} 0%, ${c2} 50%, transparent 82%)`,
        border: `1px solid ${border}`,
        boxShadow: `${glow}, inset 0 0 ${Math.round(size * 0.25)}px rgba(255,255,255,0.10)`,
        backdropFilter: 'blur(1.5px)',
        pointerEvents: 'none',
        marginLeft: -size / 2,
        marginTop: -size / 2,
        x, y,
        willChange: 'transform',
      }}
    >
      {/* Primary shine highlight */}
      <div
        style={{
          position: 'absolute',
          top: '11%', left: '17%',
          width: '38%', height: '24%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.62) 0%, transparent 80%)',
          transform: 'rotate(-22deg)',
          pointerEvents: 'none',
        }}
      />
      {/* Secondary rim light — opposite side */}
      <div
        style={{
          position: 'absolute',
          bottom: '14%', right: '12%',
          width: '22%', height: '14%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}

// ─── Animated counter ─────────────────────────────────────────
function Counter({ end, suffix = '+', delay = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = null;
          const tick = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / 900, 1);
            setCount(Math.round((1 - Math.pow(1 - p, 3)) * end));
            if (p < 1) requestAnimationFrame(tick);
          };
          setTimeout(() => requestAnimationFrame(tick), delay);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, delay]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {count}{suffix}
    </span>
  );
}

// ─── Glass-framed image carousel ─────────────────────────────
function ImageCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => { setDirection(1); return (c + 1) % SLIDES.length; });
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 28,
        padding: 10,
        border: '1px solid rgba(255,255,255,0.72)',
        boxShadow: '0 24px 80px rgba(26,63,170,0.13), 0 0 0 1px rgba(147,197,253,0.14)',
      }}
    >
      {/* Image viewport */}
      <div
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          aspectRatio: '4/3',
          position: 'relative',
          background: '#e8edf5',
        }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={current}
            src={SLIDES[current]}
            alt={`Semillero Softlab foto ${current + 1}`}
            custom={direction}
            variants={{
              enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit:  (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: EASE }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            draggable={false}
          />
        </AnimatePresence>

        {/* Bottom fade */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to top, rgba(0,0,0,0.26), transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* Dot indicators */}
        <div
          style={{
            position: 'absolute', bottom: 13, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', gap: 6, zIndex: 10,
          }}
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
              style={{
                height: 4,
                width: i === current ? 22 : 4,
                borderRadius: 999,
                border: 'none',
                background: i === current ? '#fff' : 'rgba(255,255,255,0.42)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Outer glow ring */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -2, left: -2, right: -2, bottom: -2,
          borderRadius: 30,
          background: 'linear-gradient(140deg, rgba(147,197,253,0.28) 0%, rgba(99,140,255,0.12) 40%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </div>
  );
}

// ─── HeroSection ─────────────────────────────────────────────
export function HeroSection() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const imgY     = useTransform(scrollYProgress, [0, 1], ['0px', '-55px']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0px', '-25px']);

  const mouseXMv = useMotionValue(0);
  const mouseYMv = useMotionValue(0);
  const springX = useSpring(mouseXMv, { stiffness: 30, damping: 26, mass: 1 });
  const springY = useSpring(mouseYMv, { stiffness: 30, damping: 26, mass: 1 });

  const handleMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseXMv.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseYMv.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseXMv, mouseYMv]);

  const totalManuals = manualsRepository.getAll().length;

  const stats = [
    { icon: FileText, label: 'Manuales',       value: totalManuals || 2 },
    { icon: Users,    label: 'Investigadores', value: 6 },
    { icon: Star,     label: 'Capacitaciones', value: 6 },
  ];

  return (
    <section
      ref={sectionRef}
      id="main-content"
      aria-label="Biblioteca digital de capacitaciones Softlab"
      onMouseMove={handleMouseMove}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(155deg, #EBF0FF 0%, #F3F7FF 28%, #F8FAFF 62%, #FFFFFF 100%)',
        paddingTop: 64,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Atmospheric ambient glows ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-25%', right: '-15%',
          width: 'min(80vw, 860px)',
          height: 'min(80vw, 860px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,140,255,0.09) 0%, rgba(26,63,170,0.04) 45%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-20%', left: '-10%',
          width: 'min(60vw, 660px)',
          height: 'min(60vw, 660px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147,197,253,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Glass orbs ── */}
      {ORBS.map((orb) => (
        <GlassOrb key={orb.id} {...orb} springX={springX} springY={springY} />
      ))}

      {/* ── Bottom fade-out ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 190,
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.94))',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Content grid ── */}
      <div
        className="hero-grid"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '64px 48px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
        }}
      >
        {/* Left column */}
        <motion.div style={{ y: contentY }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Institutional pill */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.72, ease: EASE }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 16px 6px 8px',
                  borderRadius: 999,
                  border: '1px solid rgba(26,63,170,0.14)',
                  background: 'rgba(238,243,255,0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#1A3FAA',
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: '0 2px 12px rgba(26,63,170,0.07)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1A3FAA, #4F7BE8)',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={10} color="#fff" aria-hidden="true" />
                </span>
                Semillero · Uniautónoma del Cauca
              </span>
            </motion.div>

            {/* Heading */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.8, ease: EASE }}
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 'clamp(36px, 4.2vw, 58px)',
                  fontWeight: 800,
                  lineHeight: 1.07,
                  letterSpacing: '-2px',
                  color: '#0A0F1E',
                  margin: 0,
                }}
              >
                Biblioteca{' '}
                <span
                  style={{
                    background: 'linear-gradient(130deg, #1A3FAA 0%, #4F7BE8 55%, #93C5FD 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Digital
                </span>
              </motion.h1>
              <motion.span
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.8, ease: EASE }}
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 'clamp(36px, 4.2vw, 58px)',
                  fontWeight: 800,
                  lineHeight: 1.07,
                  letterSpacing: '-2px',
                  color: '#0A0F1E',
                  display: 'block',
                }}
              >
                de Capacitaciones
              </motion.span>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.65, ease: EASE }}
              style={{
                fontSize: 15.5,
                lineHeight: 1.78,
                color: '#64748b',
                maxWidth: 428,
                margin: 0,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Manuales técnicos documentados por el semillero{' '}
              <strong style={{ color: '#1A3FAA', fontWeight: 600 }}>Softlab</strong>{' '}
              de la Corporación Universitaria Autónoma del Cauca. Conocimiento estructurado y accesible.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.70, duration: 0.5, ease: EASE }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}
            >
              <Link to="/manuales" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 18px 44px rgba(26,63,170,0.30)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 26px',
                    background: 'linear-gradient(135deg, #1A3FAA 0%, #2553CC 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    boxShadow: '0 8px 28px rgba(26,63,170,0.24)',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  Explorar manuales <ArrowRight size={15} aria-hidden="true" />
                </motion.button>
              </Link>

              <Link to="/nosotros" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 24px',
                    background: 'rgba(255,255,255,0.62)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    color: '#1A3FAA',
                    border: '1.5px solid rgba(26,63,170,0.18)',
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'background 0.2s',
                  }}
                >
                  <Users size={15} aria-hidden="true" /> Conocer el equipo
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.92, duration: 0.5 }}
              style={{
                display: 'flex',
                gap: 0,
                paddingTop: 24,
                borderTop: '1px solid rgba(226,232,240,0.7)',
              }}
            >
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 26,
                          fontWeight: 800,
                          fontFamily: 'Syne, sans-serif',
                          color: '#1A3FAA',
                          letterSpacing: '-1px',
                          lineHeight: 1.1,
                        }}
                      >
                        <Counter end={s.value} delay={i * 150} />
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#94a3b8',
                          marginTop: 3,
                          fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 500,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                    {i < stats.length - 1 && (
                      <div
                        aria-hidden="true"
                        style={{ width: 1, height: 36, background: 'rgba(226,232,240,0.8)', flexShrink: 0 }}
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* Right: glass-framed carousel */}
        <motion.div
          className="hero-carousel"
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.88, ease: EASE }}
          style={{ y: imgY }}
        >
          <ImageCarousel />
        </motion.div>
      </div>

      {/* ── Scroll mouse indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 0.6 }}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          zIndex: 3,
        }}
      >
        <motion.div
          style={{
            width: 20,
            height: 32,
            borderRadius: 10,
            border: '1.5px solid rgba(26,63,170,0.22)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '5px 0 0 0',
            background: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0, 1], y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 4, height: 7, borderRadius: 2, background: 'rgba(26,63,170,0.38)' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
