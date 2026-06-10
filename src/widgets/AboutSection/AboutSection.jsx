import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { directivosApi } from '@/services/directivosApi';
import { ArrowRight, BookOpen, Zap, Shield, GraduationCap, ArrowUpRight } from 'lucide-react';
const EASE = [0.22, 1, 0.36, 1];

const DEFAULT_DIRECTORS = [
  {
    id: 'default-1',
    initials: 'ZL',
    name: 'Zulema León',
    role: 'Directora del curso · Semillero de investigación',
    badge: 'Directora',
    accent: '#1A3FAA',
    bg: '#eef3ff',
    borderColor: '#c7d7f8',
    description: 'Directora del curso y del Semillero de Investigación Softlab. Lidera la línea de documentación técnica y la gestión del conocimiento generado por los investigadores.',
    chips: ['Ingeniería de Sistemas', 'Gestión de proyectos', 'Documentación técnica'],
  },
  {
    id: 'default-2',
    initials: 'AM',
    name: 'Ana María',
    role: 'Docente del semillero',
    badge: 'Docente',
    accent: '#166534',
    bg: '#f0fdf4',
    borderColor: '#bbf7d0',
    description: 'Acompaña los procesos formativos de los estudiantes investigadores, orientando el desarrollo de competencias en programación y diseño de software.',
    chips: ['Facultad de Ingeniería', 'Desarrollo de software', 'Pedagogía activa'],
  },
  {
    id: 'default-3',
    initials: 'AG',
    name: 'Ana Gabriela',
    role: 'Directora del Semillero',
    badge: 'Directora',
    accent: '#92400e',
    bg: '#fef3c7',
    borderColor: '#fde68a',
    description: 'Co-directora del Semillero Softlab. Coordina las capacitaciones, supervisa los proyectos de investigación estudiantil y vincula al semillero con la comunidad académica regional.',
    chips: ['Ingeniería de Sistemas', 'Coordinación académica', 'Investigación aplicada'],
  },
];

const PILLARS = [
  {
    icon: BookOpen,
    title: 'Documentación técnica',
    desc: 'Generamos manuales de usuario detallados a partir de las capacitaciones realizadas por el equipo investigador.',
    accent: '#2563EB',
    glow: 'rgba(37,99,235,0.18)',
    border: 'rgba(37,99,235,0.22)',
    iconBg: 'rgba(37,99,235,0.10)',
    tag: 'Manuales',
  },
  {
    icon: GraduationCap,
    title: 'Formación investigativa',
    desc: 'Fomentamos el pensamiento crítico y la cultura investigativa entre estudiantes de ingeniería de software.',
    accent: '#059669',
    glow: 'rgba(5,150,105,0.18)',
    border: 'rgba(5,150,105,0.22)',
    iconBg: 'rgba(5,150,105,0.10)',
    tag: 'Educación',
  },
  {
    icon: Zap,
    title: 'Innovación académica',
    desc: 'Exploramos tecnologías emergentes como Realidad Virtual, DevOps, contenedores y más.',
    accent: '#7C3AED',
    glow: 'rgba(124,58,237,0.18)',
    border: 'rgba(124,58,237,0.22)',
    iconBg: 'rgba(124,58,237,0.10)',
    tag: 'Tecnología',
  },
];

