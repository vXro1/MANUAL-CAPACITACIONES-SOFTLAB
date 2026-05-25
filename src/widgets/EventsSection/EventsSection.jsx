import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, Images, ArrowRight } from 'lucide-react';
import { eventsRepository } from '@/storage/localStorageRepository';
import { formatDate } from '@/shared/lib/formatDate';

const EASE = [0.22, 1, 0.36, 1];

const CATEGORY_STYLES = {
  'Divulgación Científica':  { bg: '#EEF3FF', color: '#1A3FAA' },
  'Salida Técnica':          { bg: '#ECFDF5', color: '#065F46' },
  'Movilidad Internacional': { bg: '#F3E8FF', color: '#6D28D9' },
  'Movilidad Nacional':      { bg: '#FFFBEB', color: '#92400E' },
};

function getCatStyle(cat) {
  return CATEGORY_STYLES[cat] ?? { bg: '#F1F5F9', color: '#475569' };
}

function EventCard({ event, index }) {
  const cat = getCatStyle(event.category);
  const gallery = event.gallery ?? [];
  const coverImg = event.coverImageId
    ? (gallery.find((g) => g.id === event.coverImageId) ?? gallery[0])
    : gallery[0];
  const cover = coverImg?.src ?? null;

  return (
    <Link to={`/eventos/${event.id}`} style={{ textDecoration: 'none' }}>
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: EASE }}
      style={{
        background: '#fff',
        borderRadius: 20,
        border: '1px solid #EEF2F8',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 12px rgba(26,63,170,0.05)',
        transition: 'transform 0.22s, box-shadow 0.22s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,63,170,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,63,170,0.05)';
      }}
    >
      {/* Cover image o placeholder */}
      <div
        style={{
          height: 160,
          background: cover ? 'transparent' : 'linear-gradient(135deg, #EEF3FF 0%, #F0F4FF 100%)',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CalendarDays size={40} color="#C7D5F8" strokeWidth={1.2} aria-hidden="true" />
          </div>
        )}

        {/* Category badge over image */}
        <span
          style={{
            position: 'absolute', top: 12, left: 12,
            fontSize: 10.5, fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            background: cat.bg, color: cat.color,
            padding: '4px 10px', borderRadius: 8,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {event.category}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <CalendarDays size={12} color="#94A3B8" aria-hidden="true" />
          <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
            {event.date ? formatDate(event.date, { month: 'long' }) : '—'}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 16, fontWeight: 700,
            color: '#0A0F1E', margin: 0,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.title}
        </h3>

        {/* Description */}
        {event.description && (
          <p
            style={{
              fontSize: 13, color: '#64748B', margin: 0,
              lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {event.description}
          </p>
        )}

        {/* Footer stats */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            paddingTop: 10, borderTop: '1px solid #F1F5F9', marginTop: 'auto',
          }}
        >
          {event.participantIds?.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
              <Users size={12} aria-hidden="true" />
              {event.participantIds.length} participante{event.participantIds.length !== 1 ? 's' : ''}
            </span>
          )}
          {event.gallery?.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
              <Images size={12} aria-hidden="true" />
              {event.gallery.length} foto{event.gallery.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </motion.article>
    </Link>
  );
}

export function EventsSection() {
  const events = eventsRepository.getAll()
    .filter((ev) => ev && ev.title)   // descartar entradas corruptas
    .slice(0, 3);

  if (events.length === 0) return null;

  return (
    <section
      aria-label="Eventos del semillero"
      style={{
        padding: '96px 0',
        background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="events-section-container">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'space-between', flexWrap: 'wrap',
            gap: 16, marginBottom: 48,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#1A3FAA',
                fontFamily: 'DM Sans, sans-serif',
                display: 'block', marginBottom: 8,
              }}
            >
              Actividades del semillero
            </span>
            <h2
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(24px, 3vw, 38px)',
                fontWeight: 800, letterSpacing: '-0.5px',
                color: '#0A0F1E', margin: 0, lineHeight: 1.15,
              }}
            >
              Eventos recientes
            </h2>
            <p
              style={{
                fontSize: 15, color: '#64748B', margin: '10px 0 0',
                fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6,
              }}
            >
              Capacitaciones, salidas técnicas y movilidades del semillero.
            </p>
          </div>

          <Link to="/eventos" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <motion.button
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(26,63,170,0.20)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '11px 22px',
                background: '#1A3FAA', color: '#fff',
                borderRadius: 12, border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                boxShadow: '0 4px 16px rgba(26,63,170,0.22)',
              }}
            >
              Ver todos los eventos <ArrowRight size={15} aria-hidden="true" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}
          className="events-grid"
        >
          {events.map((ev, i) => (
            <EventCard key={ev.id ?? i} event={ev} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
