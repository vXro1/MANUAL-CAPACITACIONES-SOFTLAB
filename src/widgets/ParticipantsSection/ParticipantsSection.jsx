import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, ChevronRight, Star,
  FlaskConical, BookOpen, GraduationCap, Mic2, Users, Lightbulb,
} from 'lucide-react';
import { participantesApi } from '@/services/apiService';
import { toSlug } from '@/shared/lib/toSlug';

const EASE = [0.22, 1, 0.36, 1];

/* ─── Helpers de normalización ──────────────────────────────────────── */

/**
 * Convierte cualquier valor a string seguro para renderizar.
 * Si es objeto, intenta sacar .nombre, .name o .label.
 */
function toStr(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return val.nombre ?? val.name ?? val.label ?? '';
  return String(val);
}

/**
 * Normaliza un array que puede contener strings u objetos.
 * Devuelve siempre string[].
 */
function normalizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(toStr).filter(Boolean);
}

/**
 * Normaliza un participante que viene de la API PHP,
 * asegurando que todos los campos sean tipos primitivos seguros.
 */
function normalizeParticipant(raw) {
  return {
    ...raw,
    name:     toStr(raw.name     ?? raw.nombre ?? ''),
    role:     toStr(raw.role     ?? raw.rol    ?? ''),
    career:   toStr(raw.career   ?? raw.carrera ?? ''),
    semester: toStr(raw.semester ?? raw.semestre ?? ''),
    bio:      toStr(raw.bio      ?? ''),
    photo:    toStr(raw.photo    ?? raw.foto_path ?? ''),
    featured: Boolean(raw.featured),
    // Arrays: pueden venir como JSON strings o arrays de objetos
    skills: normalizeArray(
      typeof raw.skills === 'string'
        ? tryParse(raw.skills)
        : (raw.skills ?? raw.habilidades ?? [])
    ),
    roles: normalizeArray(
      typeof raw.roles === 'string'
        ? tryParse(raw.roles)
        : (raw.roles ?? raw.roles_adicionales ?? [])
    ),
  };
}

function tryParse(str) {
  try { return JSON.parse(str); } catch { return []; }
}

/* ─── Role config ──────────────────────────────────────────────────── */
const ROLE_CONFIG = {
  Coordinador:               { bg: '#E0E8FF', color: '#0F2F8A', border: '#B8CAF5' },
  Profesor:                  { bg: '#E0E8FF', color: '#0F2F8A', border: '#B8CAF5' },
  Docente:                   { bg: '#EBF0FF', color: '#1640AE', border: '#C0CFFA' },
  'Docente Acompañante':     { bg: '#EBF0FF', color: '#1640AE', border: '#C0CFFA' },
  'Docente Investigador':    { bg: '#EBF0FF', color: '#1640AE', border: '#C0CFFA' },
  'Director del Semillero':  { bg: '#E0E8FF', color: '#0F2F8A', border: '#B8CAF5' },
  'Co-Director del Semillero': { bg: '#E0E8FF', color: '#0F2F8A', border: '#B8CAF5' },
  Investigador:              { bg: '#EEF3FF', color: '#1A3FAA', border: '#C7D7F8' },
  'Co-Investigador':         { bg: '#EEF3FF', color: '#1A3FAA', border: '#C7D7F8' },
  'Investigador Principal':  { bg: '#E8EDFF', color: '#142F8A', border: '#BCC8F6' },
  Estudiante:                { bg: '#F0F5FF', color: '#2D5CC0', border: '#C5D3F6' },
  Ponente:                   { bg: '#EDF2FF', color: '#2151C2', border: '#BFCEF8' },
  Conferencista:             { bg: '#EDF2FF', color: '#2151C2', border: '#BFCEF8' },
  'Auxiliar de Investigación': { bg: '#F2F5FF', color: '#3B6FE8', border: '#C8D6F8' },
  'Colaborador Externo':     { bg: '#F4F7FF', color: '#4F7BE8', border: '#CCDAF8' },
  default:                   { bg: '#F2F5FF', color: '#3B6FE8', border: '#C8D6F8' },
};

function getRoleStyle(role) {
  return ROLE_CONFIG[role] ?? ROLE_CONFIG.default;
}

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getRoles(participant) {
  // roles ya normalizado = string[]
  if (Array.isArray(participant.roles) && participant.roles.length > 0) return participant.roles;
  return participant.role ? [participant.role] : [];
}

