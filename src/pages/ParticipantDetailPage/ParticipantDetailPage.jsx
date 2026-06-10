import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mail, BookOpen,
  CalendarDays, Briefcase, GraduationCap, Tag,
  ExternalLink, User, ZoomIn, X, Globe, FolderOpen, FileImage,
} from 'lucide-react';
import { participantesApi } from '@/services/apiService';
import { toSlug } from '@/shared/lib/toSlug';
import { formatDate } from '@/shared/lib/formatDate';

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.48, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const TIPO_STYLE = {
  evento: { bg: '#EEF3FF', color: '#1A3FAA', label: 'Evento' },
  manual: { bg: '#ECFDF5', color: '#065F46', label: 'Manual'  },
};

// ─── Helpers de normalización ──────────────────────────────────────────

/**
 * Convierte cualquier valor a string seguro.
 * Maneja strings, números, objetos con nombre/name, y null/undefined.
 */
function toStr(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return String(val.nombre ?? val.name ?? val.label ?? '').trim();
  }
  return String(val).trim();
}

/**
 * Convierte cualquier valor de habilidades a un array limpio de strings.
 * Soporta:
 *  - Array de strings:  ["React", "Node.js"]
 *  - Array de objetos:  [{nombre:"React"}, {name:"Node.js"}]
 *  - JSON string:       '["React","Node.js"]'
 *  - CSV plano:         "React, Node.js, Laravel"
 *  - null / undefined:  → []
 */
function normalizeSkills(raw) {
  if (!raw) return [];

  // Ya es array
  if (Array.isArray(raw)) {
    return raw
      .map(toStr)
      .filter(Boolean);
  }

  // Es string — puede ser JSON o CSV
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];

    // Intentar JSON primero
    if (trimmed[0] === '[' || trimmed[0] === '"') {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(toStr).filter(Boolean);
        if (typeof parsed === 'string') return parsed.split(',').map(s => s.trim()).filter(Boolean);
      } catch { /* no es JSON válido, caer en CSV */ }
    }

    // CSV plano
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }

  return [];
}

/**
 * Convierte cualquier valor de roles a un array limpio de strings.
 */
function normalizeRoles(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(toStr).filter(Boolean);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(toStr).filter(Boolean);
    } catch { /* no es JSON */ }
    return [trimmed];
  }
  return [];
}

// ─── Subcomponentes ────────────────────────────────────────────────────

