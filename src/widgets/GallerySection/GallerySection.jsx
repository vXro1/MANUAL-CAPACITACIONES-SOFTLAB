import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Users, BookOpen, FlaskConical, Award, ArrowRight, Images } from 'lucide-react';
import { Link } from 'react-router-dom';
import { galeriaApi } from '@/services/apiService';

const EASE = [0.22, 1, 0.36, 1];

const REASONS = [
  {
    icon: FlaskConical,
    glowColor: '#3B82F6',
    iconBg: 'rgba(59,130,246,0.12)',
    iconBorder: 'rgba(59,130,246,0.22)',
    iconColor: '#93C5FD',
    title: 'Investiga desde el primer día',
    desc: 'Desarrolla proyectos reales desde que eres estudiante. La investigación aquí es práctica, no teoría.',
  },
  {
    icon: BookOpen,
    glowColor: '#2563EB',
    iconBg: 'rgba(37,99,235,0.12)',
    iconBorder: 'rgba(37,99,235,0.22)',
    iconColor: '#BFDBFE',
    title: 'Aprende tecnologías emergentes',
    desc: 'Docker, Realidad Virtual, desarrollo de software y más. Siempre a la vanguardia del mercado.',
  },
  {
    icon: Users,
    glowColor: '#4F7BE8',
    iconBg: 'rgba(79,123,232,0.12)',
    iconBorder: 'rgba(79,123,232,0.20)',
    iconColor: '#C7D7F8',
    title: 'Crece con un equipo sólido',
    desc: 'Trabaja con docentes investigadores y compañeros apasionados. El aprendizaje colaborativo transforma carreras.',
  },
  {
    icon: Award,
    glowColor: '#1A3FAA',
    iconBg: 'rgba(26,63,170,0.12)',
    iconBorder: 'rgba(26,63,170,0.20)',
    iconColor: '#93C5FD',
    title: 'Construye tu hoja de vida',
    desc: 'Publica manuales, participa en capacitaciones y obtén experiencia comprobable que te diferencia.',
  },
];

