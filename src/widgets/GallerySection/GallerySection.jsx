import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Users, BookOpen, FlaskConical, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const foto1 = new URL('/src/assets/foto1semillero.png', import.meta.url).href;
const foto2 = new URL('/src/assets/foto2semillero.png', import.meta.url).href;
const foto3 = new URL('/src/assets/foto3semillero.png', import.meta.url).href;
const foto4 = new URL('/src/assets/foto4semillero.JPG', import.meta.url).href;
const foto5 = new URL('/src/assets/foto5semillero.JPG', import.meta.url).href;

const PHOTOS = [
  { src: foto1, alt: 'Semillero Softlab — sesión de capacitación 1' },
  { src: foto2, alt: 'Semillero Softlab — sesión de capacitación 2' },
  { src: foto3, alt: 'Semillero Softlab — sesión de capacitación 3' },
  { src: foto4, alt: 'Semillero Softlab — sesión de capacitación 4' },
  { src: foto5, alt: 'Semillero Softlab — sesión de capacitación 5' },
];

const REASONS = [
  {
    icon: FlaskConical,
    color: '#EEF3FF',
    iconColor: '#1A3FAA',
    title: 'Investiga desde el primer día',
    desc: 'Desarrolla proyectos reales desde que eres estudiante. Aquí la investigación no es teoría — es práctica.',
  },
  {
    icon: BookOpen,
    color: '#F0FDF4',
    iconColor: '#166534',
    title: 'Aprende tecnologías emergentes',
    desc: 'Docker, Realidad Virtual, desarrollo de software y más. Siempre a la vanguardia de lo que el mercado necesita.',
  },
  {
    icon: Users,
    color: '#FFF7ED',
    iconColor: '#9A3412',
    title: 'Crece con un equipo sólido',
    desc: 'Trabaja junto a docentes investigadores y compañeros apasionados. El aprendizaje colaborativo transforma carreras.',
  },
  {
    icon: Award,
    color: '#FDF4FF',
    iconColor: '#7E22CE',
    title: 'Construye tu hoja de vida',
    desc: 'Publica manuales, participa en capacitaciones y obtén experiencia comprobable que te diferencia al graduarte.',
  },
];

