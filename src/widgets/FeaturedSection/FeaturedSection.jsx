import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { ArrowRight, ArrowLeft, BookOpen, Calendar, Clock, Star, FileText, ExternalLink } from 'lucide-react';
import { manualesApi } from '@/services/apiService';
import { formatDate } from '@/shared/lib/formatDate';
import { getCategoryPalette } from '@/shared/constants';

const EASE = [0.32, 0.72, 0, 1];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '6%' : '-6%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? '-6%' : '6%', opacity: 0 }),
};

/* ─── CarouselSlide ───────────────────────────────────────────────────── */
function CarouselSlide({ manual, palette }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const coverSrc = manual.cover || manual.coverImage || null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Background image layer */}
      {coverSrc && !imgError ? (
        <>
          <img
            src={coverSrc}
            alt=""
            aria-hidden="true"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: imgLoaded ? 0.18 : 0,
              transition: 'opacity 0.6s',
              filter: 'blur(2px)',
              transform: 'scale(1.06)',
            }}
          />
          {/* Dark vignette over bg */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(5,9,19,0.96) 0%, rgba(10,18,40,0.88) 60%, rgba(15,30,85,0.72) 100%)',
            pointerEvents: 'none',
          }} />
        </>
      ) : (
        /* Fallback gradient bg */
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, #05091A 0%, #0A1228 55%, ${palette.accent}22 100%)`,
        }} />
      )}

      {/* Accent glow orb */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-20%', right: '-5%',
        width: 480, height: 480, borderRadius: '50%',
        background: `radial-gradient(circle, ${palette.glow} 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-30%', left: '-10%',
        width: 360, height: 360, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(26,63,170,0.22) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      {/* Dot pattern */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }} />

      {/* Content grid */}
      <div
        className="carousel-slide-inner"
        style={{
          position: 'relative', zIndex: 1,
          display: 'grid', gridTemplateColumns: '55% 45%',
          height: '100%', gap: 0,
        }}
      >
        {/* ── Text column ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(28px, 5vw, 52px)',
          gap: 18,
        }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 12px', borderRadius: 999,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: `${palette.accent}22`,
              color: palette.light,
              border: `1px solid ${palette.accent}44`,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              <FileText size={9} aria-hidden="true" />
              {manual.category}
            </span>
            {manual.featured && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 999,
                fontSize: 10, fontWeight: 700,
                background: 'rgba(99,140,255,0.15)',
                color: '#93C5FD', border: '1px solid rgba(99,140,255,0.30)',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                <Star size={9} fill="#93C5FD" color="#93C5FD" aria-hidden="true" />
                Destacado
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(20px, 2.8vw, 32px)',
            fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.15,
            color: '#fff', margin: 0,
          }}>
            {manual.title}
          </h3>

          {/* Description */}
          {manual.description && (
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0,
              lineHeight: 1.75, fontFamily: 'DM Sans, sans-serif',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {manual.description}
            </p>
          )}

          {/* Meta chips */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {manual.date && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, color: 'rgba(255,255,255,0.35)',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                <Calendar size={12} color={palette.accent} aria-hidden="true" />
                {formatDate(manual.date, { month: 'short', year: 'numeric' })}
              </span>
            )}
            {manual.duration && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, color: 'rgba(255,255,255,0.35)',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                <Clock size={12} color={palette.accent} aria-hidden="true" />
                {manual.duration}
              </span>
            )}
          </div>

          {/* CTA */}
          <div>
            <motion.div
              whileHover={{ y: -1, opacity: 0.88 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'inline-block' }}
            >
              <Link
                to={`/manuales/${manual.id}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 22px', borderRadius: 12,
                  background: palette.accent,
                  color: '#05091A', textDecoration: 'none',
                  fontSize: 13, fontWeight: 700,
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: `0 8px 28px ${palette.glow}`,
                }}
              >
                Ver manual <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ── Cover image column ── */}
        <div
          className="carousel-image-side"
          style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 28px 28px 0' }}
        >
          {coverSrc && !imgError ? (
            <div style={{
              width: '100%', height: '100%', maxHeight: 320,
              borderRadius: 18, overflow: 'hidden',
              boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), 0 0 40px ${palette.glow}`,
              position: 'relative',
            }}>
              <img
                src={coverSrc}
                alt={manual.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={() => setImgError(true)}
                loading="lazy"
              />
              {/* Subtle overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(to bottom, transparent 60%, rgba(5,9,19,0.4) 100%)`,
                borderRadius: 18,
              }} />
            </div>
          ) : (
            <div style={{
              width: '80%', aspectRatio: '3/4',
              borderRadius: 18, overflow: 'hidden',
              background: `linear-gradient(135deg, ${palette.accent}18, ${palette.accent}35)`,
              border: `1px solid ${palette.accent}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 24px 64px rgba(0,0,0,0.4), 0 0 40px ${palette.glow}`,
            }}>
              <BookOpen size={64} color={palette.accent} style={{ opacity: 0.4 }} aria-hidden="true" />
            </div>
          )}

          {/* Glow ring behind image */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: '10%',
            borderRadius: 22,
            background: `radial-gradient(ellipse at center, ${palette.glow} 0%, transparent 70%)`,
            pointerEvents: 'none', zIndex: -1,
          }} />
        </div>
      </div>
    </div>
  );
}