// ─── DirectorCard ─────────────────────────────────────────────────────────────
function DirectorCard({ person, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const borderColor = person.borderColor ?? person.border ?? '#c7d7f8';
  const accentColor = person.accent || '#1A3FAA';

  return (
    <Link
      to={`/directivos/${person.id}`}
      style={{ textDecoration: 'none', display: 'flex', flex: 1, minWidth: 0 }}
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.62, delay: index * 0.14, ease: EASE }}
        whileHover={{
          y: -7,
          boxShadow: `0 28px 64px rgba(0,0,0,0.13), 0 0 0 1.5px ${borderColor}`,
        }}
        style={{
          width: '100%',
          borderRadius: 22, overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05), 0 0 0 1px rgba(241,245,249,1)',
          display: 'flex', flexDirection: 'column',
          transition: 'box-shadow 0.3s',
          willChange: 'transform',
          cursor: 'pointer',
        }}
      >
        {/* Colored header */}
        <div style={{
          background: `linear-gradient(140deg, ${person.bg || '#EEF3FF'} 0%, #fff 100%)`,
          padding: '36px 28px 24px',
          position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 3,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            borderRadius: '0 0 4px 4px',
          }} />

          {person.badge && (
            <div style={{
              position: 'absolute', top: 18, right: 18,
              padding: '4px 12px', borderRadius: 999,
              fontSize: 10, fontWeight: 700,
              background: '#fff',
              color: accentColor,
              border: `1px solid ${borderColor}`,
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {person.badge}
            </div>
          )}

          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            fontSize: 24, fontWeight: 800, color: '#fff',
            fontFamily: 'Syne, sans-serif',
            border: '4px solid #fff',
            boxShadow: `0 8px 28px ${accentColor}35`,
          }}>
            {person.photo
              ? <img src={person.photo} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (person.initials || (person.name ?? '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase())
            }
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700,
              color: '#0A0F1E', margin: 0, letterSpacing: '-0.3px',
            }}>
              {person.name}
            </p>
            <p style={{
              fontSize: 12, color: accentColor,
              margin: '5px 0 0', fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
              lineHeight: 1.45,
            }}>
              {person.role}
            </p>
            {person.profession && (
              <p style={{ fontSize: 11, color: '#94A3B8', margin: '3px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                {person.profession}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px 18px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.78, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            {person.description || person.desc || ''}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
            {(person.chips ?? []).map((chip) => (
              <span
                key={chip}
                style={{
                  padding: '4px 10px', borderRadius: 999,
                  fontSize: 11, fontWeight: 500,
                  background: person.bg || '#EEF3FF',
                  color: accentColor,
                  border: `1px solid ${borderColor}`,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Footer: Ver perfil */}
        <div style={{
          padding: '12px 24px',
          borderTop: `1px solid ${borderColor}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: `${person.bg || '#EEF3FF'}55`,
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: accentColor, fontFamily: 'DM Sans, sans-serif' }}>
            Ver perfil completo
          </span>
          <span style={{
            width: 26, height: 26, borderRadius: 8,
            background: accentColor, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ArrowUpRight size={13} />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── AboutSection ─────────────────────────────────────────────────────────────
// showDirectors  → muestra la sección de directivos
// featuredOnly   → true = solo destacados (Home), false/omitido = todos (Nosotros)
export function AboutSection({ showDirectors = false, featuredOnly = false }) {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-80px' });

  const [featuredDirectors, setFeaturedDirectors] = useState([]);
  const [loadingDirectors, setLoadingDirectors] = useState(true);

  useEffect(() => {
    if (!showDirectors) { setLoadingDirectors(false); return; }
    let cancelled = false;

    (async () => {
      try {
        const data = featuredOnly
          ? await directivosApi.getFeatured()
          : await directivosApi.getAll();

        if (!cancelled) {
          setFeaturedDirectors(data.length > 0 ? data : DEFAULT_DIRECTORS);
        }
      } catch {
        try {
          const cached = JSON.parse(localStorage.getItem('softlab_directors') ?? '[]');
          // En caché también respeta featuredOnly
          const filtered = featuredOnly ? cached.filter((d) => d.featured) : cached;
          if (!cancelled) {
            setFeaturedDirectors(filtered.length > 0 ? filtered : DEFAULT_DIRECTORS);
          }
        } catch {
          if (!cancelled) setFeaturedDirectors(DEFAULT_DIRECTORS);
        }
      } finally {
        if (!cancelled) setLoadingDirectors(false);
      }
    })();

    return () => { cancelled = true; };
  }, [showDirectors, featuredOnly]);

  const directorsToShow = featuredDirectors;

  return (
    <section
      aria-label="Sobre el semillero Softlab"
      style={{
        paddingTop: 'clamp(48px, 8vw, 80px)',
        paddingBottom: 'clamp(32px, 5vw, 52px)',
        background: 'linear-gradient(180deg, #F4F7FF 0%, #FAFBFF 50%, #fff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-5%', right: '-8%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '10%', left: '-5%',
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(26,63,170,0.045) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px)', position: 'relative', zIndex: 1 }}
        className="about-container"
      >
        {/* ── Identity grid: text + pillars ── */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start', marginBottom: 56 }}
          className="about-grid"
        >
          {/* ── Left: description ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#2563EB',
                marginBottom: 12, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Sobre nosotros
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08, ease: EASE }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(26px, 3.2vw, 42px)',
                fontWeight: 800,
                color: '#0A0F1E',
                letterSpacing: '-1px',
                lineHeight: 1.1,
                margin: '0 0 24px',
              }}
            >
              Semillero de{' '}
              <span style={{
                background: 'linear-gradient(120deg, #1A3FAA 0%, #2563EB 50%, #4F7BE8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Investigación Softlab
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.85, marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}
            >
              Somos un grupo de investigación formativa de la{' '}
              <strong style={{ color: '#1A3FAA', fontWeight: 600 }}>Corporación Universitaria Autónoma del Cauca</strong>,
              orientado a documentar y difundir conocimiento técnico entre la comunidad académica de ingeniería de software.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.24 }}
              style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.85, marginBottom: 32, fontFamily: 'DM Sans, sans-serif' }}
            >
              Nuestras capacitaciones cubren tecnologías emergentes como Realidad Virtual, contenedores con Docker y más.
              Cada sesión se documenta en un manual técnico accesible para toda la comunidad.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.30, ease: EASE }}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 22px',
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                borderRadius: 16,
                border: '1px solid rgba(37,99,235,0.14)',
                boxShadow: '0 2px 20px rgba(37,99,235,0.07)',
                marginBottom: 32,
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                background: 'linear-gradient(135deg, #1A3FAA, #2563EB)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(37,99,235,0.28)',
              }}>
                <Shield size={20} color="#fff" aria-hidden="true" />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700,
                  color: '#0A0F1E', margin: 0, letterSpacing: '-0.2px',
                }}>
                  Corporación Universitaria Autónoma del Cauca
                </p>
                <p style={{
                  fontSize: 12, color: '#64748b', margin: '3px 0 0',
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  Facultad de Ingeniería · Semillero Softlab
                </p>
              </div>
              <div style={{
                marginLeft: 'auto', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', borderRadius: 999,
                background: 'rgba(5,150,105,0.08)',
                border: '1px solid rgba(5,150,105,0.18)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 6px rgba(16,185,129,0.5)',
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', fontFamily: 'DM Sans, sans-serif' }}>
                  Activo
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.38 }}
            >
              <Link to="/nosotros" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 14px 36px rgba(37,99,235,0.22)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '13px 24px',
                    background: 'linear-gradient(135deg, #1A3FAA 0%, #2563EB 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12, fontSize: 13.5, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    boxShadow: '0 6px 22px rgba(37,99,235,0.28)',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  Conocer el equipo completo <ArrowRight size={14} aria-hidden="true" />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* ── Right: pillars ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <motion.p
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#94a3b8',
                marginBottom: 4, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Lo que hacemos
            </motion.p>

            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.52, delay: i * 0.13, ease: EASE }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 18,
                    padding: '22px 24px',
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1px solid rgba(226,232,240,0.8)`,
                    borderLeft: `3px solid ${pillar.accent}`,
                    borderRadius: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    cursor: 'default',
                    transition: 'box-shadow 0.25s, transform 0.25s, border-color 0.25s',
                    willChange: 'transform',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 12px 36px ${pillar.glow}, 0 0 0 1px ${pillar.border}`;
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    background: pillar.iconBg,
                    border: `1px solid ${pillar.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={20} color={pillar.accent} aria-hidden="true" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                      <h3 style={{
                        fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
                        color: '#0A0F1E', margin: 0, letterSpacing: '-0.3px',
                      }}>
                        {pillar.title}
                      </h3>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999,
                        fontSize: 10, fontWeight: 700,
                        background: pillar.iconBg,
                        color: pillar.accent,
                        border: `1px solid ${pillar.border}`,
                        fontFamily: 'DM Sans, sans-serif',
                        letterSpacing: '0.05em',
                        flexShrink: 0,
                      }}>
                        {pillar.tag}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 13, color: '#64748b', margin: 0,
                      lineHeight: 1.72, fontFamily: 'DM Sans, sans-serif',
                    }}>
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, ease: EASE }}
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                background: 'rgba(226,232,240,0.5)',
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(226,232,240,0.8)',
                marginTop: 4,
              }}
            >
              {[
                { value: '2024', label: 'Fundado' },
                { value: '3', label: 'Líneas activas' },
                { value: '100%', label: 'Open access' },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  style={{
                    padding: '16px 14px', textAlign: 'center',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <p style={{
                    fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800,
                    color: '#1A3FAA', margin: 0, letterSpacing: '-0.5px',
                  }}>
                    {value}
                  </p>
                  <p style={{
                    fontSize: 11, color: '#94a3b8', margin: '3px 0 0',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                  }}>
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Equipo Directivo ── */}
        {showDirectors && (
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative', marginBottom: 64,
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(226,232,240,0.8))' }} />
              <div ref={titleRef} style={{ textAlign: 'center', flexShrink: 0 }}>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={titleInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45 }}
                  style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: '#2563EB',
                    marginBottom: 8, fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  Liderazgo
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  animate={titleInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 'clamp(22px, 3vw, 36px)',
                    fontWeight: 800, color: '#0A0F1E',
                    letterSpacing: '-0.8px', margin: '0 0 8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Equipo Directivo
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={titleInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{ fontSize: 14, color: '#64748b', margin: 0, fontFamily: 'DM Sans, sans-serif' }}
                >
                  Las personas que guían y lideran el semillero
                </motion.p>
              </div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(226,232,240,0.8), transparent)' }} />
            </div>

            {loadingDirectors ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
                Cargando equipo directivo...
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 24,
              }}>
                {directorsToShow.map((person, i) => (
                  <DirectorCard key={person.id || person.name} person={person} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}