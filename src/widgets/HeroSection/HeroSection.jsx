import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users, FileText, Star, BookOpen, MapPin } from 'lucide-react';
import { manualsRepository } from '@/storage/localStorageRepository';

// ─── Imágenes reales del semillero ───────────────────────────
// Imágenes reales del semillero — new URL es más robusto con nombres/extensiones especiales
const foto1 = new URL('/src/assets/foto1semillero.png', import.meta.url).href;
const foto2 = new URL('/src/assets/foto2semillero.png', import.meta.url).href;
const foto3 = new URL('/src/assets/foto3semillero.png', import.meta.url).href;
const foto4 = new URL('/src/assets/foto4semillero.JPG', import.meta.url).href;
const foto5 = new URL('/src/assets/foto5semillero.JPG', import.meta.url).href;

const SLIDES = [foto1, foto2, foto3, foto4, foto5];

const EASE = [0.22, 1, 0.36, 1];

// ─── Counter animado ─────────────────────────────────────────
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
          const duration = 900;
          const tick = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(eased * end));
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

// ─── Carrusel de imágenes ─────────────────────────────────────
function ImageCarousel() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [direction, setDirection] = useState(1);

  const go = (idx) => {
    setDirection(idx > current ? 1 : -1);
    setPrev(current);
    setCurrent(idx);
  };

  useEffect(() => {
    const id = setInterval(() => {
      go((current + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(id);
  }, [current]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        aspectRatio: '4/3',
        background: '#f1f5f9',
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
            exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: EASE }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          draggable={false}
        />
      </AnimatePresence>

      {/* Overlay inferior con degradado */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          zIndex: 10,
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Ver foto ${i + 1}`}
            style={{
              height: 5,
              width: i === current ? 24 : 5,
              borderRadius: 999,
              border: 'none',
              background: i === current ? '#fff' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── HeroSection principal ────────────────────────────────────
export function HeroSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0px', '-50px']);

  const totalManuals = manualsRepository.getAll().length;

  const stats = [
    { icon: FileText, label: 'Manuales', value: totalManuals || 2 },
    { icon: Users, label: 'Investigadores', value: 6 },
    { icon: Star, label: 'Capacitaciones', value: 6 },
  ];

  return (
    <section
      ref={sectionRef}
      id="main-content"
      aria-label="Biblioteca digital de capacitaciones Softlab"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        paddingTop: 64,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Patrón de puntos sutil */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, #dde6f7 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Fade inferior */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: 'linear-gradient(to bottom, transparent, #fff)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
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
        className="hero-grid"
      >
        {/* ── COLUMNA IZQUIERDA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Pill institucional */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 14px',
                borderRadius: 999,
                border: '1px solid #c7d7f8',
                background: '#eef3ff',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#1A3FAA',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <MapPin size={11} aria-hidden="true" />
              Semillero · Uniautónoma del Cauca
            </span>
          </motion.div>

          {/* Título */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(34px, 4vw, 54px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-1.5px',
                color: '#0A0F1E',
                margin: 0,
              }}
            >
              Biblioteca{' '}
              <span style={{ color: '#1A3FAA' }}>Digital</span>
            </motion.h1>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.7, ease: EASE }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(34px, 4vw, 54px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-1.5px',
                color: '#0A0F1E',
                display: 'block',
              }}
            >
              de Capacitaciones
            </motion.span>
          </div>

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
            style={{
              fontSize: 15,
              lineHeight: 1.75,
              color: '#64748b',
              maxWidth: 420,
              margin: 0,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Manuales técnicos documentados por el semillero de investigación{' '}
            <strong style={{ color: '#374151', fontWeight: 600 }}>Softlab</strong>{' '}
            de la Corporación Universitaria Autónoma del Cauca. Conocimiento estructurado y accesible.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.78, duration: 0.5, ease: EASE }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}
          >
            <Link to="/manuales" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 24px',
                  background: '#1A3FAA',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,63,170,0.28)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Explorar manuales <ArrowRight size={15} />
              </button>
            </Link>

            <Link to="/nosotros" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 24px',
                  background: 'transparent',
                  color: '#1A3FAA',
                  border: '1.5px solid #1A3FAA',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eef3ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Users size={15} /> Conocer el equipo
              </button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            style={{
              display: 'flex',
              gap: 0,
              paddingTop: 20,
              borderTop: '1px solid #e5e7eb',
            }}
          >
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 28,
                    flex: 1,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
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
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && (
                    <div
                      style={{
                        width: 1,
                        height: 40,
                        background: '#e5e7eb',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ── COLUMNA DERECHA — Carrusel ── */}
        <motion.div
          className="hero-carousel"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
          style={{ y: imgY }}
        >
          <ImageCarousel />
        </motion.div>
      </div>

      {/* Indicador scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          zIndex: 3,
        }}
      >
        <div
          style={{
            width: 1,
            height: 36,
            background: 'linear-gradient(to bottom, transparent, rgba(26,63,170,0.35))',
          }}
        />
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'rgba(26,63,170,0.35)',
          }}
        />
      </motion.div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            padding: 48px 24px !important;
            gap: 36px !important;
          }
          .hero-carousel { display: none !important; }
        }
        @media (max-width: 480px) {
          .hero-grid { padding: 32px 20px !important; }
        }
      `}</style>
    </section>
  );
}