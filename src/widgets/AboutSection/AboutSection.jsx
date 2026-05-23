import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { ArrowRight, FlaskConical, BookOpen, Users } from 'lucide-react';

const logoSoftlab1 = new URL(
  '/src/assets/Semillero Laboratorio de Software_1 Semillero Laboratorio de Software (3).jpg',
  import.meta.url
).href;
const logoSoftlab2 = new URL(
  '/src/assets/Semillero Laboratorio de Software_2 Semillero Laboratorio de Software (3).jpg',
  import.meta.url
).href;

const EASE = [0.22, 1, 0.36, 1];

const DIRECTORS = [
  {
    initials: 'ZL',
    name: 'Zulema León',
    role: 'Directora del curso · Semillero de investigación',
    badge: 'Directora',
    accent: '#1A3FAA',
    bg: '#eef3ff',
    borderColor: '#c7d7f8',
    desc: 'Directora del curso y del Semillero de Investigación Softlab. Lidera la línea de documentación técnica y la gestión del conocimiento generado por los investigadores.',
    chips: ['Ingeniería de Sistemas', 'Gestión de proyectos', 'Documentación técnica'],
  },
  {
    initials: 'AM',
    name: 'Ana María',
    role: 'Docente del semillero',
    badge: 'Docente',
    accent: '#166534',
    bg: '#f0fdf4',
    borderColor: '#bbf7d0',
    desc: 'Acompaña los procesos formativos de los estudiantes investigadores, orientando el desarrollo de competencias en programación y diseño de software.',
    chips: ['Facultad de Ingeniería', 'Desarrollo de software', 'Pedagogía activa'],
  },
  {
    initials: 'AG',
    name: 'Ana Gabriela',
    role: 'Directora del Semillero',
    badge: 'Directora',
    accent: '#92400e',
    bg: '#fef3c7',
    borderColor: '#fde68a',
    desc: 'Co-directora del Semillero Softlab. Coordina las capacitaciones, supervisa los proyectos de investigación estudiantil y vincula al semillero con la comunidad académica regional.',
    chips: ['Ingeniería de Sistemas', 'Coordinación académica', 'Investigación aplicada'],
  },
];

