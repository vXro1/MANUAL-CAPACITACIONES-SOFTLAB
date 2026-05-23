import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Users, BookOpen, FlaskConical, Award, ArrowRight, Images } from 'lucide-react';
import { Link } from 'react-router-dom';
import { galleryRepository } from '@/storage/localStorageRepository';

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
    glowColor: '#10B981',
    iconBg: 'rgba(16,185,129,0.12)',
    iconBorder: 'rgba(16,185,129,0.22)',
    iconColor: '#6EE7B7',
    title: 'Aprende tecnologías emergentes',
    desc: 'Docker, Realidad Virtual, desarrollo de software y más. Siempre a la vanguardia del mercado.',
  },
  {
    icon: Users,
    glowColor: '#F59E0B',
    iconBg: 'rgba(245,158,11,0.12)',
    iconBorder: 'rgba(245,158,11,0.20)',
    iconColor: '#FCD34D',
    title: 'Crece con un equipo sólido',
    desc: 'Trabaja con docentes investigadores y compañeros apasionados. El aprendizaje colaborativo transforma carreras.',
  },
  {
    icon: Award,
    glowColor: '#A855F7',
    iconBg: 'rgba(168,85,247,0.12)',
    iconBorder: 'rgba(168,85,247,0.20)',
    iconColor: '#C4B5FD',
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
export function GallerySection() {
  const featuredMeta = galleryRepository.getFeatured().slice(0, 5);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (featuredMeta.length === 0) return null;

  const photos = featuredMeta
    .filter((img) => img.src)
    .map((img) => ({ src: img.src, alt: img.title || 'Foto del semillero' }));

  if (photos.length === 0) return null;

  const hasBigLayout = photos.length >= 2;

  return (
    <>
      <section
        aria-label="Galería del semillero"
        style={{
          padding: '100px 0',
          background: 'linear-gradient(180deg, #050913 0%, #080D1A 55%, #0B1222 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Atmospheric glows ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '10%', left: '2%',
            width: 700, height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,63,170,0.16) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '5%', right: '-8%',
            width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,123,232,0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }}
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
                textTransform: 'uppercase', color: '#93C5FD',
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
              <span style={{ color: '#fff' }}>¿Por qué hacer parte de{' '}</span>
              <span
                style={{
                  background: 'linear-gradient(90deg, #93C5FD 0%, #60A5FA 100%)',
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
              {hasBigLayout ? (
                <div
                  style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gridTemplateRows: 'auto auto', gap: 8 }}
                  className="photo-grid"
                >
                  {/* Large photo — spans 2 rows */}
                  <div
                    style={{ gridRow: '1 / 3', position: 'relative', cursor: 'pointer', borderRadius: 16, overflow: 'hidden', minHeight: 280 }}
                    onClick={() => setLightboxIndex(0)}
                    role="button"
                    tabIndex={0}
                    aria-label="Ver foto 1"
                    onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(0)}
                    className="photo-item"
                  >
                    <img
                      src={photos[0].src}
                      alt={photos[0].alt}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div
                      className="photo-overlay"
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'transparent',
                        transition: 'background 0.28s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 16,
                      }}
                    >
                      <div
                        className="zoom-btn"
                        style={{
                          width: 46, height: 46, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.10)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity 0.22s',
                        }}
                      >
                        <ZoomIn size={18} color="#fff" aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  {/* Smaller photos */}
                  {photos.slice(1).map((photo, i) => (
                    <div
                      key={i + 1}
                      style={{ position: 'relative', cursor: 'pointer', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3' }}
                      onClick={() => setLightboxIndex(i + 1)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver foto ${i + 2}`}
                      onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(i + 1)}
                      className="photo-item"
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <div
                        className="photo-overlay"
                        style={{
                          position: 'absolute', inset: 0,
                          background: 'transparent',
                          transition: 'background 0.28s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: 16,
                        }}
                      >
                        <div
                          className="zoom-btn"
                          style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.10)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.22)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: 0, transition: 'opacity 0.22s',
                          }}
                        >
                          <ZoomIn size={14} color="#fff" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{ position: 'relative', cursor: 'pointer', borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9' }}
                  onClick={() => setLightboxIndex(0)}
                  role="button"
                  tabIndex={0}
                  aria-label="Ver foto"
                  onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(0)}
                  className="photo-item"
                >
                  <img
                    src={photos[0].src}
                    alt={photos[0].alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    className="photo-overlay"
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'transparent',
                      transition: 'background 0.28s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 16,
                    }}
                  >
                    <div
                      className="zoom-btn"
                      style={{
                        width: 46, height: 46, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.10)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.22s',
                      }}
                    >
                      <ZoomIn size={18} color="#fff" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery footer link */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}
              >
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                  {photos.length} {photos.length === 1 ? 'momento' : 'momentos'} · Haz clic para ampliar
                </p>
                <Link
                  to="/galeria"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 600, color: '#93C5FD',
                    textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
                    transition: 'color 0.15s',
                  }}
                >
                  <Images size={13} aria-hidden="true" /> Ver galería completa
                </Link>
              </motion.div>
            </motion.div>

            {/* Reason cards — glass dark style */}
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
                      background: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(14px)',
                      WebkitBackdropFilter: 'blur(14px)',
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.07)',
                      cursor: 'default',
                      transition: 'background 0.22s, border-color 0.22s, transform 0.22s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.borderColor = `${reason.glowColor}30`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.transform = 'none';
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
                      <Icon size={20} color={reason.iconColor} aria-hidden="true" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          fontFamily: 'Syne, sans-serif',
                          fontSize: 14, fontWeight: 700,
                          color: '#e2e8f0',
                          margin: '0 0 5px',
                          letterSpacing: '-0.2px',
                        }}
                      >
                        {reason.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 13, color: 'rgba(255,255,255,0.35)',
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