// ─── Lightbox ─────────────────────────────────────────────────
function Lightbox({ photos, index, onClose }) {
  const [current, setCurrent] = useState(index);
  const count = photos.length;

  const go = useCallback((next) => setCurrent(((next % count) + count) % count), [count]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   go(current - 1);
      if (e.key === 'ArrowRight')  go(current + 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, go, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(3,7,18,0.97)',
        backdropFilter: 'blur(4px)',
        display: 'flex', flexDirection: 'column',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imagen"
    >
      {/* Header */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', flexShrink: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
          {current + 1} / {count}
        </span>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 9,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.65)',
            cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <X size={14} /> Cerrar
        </button>
      </div>

      {/* Image */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={photos[current].src}
            alt={photos[current].alt}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'contain',
            }}
            draggable={false}
          />
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              onClick={() => go(current - 1)}
              aria-label="Foto anterior"
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => go(current + 1)}
              aria-label="Foto siguiente"
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', gap: 8, padding: '12px 20px 16px',
          justifyContent: 'center', flexShrink: 0, overflowX: 'auto',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
        }}
      >
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Ver foto ${i + 1}`}
            style={{
              flexShrink: 0, width: 60, height: 42, borderRadius: 7,
              overflow: 'hidden', padding: 0, cursor: 'pointer',
              border: i === current ? '2px solid #fff' : '2px solid transparent',
              opacity: i === current ? 1 : 0.38,
              transition: 'all 0.2s',
            }}
          >
            <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── GallerySection ───────────────────────────────────────────
export function GallerySection({ photos: propPhotos = null }) {
  const [fallbackPhotos, setFallbackPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Only fetch from API when parent hasn't provided photos (propPhotos === null)
  useEffect(() => {
    if (propPhotos !== null) return;
    let cancelled = false;
    galeriaApi.getFeatured()
      .then(data => {
        if (!cancelled) {
          setFallbackPhotos(
            (data ?? [])
              .slice(0, 15)
              .filter(img => img.src)
              .map(img => ({ src: img.src, alt: img.title || 'Foto del semillero' }))
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [propPhotos]);

  const photos = propPhotos !== null ? propPhotos : fallbackPhotos;

  if (photos.length === 0) return null;

  // Show up to 9 in the grid; lightbox accesses all
  const VISIBLE = 9;
  const visiblePhotos = photos.slice(0, VISIBLE);
  const hiddenCount = Math.max(0, photos.length - VISIBLE);

  return (
    <>
      <section
        aria-label="Galería del semillero"
        style={{
          padding: 'clamp(56px, 9vw, 100px) 0',
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >

        <div
          style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px)', position: 'relative', zIndex: 1 }}
          className="gallery-container"
        >
          {/* ── Section header ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{ marginBottom: 56, display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <span
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#1A3FAA',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              El semillero en acción
            </span>
            <h2
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(26px, 3.2vw, 42px)',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                lineHeight: 1.12,
                margin: 0,
              }}
            >
              <span style={{ color: '#0A0F1E' }}>¿Por qué hacer parte de{' '}</span>
              <span
                style={{
                  background: 'linear-gradient(90deg, #1A3FAA 0%, #4F7BE8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Softlab?
              </span>
            </h2>
          </motion.div>

          {/* ── Main grid: photos left, reasons right ── */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}
            className="gallery-main-grid"
          >
            {/* Photos */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: EASE }}
            >
                {/* ── Bento photo grid (up to 9 photos) ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'auto',
                  gap: 7,
                }}
                className="photo-grid"
              >
                {visiblePhotos.map((photo, i) => {
                  const isLastVisible = i === visiblePhotos.length - 1;
                  const showOverlay = isLastVisible && hiddenCount > 0;

                  // First photo: spans 2 columns + 2 rows (large hero)
                  const isBigHero = i === 0 && visiblePhotos.length >= 3;
                  const gridStyle = isBigHero
                    ? { gridColumn: '1 / 3', gridRow: '1 / 3', minHeight: 200 }
                    : { aspectRatio: '1 / 1' };

                  return (
                    <div
                      key={i}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: 13,
                        overflow: 'hidden',
                        ...gridStyle,
                      }}
                      onClick={() => setLightboxIndex(i)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver foto ${i + 1}`}
                      onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(i)}
                      className="photo-item"
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                      />

                      {/* Normal hover overlay */}
                      {!showOverlay && (
                        <div
                          className="photo-overlay"
                          style={{
                            position: 'absolute', inset: 0,
                            background: 'transparent',
                            transition: 'background 0.28s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 13,
                          }}
                        >
                          <div
                            className="zoom-btn"
                            style={{
                              width: isBigHero ? 46 : 36, height: isBigHero ? 46 : 36,
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.10)',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255,255,255,0.25)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              opacity: 0, transition: 'opacity 0.22s',
                            }}
                          >
                            <ZoomIn size={isBigHero ? 18 : 14} color="#fff" aria-hidden="true" />
                          </div>
                        </div>
                      )}

                      {/* "+N más" overlay on last visible photo */}
                      {showOverlay && (
                        <div
                          style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(5,9,26,0.72)',
                            backdropFilter: 'blur(3px)',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            gap: 4, borderRadius: 13,
                            transition: 'background 0.25s',
                          }}
                          className="more-overlay"
                        >
                          <span style={{
                            fontFamily: 'Syne, sans-serif',
                            fontSize: 22, fontWeight: 800, color: '#fff',
                            lineHeight: 1,
                          }}>
                            +{hiddenCount}
                          </span>
                          <span style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 11, color: 'rgba(255,255,255,0.65)',
                            fontWeight: 500,
                          }}>
                            más fotos
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Gallery footer link */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}
              >
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                  {photos.length} {photos.length === 1 ? 'momento' : 'momentos'} · Haz clic para ampliar
                  {hiddenCount > 0 && (
                    <span style={{ color: '#1A3FAA', marginLeft: 4 }}>({hiddenCount} más en galería)</span>
                  )}
                </p>
                <Link
                  to="/galeria"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 600, color: '#1A3FAA',
                    textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
                    transition: 'color 0.15s',
                  }}
                >
                  <Images size={13} aria-hidden="true" /> Ver galería completa
                </Link>
              </motion.div>
            </motion.div>

            {/* Reason cards — light style */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {REASONS.map((reason, i) => {
                const Icon = reason.icon;
                return (
                  <motion.div
                    key={reason.title}
                    initial={{ opacity: 0, x: 28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.09, ease: EASE }}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: '18px 20px',
                      background: '#F8FAFC',
                      borderRadius: 16,
                      border: '1px solid #E2E8F0',
                      cursor: 'default',
                      transition: 'background 0.22s, border-color 0.22s, transform 0.22s, box-shadow 0.22s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#EEF3FF';
                      e.currentTarget.style.borderColor = '#C7D7F8';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,63,170,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: reason.iconBg,
                        border: `1px solid ${reason.iconBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} color={reason.glowColor} aria-hidden="true" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          fontFamily: 'Syne, sans-serif',
                          fontSize: 14, fontWeight: 700,
                          color: '#0A0F1E',
                          margin: '0 0 5px',
                          letterSpacing: '-0.2px',
                        }}
                      >
                        {reason.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 13, color: '#64748B',
                          margin: 0, lineHeight: 1.65,
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      >
                        {reason.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* CTA button */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, ease: EASE }}
                style={{ marginTop: 4 }}
              >
                <Link to="/nosotros" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ y: -2, boxShadow: '0 16px 40px rgba(26,63,170,0.38)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '13px 24px',
                      background: 'linear-gradient(135deg, #1A3FAA, #2553CC)',
                      color: '#fff',
                      borderRadius: 14,
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      boxShadow: '0 8px 28px rgba(26,63,170,0.30)',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    Conoce al equipo completo <ArrowRight size={15} aria-hidden="true" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && photos.length > 0 && (
          <Lightbox
            photos={photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
