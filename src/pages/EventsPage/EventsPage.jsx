import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Users, Images, X, ChevronLeft, ChevronRight,
  ZoomIn, Filter,
} from 'lucide-react';
import { eventsRepository, eventCategoriesRepository, participantsRepository } from '@/storage/localStorageRepository';
import { formatDate } from '@/shared/lib/formatDate';

const E = [0.22, 1, 0.36, 1];

const CATEGORY_STYLES = {
  'Divulgación Científica':  { bg: '#EEF3FF', color: '#1A3FAA' },
  'Salida Técnica':          { bg: '#ECFDF5', color: '#065F46' },
  'Movilidad Internacional': { bg: '#F3E8FF', color: '#6D28D9' },
  'Movilidad Nacional':      { bg: '#FFFBEB', color: '#92400E' },
};

function getCategoryStyle(cat) {
  return CATEGORY_STYLES[cat] ?? { bg: '#F1F5F9', color: '#475569' };
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ photos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [loaded, setLoaded] = useState(false);
  const count = photos.length;

  const go = useCallback((n) => {
    setLoaded(false);
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

  if (!count) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
        onClick={onClose}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Cerrar galería"
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.12)', border: 'none',
            borderRadius: 10, color: '#fff', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 2,
          }}
        >
          <X size={18} />
        </button>

        {/* Counter */}
        <div
          aria-live="polite"
          style={{
            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.6)', fontSize: 13,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {current + 1} / {count}
        </div>

        {/* Image */}
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22, ease: E }}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '88vw', maxHeight: '78vh', position: 'relative' }}
        >
          {!loaded && (
            <div style={{
              width: 200, height: 150, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'rgba(255,255,255,0.3)',
            }}>
              <div style={{
                width: 28, height: 28, border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
            </div>
          )}
          <img
            src={photos[current].src}
            alt={photos[current].title || `Foto ${current + 1}`}
            onLoad={() => setLoaded(true)}
            style={{
              maxWidth: '88vw', maxHeight: '78vh',
              objectFit: 'contain', borderRadius: 12,
              display: loaded ? 'block' : 'none',
              boxShadow: '0 8px 60px rgba(0,0,0,0.6)',
            }}
          />
          {photos[current].title && loaded && (
            <p style={{
              textAlign: 'center', marginTop: 10,
              color: 'rgba(255,255,255,0.6)', fontSize: 13,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              {photos[current].title}
            </p>
          )}
        </motion.div>

        {/* Prev / Next */}
        {count > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); go(current - 1); }}
              aria-label="Imagen anterior"
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10,
                color: '#fff', width: 44, height: 44, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(current + 1); }}
              aria-label="Imagen siguiente"
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10,
                color: '#fff', width: 44, height: 44, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Thumbnails */}
        {count > 1 && (
          <div style={{
            position: 'absolute', bottom: 20,
            display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
            maxWidth: '80vw',
          }}>
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={(e) => { e.stopPropagation(); go(i); }}
                aria-label={`Ir a imagen ${i + 1}`}
                style={{
                  width: 46, height: 34, borderRadius: 6, overflow: 'hidden',
                  border: `2px solid ${i === current ? '#fff' : 'transparent'}`,
                  opacity: i === current ? 1 : 0.5,
                  cursor: 'pointer', padding: 0, background: 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── EventDetailModal ─────────────────────────────────────────────────────────
function EventDetailModal({ event, participants, onClose }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const panelRef = useRef(null);
  const catStyle = getCategoryStyle(event.category);

  const eventParticipants = (event.participantIds ?? [])
    .map((id) => participants.find((p) => p.id === id))
    .filter(Boolean);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const first = panelRef.current?.querySelector('button, [href]');
    first?.focus();
  }, []);

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(10,15,30,0.75)',
            backdropFilter: 'blur(6px)',
          }}
        />

        {/* Panel */}
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.97, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 14 }}
          transition={{ duration: 0.25, ease: E }}
          style={{
            position: 'relative', background: '#fff', borderRadius: 20,
            width: '100%', maxWidth: 680,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Cerrar detalle del evento"
            style={{
              position: 'sticky', top: 16, float: 'right', marginRight: 16,
              background: 'rgba(255,255,255,0.9)', border: '1px solid #E2E8F0',
              borderRadius: 10, color: '#475569',
              width: 36, height: 36, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', zIndex: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ padding: '28px 28px 32px', clear: 'both' }}>
            {/* Category + Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{
                background: catStyle.bg, color: catStyle.color,
                fontSize: 11, fontWeight: 700, padding: '3px 10px',
                borderRadius: 99, fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                {event.category}
              </span>
              {event.date && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 12, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif',
                }}>
                  <CalendarDays size={13} aria-hidden="true" />
                  {formatDate(event.date, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700,
              color: '#0A0F1E', margin: '0 0 16px', lineHeight: 1.25,
            }}>
              {event.title}
            </h2>

            {/* Description */}
            {event.description && (
              <p style={{
                fontSize: 14, color: '#475569', lineHeight: 1.75,
                margin: '0 0 24px', fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'pre-wrap',
              }}>
                {event.description}
              </p>
            )}

            {/* Participants */}
            {eventParticipants.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{
                  fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700,
                  color: '#0A0F1E', margin: '0 0 12px',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Users size={14} color="#1A3FAA" aria-hidden="true" />
                  Participantes ({eventParticipants.length})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {eventParticipants.map((p, i) => {
                    const colors = ['#1A3FAA', '#0369A1', '#059669', '#7C3AED', '#B45309'];
                    const c = colors[i % colors.length];
                    const initials = p.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                    return (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 12px 6px 6px', borderRadius: 99,
                        background: '#F8FAFF', border: '1px solid #E8EFFE',
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: `${c}18`, border: `1.5px solid ${c}40`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', flexShrink: 0,
                        }}>
                          {p.photo ? (
                            <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 700, color: c, fontFamily: 'Syne, sans-serif' }}>
                              {initials}
                            </span>
                          )}
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#0A0F1E', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                            {p.name}
                          </p>
                          {(p.role || p.career) && (
                            <p style={{ fontSize: 10, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                              {p.role || p.career}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gallery */}
            {(event.gallery?.length ?? 0) > 0 && (
              <div>
                <h3 style={{
                  fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700,
                  color: '#0A0F1E', margin: '0 0 12px',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Images size={14} color="#1A3FAA" aria-hidden="true" />
                  Galería ({event.gallery.length} {event.gallery.length === 1 ? 'imagen' : 'imágenes'})
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 8,
                }}>
                  {event.gallery.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setLightboxIndex(i)}
                      aria-label={`Ver imagen: ${img.title || `Foto ${i + 1}`}`}
                      style={{
                        aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden',
                        background: '#F1F5F9', border: 'none', padding: 0,
                        cursor: 'pointer', position: 'relative',
                        display: 'block', width: '100%',
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.title || `Foto ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; }}
                      >
                        <ZoomIn size={20} color="#fff" style={{ opacity: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <Lightbox
            photos={event.gallery}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </div>
    </AnimatePresence>
  );
}

// ─── EventCard ────────────────────────────────────────────────────────────────
function EventCard({ event, participants, onOpen, index }) {
  const catStyle = getCategoryStyle(event.category);
  const participantCount = (event.participantIds ?? []).length;
  const galleryCount = (event.gallery ?? []).length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: E }}
      onClick={() => onOpen(event)}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalle: ${event.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(event); } }}
      style={{
        background: '#fff', borderRadius: 18,
        border: '1px solid #E8EFFE',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        cursor: 'pointer', overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,63,170,0.12)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Preview image if has gallery */}
      {galleryCount > 0 && (
        <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#F1F5F9' }}>
          <img
            src={event.gallery[0].src}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* No-image placeholder */}
      {galleryCount === 0 && (
        <div style={{
          aspectRatio: '16/9', background: `${catStyle.bg}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CalendarDays size={32} color={catStyle.color} style={{ opacity: 0.35 }} />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Category badge + date */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            background: catStyle.bg, color: catStyle.color,
            fontSize: 10, fontWeight: 700, padding: '3px 9px',
            borderRadius: 99, letterSpacing: '0.05em',
            textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif',
          }}>
            {event.category}
          </span>
          {event.date && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif',
            }}>
              <CalendarDays size={11} aria-hidden="true" />
              {formatDate(event.date, { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
          color: '#0A0F1E', margin: 0, lineHeight: 1.35,
        }}>
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p style={{
            fontSize: 13, color: '#64748B', lineHeight: 1.6,
            margin: 0, fontFamily: 'DM Sans, sans-serif',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            flex: 1,
          }}>
            {event.description}
          </p>
        )}

        {/* Footer chips */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {participantCount > 0 && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: '#64748B', fontFamily: 'DM Sans, sans-serif',
            }}>
              <Users size={12} aria-hidden="true" /> {participantCount} participante{participantCount !== 1 ? 's' : ''}
            </span>
          )}
          {galleryCount > 0 && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: '#64748B', fontFamily: 'DM Sans, sans-serif',
            }}>
              <Images size={12} aria-hidden="true" /> {galleryCount} foto{galleryCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── EventsPage ───────────────────────────────────────────────────────────────
export function EventsPage() {
  const [events] = useState(() => eventsRepository.getAll());
  const [categories] = useState(() => eventCategoriesRepository.getAll());
  const [participants] = useState(() => participantsRepository.getAll());
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filtered = activeCategory === 'Todos'
    ? events
    : events.filter((ev) => ev.category === activeCategory);

  const usedCategories = [...new Set(events.map((ev) => ev.category))];
  const tabs = ['Todos', ...categories.filter((c) => usedCategories.includes(c)), ...usedCategories.filter((c) => !categories.includes(c))];

  return (
    <main id="main-content" style={{ minHeight: '100vh', background: '#F8FAFF', paddingBottom: 80 }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #1A3FAA 100%)',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E }}
        >
          <p style={{
            fontSize: 11, fontWeight: 700, color: 'rgba(167,210,255,0.8)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 12, fontFamily: 'DM Sans, sans-serif',
          }}>
            Semillero Softlab
          </p>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 46px)',
            fontWeight: 800, color: '#fff', margin: '0 0 16px',
            letterSpacing: '-1px', lineHeight: 1.1,
          }}>
            Eventos del semillero
          </h1>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 520,
            margin: '0 auto', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.7,
          }}>
            Divulgación científica, movilidades, salidas técnicas y más actividades de nuestro equipo.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: E }}
          style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            padding: '28px 0 24px',
            alignItems: 'center',
          }}
          role="group"
          aria-label="Filtrar por categoría"
        >
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: '#94A3B8', marginRight: 4,
            fontFamily: 'DM Sans, sans-serif',
          }}>
            <Filter size={13} aria-hidden="true" /> Filtrar:
          </span>
          {tabs.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={active}
                style={{
                  padding: '7px 16px', borderRadius: 99, border: 'none',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                  transition: 'all 0.18s',
                  background: active ? '#1A3FAA' : '#fff',
                  color: active ? '#fff' : '#475569',
                  boxShadow: active
                    ? '0 4px 14px rgba(26,63,170,0.25)'
                    : '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </motion.div>

        {/* Count */}
        {events.length > 0 && (
          <p style={{
            fontSize: 12, color: '#94A3B8', marginBottom: 20,
            fontFamily: 'DM Sans, sans-serif',
          }}>
            {filtered.length} evento{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'Todos' ? ` en ${activeCategory}` : ''}
          </p>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '80px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 18, background: '#EEF3FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CalendarDays size={28} color="#1A3FAA" aria-hidden="true" />
            </div>
            <div>
              <p style={{
                fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700,
                color: '#0A0F1E', margin: '0 0 6px',
              }}>
                {activeCategory === 'Todos' ? 'Próximamente' : `Sin eventos en "${activeCategory}"`}
              </p>
              <p style={{
                fontSize: 13, color: '#94A3B8', margin: 0,
                fontFamily: 'DM Sans, sans-serif',
              }}>
                {activeCategory === 'Todos'
                  ? 'Los eventos del semillero aparecerán aquí una vez registrados.'
                  : 'Prueba con otra categoría.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Cards grid */}
        {filtered.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((ev, i) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  participants={participants}
                  onOpen={setSelectedEvent}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            participants={participants}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
