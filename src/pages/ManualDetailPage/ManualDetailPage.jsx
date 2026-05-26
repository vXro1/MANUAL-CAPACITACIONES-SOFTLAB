import { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Clock, User, BookOpen, FileText,
  ChevronRight, Tag, Building2, List, Mic, Users, UserCheck, ZoomIn, X,
} from 'lucide-react';
import { manualesApi, participantesApi } from '@/services/apiService';
import { PDFViewer } from '@/features/manual-viewer/PDFViewer';
import { Modal } from '@/shared/ui/Modal';
import { formatDate, formatTime } from '@/shared/lib/formatDate';
import { toSlug } from '@/shared/lib/toSlug';

/* ─── Category palette ──────────────────────────────────────── */
const CATEGORY_PALETTE = {
  'Realidad Virtual':       { bg: '#EEF3FF', accent: '#1A3FAA', border: '#C7D7F8' },
  'DevOps':                 { bg: '#FFF7ED', accent: '#C2410C', border: '#FED7AA' },
  'Control de Versiones':   { bg: '#F0FDF4', accent: '#15803D', border: '#BBF7D0' },
  'Desarrollo Frontend':    { bg: '#FDF4FF', accent: '#9333EA', border: '#E9D5FF' },
  'Desarrollo Backend':     { bg: '#FFF1F2', accent: '#E11D48', border: '#FECDD3' },
  'Bases de Datos':         { bg: '#F0F9FF', accent: '#0369A1', border: '#BAE6FD' },
  'Gestión de Proyectos':   { bg: '#FEFCE8', accent: '#CA8A04', border: '#FDE68A' },
  'Seguridad':              { bg: '#F8FAFC', accent: '#475569', border: '#CBD5E1' },
  'Inteligencia Artificial':{ bg: '#ECFDF5', accent: '#059669', border: '#A7F3D0' },
  default:                  { bg: '#EEF3FF', accent: '#1A3FAA', border: '#C7D7F8' },
};
function getCategoryPalette(cat) {
  return CATEGORY_PALETTE[cat] || CATEGORY_PALETTE.default;
}