const PILLARS = [
  {
    icon: BookOpen,
    title: 'Documentación técnica',
    desc: 'Generamos manuales de usuario detallados a partir de las capacitaciones realizadas por el equipo investigador.',
    accent: '#1A3FAA',
    bg: '#EEF3FF',
    border: '#C7D7F8',
  },
  {
    icon: Users,
    title: 'Formación investigativa',
    desc: 'Fomentamos el pensamiento crítico y la cultura investigativa entre estudiantes de ingeniería de software.',
    accent: '#15803D',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  },
  {
    icon: FlaskConical,
    title: 'Innovación académica',
    desc: 'Exploramos tecnologías emergentes como Realidad Virtual, DevOps, contenedores y más.',
    accent: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
];

function DirectorCard({ person, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.62, delay: index * 0.14, ease: EASE }}
      whileHover={{
        y: -7,
        boxShadow: `0 24px 56px rgba(0,0,0,0.11), 0 0 0 1.5px ${person.borderColor}`,
      }}
      style={{
        flex: 1, minWidth: 0,
        borderRadius: 20, overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(241,245,249,1)',
        display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.3s',
        willChange: 'transform',
      }}
    >
      {/* Colored header */}
      <div
        style={{
          background: person.bg,
          padding: '32px 28px 28px',
          position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}
      >
        {/* Badge */}
        <div
          style={{
            position: 'absolute', top: 16, right: 16,
            padding: '4px 12px', borderRadius: 999,
            fontSize: 11, fontWeight: 700,
            background: '#fff', color: person.accent,
            border: `1px solid ${person.borderColor}`,
            fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em',
          }}
        >
          {person.badge}
        </div>

        {/* Avatar */}
        <div
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: person.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#fff',
            fontFamily: 'Syne, sans-serif',
            border: '4px solid #fff',
            boxShadow: `0 6px 24px ${person.accent}40`,
          }}
        >
          {person.initials}
        </div>

        {/* Name + role */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: '#0A0F1E', margin: 0, letterSpacing: '-0.3px' }}>
            {person.name}
          </p>
          <p style={{ fontSize: 12, color: person.accent, margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            {person.role}
          </p>
        </div>
      </div>

      <div style={{ height: 1, background: person.borderColor }} />

      {/* Body */}
      <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.75, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
          {person.desc}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
          {person.chips.map((chip) => (
            <span
              key={chip}
              style={{
                padding: '4px 10px', borderRadius: 999,
                fontSize: 11, fontWeight: 500,
                background: person.bg, color: person.accent,
                border: `1px solid ${person.borderColor}`,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function AboutSection() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-80px' });

  return (
    <section
      aria-label="Sobre el semillero Softlab"
      style={{
        padding: '96px 0 80px',
        background: 'linear-gradient(180deg, #F8FAFF 0%, #fff 120px)',
        borderTop: '1px solid #f1f5f9',
      }}
    >
      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}
        className="about-container"
      >
        {/* ── Identity: text + pillars ── */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'start', marginBottom: 88 }}
          className="about-grid"
        >
          {/* Left column */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#1A3FAA',
                marginBottom: 10, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Sobre nosotros
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08, ease: EASE }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(24px, 3vw, 38px)',
                fontWeight: 700, color: '#0A0F1E',
                letterSpacing: '-0.8px', lineHeight: 1.15,
                margin: '0 0 20px',
              }}
            >
              Semillero de Investigación{' '}
              <span style={{ color: '#1A3FAA' }}>Softlab</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18 }}
              style={{ fontSize: 14, color: '#64748b', lineHeight: 1.85, marginBottom: 14, fontFamily: 'DM Sans, sans-serif' }}
            >
              Somos un grupo de investigación formativa de la{' '}
              <strong style={{ color: '#374151', fontWeight: 600 }}>Corporación Universitaria Autónoma del Cauca</strong>,
              orientado a documentar y difundir conocimiento técnico entre la comunidad académica de ingeniería de software.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.26 }}
              style={{ fontSize: 14, color: '#64748b', lineHeight: 1.85, marginBottom: 28, fontFamily: 'DM Sans, sans-serif' }}
            >
              Nuestras capacitaciones cubren tecnologías emergentes como Realidad Virtual, contenedores con Docker y más.
              Cada sesión se documenta en un manual técnico accesible para toda la comunidad.
            </motion.p>

            {/* Logos */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.32, ease: EASE }}
              style={{
                display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28,
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 14,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 12px rgba(26,63,170,0.05)',
              }}
            >
              <img
                src={logoSoftlab1}
                alt="Logo Semillero"
                style={{ height: 44, objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div style={{ width: 1, height: 36, background: '#e5e7eb', flexShrink: 0 }} />
              <img
                src={logoSoftlab2}
                alt="Logo Softlab"
                style={{ height: 44, objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.38 }}
            >
              <Link to="/nosotros" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(26,63,170,0.14)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 22px',
                    background: 'transparent', color: '#1A3FAA',
                    border: '1.5px solid #1A3FAA',
                    borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#eef3ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Conocer el equipo completo <ArrowRight size={14} />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right column: glass pillar cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p
              style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#94a3b8',
                marginBottom: 4, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Lo que hacemos
            </p>
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.52, delay: i * 0.12, ease: EASE }}
                  whileHover={{ x: 4, boxShadow: `0 8px 28px rgba(0,0,0,0.07), 0 0 0 1px ${pillar.border}` }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    padding: '20px 22px',
                    background: 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid #e5e7eb',
                    borderRadius: 16,
                    cursor: 'default',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    willChange: 'transform',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = pillar.border; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  <div
                    style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: pillar.bg,
                      border: `1px solid ${pillar.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 2px 10px ${pillar.accent}18`,
                    }}
                  >
                    <Icon size={18} color={pillar.accent} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
                        color: '#0A0F1E', margin: '0 0 6px', letterSpacing: '-0.2px',
                      }}
                    >
                      {pillar.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Equipo Directivo ── */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 64 }}>
          <div ref={titleRef} style={{ textAlign: 'center', marginBottom: 48 }}>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#1A3FAA',
                marginBottom: 10, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Liderazgo
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 700, color: '#0A0F1E',
                letterSpacing: '-1px', margin: '0 0 12px',
              }}
            >
              Equipo Directivo
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={titleInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ fontSize: 15, color: '#64748b', margin: 0, fontFamily: 'DM Sans, sans-serif' }}
            >
              Las personas que guían y lideran el semillero Softlab
            </motion.p>
          </div>

          <div
            style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}
            className="directors-grid"
          >
            {DIRECTORS.map((person, i) => (
              <DirectorCard key={person.name} person={person} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