/* ─── Grupos de roles ────────────────────────────────────────────────── */
const ROLE_GROUPS = [
  {
    key: 'directivos',
    label: 'Equipo Directivo',
    subtitle: 'Coordinadores, profesores y directores del semillero',
    icon: Star,
    accent: '#0F2F8A',
    accentLight: '#E0E8FF',
    roles: [
      'Coordinador', 'Profesor', 'Docente', 'Docente Acompañante',
      'Docente Investigador', 'Director del Semillero', 'Co-Director del Semillero',
    ],
  },
  {
    key: 'investigadores',
    label: 'Investigadores',
    subtitle: 'Equipo de investigación activo',
    icon: FlaskConical,
    accent: '#1A3FAA',
    accentLight: '#EEF3FF',
    roles: ['Investigador Principal', 'Investigador', 'Co-Investigador'],
  },
  {
    key: 'estudiantes',
    label: 'Estudiantes',
    subtitle: 'Semilleros activos del programa',
    icon: GraduationCap,
    accent: '#2D5CC0',
    accentLight: '#F0F5FF',
    roles: ['Estudiante'],
  },
  {
    key: 'ponentes',
    label: 'Ponentes',
    subtitle: 'Conferencistas invitados',
    icon: Mic2,
    accent: '#2151C2',
    accentLight: '#EDF2FF',
    roles: ['Ponente', 'Conferencista'],
  },
  {
    key: 'auxiliares',
    label: 'Auxiliares',
    subtitle: 'Apoyo a la investigación',
    icon: Lightbulb,
    accent: '#3B6FE8',
    accentLight: '#F2F5FF',
    roles: ['Auxiliar de Investigación'],
  },
  {
    key: 'colaboradores',
    label: 'Colaboradores Externos',
    subtitle: 'Aliados y colaboradores del semillero',
    icon: Users,
    accent: '#4F7BE8',
    accentLight: '#F4F7FF',
    roles: ['Colaborador Externo'],
  },
];

/* ─── CardAvatar ─────────────────────────────────────────────────────── */
function CardAvatar({ name, photo, size = 52 }) {
  const [err, setErr] = useState(false);
  if (photo && !err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 12,
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '0 0 0 2.5px #fff, 0 0 0 4.5px #93C5FD, 0 4px 14px rgba(26,63,170,0.16)',
      }}>
        <img src={photo} alt={name} onError={() => setErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: 'linear-gradient(135deg, #1A3FAA, #3B6FE8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 800, color: '#fff',
      fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px',
      boxShadow: '0 0 0 2.5px #fff, 0 0 0 4.5px #93C5FD, 0 6px 18px rgba(26,63,170,0.22)',
    }}>
      {getInitials(name)}
    </div>
  );
}

