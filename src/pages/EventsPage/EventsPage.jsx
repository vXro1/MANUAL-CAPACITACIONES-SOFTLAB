import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Users, Images, Filter } from 'lucide-react';
import { eventosApi, categoriasEventosApi } from '@/services/apiService';
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

// ─── EventCard ────────────────────────────────────────────────────────────────
function EventCard({ event, index }) {
  const navigate = useNavigate();
  const catStyle = getCategoryStyle(event.category);
  const participantCount = (event.participantIds ?? []).length;
  const galleryCount = (event.gallery ?? []).length;
  const gallery = event.gallery ?? [];
  const coverImage = event.coverImageId
    ? (gallery.find((g) => g.id === event.coverImageId) ?? gallery[0])
    : gallery[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: E }}
      onClick={() => navigate(`/eventos/${event.id}`)}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalle: ${event.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/eventos/${event.id}`); } }}
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
      {/* Cover image */}
      {coverImage && (
        <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#F1F5F9' }}>
          <img
            src={coverImage.src}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* No-image placeholder */}
      {!coverImage && (
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
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Todos');

  useEffect(() => {
    let cancelled = false;
    Promise.all([eventosApi.getAll(), categoriasEventosApi.getAll()])
      .then(([evts, cats]) => {
        if (!cancelled) {
          setEvents(evts ?? []);
          setCategories((cats ?? []).map(c => c.nombre ?? c));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

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
        padding: 'clamp(64px, 10vw, 96px) clamp(20px, 5vw, 48px) clamp(48px, 8vw, 72px)',
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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>

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
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
