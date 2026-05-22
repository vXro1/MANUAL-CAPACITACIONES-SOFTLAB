import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, BookOpen, ExternalLink } from 'lucide-react';
import { manualsRepository } from '@/storage/localStorageRepository';
import { formatDate } from '@/shared/lib/formatDate';
import { ManualCardFeatured } from '@/widgets/ManualCard/ManualCard';

const CATEGORY_COLORS = {
  'Realidad Virtual': { bg: '#eef3ff', color: '#1A3FAA', border: '#c7d7f8' },
  DevOps: { bg: '#fff7ed', color: '#92400e', border: '#fcd9a0' },
  Docker: { bg: '#fff7ed', color: '#92400e', border: '#fcd9a0' },
  default: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
};

function getCategoryStyle(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
}

function ManualRow({ manual, index }) {
  const style = getCategoryStyle(manual.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to={`/manuales/${manual.id}`}
        style={{ textDecoration: 'none' }}
        aria-label={`Ver manual: ${manual.title}`}
      >
        <div
          className="manual-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 16,
            padding: '24px 28px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            alignItems: 'center',
            transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#1A3FAA';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 32px rgba(26,63,170,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
            {/* Badge categoría */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  background: style.bg,
                  color: style.color,
                  border: `1px solid ${style.border}`,
                  fontFamily: 'DM Sans, sans-serif',
                  letterSpacing: '0.03em',
                }}
              >
                {manual.category}
              </span>
              {manual.featured && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    background: '#fefce8',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  ★ Destacado
                </span>
              )}
            </div>

            {/* Título */}
            <h3
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 17,
                fontWeight: 700,
                color: '#0A0F1E',
                margin: 0,
                lineHeight: 1.3,
                letterSpacing: '-0.3px',
              }}
            >
              {manual.title}
            </h3>

            {/* Descripción */}
            {manual.description && (
              <p
                style={{
                  fontSize: 13,
                  color: '#64748b',
                  margin: 0,
                  lineHeight: 1.65,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {manual.description}
              </p>
            )}

            {/* Meta */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              {manual.date && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: '#94a3b8',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <Calendar size={12} aria-hidden="true" />
                  {formatDate(manual.date)}
                </span>
              )}
              {manual.duration && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: '#94a3b8',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <Clock size={12} aria-hidden="true" />
                  {manual.duration}
                </span>
              )}
            </div>
          </div>

          {/* Icono derecho */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#eef3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <ExternalLink size={16} color="#1A3FAA" aria-hidden="true" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function FeaturedSection() {
  const featured = manualsRepository.getFeatured?.()?.slice(0, 4)
    ?? manualsRepository.getAll().slice(0, 4);

  if (!featured.length) return null;

  return (
    <section
      aria-label="Manuales destacados"
      style={{ padding: '80px 0', background: '#fff' }}
    >
      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}
        className="featured-container"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 40,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#1A3FAA',
                marginBottom: 8,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Destacados
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(22px, 3vw, 34px)',
                fontWeight: 700,
                color: '#0A0F1E',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Manuales más recientes
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 14,
                color: '#64748b',
                marginTop: 8,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Las capacitaciones más relevantes documentadas por el equipo Softlab.
            </motion.p>
          </div>

          <Link to="/manuales" style={{ textDecoration: 'none' }}>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'transparent',
                color: '#1A3FAA',
                border: '1.5px solid #1A3FAA',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'background 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#eef3ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Ver todos <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        {/* Grid 2 columnas */}
        <div
          className="featured-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 24,
          }}
        >
          {featured.map((manual, i) => (
            <motion.div
              key={manual.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{ height: '100%' }}
            >
              <ManualCardFeatured manual={manual} />
            </motion.div>
          ))}
        </div>

        {/* Enlace secundario */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginTop: 36 }}
        >
          <Link
            to="/manuales"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#1A3FAA',
              textDecoration: 'none',
              fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <BookOpen size={14} /> Ver la biblioteca completa
          </Link>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .featured-container { padding: 0 20px !important; }
          .featured-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}