// ─── Lightbox ─────────────────────────────────────────────────
function Lightbox({ index, onClose }) {
  const [current, setCurrent] = useState(index);
  const count = PHOTOS.length;

  const go = useCallback((next) => setCurrent(((next % count) + count) % count), [count]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(current - 1);
      if (e.key === 'ArrowRight') go(current + 1);
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
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.96)', display: 'flex', flexDirection: 'column' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{current + 1} / {count}</span>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 13 }}>
          <X size={14} /> Cerrar
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={PHOTOS[current].src}
            alt={PHOTOS[current].alt}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </AnimatePresence>
        <button onClick={() => go(current - 1)} aria-label="Foto anterior" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => go(current + 1)} aria-label="Foto siguiente" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={20} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '12px 20px', justifyContent: 'center', flexShrink: 0, overflowX: 'auto' }} onClick={e => e.stopPropagation()}>
        {PHOTOS.map((p, i) => (
          <button key={i} onClick={() => go(i)} aria-label={'Ver foto ' + (i + 1)} style={{ flexShrink: 0, width: 60, height: 42, borderRadius: 6, overflow: 'hidden', border: i === current ? '2px solid #fff' : '2px solid transparent', opacity: i === current ? 1 : 0.4, cursor: 'pointer', padding: 0, transition: 'all 0.2s' }}>
            <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── GallerySection ───────────────────────────────────────────
export function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  return (
    <>
      <section
        aria-label="Galería del semillero"
        style={{ padding: '88px 0', background: '#F8FAFC', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="gallery-container">

          {/* Encabezado de sección */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 48, display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1A3FAA', fontFamily: 'DM Sans, sans-serif' }}>
              El semillero en acción
            </span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: '#0A0F1E', letterSpacing: '-0.5px', lineHeight: 1.2, margin: 0 }}>
              ¿Por qué hacer parte de Softlab?
            </h2>
          </motion.div>

          {/* Layout principal: galería izquierda + razones derecha */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }} className="gallery-main-grid">

            {/* ── COLUMNA IZQUIERDA: Galería compacta ── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Grid de fotos 2x2 + foto grande */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gridTemplateRows: 'auto auto', gap: 6 }} className="photo-grid">

                {/* Foto 1 grande — ocupa 2 filas */}
                <div
                  style={{ gridRow: '1 / 3', position: 'relative', cursor: 'pointer', borderRadius: 14, overflow: 'hidden', minHeight: 280 }}
                  onClick={() => setLightboxIndex(0)}
                  role="button"
                  tabIndex={0}
                  aria-label="Ver foto 1"
                  onKeyDown={e => e.key === 'Enter' && setLightboxIndex(0)}
                  className="photo-item"
                >
                  <img src={PHOTOS[0].src} alt={PHOTOS[0].alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div className="photo-overlay" style={{ position: 'absolute', inset: 0, background: 'transparent', transition: 'background 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
                    <div className="zoom-btn" style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                      <ZoomIn size={16} color="#1A3FAA" />
                    </div>
                  </div>
                </div>

                {/* Fotos 2-5 */}
                {PHOTOS.slice(1).map((photo, i) => (
                  <div
                    key={i + 1}
                    style={{ position: 'relative', cursor: 'pointer', borderRadius: 14, overflow: 'hidden', aspectRatio: '4/3' }}
                    onClick={() => setLightboxIndex(i + 1)}
                    role="button"
                    tabIndex={0}
                    aria-label={'Ver foto ' + (i + 2)}
                    onKeyDown={e => e.key === 'Enter' && setLightboxIndex(i + 1)}
                    className="photo-item"
                  >
                    <img src={photo.src} alt={photo.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div className="photo-overlay" style={{ position: 'absolute', inset: 0, background: 'transparent', transition: 'background 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
                      <div className="zoom-btn" style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        <ZoomIn size={14} color="#1A3FAA" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contador de fotos */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                style={{ fontSize: 12, color: '#94a3b8', marginTop: 12, textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}
              >
                {PHOTOS.length} momentos del equipo · Haz clic para ampliar
              </motion.p>
            </motion.div>

            {/* ── COLUMNA DERECHA: Razones para unirse ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {REASONS.map((reason, i) => {
                const Icon = reason.icon;
                return (
                  <motion.div
                    key={reason.title}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: '20px 22px',
                      background: '#fff',
                      borderRadius: 14,
                      border: '1px solid #E5E7EB',
                      transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#C7D5F8';
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(26,63,170,0.08)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* Ícono */}
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: reason.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={reason.iconColor} />
                    </div>
                    {/* Texto */}
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: '0 0 6px', letterSpacing: '-0.2px' }}>
                        {reason.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>
                        {reason.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: 4 }}
              >
                <Link to="/nosotros" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '13px 24px',
                      background: '#1A3FAA', color: '#fff',
                      borderRadius: 12, border: 'none',
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(26,63,170,0.28)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    Conoce al equipo completo <ArrowRight size={15} />
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </AnimatePresence>

      <style>{`
        .photo-item:hover .photo-overlay { background: rgba(0,0,0,0.28) !important; }
        .photo-item:hover .zoom-btn { opacity: 1 !important; }
        @media (max-width: 900px) {
          .gallery-container { padding: 0 24px !important; }
          .gallery-main-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .photo-grid { grid-template-columns: 1fr 1fr !important; }
          .photo-grid > div:first-child { grid-row: auto !important; min-height: 200px !important; grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .gallery-container { padding: 0 20px !important; }
        }
      `}</style>
    </>
  );
}