function ProjectCard({ project, index }) {
  const isLink = project.tipo === 'link';
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      style={{
        padding: '14px 16px', borderRadius: 14,
        background: '#fff', border: '1px solid #f1f5f9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'border-color 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d7f8'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,63,170,0.07)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: isLink ? '#EEF3FF' : '#F0FDF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isLink
            ? <Globe size={16} style={{ color: '#1A3FAA' }} />
            : <FileImage size={16} style={{ color: '#065F46' }} />
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0A0F1E', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            {toStr(project.titulo)}
          </p>
          {project.descripcion && (
            <p style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 0', lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>
              {toStr(project.descripcion)}
            </p>
          )}
          {project.url_link && (
            <a
              href={toStr(project.url_link)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                marginTop: 8, fontSize: 12, fontWeight: 600,
                color: '#1A3FAA', textDecoration: 'none',
                fontFamily: 'DM Sans, sans-serif', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Ver proyecto <ExternalLink size={11} />
            </a>
          )}
        </div>

        {project.imagen_path && (
          <a href={toStr(project.imagen_path)} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
            <img
              src={toStr(project.imagen_path)}
              alt={`Evidencia: ${toStr(project.titulo)}`}
              style={{
                width: 64, height: 64, borderRadius: 10,
                objectFit: 'cover', cursor: 'zoom-in',
                border: '1px solid #e2e8f0',
              }}
            />
          </a>
        )}
      </div>
    </motion.div>
  );
}

function ActivityCard({ item, index }) {
  const style = TIPO_STYLE[item.tipo] ?? { bg: '#F1F5F9', color: '#475569', label: item.tipo };
  const to    = item.tipo === 'evento' ? `/eventos/${item.id}` : `/manuales/${item.id}`;

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '14px 16px', borderRadius: 14,
        background: '#fff', border: '1px solid #f1f5f9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'border-color 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d7f8'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,63,170,0.07)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: style.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.tipo === 'evento'
          ? <CalendarDays size={16} style={{ color: style.color }} />
          : <BookOpen      size={16} style={{ color: style.color }} />
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {item.rol && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            color: style.color, background: style.bg,
            padding: '2px 8px', borderRadius: 99,
            marginBottom: 5, fontFamily: 'DM Sans, sans-serif',
          }}>
            <Briefcase size={9} /> {toStr(item.rol)}
          </span>
        )}

        <Link
          to={to}
          style={{
            display: 'block', fontSize: 14, fontWeight: 600,
            color: '#0A0F1E', textDecoration: 'none', lineHeight: 1.35,
            fontFamily: 'DM Sans, sans-serif', transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = style.color; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#0A0F1E'; }}
        >
          {toStr(item.titulo)}
          <ExternalLink size={11} style={{ marginLeft: 5, opacity: 0.4, verticalAlign: 'middle' }} />
        </Link>

        <div style={{ display: 'flex', gap: 12, marginTop: 5, flexWrap: 'wrap' }}>
          {item.fecha && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
              <CalendarDays size={10} /> {formatDate(item.fecha)}
            </span>
          )}
          {item.categoria && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
              <Tag size={10} /> {toStr(item.categoria)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── ParticipantDetailPage ─────────────────────────────────────────────

export function ParticipantDetailPage() {
  const { slug } = useParams();

  const [participant, setParticipant] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [lightbox, setLightbox]       = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  const closeLightbox = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    if (!lightbox) return;
    const esc = (e) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [lightbox, closeLightbox]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setParticipant(null);

    async function load() {
      try {
        // 1. Resolver slug → id
        const all = await participantesApi.getAll();
        const found = all.find(
          (p) => toSlug(toStr(p.name ?? p.nombre)) === slug
        );
        if (!found) return;

        // 2. Cargar perfil completo
        const data = await participantesApi.getById(String(found.id));
        if (cancelled) return;

        // 3. Normalizar TODOS los campos antes de guardar en estado
        const primaryRole = toStr(data.role ?? data.rol ?? '');

        // Roles: preferir data.roles (array del PHP), si no construirlo
        const rawRoles = data.roles ?? data.roles_adicionales ?? null;
        const rolesArr = normalizeRoles(rawRoles);
        const finalRoles = rolesArr.length > 0
          ? rolesArr
          : primaryRole ? [primaryRole] : [];

        // Skills: puede llegar como array, JSON string o CSV plano
        const rawSkills = data.skills ?? data.habilidades ?? [];
        const skillsArr = normalizeSkills(rawSkills);

        setParticipant({
          id:          String(data.id ?? ''),
          name:        toStr(data.name     ?? data.nombre     ?? ''),
          role:        primaryRole,
          roles:       finalRoles,
          career:      toStr(data.career   ?? data.carrera    ?? ''),
          semester:    data.semestre ?? data.semester ?? null,
          bio:         toStr(data.bio      ?? data.descripcion ?? ''),
          skills:      skillsArr,
          linkedin:    toStr(data.linkedin  ?? ''),
          github:      toStr(data.github    ?? ''),
          email:       toStr(data.email     ?? ''),
          photo:       toStr(data.foto_path ?? data.photo     ?? ''),
          actividades: Array.isArray(data.actividades) ? data.actividades : [],
          proyectos:   Array.isArray(data.proyectos)   ? data.proyectos   : [],
        });
      } catch (err) {
        console.error('Error cargando participante:', err);
      }
    }

    load().finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (!participant && !loading) return <Navigate to="/nosotros" replace />;

  const p           = participant;
  const initials    = p ? p.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() : '';
  const actividades = p?.actividades ?? [];
  const proyectos   = p?.proyectos   ?? [];
  const eventos     = actividades.filter((a) => a.tipo === 'evento');
  const manuales    = actividades.filter((a) => a.tipo === 'manual');

  return (
    <main id="main-content" style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: 80 }}>

      {/* Back */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px 0' }}>
        <Link
          to="/nosotros"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10,
            border: '1px solid #E2E8F0', background: '#fff',
            color: '#475569', fontSize: 13, fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif', textDecoration: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A3FAA'; e.currentTarget.style.color = '#1A3FAA'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Volver
        </Link>
      </div>

      {/* Spinner */}
      {loading && !p && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <div style={{
            width: 32, height: 32, border: '3px solid #C7D7F8',
            borderTopColor: '#1A3FAA', borderRadius: '50%', animation: 'spin 0.7s linear infinite',
          }} />
        </div>
      )}

      {p && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px 0' }}
        >

          {/* ── Hero ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex', gap: 24, alignItems: 'flex-start',
              padding: '28px 28px', borderRadius: 20,
              background: 'linear-gradient(135deg, #EEF3FF 0%, #fff 60%)',
              border: '1px solid #C7D7F8',
              boxShadow: '0 4px 24px rgba(26,63,170,0.06)',
              flexWrap: 'wrap',
            }}
          >
            {/* Avatar */}
            <motion.div
              whileHover={p.photo ? { scale: 1.04 } : {}}
              onClick={p.photo ? () => setLightbox(true) : undefined}
              style={{
                width: 88, height: 88, borderRadius: 20,
                background: 'linear-gradient(135deg, #1A3FAA, #3B6FE8)',
                border: '3px solid #fff',
                overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(26,63,170,0.18)',
                cursor: p.photo ? 'zoom-in' : 'default',
                position: 'relative',
              }}
            >
              {p.photo ? (
                <>
                  <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div
                    onMouseEnter={() => setAvatarHover(true)}
                    onMouseLeave={() => setAvatarHover(false)}
                    style={{
                      position: 'absolute', inset: 0,
                      background: avatarHover ? 'rgba(0,0,0,0.34)' : 'rgba(0,0,0,0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.18s',
                    }}
                  >
                    <ZoomIn size={20} color="#fff" style={{ opacity: avatarHover ? 1 : 0, transition: 'opacity 0.18s' }} />
                  </div>
                </>
              ) : (
                <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
                  {initials}
                </span>
              )}
            </motion.div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(20px, 3.5vw, 30px)',
                fontWeight: 800, color: '#0A0F1E',
                margin: '0 0 8px', lineHeight: 1.2,
              }}>
                {p.name}
              </h1>

              {/* Roles */}
              {p.roles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {p.roles.map((r, i) => (
                    <span key={`${r}-${i}`} style={{
                      display: 'inline-block',
                      background: i === 0 ? '#1A3FAA' : '#EEF3FF',
                      color: i === 0 ? '#fff' : '#1A3FAA',
                      fontSize: 11, fontWeight: 700,
                      padding: '3px 12px', borderRadius: 99,
                      fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em',
                      border: i === 0 ? 'none' : '1px solid #C7D7F8',
                    }}>
                      {r}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                {p.career && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#475569', fontFamily: 'DM Sans, sans-serif' }}>
                    <GraduationCap size={13} style={{ color: '#94a3b8' }} /> {p.career}
                    {p.semester ? ` · Sem. ${p.semester}` : ''}
                  </span>
                )}
              </div>

              {/* Social links */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {p.email && (
                  <a href={`mailto:${p.email}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#1A3FAA'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}>
                    <Mail size={13} /> {p.email}
                  </a>
                )}
                {p.linkedin && (
                  <a href={p.linkedin} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#0369A1'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#0A0F1E'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                    </svg>
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Body ── */}
          <div
            style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}
            className="participant-body-grid"
          >

            {/* ── Contenido principal ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Bio */}
              {p.bio && (
                <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={1}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: '0 0 10px' }}>
                    Sobre mí
                  </h2>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                    {p.bio}
                  </p>
                </motion.section>
              )}

              {/* Proyectos */}
              {proyectos.length > 0 && (
                <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={1.5}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <FolderOpen size={15} style={{ color: '#1A3FAA' }} />
                    Proyectos ({proyectos.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {proyectos.map((pr, i) => <ProjectCard key={pr.id ?? i} project={pr} index={i} />)}
                  </div>
                </motion.section>
              )}

              {/* Eventos */}
              {eventos.length > 0 && (
                <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CalendarDays size={15} style={{ color: '#1A3FAA' }} />
                    Eventos ({eventos.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {eventos.map((ev, i) => <ActivityCard key={`ev-${ev.id ?? i}`} item={ev} index={i} />)}
                  </div>
                </motion.section>
              )}

              {/* Manuales */}
              {manuales.length > 0 && (
                <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <BookOpen size={15} style={{ color: '#065F46' }} />
                    Manuales ({manuales.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {manuales.map((mn, i) => <ActivityCard key={`mn-${mn.id ?? i}`} item={mn} index={i} />)}
                  </div>
                </motion.section>
              )}

              {/* Estado vacío */}
              {actividades.length === 0 && !loading && (
                <motion.div
                  variants={fadeUp} initial="hidden" animate="visible" custom={2}
                  style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}
                >
                  <User size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p style={{ fontSize: 14, margin: 0 }}>No hay actividades registradas aún.</p>
                </motion.div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <motion.aside
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              {/* Habilidades — solo renderiza si hay strings válidos */}
              {p.skills.length > 0 && (
                <div style={{
                  padding: 16, borderRadius: 14,
                  background: '#fff', border: '1px solid #f1f5f9',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}>
                  <p style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: '#94a3b8',
                    margin: '0 0 10px', fontFamily: 'DM Sans, sans-serif',
                  }}>
                    Habilidades
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.skills.map((skill, i) => (
                      /* skill aquí es SIEMPRE un string gracias a normalizeSkills() */
                      <span key={`${skill}-${i}`} style={{
                        display: 'inline-block',
                        padding: '3px 10px', borderRadius: 99,
                        background: '#EEF3FF', color: '#1A3FAA',
                        fontSize: 11, fontWeight: 600,
                        fontFamily: 'DM Sans, sans-serif',
                        border: '1px solid #C7D7F8',
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen de actividad */}
              {actividades.length > 0 && (
                <div style={{
                  padding: 16, borderRadius: 14,
                  background: '#fff', border: '1px solid #f1f5f9',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}>
                  <p style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: '#94a3b8',
                    margin: '0 0 12px', fontFamily: 'DM Sans, sans-serif',
                  }}>
                    Resumen de actividad
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {eventos.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#475569', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CalendarDays size={13} style={{ color: '#1A3FAA' }} /> Eventos
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A3FAA', fontFamily: 'Syne, sans-serif' }}>
                          {eventos.length}
                        </span>
                      </div>
                    )}
                    {manuales.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#475569', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <BookOpen size={13} style={{ color: '#065F46' }} /> Manuales
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46', fontFamily: 'Syne, sans-serif' }}>
                          {manuales.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        </motion.div>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && p?.photo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeLightbox}
            style={{
              position: 'fixed', inset: 0, zIndex: 3000,
              background: 'rgba(10,15,30,0.92)',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24, cursor: 'zoom-out',
            }}
          >
            <button
              onClick={closeLightbox}
              aria-label="Cerrar foto"
              style={{
                position: 'absolute', top: 20, right: 20,
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(6px)',
              }}
            >
              <X size={16} />
            </button>

            <motion.img
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              src={p.photo}
              alt={p.name}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '88vw', maxHeight: '88vh',
                borderRadius: 20,
                boxShadow: '0 28px 80px rgba(0,0,0,0.55)',
                objectFit: 'contain', cursor: 'default',
              }}
            />

            <div style={{
              position: 'absolute', bottom: 28,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.2px' }}>
                {p.name}
              </span>
              {p.role && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Sans, sans-serif' }}>
                  {p.role}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}