/* ─── Animation variants ────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.52, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ─── Helpers ───────────────────────────────────────────────── */
function MetaChip({ icon: Icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
      <Icon size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}

function SectionCard({ children, palette }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${palette ? palette.border : '#f1f5f9'}`,
        background: palette ? palette.bg : '#fff',
        padding: 20,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
      {Icon && <Icon size={13} style={{ color: '#1A3FAA' }} />}
      <p
        style={{
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: '#94a3b8', margin: 0, fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {children}
      </p>
    </div>
  );
}

function PersonCard({ person }) {
  return (
    <Link
      to={`/participantes/${toSlug(person.name)}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 10,
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid #e5e7eb',
        transition: 'background 0.18s, border-color 0.18s',
        textDecoration: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#eef3ff'; e.currentTarget.style.borderColor = '#c7d7f8'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#EEF3FF', border: '1px solid #C7D7F8',
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {person.photo ? (
          <img src={person.photo} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A3FAA' }}>
            {person.name?.[0] ?? '?'}
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#0A0F1E', margin: 0, lineHeight: 1.3 }}>
          {person.name}
        </p>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
          {person.career ?? person.role ?? ''}
        </p>
      </div>
    </Link>
  );
}

/* ─── Image gallery with zoom lightbox ─────────────────────── */
function EvidenceLightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrent(c => (c - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % images.length);
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(3,7,18,0.97)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)', padding: 32,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de evidencias"
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <X size={18} />
      </button>

      {/* Counter */}
      <div
        style={{
          position: 'absolute', top: 16, left: 16,
          padding: '6px 14px', borderRadius: 99,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Sans, sans-serif' }}>
          {current + 1} / {images.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          alt={`Evidencia ${current + 1}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22, ease: EASE }}
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '100%', maxHeight: '80vh',
            objectFit: 'contain', borderRadius: 12,
            boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          }}
          draggable={false}
        />
      </AnimatePresence>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', bottom: 16,
            display: 'flex', gap: 6, padding: '8px 16px',
            background: 'rgba(0,0,0,0.5)', borderRadius: 12,
          }}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: 48, height: 34, borderRadius: 6, overflow: 'hidden',
                border: `2px solid ${i === current ? '#fff' : 'transparent'}`,
                opacity: i === current ? 1 : 0.38,
                transition: 'all 0.2s', cursor: 'pointer', padding: 0,
                transform: i === current ? 'scale(1.06)' : 'scale(1)',
              }}
            >
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Evidence image card ───────────────────────────────────── */
function EvidenceCard({ src, index, onOpen }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      onClick={() => onOpen(index)}
      style={{
        position: 'relative', aspectRatio: '4/3',
        overflow: 'hidden', borderRadius: 12,
        border: '1px solid #f1f5f9', background: '#F8FAFC',
        cursor: 'pointer',
      }}
    >
      <img
        src={src}
        alt={`Evidencia ${index + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      />
      {/* Zoom overlay */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(10,15,30,0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, transition: 'background 0.28s',
        }}
        className="evidence-overlay"
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(10,15,30,0.38)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,15,30,0)'; }}
      >
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transform: 'scale(0.8)',
            transition: 'opacity 0.22s, transform 0.22s',
          }}
          className="evidence-zoom-btn"
        >
          <ZoomIn size={16} color="#1A3FAA" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export function ManualDetailPage() {
  const { id } = useParams();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [manual, setManual] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setManual(null);
    Promise.all([manualesApi.getById(id), participantesApi.getAll()])
      .then(([m, participants]) => {
        if (!cancelled) {
          setManual(m ?? null);
          setAllParticipants(participants ?? []);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Cargando manual...</p>
      </main>
    );
  }

  if (!manual) return <Navigate to="/manuales" replace />;

  const evidenceGallery = (manual?.gallery ?? []).filter(
    s => typeof s === 'string' && s.startsWith('http')
  );

  const palette = getCategoryPalette(manual?.category);

  const speakerIds = manual?.speakerIds?.length
    ? manual.speakerIds
    : manual?.speakerId ? [manual.speakerId] : [];
  const speakers = speakerIds.map(sid => allParticipants.find(p => String(p.id) === String(sid))).filter(Boolean);
  const authors = (manual?.authorIds ?? []).map(aid => allParticipants.find(p => String(p.id) === String(aid))).filter(Boolean);
  const auxiliares = (manual?.auxiliaresIds ?? []).map(aid => allParticipants.find(p => String(p.id) === String(aid))).filter(Boolean);

  return (
    <main id="main-content" style={{ minHeight: '100vh', background: '#F8FAFC', paddingTop: 64 }}>

      {/* ── Back nav ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px clamp(16px,4vw,48px) 0' }}>
        <Link
          to="/manuales"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: '#94a3b8', textDecoration: 'none',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
            transition: 'color 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#1A3FAA'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; }}
        >
          <ArrowLeft size={14} /> Manuales
        </Link>
      </div>

      {/* ── Hero card ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px clamp(16px,4vw,48px) 0' }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            position: 'relative', overflow: 'hidden', borderRadius: 24,
            background: `linear-gradient(145deg, ${palette.bg} 0%, #fff 55%)`,
            border: `1px solid ${palette.border}`,
            boxShadow: `0 4px 32px rgba(0,0,0,0.06), 0 0 0 1px ${palette.border}40`,
          }}
        >
          {manual.cover && (
            <div style={{ position: 'absolute', inset: 0, opacity: 0.045 }}>
              <img src={manual.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ position: 'relative', padding: 'clamp(24px,5vw,40px)' }}>
            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {manual.category && (
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '3px 12px', borderRadius: 999,
                    fontSize: 11, fontWeight: 700,
                    background: palette.bg, color: palette.accent,
                    border: `1.5px solid ${palette.border}`,
                    fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {manual.category}
                </span>
              )}
              {manual.featured && (
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '3px 12px', borderRadius: 999,
                    fontSize: 11, fontWeight: 700,
                    background: '#FEFCE8', color: '#CA8A04',
                    border: '1.5px solid #FDE68A',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  Destacado
                </span>
              )}
            </div>

            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}
              className="manual-hero-grid"
            >
              {/* Left: title + meta */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h1
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontSize: 'clamp(22px, 3vw, 34px)',
                      fontWeight: 800, color: '#0A0F1E',
                      margin: 0, lineHeight: 1.2, letterSpacing: '-0.5px',
                    }}
                  >
                    {manual.title}
                  </h1>
                  {manual.subtitle && (
                    <p style={{ marginTop: 6, fontSize: 15, color: palette.accent, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
                      {manual.subtitle}
                    </p>
                  )}
                </div>

                {manual.description && (
                  <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif', maxWidth: 600 }}>
                    {manual.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {manual.institution && <MetaChip icon={Building2}>{manual.institution}</MetaChip>}
                  {manual.date && <MetaChip icon={Calendar}>{formatDate(manual.date)}</MetaChip>}
                  {manual.time && <MetaChip icon={Clock}>{formatTime(manual.time)}</MetaChip>}
                  {manual.duration && <MetaChip icon={Clock}>{manual.duration}</MetaChip>}
                </div>
              </div>

              {/* Right: PDF button */}
              {manual.pdf && (
                <motion.button
                  onClick={() => setPdfOpen(true)}
                  whileHover={{ y: -2, boxShadow: `0 16px 40px ${palette.accent}28` }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    borderRadius: 16, background: palette.accent,
                    padding: '14px 20px', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    boxShadow: `0 6px 24px ${palette.accent}30`,
                    flexShrink: 0, alignSelf: 'flex-start',
                    fontFamily: 'DM Sans, sans-serif',
                    willChange: 'transform',
                  }}
                >
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <BookOpen size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Abrir manual</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.62)', margin: 0 }}>Ver en PDF</p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 4 }} />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          maxWidth: 1200, margin: '0 auto',
          padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,48px)',
          display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32,
        }}
        className="manual-body-grid"
      >

        {/* ── Left column ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
        >
          {/* Introduction */}
          {manual.introduction && (
            <motion.section variants={fadeUp}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0A0F1E', marginBottom: 12, fontFamily: 'Syne, sans-serif' }}>
                Introducción
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {manual.introduction.split('\n\n').map((p, i) => (
                  <p key={i} style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.75, fontFamily: 'DM Sans, sans-serif' }}>{p}</p>
                ))}
              </div>
            </motion.section>
          )}

          {/* Objectives */}
          {manual.objectives?.length > 0 && (
            <motion.section variants={fadeUp}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0A0F1E', marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>
                Objetivos
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {manual.objectives.map((obj, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      borderRadius: 12, border: '1px solid #f1f5f9',
                      background: '#fff', padding: '12px 16px',
                      boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
                      transition: 'border-color 0.18s, box-shadow 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.boxShadow = `0 4px 16px ${palette.accent}0A`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.03)'; }}
                  >
                    <span
                      style={{
                        flexShrink: 0, marginTop: 2,
                        width: 22, height: 22, borderRadius: '50%',
                        background: palette.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: '#fff',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, fontFamily: 'DM Sans, sans-serif' }}>{obj}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Evidence Gallery */}
          {evidenceGallery.length > 0 && (
            <motion.section variants={fadeUp}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0A0F1E', marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>
                Galería de evidencias
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 12,
                }}
              >
                {evidenceGallery.map((src, i) => (
                  <EvidenceCard key={i} src={src} index={i} onOpen={setLightboxIdx} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Empty state */}
          {!manual.introduction && !manual.objectives?.length && !evidenceGallery.length && (
            <motion.div
              variants={fadeUp}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 12, padding: '48px 0', textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: palette.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 16px ${palette.accent}18`,
                }}
              >
                <FileText size={24} style={{ color: palette.accent, opacity: 0.5 }} />
              </div>
              <p style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                El contenido de este manual aún no ha sido cargado.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* ── Sidebar ── */}
        <motion.aside
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {/* PDF CTA */}
          {manual.pdf ? (
            <motion.button
              variants={fadeUp}
              onClick={() => setPdfOpen(true)}
              whileHover={{ y: -2, boxShadow: `0 12px 32px ${palette.accent}22` }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                borderRadius: 16, border: `1.5px solid ${palette.border}`,
                background: palette.bg, padding: '14px 16px',
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'background 0.2s',
                willChange: 'transform',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = palette.bg.replace('#', '#') + 'cc' || '#dce8ff'; }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: palette.accent, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}
              >
                <BookOpen size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: palette.accent, margin: 0, lineHeight: 1.3 }}>
                  Ver manual PDF
                </p>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Visor interactivo</p>
              </div>
            </motion.button>
          ) : (
            <motion.div
              variants={fadeUp}
              style={{
                borderRadius: 16, border: '1.5px dashed #E2E8F0',
                background: '#fff', padding: 20,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
              }}
            >
              <FileText size={22} style={{ color: '#CBD5E1' }} />
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                PDF no disponible aún
              </p>
            </motion.div>
          )}

          {/* Ponentes */}
          {speakers.length > 0 && (
            <motion.div variants={fadeUp}>
              <SectionCard palette={null}>
                <SectionLabel icon={Mic}>{speakers.length === 1 ? 'Ponente' : 'Ponentes'}</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {speakers.map(s => <PersonCard key={s.id} person={s} />)}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* Autores */}
          {authors.length > 0 && (
            <motion.div variants={fadeUp}>
              <SectionCard palette={null}>
                <SectionLabel icon={Users}>{authors.length === 1 ? 'Autor' : 'Autores'}</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {authors.map(a => <PersonCard key={a.id} person={a} />)}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* Auxiliares */}
          {auxiliares.length > 0 && (
            <motion.div variants={fadeUp}>
              <SectionCard palette={null}>
                <SectionLabel icon={UserCheck}>Auxiliares externos</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {auxiliares.map(a => <PersonCard key={a.id} person={a} />)}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* Institution */}
          {manual.institution && (
            <motion.div variants={fadeUp}>
              <SectionCard palette={null}>
                <SectionLabel icon={Building2}>Institución</SectionLabel>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0A0F1E', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                  {manual.institution}
                </p>
              </SectionCard>
            </motion.div>
          )}

          {/* Tags */}
          {manual.tags?.length > 0 && (
            <motion.div variants={fadeUp}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Tag size={12} style={{ color: '#94a3b8' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
                  Etiquetas
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {manual.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px', borderRadius: 999,
                      border: '1px solid #E2E8F0', background: '#fff',
                      fontSize: 11, color: '#64748b', fontFamily: 'DM Sans, sans-serif',
                      transition: 'border-color 0.18s, color 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.color = palette.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748b'; }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.aside>
      </div>

      {/* ── Evidence Lightbox ── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <EvidenceLightbox
            images={evidenceGallery}
            startIndex={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>

      {/* ── PDF Modal ── */}
      <Modal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        size="full"
        className="!max-w-[95vw] !h-[95vh]"
      >
        <PDFViewer
          url={manual.pdf}
          title={manual.title}
          cover={manual.cover}
          institution={manual.institution}
        />
      </Modal>

    </main>
  );
}
