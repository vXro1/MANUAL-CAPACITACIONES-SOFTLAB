import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays, Users, Images, ArrowLeft,
  ChevronLeft, ChevronRight, X, ZoomIn, Briefcase,
} from 'lucide-react';
import { eventosApi, participantesApi } from '@/services/apiService';
import { directivosApi } from '@/services/directivosApi';
import { formatDate } from '@/shared/lib/formatDate';
import { toSlug } from '@/shared/lib/toSlug';

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
      if (e.key === 'ArrowLeft')  go(current - 1);
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

      <div aria-live="polite" style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
      }}>
        {current + 1} / {count}
      </div>

      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: E }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '88vw', maxHeight: '78vh', position: 'relative' }}
      >
        {!loaded && (
          <div style={{ width: 200, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 28, height: 28,
              border: '3px solid rgba(255,255,255,0.3)',
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

      {count > 1 && (
        <div style={{
          position: 'absolute', bottom: 20,
          display: 'flex', gap: 8, flexWrap: 'wrap',
          justifyContent: 'center', maxWidth: '80vw',
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
  );
}

// ─── EventDetailPage ──────────────────────────────────────────────────────────
export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [event, setEvent] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [allDirectors,   setAllDirectors]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setEvent(null);
    Promise.all([
      eventosApi.getById(id),
      participantesApi.getAll(),
      directivosApi.getAll().catch(() => []),
    ])
      .then(([ev, participants, directors]) => {
        if (!cancelled) {
          setEvent(ev ?? null);
          setAllParticipants(participants ?? []);
          setAllDirectors(Array.isArray(directors) ? directors : []);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Cargando evento...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main style={{
        minHeight: '100vh', background: '#F8FAFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <CalendarDays size={40} color="#CBD5E1" />
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#0A0F1E', margin: 0 }}>
          Evento no encontrado
        </p>
        <Link to="/eventos" style={{
          color: '#1A3FAA', fontSize: 14,
          fontFamily: 'DM Sans, sans-serif', textDecoration: 'none',
        }}>
          ← Volver a eventos
        </Link>
      </main>
    );
  }

  const catStyle  = getCategoryStyle(event.category);
  const gallery   = event.gallery ?? [];
  const coverImage = event.coverImageId
    ? (gallery.find((g) => String(g.id) === String(event.coverImageId)) ?? gallery[0])
    : gallery[0];

  // Directivos con su rol en el evento
  const eventDirectivos = (() => {
    const roles = event.directivoRoles ?? [];
    return roles
      .map((dr) => {
        const d = allDirectors.find((x) => String(x.id) === String(dr.directivo_id));
        return d ? { ...d, eventRole: dr.rol } : null;
      })
      .filter(Boolean);
  })();

  // Combinar datos del participante con su rol específico en este evento
  const eventParticipants = (() => {
    const roles = event.participantRoles ?? [];
    const ids   = event.participantIds   ?? [];

    if (roles.length > 0) {
      return roles
        .map((pr) => {
          const p = allParticipants.find((x) => String(x.id) === String(pr.participante_id));
          return p ? { ...p, eventRole: pr.rol } : null;
        })
        .filter(Boolean);
    }
    // Fallback: IDs sin rol
    return ids
      .map((pid) => {
        const p = allParticipants.find((x) => String(x.id) === String(pid));
        return p ? { ...p, eventRole: null } : null;
      })
      .filter(Boolean);
  })();

  return (
    <main id="main-content" style={{ minHeight: '100vh', background: '#F8FAFF', paddingBottom: 80 }}>

      {/* Back button */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 24px) 0' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10,
            border: '1px solid #E2E8F0', background: '#fff',
            color: '#475569', fontSize: 13, fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A3FAA'; e.currentTarget.style.color = '#1A3FAA'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Volver a eventos
        </button>
      </div>

      {/* Cover image */}
      {coverImage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: E }}
          style={{ maxWidth: 920, margin: '22px auto 0', padding: '0 clamp(16px, 4vw, 24px)' }}
        >
          <div className="event-detail-cover" style={{ borderRadius: 20, overflow: 'hidden', background: '#E2E8F0' }}>
            <img
              src={coverImage.src}
              alt={coverImage.title || event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: E }}
        style={{ maxWidth: 920, margin: '0 auto', padding: '32px clamp(16px, 4vw, 24px) 0' }}
      >
        {/* Category + Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{
            background: catStyle.bg, color: catStyle.color,
            fontSize: 11, fontWeight: 700, padding: '4px 12px',
            borderRadius: 99, fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {event.category}
          </span>
          {event.date && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 13, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif',
            }}>
              <CalendarDays size={14} aria-hidden="true" />
              {formatDate(event.date, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(24px, 4vw, 38px)',
          fontWeight: 800, color: '#0A0F1E',
          margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-0.5px',
        }}>
          {event.title}
        </h1>

        {/* Description */}
        {event.description && (
          <p style={{
            fontSize: 15, color: '#475569', lineHeight: 1.8,
            margin: '0 0 40px', fontFamily: 'DM Sans, sans-serif',
            whiteSpace: 'pre-wrap', maxWidth: 700,
          }}>
            {event.description}
          </p>
        )}

        {/* Directivos */}
        {eventDirectivos.length > 0 && (
          <section aria-label="Equipo directivo del evento" style={{ marginBottom: 44 }}>
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
              color: '#0A0F1E', margin: '0 0 16px',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <Briefcase size={15} color="#1A3FAA" aria-hidden="true" />
              Equipo directivo ({eventDirectivos.length})
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {eventDirectivos.map((d) => {
                const accentColor = d.accent ?? '#1A3FAA';
                const bgColor     = d.bg     ?? '#EEF3FF';
                const borderColor = d.border ?? '#C7D5F8';
                const initials    = d.initials ?? d.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                return (
                  <Link
                    key={d.id}
                    to={`/directivos/${d.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 16px 8px 8px', borderRadius: 99,
                      background: bgColor,
                      border: `1px solid ${borderColor}`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      textDecoration: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 2px 10px ${accentColor}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: `${accentColor}18`, border: `1.5px solid ${accentColor}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      {d.photo ? (
                        <img src={d.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: accentColor, fontFamily: 'Syne, sans-serif' }}>
                          {initials}
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0A0F1E', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                        {d.name}
                      </p>
                      <p style={{ fontSize: 11, color: accentColor, margin: 0, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Briefcase size={9} aria-hidden="true" />
                        {d.eventRole ?? d.role}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Participants */}
        {eventParticipants.length > 0 && (
          <section aria-label="Participantes del evento" style={{ marginBottom: 44 }}>
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
              color: '#0A0F1E', margin: '0 0 16px',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <Users size={15} color="#1A3FAA" aria-hidden="true" />
              Participantes ({eventParticipants.length})
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {eventParticipants.map((p, i) => {
                const colors = ['#1A3FAA', '#0369A1', '#059669', '#7C3AED', '#B45309'];
                const c = colors[i % colors.length];
                const initials = p.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                return (
                  <Link
                    key={p.id}
                    to={`/participantes/${toSlug(p.name)}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 16px 8px 8px', borderRadius: 99,
                      background: '#fff', border: '1px solid #E8EFFE',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      textDecoration: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#A5B8F8'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(26,63,170,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8EFFE'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: `${c}18`, border: `1.5px solid ${c}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      {p.photo ? (
                        <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: 'Syne, sans-serif' }}>
                          {initials}
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0A0F1E', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                        {p.name}
                      </p>
                      {(p.eventRole || p.role || p.career) && (
                        <p style={{ fontSize: 11, color: '#1A3FAA', margin: 0, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
                          {p.eventRole ? (
                            <><Briefcase size={9} aria-hidden="true" /> {p.eventRole}</>
                          ) : (
                            p.role || p.career
                          )}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section aria-label="Galería del evento">
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
              color: '#0A0F1E', margin: '0 0 16px',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <Images size={15} color="#1A3FAA" aria-hidden="true" />
              Galería ({gallery.length} {gallery.length === 1 ? 'imagen' : 'imágenes'})
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
              gap: 12,
            }}>
              {gallery.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Ver imagen: ${img.title || `Foto ${i + 1}`}`}
                  style={{
                    aspectRatio: '4/3', borderRadius: 14, overflow: 'hidden',
                    background: '#F1F5F9', border: 'none', padding: 0,
                    cursor: 'pointer', position: 'relative', display: 'block', width: '100%',
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.title || `Foto ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.28)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; }}
                  >
                    <ZoomIn size={22} color="#fff" aria-hidden="true" />
                  </div>
                  {img.id === event.coverImageId && (
                    <span style={{
                      position: 'absolute', top: 8, left: 8,
                      background: '#1A3FAA', color: '#fff',
                      fontSize: 9, fontWeight: 700, padding: '3px 8px',
                      borderRadius: 6, fontFamily: 'DM Sans, sans-serif',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      Portada
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </motion.div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={gallery}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </main>
  );
}