/* ─── ParticipantCard ────────────────────────────────────────────────── */
function ParticipantCard({ participant, onClick, index }) {
  const allRoles    = getRoles(participant);
  const primaryRole = allRoles[0];
  const extraRoles  = allRoles.slice(1);
  const roleStyle   = getRoleStyle(primaryRole);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const isFeatured = Boolean(participant.featured);

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.48, delay: (index % 4) * 0.07, ease: EASE }}
      whileHover={{
        y: -6,
        boxShadow: '0 22px 52px rgba(26,63,170,0.16), 0 0 0 2px #93C5FD, 0 0 26px rgba(99,140,255,0.12)',
      }}
      onClick={() => onClick(participant)}
      aria-label={`Ver perfil de ${participant.name}`}
      style={{
        background: isFeatured ? '#F7FBFF' : '#fff',
        border: isFeatured ? '1px solid #C7D7F8' : '1px solid #E8EFFE',
        borderRadius: 18,
        padding: '18px 18px 16px',
        textAlign: 'left',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        outline: 'none',
        boxShadow: isFeatured
          ? '0 6px 22px rgba(26,63,170,0.10), 0 0 0 1px #E0EAFF'
          : '0 2px 10px rgba(26,63,170,0.05)',
        willChange: 'transform',
        position: 'relative',
        transition: 'border-color 0.22s, box-shadow 0.22s',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = '#1A3FAA50'; }}
      onBlur={e => { e.currentTarget.style.borderColor = isFeatured ? '#C7D7F8' : '#E5E7EB'; }}
    >
      {isFeatured && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 99,
          background: '#EEF3FF', border: '1px solid #C7D7F8',
          fontSize: 10, fontWeight: 700, color: '#1A3FAA',
          fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em',
        }}>
          <Star size={9} fill="#1A3FAA" color="#1A3FAA" />
          Destacado
        </div>
      )}

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
              {participant.career}
              {participant.semester ? ` · Sem. ${participant.semester}` : ''}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {/* Rol principal — ✅ siempre string por normalizeParticipant */}
        {primaryRole && (
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
        )}
        {/* Roles adicionales — ✅ string[] */}
        {extraRoles.map((role) => (
          <span key={role} style={{
            padding: '3px 9px', borderRadius: 999,
            fontSize: 10, fontWeight: 600,
            background: '#F1F5F9', color: '#475569',
            border: '1px solid #E2E8F0',
            fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
          }}>
            {role}
          </span>
        ))}
        {/* Skills — ✅ string[] gracias a normalizeArray */}
        {participant.skills.map((skill) => (
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
      </div>
    </motion.button>
  );
}

/* ─── ParticipantModal ───────────────────────────────────────────────── */
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
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 34, mass: 0.7 }}
        style={{
          position: 'relative', width: '100%',
          maxWidth: 'min(400px, calc(100vw - 24px))',
          borderRadius: 18, background: '#fff',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          padding: 'clamp(16px, 5vw, 28px) clamp(14px, 5vw, 24px) clamp(14px, 5vw, 24px)',
        }}
      >
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
                {participant.career}
                {participant.semester ? ` · Sem. ${participant.semester}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* bio ya es string seguro */}
        {participant.bio && (
          <p style={{
            fontSize: 13.5, color: '#475569', lineHeight: 1.7,
            margin: '0 0 24px', fontFamily: 'DM Sans, sans-serif',
          }}>
            {participant.bio}
          </p>
        )}

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

/* ─── RoleGroupHeader ────────────────────────────────────────────────── */
function RoleGroupHeader({ group, count, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = group.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: EASE }}
      style={{ marginBottom: 16, marginTop: index === 0 ? 0 : 28, position: 'relative' }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: 56 } : {}}
        transition={{ duration: 0.6, delay: index * 0.08 + 0.1, ease: EASE }}
        style={{
          height: 4, borderRadius: 99,
          background: `linear-gradient(90deg, ${group.accent}, ${group.accent}00)`,
          marginBottom: 16,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.08 + 0.05, ease: 'easeOut' }}
          style={{
            width: 54, height: 54, borderRadius: 16, flexShrink: 0,
            background: group.accentLight,
            border: `2px solid ${group.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 20px ${group.accent}20`,
          }}
        >
          <Icon size={26} color={group.accent} strokeWidth={1.8} />
        </motion.div>
        <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.08 + 0.1, ease: EASE }}
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(22px, 3vw, 38px)',
              fontWeight: 800, color: '#0A0F1E',
              margin: 0, letterSpacing: '-0.8px', lineHeight: 1.1,
              background: `linear-gradient(135deg, ${group.accent}, ${group.accent}dd)`,
              backgroundClip: 'text', WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {group.label}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.08 + 0.15 }}
            style={{
              fontSize: 13, color: '#64748B', margin: '6px 0 0',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500, letterSpacing: '0.3px',
            }}
          >
            {group.subtitle}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.08 + 0.2 }}
          style={{
            padding: '8px 18px', borderRadius: 999,
            background: group.accent, color: '#fff',
            fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif',
            flexShrink: 0, boxShadow: `0 6px 16px ${group.accent}40`, letterSpacing: '-0.3px',
          }}
        >
          {count}
        </motion.div>
      </div>
    </motion.div>
  );
}

const PONENTE_ROLES = ['Ponente', 'Conferencista'];
const EXTERNAL_ROLES = ['Auxiliar de Investigación', 'Colaborador Externo'];

/* ─── ParticipantsSection ────────────────────────────────────────────── */
export function ParticipantsSection({
  featuredOnly = false,
  limit,
  skipPonentes = false,
  onlyPonentes = false,
  skipExternal = false,
  collaboratorsOnly = false,
  sectionTitle,
  sectionSubtitle,
  groupByRole = false,
  paddingTop,
}) {
  const [allParticipants, setAllParticipants] = useState([]);
  const [selected, setSelected] = useState(null);
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-80px' });

  useEffect(() => {
    let cancelled = false;
    participantesApi.getAll()
      .then(data => {
        if (!cancelled) {
          // ✅ CORRECCIÓN CLAVE: normalizar cada participante al llegar de la API
          const normalized = (data ?? []).map(normalizeParticipant);
          setAllParticipants(normalized);
        }
      })
      .catch((err) => {
        console.error('Error cargando participantes:', err);
      });
    return () => { cancelled = true; };
  }, []);

  const sorted = [...allParticipants].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (a.name ?? '').localeCompare(b.name ?? '');
  });

  let pool = sorted;
  if (skipPonentes)      pool = pool.filter((p) => !PONENTE_ROLES.includes(p.role));
  if (onlyPonentes)      pool = pool.filter((p) => PONENTE_ROLES.includes(p.role));
  if (skipExternal)      pool = pool.filter((p) => !EXTERNAL_ROLES.includes(p.role));
  if (collaboratorsOnly) pool = pool.filter((p) => PONENTE_ROLES.includes(p.role) || EXTERNAL_ROLES.includes(p.role));
  if (featuredOnly)      pool = pool.filter((p) => p.featured);

  const participants = limit ? pool.slice(0, limit) : pool;
  const hasMore = limit && pool.length > limit;

  if (participants.length === 0) return null;

  const isCompact = Boolean(limit);

  /* ── Modo agrupado por rol ── */
  if (groupByRole && !isCompact) {
    const groups = ROLE_GROUPS
      .map((group) => ({
        group,
        members: participants.filter((p) => getRoles(p).some((r) => group.roles.includes(r))),
      }))
      .filter(({ members }) => members.length > 0);

    if (groups.length === 0) return null;

    let globalIndex = 0;
    const sectionPadTop = paddingTop ?? 'clamp(40px, 6vw, 72px)';

    return (
      <section
        aria-label="Participantes del semillero"
        style={{
          paddingTop: sectionPadTop,
          paddingBottom: 'clamp(40px, 6vw, 72px)',
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '0 clamp(20px, 5vw, 48px)',
            position: 'relative', zIndex: 1,
            boxSizing: 'border-box', width: '100%',
          }}
          className="participants-container"
        >
          <div ref={titleRef} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 4, height: 36, borderRadius: 2, background: 'linear-gradient(180deg, #1A3FAA, #3B6FE8)', flexShrink: 0 }} />
            <div>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={titleInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4 }}
                style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#1A3FAA',
                  margin: 0, fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {sectionSubtitle ?? 'Comunidad'}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={titleInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.06, ease: EASE }}
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 'clamp(20px, 2.4vw, 28px)',
                  fontWeight: 700, color: '#0A0F1E',
                  letterSpacing: '-0.5px', margin: '2px 0 0',
                }}
              >
                {sectionTitle ?? 'Equipo del semillero'}
              </motion.h2>
            </div>
          </div>

          {groups.map(({ group, members }, gi) => {
            const startIndex = globalIndex;
            globalIndex += members.length;
            return (
              <div key={group.key}>
                <RoleGroupHeader group={group} count={members.length} index={gi} />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
                    gap: 14, marginBottom: 0,
                  }}
                  className="participants-grid"
                >
                  {members.map((p, i) => (
                    <ParticipantCard key={p.id} participant={p} index={startIndex + i} onClick={setSelected} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && <ParticipantModal participant={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>
      </section>
    );
  }

  /* ── Modo original (compact / sin groupByRole) ── */
  const normalPadTop = paddingTop ?? (isCompact ? 'clamp(32px, 5vw, 56px)' : 'clamp(40px, 6vw, 72px)');

  return (
    <section
      aria-label="Investigadores del semillero"
      style={{
        paddingTop: normalPadTop,
        paddingBottom: isCompact ? 'clamp(32px, 5vw, 56px)' : 'clamp(40px, 6vw, 72px)',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 clamp(20px, 5vw, 48px)',
          position: 'relative', zIndex: 1,
          boxSizing: 'border-box', width: '100%',
        }}
        className="participants-container"
      >
        <div
          ref={titleRef}
          style={{
            marginBottom: isCompact ? 24 : 36,
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}
        >
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
              {sectionSubtitle ?? 'Comunidad'}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: isCompact ? 'clamp(20px, 2.8vw, 30px)' : 'clamp(22px, 3vw, 38px)',
                fontWeight: 700, color: '#0A0F1E',
                letterSpacing: '-1px', margin: 0,
              }}
            >
              {sectionTitle ?? 'Investigadores del semillero'}
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
                  transition: 'background 0.18s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eef3ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(238,243,255,0.5)'; }}
              >
                Ver equipo completo <ChevronRight size={13} aria-hidden="true" />
              </Link>
            </motion.div>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isCompact
              ? 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))'
              : 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
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
        {selected && <ParticipantModal participant={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}