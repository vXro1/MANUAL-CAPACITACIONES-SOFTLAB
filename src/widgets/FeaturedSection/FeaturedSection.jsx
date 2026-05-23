import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, BookOpen, Calendar, Clock, Star } from 'lucide-react';
import { manualsRepository } from '@/storage/localStorageRepository';
import { formatDate } from '@/shared/lib/formatDate';

const PALETTE = {
  'Realidad Virtual':       { bg: '#EEF3FF', accent: '#1A3FAA', border: '#C7D7F8' },
  'DevOps':                 { bg: '#FFF7ED', accent: '#C2410C', border: '#FED7AA' },
  'Control de Versiones':   { bg: '#F0FDF4', accent: '#15803D', border: '#BBF7D0' },
  'Desarrollo Frontend':    { bg: '#FDF4FF', accent: '#9333EA', border: '#E9D5FF' },
  'Desarrollo Backend':     { bg: '#FFF1F2', accent: '#E11D48', border: '#FECDD3' },
  'Bases de Datos':         { bg: '#F0F9FF', accent: '#0369A1', border: '#BAE6FD' },
  'Gestión de Proyectos':   { bg: '#FEFCE8', accent: '#CA8A04', border: '#FDE68A' },
  'Seguridad':              { bg: '#F8FAFC', accent: '#475569', border: '#CBD5E1' },
  'Inteligencia Artificial':{ bg: '#ECFDF5', accent: '#059669', border: '#A7F3D0' },
  default:                  { bg: '#F8FAFF', accent: '#1A3FAA', border: '#C7D7F8' },
};

function getPalette(cat) {
  return PALETTE[cat] || PALETTE.default;
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

function CarouselSlide({ manual, palette }) {
  const [imgError, setImgError] = useState(false);
  const coverSrc = manual.cover || manual.coverImage || null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '55% 45%',
        height: '100%',
        background: palette.bg,
      }}
      className="carousel-slide-inner"
    >
      {/* Text side */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(32px, 5vw, 56px)',
          gap: 20,
        }}
      >
        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              background: palette.accent + '18',
              color: palette.accent,
              border: `1.5px solid ${palette.border}`,
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {manual.category}
          </span>
          {manual.featured && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                background: '#FEFCE8',
                color: '#CA8A04',
                border: '1.5px solid #FDE68A',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <Star size={10} fill="#CA8A04" aria-hidden="true" /> Destacado
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(22px, 3vw, 34px)',
            fontWeight: 800,
            color: '#0A0F1E',
            margin: 0,
            lineHeight: 1.18,
            letterSpacing: '-0.5px',
          }}
        >
          {manual.title}
        </h3>

        {/* Description */}
        {manual.description && (
          <p
            style={{
              fontSize: 14,
              color: '#475569',
              margin: 0,
              lineHeight: 1.7,
              fontFamily: 'DM Sans, sans-serif',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {manual.description}
          </p>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {manual.date && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#64748b',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <Calendar size={13} color={palette.accent} aria-hidden="true" />
              {formatDate(manual.date, { month: 'short' })}
            </span>
          )}
          {manual.duration && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#64748b',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <Clock size={13} color={palette.accent} aria-hidden="true" />
              {manual.duration}
            </span>
          )}
        </div>

        {/* CTA */}
        <div>
          <Link
            to={`/manuales/${manual.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              borderRadius: 12,
              background: palette.accent,
              color: '#fff',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'opacity 0.2s, transform 0.2s',
              boxShadow: `0 4px 16px ${palette.accent}30`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
          >
            Ver manual <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Image side */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${palette.accent}22, ${palette.accent}44)`,
        }}
        className="carousel-image-side"
      >
        {coverSrc && !imgError ? (
          <img
            src={coverSrc}
            alt={manual.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen
              size={72}
              color={palette.accent}
              style={{ opacity: 0.25 }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function FeaturedSection() {
  const manuals = manualsRepository.getAll().slice(0, 6);

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const current = manuals[index];

  function go(newIndex, dir) {
    setDirection(dir);
    setIndex(newIndex);
  }

  function prev() {
    go(index === 0 ? manuals.length - 1 : index - 1, -1);
  }

  function next() {
    go(index === manuals.length - 1 ? 0 : index + 1, 1);
  }

  useEffect(() => {
    if (paused || manuals.length <= 1) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i === manuals.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, manuals.length, index]);

  if (!manuals.length) return null;

  const palette = getPalette(current?.category);

  return (
    <section
      aria-label="Manuales recientes"
      style={{
        padding: '96px 0',
        background: '#FAFBFF',
        borderTop: '1px solid rgba(226,232,240,0.6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle dot pattern */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, #dde6f7 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }}
        className="featured-container"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 40,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#1A3FAA',
                marginBottom: 8,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Destacados
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(22px, 3vw, 36px)',
                fontWeight: 800,
                color: '#0A0F1E',
                letterSpacing: '-0.6px',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Manuales recientes
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <Link
              to="/manuales"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.70)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#1A3FAA',
                border: '1.5px solid rgba(26,63,170,0.18)',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'background 0.2s, border-color 0.2s',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 12px rgba(26,63,170,0.07)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(238,243,255,0.90)';
                e.currentTarget.style.borderColor = 'rgba(26,63,170,0.30)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.70)';
                e.currentTarget.style.borderColor = 'rgba(26,63,170,0.18)';
              }}
            >
              Ver todos <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        {/* Carousel — glass-framed */}
        <div
          style={{
            position: 'relative',
            borderRadius: 22,
            padding: 6,
            background: 'rgba(255,255,255,0.60)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.80)',
            boxShadow: `0 2px 0 rgba(147,197,253,0.18), 0 16px 56px rgba(26,63,170,0.09)`,
          }}
        >
        <div
          style={{
            position: 'relative',
            borderRadius: 18,
            overflow: 'hidden',
            height: 420,
            border: `1px solid ${palette.border}`,
            transition: 'border-color 0.4s',
          }}
          className="carousel-wrapper"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <CarouselSlide manual={current} palette={palette} />
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next arrows */}
          {manuals.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Manual anterior"
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  border: `1px solid ${palette.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  transition: 'background 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
              >
                <ArrowLeft size={16} color={palette.accent} aria-hidden="true" />
              </button>

              <button
                onClick={next}
                aria-label="Manual siguiente"
                style={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  border: `1px solid ${palette.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  transition: 'background 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
              >
                <ArrowRight size={16} color={palette.accent} aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        </div>

        {/* Dots */}
        {manuals.length > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              marginTop: 20,
            }}
            role="tablist"
            aria-label="Diapositivas del carrusel"
          >
            {manuals.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Ir a manual ${i + 1}`}
                onClick={() => go(i, i > index ? 1 : -1)}
                style={{
                  width: i === index ? 24 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: 'none',
                  background: i === index ? palette.accent : '#CBD5E1',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'width 0.3s, background 0.3s',
                }}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