/* ─── FeaturedSection ─────────────────────────────────────────────────── */
export function FeaturedSection() {
  const [manuals, setManuals] = useState([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    manualesApi.getAll()
      .then(data => {
        if (!cancelled) setManuals((data ?? []).slice(0, 6));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const current = manuals[index];

  const go = useCallback((newIndex, dir) => {
    setDirection(dir);
    setIndex(newIndex);
  }, []);

  const prev = useCallback(() => {
    go(index === 0 ? manuals.length - 1 : index - 1, -1);
  }, [index, manuals.length, go]);

  const next = useCallback(() => {
    go(index === manuals.length - 1 ? 0 : index + 1, 1);
  }, [index, manuals.length, go]);

  useEffect(() => {
    if (paused || manuals.length <= 1) return;
    const id = setTimeout(() => {
      setDirection(1);
      setIndex((i) => (i === manuals.length - 1 ? 0 : i + 1));
    }, 5500);
    return () => clearTimeout(id);
  }, [paused, manuals.length, index]);

  if (!manuals.length) return null;

  const palette = getCategoryPalette(current?.category);

  return (
    <section
      aria-label="Manuales recientes"
      style={{
        padding: 'clamp(56px, 8vw, 88px) 0',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >

      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px)', position: 'relative', zIndex: 1 }}
        className="featured-container"
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: 'clamp(20px, 3.5vw, 36px)',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#1A3FAA',
                marginBottom: 8, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Destacados
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(22px, 3vw, 36px)',
                fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1.12,
                color: '#0A0F1E', margin: 0,
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
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'inline-block' }}
            >
              <Link
                to="/manuales"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px',
                  background: 'rgba(238,243,255,0.92)',
                  color: '#1A3FAA',
                  border: '1.5px solid rgba(26,63,170,0.15)',
                  borderRadius: 12, fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
                  transition: 'background 0.2s, border-color 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                Ver todos <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Carousel frame ── */}
        <div
          style={{
            position: 'relative',
            borderRadius: 24,
            padding: 1,
            background: `linear-gradient(135deg, ${palette.accent}44 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.04) 100%)`,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.5), 0 0 60px ${palette.glow}`,
            transition: 'background 0.4s, box-shadow 0.4s',
          }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: 23,
              overflow: 'hidden',
              height: 'clamp(320px, 44vw, 420px)',
              background: '#060C1E',
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
                transition={{ duration: 0.42, ease: EASE }}
                style={{ position: 'absolute', inset: 0 }}
              >
                {current && <CarouselSlide manual={current} palette={palette} />}
              </motion.div>
            </AnimatePresence>

            {/* Arrows */}
            {manuals.length > 1 && (
              <>
                {[
                  { side: 'left',  action: prev, icon: ArrowLeft,  label: 'Manual anterior' },
                  { side: 'right', action: next, icon: ArrowRight, label: 'Manual siguiente' },
                ].map(({ side, action, icon: Icon, label }) => (
                  <motion.button
                    key={side}
                    onClick={action}
                    aria-label={label}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.16)' }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', [side]: 16, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10,
                    }}
                  >
                    <Icon size={16} aria-hidden="true" />
                  </motion.button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Dots ── */}
        {manuals.length > 1 && (
          <div
            style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}
            role="tablist"
            aria-label="Manuales del carrusel"
          >
            {manuals.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Ir a manual ${i + 1}`}
                onClick={() => go(i, i > index ? 1 : -1)}
                style={{
                  width: i === index ? 28 : 8,
                  height: 8, borderRadius: 999,
                  border: 'none', padding: 0, cursor: 'pointer',
                  background: i === index ? palette.accent : 'rgba(255,255,255,0.15)',
                  transition: 'width 0.3s, background 0.3s',
                  boxShadow: i === index ? `0 0 12px ${palette.glow}` : 'none',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
