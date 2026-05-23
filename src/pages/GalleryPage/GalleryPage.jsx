import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, Images, Search } from 'lucide-react';
import { galleryRepository } from '@/storage/localStorageRepository';

// ─── Utilidades ───────────────────────────────────────────────────────────────
function downloadImage(url, title) {
  fetch(url)
    .then(r => r.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (title || 'softlab').replace(/[^\w\s-]/g, '') || 'softlab';
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch(() => {
      const a = document.createElement('a');
      a.href = url;
      a.download = title || 'softlab';
      a.target = '_blank';
      a.click();
    });
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ photos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [imgLoaded, setImgLoaded] = useState(false);
  const count = photos.length;
  const thumbsRef = useRef(null);

  const go = useCallback((n) => {
    setImgLoaded(false);
    setCurrent(((n % count) + count) % count);
  }, [count]);

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

  // Scroll thumbnail into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const btn = thumbsRef.current.children[current];
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [current]);

  const photo = photos[current];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(3,7,18,0.98)',
        display: 'flex', flexDirection: 'column',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imagen"
    >
      {/* Header */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', flexShrink: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Images size={12} color="rgba(255,255,255,0.5)" />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif' }}>
              {current + 1} <span style={{ opacity: 0.4 }}>/</span> {count}
            </span>
          </div>
          {photo.title && (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {photo.title}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => downloadImage(photo.src, photo.title)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 9, background: '#1A3FAA', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Download size={14} /> Descargar
          </button>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 72px' }}
        onClick={e => e.stopPropagation()}
      >
        {!imgLoaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#fff', borderRadius: '50%', animation: 'lb-spin 0.7s linear infinite' }} />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={photo.src}
            alt={photo.title || `Imagen ${current + 1}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: imgLoaded ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onLoad={() => setImgLoaded(true)}
            style={{
              maxWidth: '100%', maxHeight: '100%',
              objectFit: 'contain', borderRadius: 10,
              boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
              userSelect: 'none',
            }}
            draggable={false}
          />
        </AnimatePresence>

        {/* Prev / Next */}
        {count > 1 && (
          <>
            {[
              { side: 'left',  delta: -1, icon: ChevronLeft,  label: 'Imagen anterior' },
              { side: 'right', delta: +1, icon: ChevronRight, label: 'Imagen siguiente' },
            ].map(({ side, delta, icon: Icon, label }) => (
              <button
                key={side}
                onClick={() => go(current + delta)}
                aria-label={label}
                style={{
                  position: 'absolute', [side]: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = `translateY(-50%) scale(1.08)`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
              >
                <Icon size={22} />
              </button>
            ))}
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {count > 1 && (
        <div
          ref={thumbsRef}
          onClick={e => e.stopPropagation()}
          style={{
            display: 'flex', gap: 6, padding: '10px 20px 14px',
            overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0,
            justifyContent: count <= 8 ? 'center' : 'flex-start',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
          }}
        >
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Ver imagen ${i + 1}`}
              style={{
                flexShrink: 0, width: 56, height: 40, borderRadius: 6,
                overflow: 'hidden', padding: 0, cursor: 'pointer',
                border: i === current ? '2px solid #fff' : '2px solid transparent',
                opacity: i === current ? 1 : 0.35,
                transition: 'all 0.2s',
                transform: i === current ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Card animada ─────────────────────────────────────────────────────────────
function GalleryCard({ photo, index, onOpen }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.52, delay: Math.min(index * 0.05, 0.38), ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpen(index)}
      role="button"
      tabIndex={0}
      aria-label={`Ver imagen ${index + 1}`}
      onKeyDown={e => e.key === 'Enter' && onOpen(index)}
      className="gp-card"
    >
      <img
        src={photo.src}
        alt={`Fotografía del semillero Softlab ${index + 1}`}
        loading="lazy"
        style={{ width: '100%', display: 'block', borderRadius: 14 }}
      />

      {/* Hover overlay — only action buttons, no caption text */}
      <div className="gp-overlay">
        <div className="gp-actions">
          <div className="gp-btn" aria-hidden="true">
            <ZoomIn size={18} color="#1A3FAA" strokeWidth={2.2} />
          </div>
          <div
            className="gp-btn gp-btn-dl"
            aria-hidden="true"
            onClick={e => { e.stopPropagation(); downloadImage(photo.src, photo.title); }}
          >
            <Download size={18} color="#1A3FAA" strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── GalleryPage ──────────────────────────────────────────────────────────────
export function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const all = galleryRepository.getAll();
    setPhotos(all.map(img => ({ src: img.src, title: img.title || '' })).filter(p => p.src));
  }, []);

  const filtered = search.trim()
    ? photos.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : photos;

  const count = filtered.length;

  // Determina número de columnas semántico para el hero
  const colLabel = count === 0 ? '' : count === 1 ? '1 imagen' : `${count} imágenes`;

  return (
    <main id="main-content" style={{ minHeight: '100vh', background: '#0B0F1A' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(80px,12vw,130px) clamp(20px,6vw,64px) clamp(56px,8vw,88px)', background: 'linear-gradient(145deg, #050913 0%, #0F1E55 55%, #1A3FAA 100%)' }}>

        {/* Patrón puntillado */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '26px 26px', pointerEvents: 'none' }} />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,140,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '10%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,63,170,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#93C5FD', marginBottom: 14, fontFamily: 'DM Sans, sans-serif' }}
          >
            Semillero Softlab
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.07 }}
            style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(36px,6vw,68px)', fontWeight: 700, color: '#fff', letterSpacing: '-2px', lineHeight: 1.08, margin: '0 0 18px' }}
          >
            Galería de<br />
            <span style={{ background: 'linear-gradient(90deg, #93C5FD 0%, #fff 60%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              momentos
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', margin: '0 0 32px', fontFamily: 'DM Sans, sans-serif', maxWidth: 480, lineHeight: 1.65 }}
          >
            Capacitaciones, sesiones de trabajo y momentos del equipo. Descarga las imágenes que quieras.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
          >
            {count > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <Images size={14} color="rgba(255,255,255,0.6)" />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{colLabel}</span>
              </div>
            )}

            {/* Búsqueda inline */}
            {count > 6 && (
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar imagen…"
                  style={{ paddingLeft: 34, paddingRight: 14, height: 38, borderRadius: 99, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', backdropFilter: 'blur(8px)', minWidth: 200 }}
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Galería ── */}
      <section style={{ padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,48px) clamp(64px,8vw,100px)', maxWidth: 1440, margin: '0 auto' }}>

        {/* Sin imágenes */}
        {count === 0 && photos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '100px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}
          >
            <div style={{ width: 80, height: 80, borderRadius: 22, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Images size={34} color="rgba(255,255,255,0.2)" />
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Aún no hay imágenes</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              El administrador del sitio aún no ha subido fotos a la galería.
            </p>
          </motion.div>
        )}

        {/* Sin resultados de búsqueda */}
        {count === 0 && photos.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans, sans-serif', fontSize: 15 }}>Sin resultados para "{search}"</p>
            <button onClick={() => setSearch('')} style={{ marginTop: 12, padding: '6px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
              Limpiar búsqueda
            </button>
          </motion.div>
        )}

        {/* Grid adaptivo por cantidad */}
        {count > 0 && (
          <div className={`gp-grid gp-grid-${count <= 2 ? 'few' : count <= 5 ? 'small' : count <= 12 ? 'medium' : 'large'}`}>
            {filtered.map((photo, i) => (
              <GalleryCard key={photo.src + i} photo={photo} index={i} onOpen={setLightboxIndex} />
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered.length > 0 && (
          <Lightbox
            photos={filtered}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>

    </main>
  );
}
