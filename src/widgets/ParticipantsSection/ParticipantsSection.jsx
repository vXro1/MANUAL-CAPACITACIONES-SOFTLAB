import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, Mail, BookOpen, ChevronRight, GraduationCap,
  Star, CalendarDays, Users,
} from 'lucide-react';
import { participantesApi } from '@/services/apiService';
import { toSlug } from '@/shared/lib/toSlug';

const EASE = [0.22, 1, 0.36, 1];

/* ─── Role config ──────────────────────────────────────────────────────── */
const ROLE_CONFIG = {
  Investigador:                { bg: '#EEF3FF', color: '#1A3FAA', border: '#C7D7F8' },
  'Co-Investigador':           { bg: '#EEF3FF', color: '#1A3FAA', border: '#C7D7F8' },
  'Investigador Principal':    { bg: '#EEF3FF', color: '#1A3FAA', border: '#C7D7F8' },
  Estudiante:                  { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  Docente:                     { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  'Docente Investigador':      { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  Ponente:                     { bg: '#FEFCE8', color: '#92400E', border: '#FDE68A' },
  'Director del Semillero':    { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
  'Co-Director del Semillero': { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
  'Auxiliar de Investigación': { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  'Colaborador Externo':       { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  default:                     { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
};

const EVENT_CATEGORY_STYLES = {
  'Divulgación Científica':  { bg: '#EEF3FF', color: '#1A3FAA' },
  'Salida Técnica':          { bg: '#ECFDF5', color: '#065F46' },
  'Movilidad Internacional': { bg: '#F3E8FF', color: '#6D28D9' },
  'Movilidad Nacional':      { bg: '#FFFBEB', color: '#92400E' },
};

function getRoleStyle(role) {
  return ROLE_CONFIG[role] ?? ROLE_CONFIG.default;
}

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/* ─── Helper: roles array normalizado ─────────────────────────────────── */
function getRoles(participant) {
  if (Array.isArray(participant.roles) && participant.roles.length > 0) {
    return participant.roles;
  }
  return participant.role ? [participant.role] : [];
}

/* ─── Helper: manuales relacionados ───────────────────────────────────── */
function getRelatedManuals(participant, allManuals) {
  return allManuals.filter((m) =>
    m.authorIds?.includes(participant.id) ||
    m.speakerIds?.includes(participant.id) ||
    participant.manualsAsAuthor?.includes(m.id)
  );
}

/* ─── Helper: rol dentro de un manual ─────────────────────────────────── */
function getManualRole(manual, participantId) {
  const isAuthor = manual.authorIds?.includes(participantId) || false;
  const isSpeaker = manual.speakerIds?.includes(participantId) || false;
  if (isAuthor && isSpeaker) return 'Autor · Ponente';
  if (isAuthor) return 'Autor';
  if (isSpeaker) return 'Ponente';
  return null;
}

/* ─── Brand SVG icons ──────────────────────────────────────────────────── */
function LinkedInIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/* ─── SocialLink button ─────────────────────────────────────────────────── */
function SocialLink({ href, label, normalBg, normalBorder, normalColor, hoverBg, hoverBorder, children }) {
  if (!href || href === '#') return null;
  const isMailTo = href.startsWith('mailto:');
  const Tag = 'a';
  return (
    <Tag
      href={href}
      target={isMailTo ? undefined : '_blank'}
      rel={isMailTo ? undefined : 'noreferrer'}
      aria-label={label}
      title={label}
      style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: normalBg, border: `1.5px solid ${normalBorder}`,
        color: normalColor, textDecoration: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.borderColor = hoverBorder;
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 6px 16px ${hoverBg}55`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = normalBg;
        e.currentTarget.style.borderColor = normalBorder;
        e.currentTarget.style.color = normalColor;
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
    </Tag>
  );
}

/* ─── Inline avatar (card) ──────────────────────────────────────────────── */
function CardAvatar({ name, photo, size = 52 }) {
  const [err, setErr] = useState(false);

  if (photo && !err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 12,
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px #C7D7F8',
      }}>
        <img src={photo} alt={name} onError={() => setErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: 'linear-gradient(135deg, #1A3FAA, #2553CC)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 800, color: '#fff',
      fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px',
      boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px #C7D7F8',
    }}>
      {getInitials(name)}
    </div>
  );
}

/* ─── ParticipantCard ────────────────────────────────────────────────────── */
function ParticipantCard({ participant, onClick, index }) {
  const primaryRole = getRoles(participant)[0];
  const roleStyle = getRoleStyle(primaryRole);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const isFeatured = Boolean(participant.featured);

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.48, delay: (index % 4) * 0.07, ease: EASE }}
      whileHover={{ y: -5, boxShadow: '0 20px 44px rgba(26,63,170,0.12), 0 0 0 1.5px #C7D7F8' }}
      onClick={() => onClick(participant)}
      aria-label={`Ver perfil de ${participant.name}`}
      style={{
        background: isFeatured ? '#FAFBFF' : '#fff',
        border: isFeatured ? '1px solid #C7D7F8' : '1px solid #E5E7EB',
        borderRadius: 18,
        padding: '18px 18px 16px',
        textAlign: 'left',
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        outline: 'none',
        boxShadow: isFeatured
          ? '0 4px 16px rgba(26,63,170,0.08), 0 0 0 1px #E8EFFE'
          : '0 2px 8px rgba(0,0,0,0.04)',
        willChange: 'transform',
        position: 'relative',
        transition: 'border-color 0.22s',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = '#1A3FAA50'; }}
      onBlur={e => { e.currentTarget.style.borderColor = isFeatured ? '#C7D7F8' : '#E5E7EB'; }}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 99,
          background: '#FFFBEB', border: '1px solid #FDE68A',
          fontSize: 10, fontWeight: 700, color: '#92400E',
          fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em',
        }}>
          <Star size={9} fill="#F59E0B" color="#F59E0B" />
          Destacado
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingRight: isFeatured ? 72 : 0 }}>
        <CardAvatar name={participant.name} photo={participant.photo} size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
              color: '#0A0F1E', margin: 0, letterSpacing: '-0.2px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            }}>
              {participant.name}
            </h3>
            <ChevronRight size={14} color="#CBD5E1" style={{ flexShrink: 0 }} />
          </div>
          {participant.career && (
            <p style={{
              fontSize: 11.5, color: '#94A3B8', margin: '3px 0 0',
              fontFamily: 'DM Sans, sans-serif',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {participant.career}{participant.semester ? ` · Sem. ${participant.semester}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Role + skills chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        <span style={{
          padding: '3px 10px', borderRadius: 999,
          fontSize: 10.5, fontWeight: 700,
          background: roleStyle.bg, color: roleStyle.color,
          border: `1px solid ${roleStyle.border}`,
          fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}>
          {primaryRole}
        </span>
        {participant.skills?.slice(0, 2).map((skill) => (
          <span key={skill} style={{
            padding: '3px 10px', borderRadius: 999,
            fontSize: 10.5, fontWeight: 500,
            background: '#F8FAFC', color: '#475569',
            border: '1px solid #E5E7EB', fontFamily: 'DM Sans, sans-serif',
            whiteSpace: 'nowrap',
          }}>
            {skill}
          </span>
        ))}
        {participant.skills?.length > 2 && (
          <span style={{
            padding: '3px 10px', borderRadius: 999,
            fontSize: 10.5, fontWeight: 500,
            background: '#F8FAFC', color: '#94A3B8',
            border: '1px solid #E5E7EB', fontFamily: 'DM Sans, sans-serif',
          }}>
            +{participant.skills.length - 2}
          </span>
        )}
      </div>
    </motion.button>
  );
}

/* ─── ParticipantModal ───────────────────────────────────────────────────── */
function ParticipantModal({ participant, onClose }) {
  const closeRef = useRef(null);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(12px, 5vw, 24px)',
      }}
      role="dialog" aria-modal="true" aria-label={`Perfil de ${participant.name}`}
    >
      {/* Backdrop sutil */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        }}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 34, mass: 0.7 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(400px, calc(100vw - 24px))',
          borderRadius: 18,
          background: '#fff',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          padding: '28px 24px 24px',
        }}
      >
        {/* Cerrar */}
        <button
          ref={closeRef} onClick={onClose} aria-label="Cerrar perfil"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 30, height: 30, borderRadius: 8,
            background: '#F1F5F9', border: 'none',
            color: '#64748B', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.14s, color 0.14s', outline: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0A0F1E'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
        >
          <X size={14} />
        </button>

        {/* Identidad */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: participant.bio ? 20 : 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1A3FAA, #3B6FE8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif',
            boxShadow: '0 4px 12px rgba(26,63,170,0.22)',
          }}>
            {participant.photo && !imgErr ? (
              <img src={participant.photo} alt={participant.name} onError={() => setImgErr(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : getInitials(participant.name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(15px, 4vw, 18px)',
              fontWeight: 800, color: '#0A0F1E',
              margin: '0 0 4px', letterSpacing: '-0.3px', lineHeight: 1.2,
            }}>
              {participant.name}
            </h2>
            {participant.career && (
              <p style={{
                margin: 0, fontSize: 12, color: '#64748B',
                fontFamily: 'DM Sans, sans-serif',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {participant.career}{participant.semester ? ` · Sem. ${participant.semester}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {participant.bio && (
          <p style={{
            fontSize: 13.5, color: '#475569', lineHeight: 1.7,
            margin: '0 0 24px', fontFamily: 'DM Sans, sans-serif',
          }}>
            {participant.bio}
          </p>
        )}

        {/* CTA */}
        <Link
          to={`/participantes/${toSlug(participant.name)}`}
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '11px 18px', width: '100%', boxSizing: 'border-box',
            background: '#0A0F1E',
            borderRadius: 11, fontSize: 13, fontWeight: 700, color: '#fff',
            textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
            transition: 'background 0.16s, transform 0.16s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1A3FAA'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0A0F1E'; e.currentTarget.style.transform = 'none'; }}
        >
          Ver perfil completo <ChevronRight size={13} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ─── ParticipantsSection ────────────────────────────────────────────────── */
export function ParticipantsSection({ featuredOnly = false, limit }) {
  const [allParticipants, setAllParticipants] = useState([]);
  const [selected, setSelected] = useState(null);
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-80px' });

  useEffect(() => {
    let cancelled = false;
    participantesApi.getAll()
      .then(data => { if (!cancelled) setAllParticipants(data ?? []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const sorted = [...allParticipants].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (a.name ?? '').localeCompare(b.name ?? '');
  });

  const all = featuredOnly ? sorted.filter((p) => p.featured) : sorted;
  const participants = limit ? all.slice(0, limit) : all;
  const hasMore = limit && all.length > limit;

  if (participants.length === 0) return null;

  // When limited (homepage), use a 2×2 or 4-col horizontal layout
  const isCompact = Boolean(limit);

  return (
    <section
      aria-label="Investigadores del semillero"
      style={{
        padding: isCompact ? 'clamp(40px, 6vw, 72px) 0' : 'clamp(56px, 9vw, 96px) 0',
        background: 'linear-gradient(180deg, #F1F5FF 0%, #F8FAFC 80px, #F8FAFC 100%)',
      }}
    >
      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}
        className="participants-container"
      >
        {/* Title */}
        <div ref={titleRef} style={{ marginBottom: isCompact ? 32 : 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#1A3FAA',
                marginBottom: 8, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Comunidad
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: isCompact ? 'clamp(22px, 2.8vw, 34px)' : 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 700, color: '#0A0F1E',
                letterSpacing: '-1px', margin: 0,
              }}
            >
              Investigadores del semillero
            </motion.h2>
          </div>

          {hasMore && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={titleInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                to="/nosotros"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 10,
                  fontSize: 13, fontWeight: 600, color: '#1A3FAA',
                  textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
                  border: '1.5px solid rgba(26,63,170,0.18)',
                  background: 'rgba(238,243,255,0.5)',
                  transition: 'background 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eef3ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(238,243,255,0.5)'; }}
              >
                Ver equipo completo <ChevronRight size={13} aria-hidden="true" />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Grid — 4 columns when compact, 3 otherwise */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isCompact ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
            gap: isCompact ? 14 : 16,
          }}
          className={isCompact ? 'participants-grid-compact' : 'participants-grid'}
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
    </section>
  );
}
