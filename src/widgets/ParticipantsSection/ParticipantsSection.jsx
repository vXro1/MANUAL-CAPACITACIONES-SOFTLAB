import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, ExternalLink, Mail, BookOpen, GitBranch, ChevronRight } from 'lucide-react';
import { participantsRepository, manualsRepository } from '@/storage/localStorageRepository';

const ROLE_CONFIG = {
  Investigador: { bg: '#eef3ff', color: '#1A3FAA', border: '#c7d7f8' },
  'Co-Investigador': { bg: '#eef3ff', color: '#1A3FAA', border: '#c7d7f8' },
  'Investigador Principal': { bg: '#eef3ff', color: '#1A3FAA', border: '#c7d7f8' },
  Estudiante: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  Docente: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  'Docente Investigador': { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  Ponente: { bg: '#fefce8', color: '#92400e', border: '#fde68a' },
  'Director del Semillero': { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
  'Co-Director del Semillero': { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
  'Auxiliar de Investigación': { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  'Colaborador Externo': { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  default: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
};

function getRoleStyle(role) {
  return ROLE_CONFIG[role] ?? ROLE_CONFIG.default;
}

function avatarColor(name = '') {
  const COLORS = [
    '#1A3FAA', '#0f766e', '#7c3aed', '#b45309', '#be123c',
    '#0369a1', '#15803d', '#6d28d9', '#9a3412', '#0f172a',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % COLORS.length;
  return COLORS[h];
}

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function Avatar({ name, photo, size = 56 }) {
  const [err, setErr] = useState(false);
  const color = avatarColor(name);
  if (photo && !err) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.3,
        fontWeight: 800,
        color: '#fff',
        fontFamily: 'Syne, sans-serif',
        flexShrink: 0,
        letterSpacing: '-0.5px',
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function AvatarModal({ name, photo, size = 72 }) {
  const [err, setErr] = useState(false);
  const color = avatarColor(name);
  if (photo && !err) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setErr(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '4px solid #fff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${color}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.28,
        fontWeight: 800,
        color: color,
        fontFamily: 'Syne, sans-serif',
        border: '4px solid #fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        letterSpacing: '-0.5px',
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function SocialButton({ href, ariaLabel, children }) {
  if (!href || href === '#') return null;
  const isMail = href.startsWith('mailto:');

  const commonProps = {
    href,
    'aria-label': ariaLabel,
    style: {
      width: 32,
      height: 32,
      borderRadius: 8,
      background: '#f1f5f9',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#64748b',
      transition: 'background 0.2s, color 0.2s',
      textDecoration: 'none',
    },
    onMouseEnter: (e) => {
      e.currentTarget.style.background = '#eef3ff';
      e.currentTarget.style.color = '#1A3FAA';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.background = '#f1f5f9';
      e.currentTarget.style.color = '#64748b';
    },
  };

  if (isMail) {
    return <a {...commonProps}>{children}</a>;
  }

  return (
    <a {...commonProps} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
function ParticipantCard({ participant, onClick, index }) {
  const roleStyle = getRoleStyle(participant.role);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(26,63,170,0.12)', borderColor: '#c7d7f8' }}
      onClick={() => onClick(participant)}
      aria-label={`Ver perfil de ${participant.name}`}
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: '20px',
        textAlign: 'left',
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <Avatar name={participant.name} photo={participant.photo} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <h3
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                color: '#0A0F1E',
                margin: 0,
                letterSpacing: '-0.2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {participant.name}
            </h3>
            <ChevronRight size={14} color="#cbd5e1" style={{ flexShrink: 0 }} />
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {participant.career}
            {participant.semester ? ` · ${participant.semester}° sem.` : ''}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: roleStyle.bg,
            color: roleStyle.color,
            border: `1px solid ${roleStyle.border}`,
            fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          {participant.role}
        </span>
        {participant.skills?.slice(0, 2).map((skill) => (
          <span
            key={skill}
            style={{
              padding: '3px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 500,
              background: '#f8fafc',
              color: '#475569',
              border: '1px solid #e5e7eb',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {skill}
          </span>
        ))}
        {participant.skills?.length > 2 && (
          <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: '#f8fafc', color: '#94a3b8', border: '1px solid #e5e7eb', fontFamily: 'DM Sans, sans-serif' }}>
            +{participant.skills.length - 2}
          </span>
        )}
      </div>
    </motion.button>
  );
}

function ParticipantModal({ participant, onClose }) {
  const closeRef = useRef(null);
  const allManuals = manualsRepository.getAll();
  const authorManuals = allManuals.filter((m) => m.authorIds?.includes(participant.id));
  const roleStyle = getRoleStyle(participant.role);

  useEffect(() => {
    closeRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10,15,30,0.55)',
          backdropFilter: 'blur(6px)',
        }}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 440,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1A3FAA 0%, #2952cc 100%)',
            padding: '28px 24px 52px',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
            }}
          />
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Avatar flotante + iconos sociales */}
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 14,
            padding: '0 24px',
            marginTop: -36,
          }}
        >
          <AvatarModal name={participant.name} photo={participant.photo} size={72} />

          {/* Social icons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <SocialButton href={participant.linkedin} ariaLabel="LinkedIn">
              <ExternalLink size={13} />
            </SocialButton>
            <SocialButton href={participant.github} ariaLabel="GitHub">
              <GitBranch size={13} />
            </SocialButton>
            {participant.email && (
              <SocialButton href={`mailto:${participant.email}`} ariaLabel="Email">
                <Mail size={13} />
              </SocialButton>
            )}
          </div>
        </div>

        {/* Cuerpo scrollable */}
        <div style={{ padding: '16px 24px 28px', overflowY: 'auto', flex: 1 }}>
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#0A0F1E',
              margin: '0 0 8px',
              letterSpacing: '-0.4px',
            }}
          >
            {participant.name}
          </h2>

          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              background: roleStyle.bg,
              color: roleStyle.color,
              border: `1px solid ${roleStyle.border}`,
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {participant.role}
          </span>

          {participant.career && (
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '10px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
              {participant.career}
              {participant.semester ? ` — Semestre ${participant.semester}` : ''}
            </p>
          )}

          {participant.bio && (
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, margin: '16px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
              {participant.bio}
            </p>
          )}

          {participant.skills?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 10,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Habilidades
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {participant.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 500,
                      background: '#eef3ff',
                      color: '#1A3FAA',
                      border: '1px solid #c7d7f8',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {authorManuals.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 10,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Manuales como autor
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {authorManuals.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                    }}
                  >
                    <BookOpen size={13} color="#1A3FAA" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ParticipantsSection() {
  const participants = participantsRepository.getAll();
  const [selected, setSelected] = useState(null);
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-80px' });

  if (participants.length === 0) return null;

  return (
    <section
      aria-label="Investigadores del semillero"
      style={{ padding: '96px 0', background: '#f8fafc' }}
    >
      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}
        className="participants-container"
      >
        {/* Título */}
        <div ref={titleRef} style={{ textAlign: 'center', marginBottom: 56 }}>
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
            Comunidad
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
            Investigadores del semillero
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: 15, color: '#64748b', margin: 0, fontFamily: 'DM Sans, sans-serif' }}
          >
            Conoce a los estudiantes que documentan y lideran las capacitaciones en Softlab.
          </motion.p>
        </div>

        {/* Grid */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
          className="participants-grid"
        >
          {participants.map((p, i) => (
            <ParticipantCard key={p.id} participant={p} index={i} onClick={setSelected} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <ParticipantModal participant={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .participants-container { padding: 0 24px !important; }
          .participants-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .participants-container { padding: 0 20px !important; }
          .participants-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}