import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Briefcase, GraduationCap, Tag, User, Star,
} from 'lucide-react';
import { directorsRepository } from '@/storage/localStorageRepository';
import { directivosApi } from '@/services/directivosApi';

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.44, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function parseList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return value.split('\n').map((s) => s.trim()).filter(Boolean);
  }
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function DirectorDetailPage() {
  const { id } = useParams();
  const [director, setDirector] = useState(
    () => directorsRepository.getAll().find((d) => String(d.id) === String(id)) ?? null,
  );
  const [loading, setLoading] = useState(!director);

  useEffect(() => {
    setLoading(true);
    directivosApi.getById(id)
      .then((data) => {
        const item = data?.id ? data : (data?.data?.id ? data.data : null);
        if (item) setDirector(item);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading && !director) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFF' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #1A3FAA', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      </div>
    );
  }

  if (!director) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFF', gap: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#374151', fontFamily: 'DM Sans, sans-serif' }}>Directivo no encontrado</p>
        <Link to="/nosotros" style={{ fontSize: 14, color: '#1A3FAA', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Volver a Nosotros
        </Link>
      </div>
    );
  }

  const accentColor = director.accent ?? '#1A3FAA';
  const bgColor     = director.bg ?? '#EEF3FF';
  const borderColor = director.border ?? director.borderColor ?? '#C7D5F8';
  const initials    = getInitials(director.name);
  const highlights  = parseList(director.highlights);
  const chips       = parseList(director.chips);

  return (
    <main id="main-content" style={{ minHeight: '100vh', background: '#F8FAFF', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Hero ── */}
      <div style={{
        background: `linear-gradient(145deg, ${bgColor} 0%, #fff 100%)`,
        borderBottom: `1px solid ${borderColor}`,
        padding: 'clamp(80px, 10vw, 112px) clamp(20px, 5vw, 48px) clamp(32px, 5vw, 48px)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          <Link to="/nosotros"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: accentColor, textDecoration: 'none', fontSize: 13, fontWeight: 500, marginBottom: 28, opacity: 0.85, transition: 'opacity .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; }}
          >
            <ArrowLeft size={15} /> Volver a Nosotros
          </Link>

          <motion.div
            initial="hidden" animate="visible"
            style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}
          >
            {/* Avatar */}
            <motion.div
              variants={fadeUp} custom={0}
              style={{
                width: 100, height: 100, borderRadius: 24, flexShrink: 0,
                background: bgColor, border: `3px solid ${borderColor}`,
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accentColor, fontSize: 34, fontWeight: 800,
                fontFamily: 'Syne, sans-serif',
                boxShadow: `0 8px 32px ${accentColor}22`,
              }}
            >
              {director.photo
                ? <img src={director.photo} alt={director.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </motion.div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {director.badge && (
                <motion.span
                  variants={fadeUp} custom={0}
                  style={{
                    display: 'inline-block', fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: accentColor, background: bgColor,
                    border: `1px solid ${borderColor}`,
                    padding: '3px 12px', borderRadius: 99, marginBottom: 10,
                  }}
                >
                  {director.badge}
                </motion.span>
              )}
              <motion.h1
                variants={fadeUp} custom={1}
                style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: '#0A0F1E', margin: '0 0 6px', fontFamily: 'Syne, sans-serif', lineHeight: 1.15 }}
              >
                {director.name}
              </motion.h1>
              {director.role && (
                <motion.p
                  variants={fadeUp} custom={2}
                  style={{ fontSize: 15, color: '#475569', margin: 0 }}
                >
                  {director.role}
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px clamp(20px, 5vw, 48px) 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>

          {/* Main column */}
          <motion.div
            initial="hidden" animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* Descripción */}
            {director.description && (
              <motion.div
                variants={fadeUp} custom={0}
                style={{ background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
              >
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0A0F1E', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={14} style={{ color: accentColor }} />
                  </span>
                  Acerca de
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: '#475569', margin: 0 }}>{director.description}</p>
              </motion.div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <motion.div
                variants={fadeUp} custom={1}
                style={{ background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
              >
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0A0F1E', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Star size={14} style={{ color: accentColor }} />
                  </span>
                  Destacados
                </h2>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {highlights.map((h, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, flexShrink: 0, marginTop: 6 }} />
                      <span style={{ fontSize: 14, color: '#475569', lineHeight: 1.65 }}>{h}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial="hidden" animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Info académica */}
            {(director.profession || director.faculty) && (
              <motion.div
                variants={fadeUp} custom={0}
                style={{ background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
              >
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>
                  Información
                </h3>
                {director.profession && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GraduationCap size={13} style={{ color: accentColor }} />
                    </span>
                    <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>{director.profession}</p>
                  </div>
                )}
                {director.faculty && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Briefcase size={13} style={{ color: accentColor }} />
                    </span>
                    <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>{director.faculty}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Áreas / Chips */}
            {chips.length > 0 && (
              <motion.div
                variants={fadeUp} custom={1}
                style={{ background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
              >
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag size={12} /> Áreas
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {chips.map((chip, i) => (
                    <span key={i} style={{
                      fontSize: 12, fontWeight: 500, color: accentColor,
                      background: bgColor, border: `1px solid ${borderColor}`,
                      padding: '4px 12px', borderRadius: 99,
                    }}>
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .director-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
