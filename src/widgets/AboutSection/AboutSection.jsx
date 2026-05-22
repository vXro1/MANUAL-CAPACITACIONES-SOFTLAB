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
  },
  {
    icon: Users,
    title: 'Formación investigativa',
    desc: 'Fomentamos el pensamiento crítico y la cultura investigativa entre estudiantes de ingeniería de software.',
  },
  {
    icon: FlaskConical,
    title: 'Innovación académica',
    desc: 'Exploramos tecnologías emergentes como Realidad Virtual, DevOps, contenedores y más.',
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
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${person.borderColor}`,
        background: '#fff',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
      }}
      whileHover={{
        y: -6,
        boxShadow: `0 20px 48px rgba(0,0,0,0.10)`,
      }}
    >
      {/* Header coloreado */}
      <div
        style={{
          background: person.bg,
          padding: '32px 28px 28px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {/* Badge superior */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: '#fff',
            color: person.accent,
            border: `1px solid ${person.borderColor}`,
            fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.04em',
          }}
        >
          {person.badge}
        </div>

        {/* Avatar */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: person.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 800,
            color: '#fff',
            fontFamily: 'Syne, sans-serif',
            border: '4px solid #fff',
            boxShadow: `0 4px 20px ${person.accent}40`,
          }}
        >
          {person.initials}
        </div>

        {/* Nombre y rol */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 17,
              fontWeight: 700,
              color: '#0A0F1E',
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            {person.name}
          </p>
          <p
            style={{
              fontSize: 12,
              color: person.accent,
              margin: '4px 0 0',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
            }}
          >
            {person.role}
          </p>
        </div>
      </div>

      {/* Separador */}
      <div style={{ height: 1, background: person.borderColor }} />

      {/* Cuerpo */}
      <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        <p
          style={{
            fontSize: 13,
            color: '#64748b',
            lineHeight: 1.75,
            margin: 0,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {person.desc}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
          {person.chips.map((chip) => (
            <span
              key={chip}
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 500,
                background: person.bg,
                color: person.accent,
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
      style={{ padding: '96px 0 80px', background: '#fff', borderTop: '1px solid #f1f5f9' }}
    >
      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}
        className="about-container"
      >
        {/* ── Identidad: texto + pilares ── */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'start', marginBottom: 88 }}
          className="about-grid"
        >
          {/* Columna izquierda */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#1A3FAA',
                marginBottom: 10,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Sobre nosotros
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(24px, 3vw, 38px)',
                fontWeight: 700,
                color: '#0A0F1E',
                letterSpacing: '-0.8px',
                lineHeight: 1.15,
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
              transition={{ delay: 0.32 }}
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                marginBottom: 28,
                padding: '16px 20px',
                background: '#f8fafc',
                borderRadius: 14,
                border: '1px solid #e5e7eb',
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
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 22px',
                    background: 'transparent',
                    color: '#1A3FAA',
                    border: '1.5px solid #1A3FAA',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'background 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#eef3ff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  Conocer el equipo completo <ArrowRight size={14} />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Columna derecha: pilares */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#94a3b8',
                marginBottom: 4,
                fontFamily: 'DM Sans, sans-serif',
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
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 4 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '20px 22px',
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: 14,
                    cursor: 'default',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#c7d7f8';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,63,170,0.07)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
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
                    }}
                  >
                    <Icon size={18} color="#1A3FAA" />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0A0F1E',
                        margin: '0 0 6px',
                        letterSpacing: '-0.2px',
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
        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: 64,
          }}
        >
          <div ref={titleRef} style={{ textAlign: 'center', marginBottom: 48 }}>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#1A3FAA',
                marginBottom: 10,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Liderazgo
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 700,
                color: '#0A0F1E',
                letterSpacing: '-1px',
                margin: '0 0 12px',
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

      <style>{`
        @media (max-width: 1024px) {
          .about-container { padding: 0 28px !important; }
          .directors-grid { flex-direction: column !important; }
        }
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 480px) {
          .about-container { padding: 0 20px !important; }
        }
      `}</style>
    </section>
  );
}