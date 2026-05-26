import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, ArrowRight, User } from 'lucide-react';
import { formatDate } from '@/shared/lib/formatDate';

const CATEGORY_PALETTE = {
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

function getCategoryPalette(cat) {
  return CATEGORY_PALETTE[cat] || CATEGORY_PALETTE.default;
}

const EASE = [0.22, 1, 0.36, 1];

/* ─── ManualCard ──────────────────────────────────────────────────── */
export function ManualCard({ manual, index = 0, speaker = null }) {
  const [imgError, setImgError] = useState(false);
  const coverSrc = manual.cover || manual.coverImage || null;
  const palette = getCategoryPalette(manual.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.52, delay: Math.min(index * 0.06, 0.42), ease: EASE }}
      style={{ height: '100%' }}
    >
      <Link
        to={`/manuales/${manual.id}`}
        style={{ textDecoration: 'none', display: 'block', height: '100%' }}
        aria-label={`Ver manual: ${manual.title}`}
      >
        {/* Variant propagation: parent "hover" state flows to all motion children */}
        <motion.div
          initial="rest"
          animate="rest"
          whileHover="hover"
          transition={{ duration: 0.28, ease: EASE }}
          variants={{
            rest: {
              y: 0,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 0 0 1.5px #F1F5F9',
            },
            hover: {
              y: -8,
              boxShadow: `0 24px 56px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.05), 0 0 0 1.5px ${palette.border}`,
            },
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#fff',
            borderRadius: 18,
            overflow: 'hidden',
            willChange: 'transform',
          }}
        >
          {/* ── Cover image ── */}
          <div
            style={{
              position: 'relative',
              height: 200,
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${palette.accent}18, ${palette.accent}30)`,
              flexShrink: 0,
            }}
          >
            {coverSrc && !imgError ? (
              <motion.img
                src={coverSrc}
                alt={manual.title}
                variants={{ rest: { scale: 1 }, hover: { scale: 1.07 } }}
                transition={{ duration: 0.6, ease: EASE }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={44} color={palette.accent} style={{ opacity: 0.3 }} aria-hidden="true" />
              </div>
            )}

            {/* Static base overlay */}
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(10,15,30,0.38) 0%, transparent 55%)',
              }}
            />

            {/* Deepens on hover for cinematic effect */}
            <motion.div
              variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(10,15,30,0.20) 0%, transparent 55%)',
              }}
            />

            {/* Category badge */}
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
              <span
                style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 999,
                  fontSize: 11, fontWeight: 700,
                  background: 'rgba(255,255,255,0.88)',
                  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                  color: palette.accent, border: '1px solid rgba(255,255,255,0.6)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.03em',
                }}
              >
                {manual.category}
              </span>
            </div>

            {/* PDF badge */}
            {manual.pdf && (
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <span
                  style={{
                    display: 'inline-block', padding: '3px 9px', borderRadius: 999,
                    fontSize: 10, fontWeight: 700,
                    background: 'rgba(21,128,61,0.9)', backdropFilter: 'blur(6px)',
                    color: '#fff', fontFamily: 'DM Sans, sans-serif',
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}
                >
                  PDF
                </span>
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '18px 20px 20px', flex: 1 }}>

            {/* Title — color flows from parent hover variant */}
            <motion.h3
              variants={{ rest: { color: '#0A0F1E' }, hover: { color: palette.accent } }}
              transition={{ duration: 0.22 }}
              style={{
                fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700,
                margin: 0, lineHeight: 1.3, letterSpacing: '-0.2px',
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}
            >
              {manual.title}
            </motion.h3>

            {/* Description */}
            {manual.description && (
              <p
                style={{
                  fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.65,
                  fontFamily: 'DM Sans, sans-serif',
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1,
                }}
              >
                {manual.description}
              </p>
            )}

            <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 4 }} />

            {/* Speaker */}
            {speaker && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontFamily: 'DM Sans, sans-serif' }}>
                <User size={12} color={palette.accent} aria-hidden="true" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {speaker.name}
                </span>
              </div>
            )}

            {/* Meta row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {manual.date && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
                  <Calendar size={12} aria-hidden="true" />
                  {formatDate(manual.date, { month: 'short' })}
                </span>
              )}
              {manual.duration && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
                  <Clock size={12} aria-hidden="true" />
                  {manual.duration}
                </span>
              )}
            </div>

            {/* CTA — arrow slides right on hover */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: palette.accent, fontFamily: 'DM Sans, sans-serif' }}>
              Ver manual
              <motion.span
                variants={{ rest: { x: 0 }, hover: { x: 5 } }}
                transition={{ duration: 0.22, ease: EASE }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <ArrowRight size={13} aria-hidden="true" />
              </motion.span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ─── ManualCardFeatured ──────────────────────────────────────────── */
export function ManualCardFeatured({ manual, speaker = null }) {
  const [imgError, setImgError] = useState(false);
  const coverSrc = manual.cover || manual.coverImage || null;
  const palette = getCategoryPalette(manual.category);

  return (
    <Link
      to={`/manuales/${manual.id}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      aria-label={`Ver manual: ${manual.title}`}
    >
      <motion.div
        initial="rest"
        animate="rest"
        whileHover="hover"
        transition={{ duration: 0.28, ease: EASE }}
        variants={{
          rest: {
            y: 0,
            boxShadow: '0 2px 16px rgba(0,0,0,0.05), 0 0 0 1.5px #F1F5F9',
          },
          hover: {
            y: -8,
            boxShadow: `0 28px 64px rgba(0,0,0,0.11), 0 4px 20px rgba(0,0,0,0.06), 0 0 0 1.5px ${palette.border}`,
          },
        }}
        style={{
          display: 'flex', flexDirection: 'column',
          height: '100%', background: '#fff',
          borderRadius: 18, overflow: 'hidden',
          willChange: 'transform',
        }}
      >
        {/* Image */}
        <div
          style={{
            position: 'relative', aspectRatio: '16/10', overflow: 'hidden',
            background: `linear-gradient(135deg, ${palette.accent}18, ${palette.accent}30)`,
            flexShrink: 0,
          }}
        >
          {coverSrc && !imgError ? (
            <motion.img
              src={coverSrc}
              alt={manual.title}
              variants={{ rest: { scale: 1 }, hover: { scale: 1.07 } }}
              transition={{ duration: 0.6, ease: EASE }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={48} color={palette.accent} style={{ opacity: 0.25 }} aria-hidden="true" />
            </div>
          )}

          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(10,15,30,0.30) 0%, transparent 60%)',
            }}
          />

          {/* Category badge */}
          <div style={{ position: 'absolute', top: 16, left: 16 }}>
            <span
              style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: 999,
                fontSize: 12, fontWeight: 700,
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                color: palette.accent, border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.02em',
              }}
            >
              {manual.category}
            </span>
          </div>

          {/* Featured badge */}
          {manual.featured && (
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <span
                style={{
                  display: 'inline-block', padding: '4px 14px', borderRadius: 999,
                  fontSize: 12, fontWeight: 700,
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                  color: '#92400e', fontFamily: 'DM Sans, sans-serif',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                ★ Destacado
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24, flex: 1 }}>
          <motion.h3
            variants={{ rest: { color: '#0A0F1E' }, hover: { color: palette.accent } }}
            transition={{ duration: 0.22 }}
            style={{
              fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700,
              margin: 0, lineHeight: 1.3, letterSpacing: '-0.3px',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}
          >
            {manual.title}
          </motion.h3>

          <p
            style={{
              fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.65,
              fontFamily: 'DM Sans, sans-serif',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1,
            }}
          >
            {manual.description}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
            {speaker && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={12} color={palette.accent} aria-hidden="true" />
                <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'DM Sans, sans-serif' }}>
                  {speaker.name}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {manual.date && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
                  <Calendar size={12} aria-hidden="true" />
                  {formatDate(manual.date, { month: 'short' })}
                </span>
              )}
              {manual.duration && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
                  <Clock size={12} aria-hidden="true" />
                  {manual.duration}
                </span>
              )}
            </div>
          </div>

          {/* CTA — arrow slides on hover */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: palette.accent, fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>
            Ver manual
            <motion.span
              variants={{ rest: { x: 0 }, hover: { x: 5 } }}
              transition={{ duration: 0.22, ease: EASE }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <ArrowRight size={13} aria-hidden="true" />
            </motion.span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
