import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Star, Edit2, Trash2, Camera, FileText,
  Users, Save, GraduationCap, RefreshCw,
  CheckCircle, AlertTriangle, Info, UserPlus, UserCheck, UserX, Sparkles,
} from 'lucide-react';
import { directivosApi } from '@/services/directivosApi';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ACCENT_OPTIONS = [
  { accent: '#1A3FAA', bg: '#EEF3FF', border: '#C7D5F8', label: 'Azul índigo' },
  { accent: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Esmeralda' },
  { accent: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Ámbar' },
  { accent: '#DC2626', bg: '#FFF1F2', border: '#FECDD3', label: 'Carmesí' },
  { accent: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC', label: 'Cian' },
  { accent: '#0F766E', bg: '#F0FDFA', border: '#99F6E4', label: 'Teal' },
  { accent: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: 'Naranja' },
  { accent: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', label: 'Azul cielo' },
];

const PROFESIONES = [
  'Ingeniero/a de Sistemas',
  'Ingeniero/a de Software',
  'Ingeniero/a en Informática',
  'Licenciado/a en Matemáticas',
  'Licenciado/a en Física',
  'Magíster en Ingeniería',
  'Doctor/a en Ciencias de la Computación',
  'Doctor/a en Ingeniería',
  'Especialista en Redes',
  'Especialista en Seguridad Informática',
  'Investigador/a en IA',
  'Docente universitario/a',
];

const BADGES = [
  'Directora', 'Director', 'Docente', 'Co-directora', 'Co-director',
  'Coordinadora', 'Coordinador', 'Investigadora', 'Investigador',
  'Asesor/a', 'Tutor/a',
];

const E = [0.22, 1, 0.36, 1];

const DEFAULT_FORM = {
  name: '', role: '', profession: '', faculty: 'Corporación Universitaria Autónoma del Cauca',
  description: '', highlights: '', badge: '', featured: false,
  accent: '#1A3FAA', bg: '#EEF3FF', border: '#C7D5F8',
};

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// ─── Sistema de Toast visual ──────────────────────────────────────────────────

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    bg: '#F0FDF4', border: '#86EFAC', text: '#065F46', glow: 'rgba(5,150,105,0.2)',
  },
  error: {
    icon: X,
    gradient: 'linear-gradient(135deg, #DC2626, #B91C1C)',
    bg: '#FFF1F2', border: '#FECDD3', text: '#881337', glow: 'rgba(220,38,38,0.2)',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'linear-gradient(135deg, #D97706, #B45309)',
    bg: '#FFFBEB', border: '#FDE68A', text: '#78350F', glow: 'rgba(217,119,6,0.2)',
  },
  info: {
    icon: Info,
    gradient: 'linear-gradient(135deg, #1A3FAA, #2649C8)',
    bg: '#EEF3FF', border: '#C7D5F8', text: '#1E3A8A', glow: 'rgba(26,63,170,0.2)',
  },
  created: {
    icon: UserPlus,
    gradient: 'linear-gradient(135deg, #059669, #0891B2)',
    bg: '#F0FDF4', border: '#6EE7B7', text: '#065F46', glow: 'rgba(5,150,105,0.2)',
  },
  updated: {
    icon: UserCheck,
    gradient: 'linear-gradient(135deg, #1A3FAA, #0891B2)',
    bg: '#EFF6FF', border: '#93C5FD', text: '#1E3A8A', glow: 'rgba(26,63,170,0.2)',
  },
  deleted: {
    icon: UserX,
    gradient: 'linear-gradient(135deg, #EA580C, #DC2626)',
    bg: '#FFF7ED', border: '#FED7AA', text: '#7C2D12', glow: 'rgba(234,88,12,0.2)',
  },
  featured: {
    icon: Star,
    gradient: 'linear-gradient(135deg, #D97706, #EA580C)',
    bg: '#FFFBEB', border: '#FDE68A', text: '#78350F', glow: 'rgba(217,119,6,0.2)',
  },
};

function ToastNotification({ toast, onClose }) {
  if (!toast.show) return null;
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.85 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.85 }}
          transition={{ duration: 0.4, ease: E }}
          style={{
            position: 'fixed', bottom: 32, right: 32, zIndex: 99999,
            width: 360, fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <div style={{
            background: cfg.bg, border: `1.5px solid ${cfg.border}`,
            borderRadius: 20, padding: '18px 18px 16px',
            boxShadow: `0 24px 64px ${cfg.glow}, 0 8px 24px rgba(0,0,0,0.08)`,
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: cfg.gradient, borderRadius: '20px 20px 0 0' }} />
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                background: cfg.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${cfg.glow}`,
              }}>
                <Icon size={20} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: cfg.text, margin: '0 0 4px', letterSpacing: '-0.2px' }}>
                  {toast.title}
                </p>
                <p style={{ fontSize: 12.5, color: cfg.text, opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
                  {toast.message}
                </p>
              </div>
              <button onClick={onClose} style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.text, flexShrink: 0 }}>
                <X size={13} />
              </button>
            </div>
            <motion.div
              initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
              transition={{ duration: 4.5, ease: 'linear' }}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: cfg.gradient, transformOrigin: 'left', opacity: 0.5, borderRadius: '0 0 20px 20px' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Modal de confirmación ────────────────────────────────────────────────────

function ConfirmModal({ isOpen, config, onConfirm, onCancel }) {
  if (!isOpen || !config) return null;
  const cfg = TOAST_CONFIG[config.type] || TOAST_CONFIG.warning;
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(8px)' }}
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ duration: 0.3, ease: E }}
          style={{
            position: 'relative', background: '#fff', borderRadius: 24,
            padding: '32px 28px 28px', maxWidth: 420, width: '100%',
            boxShadow: '0 40px 100px rgba(0,0,0,0.22)',
            textAlign: 'center', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: cfg.gradient }} />
          <div style={{
            width: 72, height: 72, borderRadius: 22, margin: '0 auto 20px',
            background: `linear-gradient(135deg, ${cfg.bg}, #fff)`,
            border: `2px solid ${cfg.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${cfg.glow}`,
          }}>
            <Icon size={30} color={cfg.text} />
          </div>
          {config.avatar && (
            <div style={{ width: 52, height: 52, borderRadius: '50%', margin: '-8px auto 16px', background: config.avatarBg || '#EEF3FF', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: config.avatarAccent || '#1A3FAA', fontFamily: 'Syne, sans-serif', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
              {config.avatarPhoto
                ? <img src={config.avatarPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : config.avatar}
            </div>
          )}
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 19, fontWeight: 800, color: '#0A0F1E', margin: '0 0 10px', letterSpacing: '-0.4px' }}>
            {config.title}
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.65, margin: '0 0 28px' }}>
            {config.message}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={onCancel}
              style={{ padding: '11px 22px', background: '#F8FAFF', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onConfirm}
              style={{ padding: '11px 24px', background: cfg.gradient, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 16px ${cfg.glow}` }}
            >
              {config.confirmLabel || 'Confirmar'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Director Card ────────────────────────────────────────────────────────────

function DirectorCard({ director, onEdit, onDelete, onToggleFeatured }) {
  const initials = director.initials || getInitials(director.name);
  const borderCol = director.borderColor || director.border || '#C7D5F8';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.35, ease: E }}
      whileHover={{ y: -4 }}
      style={{
        background: '#fff', borderRadius: 22,
        border: `1.5px solid ${borderCol}`,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.25s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.1), 0 0 0 2px ${borderCol}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'; }}
    >
      <div style={{
        background: `linear-gradient(145deg, ${director.bg || '#EEF3FF'} 0%, ${director.bg || '#EEF3FF'}AA 100%)`,
        padding: '28px 20px 22px', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        {director.featured && (
          <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: '#FFF8EE', color: '#D97706', border: '1.5px solid #FDE68A', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={9} fill="#D97706" color="#D97706" /> PORTADA
          </div>
        )}
        {director.badge && (
          <div style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: '#fff', color: director.accent || '#1A3FAA', border: `1.5px solid ${borderCol}`, fontFamily: 'DM Sans, sans-serif' }}>
            {director.badge}
          </div>
        )}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: director.accent || '#1A3FAA', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '4px solid #fff',
          boxShadow: `0 0 0 3px ${borderCol}, 0 8px 24px ${director.accent || '#1A3FAA'}35`,
          flexShrink: 0,
        }}>
          {director.photo
            ? <img src={director.photo} alt={director.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{initials}</span>
          }
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15.5, fontWeight: 700, color: '#0A0F1E', margin: '0 0 4px', letterSpacing: '-0.3px' }}>{director.name}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: director.accent || '#1A3FAA', margin: '0 0 2px', fontFamily: 'DM Sans, sans-serif' }}>{director.role}</p>
          {director.profession && (
            <p style={{ fontSize: 11.5, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{director.profession}</p>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${borderCol}, transparent)` }} />

      <div style={{ padding: '14px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {director.description && (
          <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.7, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {director.description}
          </p>
        )}
        {director.chips?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {director.chips.map((ch) => (
              <span key={ch} style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: director.bg || '#EEF3FF', color: director.accent || '#1A3FAA', border: `1px solid ${borderCol}`, fontFamily: 'DM Sans, sans-serif' }}>{ch}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '10px 12px', borderTop: `1px solid ${director.bg || '#F8FAFF'}`, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => onToggleFeatured(director)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s', background: director.featured ? '#D97706' : '#FFF8EE', color: director.featured ? '#fff' : '#D97706', borderColor: director.featured ? '#D97706' : '#FDE68A', fontFamily: 'DM Sans, sans-serif' }}>
          <Star size={11} fill={director.featured ? '#fff' : 'none'} />
          {director.featured ? 'En portada' : 'Destacar'}
        </motion.button>
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => onEdit(director)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#EEF3FF', color: '#1A3FAA', border: '1.5px solid #C7D5F8', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif' }}>
          <Edit2 size={11} /> Editar
        </motion.button>
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => onDelete(director)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: '#FFF1F2', color: '#E11D48', border: '1.5px solid #FECDD3', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif' }}>
          <Trash2 size={11} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Modal Form con tabs ──────────────────────────────────────────────────────

const TABS = [
  { id: 'foto', label: 'Foto', icon: Camera },
  { id: 'info', label: 'Información', icon: GraduationCap },
  { id: 'detalle', label: 'Detalle', icon: FileText },
  { id: 'config', label: 'Color y visibilidad', icon: Sparkles },
];

function DirectorModal({ isOpen, onClose, onSave, initial, loading }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [chips, setChips] = useState([]);
  const [chipInput, setChipInput] = useState('');
  const [docs, setDocs] = useState([]);
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [photo, setPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState('foto');
  const fileRef = useRef();

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('foto');
    if (initial) {
      setForm({
        name: initial.name ?? '',
        role: initial.role ?? '',
        profession: initial.profession ?? '',
        faculty: initial.faculty ?? 'Corporación Universitaria Autónoma del Cauca',
        description: initial.description ?? '',
        highlights: initial.highlights ?? '',
        badge: initial.badge ?? '',
        featured: !!initial.featured,
        accent: initial.accent ?? '#1A3FAA',
        bg: initial.bg ?? '#EEF3FF',
        border: initial.borderColor ?? initial.border ?? '#C7D5F8',
      });
      setChips(initial.chips ?? []);
      setDocs(initial.docs ?? []);
      setPhoto(initial.photo ?? null);
    } else {
      setForm(DEFAULT_FORM);
      setChips([]); setDocs([]); setPhoto(null);
    }
    setChipInput(''); setDocName(''); setDocUrl('');
  }, [isOpen, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setColor = (opt) => setForm((f) => ({ ...f, accent: opt.accent, bg: opt.bg, border: opt.border }));

  const handlePhoto = (file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('La foto supera los 3 MB permitidos'); return; }
    const reader = new FileReader();
    reader.onload = (e) => setPhoto(e.target.result);
    reader.readAsDataURL(file);
  };

  const addChip = () => {
    const v = chipInput.trim().replace(',', '');
    if (v && !chips.includes(v)) setChips((c) => [...c, v]);
    setChipInput('');
  };

  const addDoc = () => {
    if (!docName.trim()) return;
    setDocs((d) => [...d, { name: docName.trim(), url: docUrl.trim() }]);
    setDocName(''); setDocUrl('');
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.role.trim()) { alert('Nombre y cargo son obligatorios'); return; }
    onSave({ ...form, chips, docs, photo });
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%', padding: '10px 13px', border: '1.5px solid #E2E8F0', borderRadius: 10,
    fontSize: 13.5, color: '#0A0F1E', background: '#FAFAFA', fontFamily: 'DM Sans, sans-serif',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: '#374151', letterSpacing: '0.06em',
    textTransform: 'uppercase', marginBottom: 6, display: 'block', fontFamily: 'DM Sans, sans-serif',
  };

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.3, ease: E }}
          style={{
            position: 'relative', background: '#fff', borderRadius: 26,
            width: '100%', maxWidth: 680, maxHeight: '94vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 40px 100px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}
        >
          {/* Header con tabs */}
          <div style={{ background: form.bg, padding: '22px 28px 0', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: form.accent, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${form.border}`, boxShadow: `0 4px 12px ${form.accent}40` }}>
                  {photo
                    ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{form.name ? getInitials(form.name) : '?'}</span>
                  }
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: 0 }}>
                    {initial ? 'Editar directivo' : 'Nuevo directivo'}
                  </p>
                  <p style={{ fontSize: 11.5, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                    {form.name || 'Sin nombre'}{form.role ? ` · ${form.role}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', border: `1px solid ${form.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                <X size={15} />
              </button>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2 }}>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: active ? 700 : 500, background: active ? '#fff' : 'transparent', color: active ? form.accent : '#94A3B8', fontFamily: 'DM Sans, sans-serif', borderBottom: active ? `2px solid ${form.accent}` : '2px solid transparent', transition: 'all 0.15s' }}>
                    <Icon size={13} /> {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuerpo scrolleable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            <AnimatePresence mode="wait">

              {/* ── TAB FOTO ── */}
              {activeTab === 'foto' && (
                <motion.div key="foto"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handlePhoto(e.dataTransfer.files[0]); }}
                      style={{ width: 150, height: 150, borderRadius: '50%', margin: '0 auto 16px', background: photo ? 'transparent' : form.bg, border: `3px dashed ${photo ? form.accent : '#CBD5E1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', boxShadow: photo ? `0 0 0 5px ${form.border}, 0 8px 32px ${form.accent}30` : 'none', transition: 'all 0.25s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = form.accent; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = photo ? form.accent : '#CBD5E1'; }}
                    >
                      {photo ? (
                        <img src={photo} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <Camera size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
                          <p style={{ fontSize: 12.5, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Subir foto</p>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>JPG, PNG, WEBP · máx. 3 MB</p>
                    {photo && (
                      <button onClick={() => setPhoto(null)} style={{ fontSize: 12, color: '#E11D48', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                        Quitar foto
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhoto(e.target.files[0])} />

                  {/* Vista previa de iniciales */}
                  <div style={{ background: '#F8FAFF', borderRadius: 16, padding: 16, border: '1px dashed #E2E8F0' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: 'DM Sans, sans-serif' }}>Vista previa en distintos tamaños</p>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      {[80, 56, 40].map((size) => (
                        <div key={size} style={{ width: size, height: size, borderRadius: '50%', background: form.accent, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: `0 0 0 2px ${form.border}`, flexShrink: 0 }}>
                          {photo
                            ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ color: '#fff', fontSize: size * 0.28, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{form.name ? getInitials(form.name) : '??'}</span>
                          }
                        </div>
                      ))}
                      <p style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
                        {photo ? '✓ Foto cargada' : `Iniciales: "${form.name ? getInitials(form.name) : '??'}"`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── TAB INFORMACIÓN ── */}
              {activeTab === 'info' && (
                <motion.div key="info"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Nombre completo *</label>
                      <input style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej. Zulema León"
                        onFocus={(e) => { e.currentTarget.style.borderColor = form.accent; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Cargo / Rol *</label>
                      <input style={inputStyle} value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Ej. Directora del semillero"
                        onFocus={(e) => { e.currentTarget.style.borderColor = form.accent; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Profesión</label>
                      <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto', marginBottom: 8 }}
                        value={PROFESIONES.includes(form.profession) ? form.profession : ''}
                        onChange={(e) => set('profession', e.target.value)}>
                        <option value="">— Seleccionar —</option>
                        {PROFESIONES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input style={inputStyle} value={form.profession} onChange={(e) => set('profession', e.target.value)} placeholder="O escribe aquí..."
                        onFocus={(e) => { e.currentTarget.style.borderColor = form.accent; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Etiqueta (badge)</label>
                      <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto', marginBottom: 8 }}
                        value={BADGES.includes(form.badge) ? form.badge : ''}
                        onChange={(e) => set('badge', e.target.value)}>
                        <option value="">— Seleccionar —</option>
                        {BADGES.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <input style={inputStyle} value={form.badge} onChange={(e) => set('badge', e.target.value)} placeholder="O escribe aquí..."
                        onFocus={(e) => { e.currentTarget.style.borderColor = form.accent; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Institución / Facultad</label>
                    <input style={{ ...inputStyle, marginBottom: 8 }} value={form.faculty} onChange={(e) => set('faculty', e.target.value)}
                      placeholder="Corporación Universitaria Autónoma del Cauca"
                      onFocus={(e) => { e.currentTarget.style.borderColor = form.accent; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                    <p style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                      Predeterminado: Corporación Universitaria Autónoma del Cauca. Puedes editarlo libremente.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── TAB DETALLE ── */}
              {activeTab === 'detalle' && (
                <motion.div key="detalle"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Descripción / Responsabilidades</label>
                    <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 88, lineHeight: 1.65 }}
                      value={form.description} onChange={(e) => set('description', e.target.value)}
                      placeholder="Describe el rol, responsabilidades y aportes..."
                      onFocus={(e) => { e.currentTarget.style.borderColor = form.accent; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                  </div>
                  <div>
                    <label style={labelStyle}>En qué se destaca</label>
                    <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 64, lineHeight: 1.65 }}
                      value={form.highlights} onChange={(e) => set('highlights', e.target.value)}
                      placeholder="Áreas de expertise, logros..."
                      onFocus={(e) => { e.currentTarget.style.borderColor = form.accent; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                  </div>

                  {/* Chips */}
                  <div>
                    <label style={labelStyle}>
                      Áreas / Etiquetas{' '}
                      <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: '#94A3B8' }}>(Enter o coma)</span>
                    </label>
                    <div
                      style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 10, background: '#FAFAFA', minHeight: 44, alignItems: 'center' }}
                      onClick={() => document.getElementById('chip-field-dir')?.focus()}
                    >
                      {chips.map((ch) => (
                        <span key={ch} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: form.bg, color: form.accent, border: `1px solid ${form.border}` }}>
                          {ch}
                          <button onClick={() => setChips((c) => c.filter((x) => x !== ch))}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: form.accent, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                        </span>
                      ))}
                      <input
                        id="chip-field-dir"
                        value={chipInput}
                        onChange={(e) => setChipInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addChip(); } }}
                        placeholder={chips.length === 0 ? 'Ej. DevOps, Investigación...' : ''}
                        style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', minWidth: 130, color: '#0A0F1E', fontFamily: 'DM Sans, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* Documentos */}
                  <div>
                    <label style={labelStyle}>Documentos / Proyectos</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <input style={{ ...inputStyle, flex: '1 1 160px' }} value={docName} onChange={(e) => setDocName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addDoc()} placeholder="Nombre del documento"
                        onFocus={(e) => { e.currentTarget.style.borderColor = form.accent; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                      <input style={{ ...inputStyle, flex: '1 1 160px' }} value={docUrl} onChange={(e) => setDocUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addDoc()} placeholder="URL (opcional)"
                        onFocus={(e) => { e.currentTarget.style.borderColor = form.accent; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
                      <button onClick={addDoc} style={{ padding: '10px 14px', background: form.bg, color: form.accent, border: `1px solid ${form.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Agregar</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {docs.map((doc, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F8FAFF', borderRadius: 8, border: '1px solid #F1F5F9' }}>
                          <FileText size={13} color={form.accent} />
                          <span style={{ flex: 1, fontSize: 12.5, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
                            {doc.name}{doc.url && <span style={{ color: '#94A3B8', fontSize: 11 }}> — {doc.url}</span>}
                          </span>
                          <button onClick={() => setDocs((d) => d.filter((_, j) => j !== i))}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#E11D48', display: 'flex', padding: 2 }}><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── TAB COLOR Y VISIBILIDAD ── */}
              {activeTab === 'config' && (
                <motion.div key="config"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                  <div>
                    <label style={labelStyle}>Color de la tarjeta</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                      {ACCENT_OPTIONS.map((opt) => (
                        <button key={opt.accent} onClick={() => setColor(opt)}
                          style={{ padding: '12px 8px', borderRadius: 14, background: opt.bg, border: form.accent === opt.accent ? `3px solid ${opt.accent}` : `1.5px solid ${opt.border}`, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 9, background: opt.accent, boxShadow: form.accent === opt.accent ? `0 4px 12px ${opt.accent}50` : 'none' }} />
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: opt.accent, fontFamily: 'DM Sans, sans-serif' }}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle destacar */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => set('featured', !form.featured)}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', padding: '18px 20px', background: form.featured ? '#FFFBEB' : '#F8FAFF', borderRadius: 16, border: form.featured ? '2px solid #FDE68A' : '1.5px solid #F1F5F9', transition: 'all 0.2s' }}
                  >
                    <div style={{ width: 48, height: 26, borderRadius: 13, background: form.featured ? '#D97706' : '#E2E8F0', transition: 'background 0.25s', position: 'relative', flexShrink: 0 }}>
                      <motion.div
                        animate={{ x: form.featured ? 24 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: 13.5, color: '#0A0F1E', margin: 0, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>
                        ⭐ Destacar en página principal
                      </p>
                      <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
                        {form.featured ? 'Aparece en portada y en la sección Nosotros.' : 'Solo aparece en la sección Nosotros, no en portada.'}
                      </p>
                    </div>
                  </motion.div>

                  {/* Vista previa */}
                  <div style={{ background: '#F8FAFF', borderRadius: 16, padding: 16, border: '1px dashed #E2E8F0' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 14px', fontFamily: 'DM Sans, sans-serif' }}>Vista previa</p>
                    <div style={{ background: form.bg, borderRadius: 16, padding: '18px 22px', border: `2px solid ${form.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 54, height: 54, borderRadius: '50%', background: form.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: `0 4px 14px ${form.accent}40`, flexShrink: 0 }}>
                        {photo
                          ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                          : <span style={{ color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{form.name ? getInitials(form.name) : '??'}</span>
                        }
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: '0 0 2px' }}>{form.name || 'Nombre'}</p>
                        <p style={{ fontSize: 12, fontWeight: 600, color: form.accent, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{form.role || 'Cargo'}</p>
                        {form.featured && <span style={{ fontSize: 10, fontWeight: 700, background: '#FFF8EE', color: '#D97706', border: '1px solid #FDE68A', padding: '2px 7px', borderRadius: 5, fontFamily: 'DM Sans, sans-serif', marginTop: 4, display: 'inline-block' }}>⭐ EN PORTADA</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', borderTop: '1px solid #F1F5F9', background: '#FAFCFF', flexShrink: 0 }}>
            {/* Puntos de navegación */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ width: activeTab === t.id ? 20 : 7, height: 7, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, background: activeTab === t.id ? form.accent : '#E2E8F0', transition: 'all 0.25s' }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} disabled={loading}
                style={{ padding: '10px 18px', background: '#F8FAFF', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Cancelar
              </button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleSubmit} disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: loading ? '#94A3B8' : `linear-gradient(135deg, ${form.accent}, ${form.accent}CC)`, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: loading ? 'none' : `0 4px 16px ${form.accent}40`, transition: 'all 0.2s' }}>
                <Save size={14} /> {loading ? 'Guardando...' : (initial ? 'Guardar cambios' : 'Crear directivo')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export function AdminDirectors() {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [toast, setToast]         = useState({ show: false, title: '', message: '', type: 'success' });
  const [confirm, setConfirm]     = useState({ isOpen: false, config: null, onConfirm: null });

  const showToast = useCallback((title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 5000);
  }, []);

  const openConfirm = useCallback((config, onConfirm) => {
    setConfirm({ isOpen: true, config, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirm({ isOpen: false, config: null, onConfirm: null });
  }, []);

  const loadDirectors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await directivosApi.getAll();
      setDirectors(data);
      try { localStorage.setItem('softlab_directors', JSON.stringify(data)); } catch {}
    } catch (err) {
      showToast('Error al cargar', err.message, 'error');
      try {
        const cached = JSON.parse(localStorage.getItem('softlab_directors') ?? '[]');
        setDirectors(cached);
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadDirectors(); }, [loadDirectors]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await directivosApi.update(editing.id, data);
        showToast('Directivo actualizado', `${data.name} fue guardado correctamente.`, 'updated');
      } else {
        await directivosApi.create(data);
        showToast('Directivo creado', `${data.name} fue agregado al equipo.`, 'created');
      }
      await loadDirectors();
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      showToast('Error al guardar', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (director) => {
    openConfirm(
      {
        type: 'deleted',
        title: '¿Eliminar directivo?',
        message: `Se eliminará a "${director.name}" de forma permanente. Esta acción no se puede deshacer.`,
        confirmLabel: 'Sí, eliminar',
        avatar: getInitials(director.name),
        avatarBg: director.bg,
        avatarAccent: director.accent,
        avatarPhoto: director.photo,
      },
      async () => {
        closeConfirm();
        try {
          await directivosApi.delete(director.id);
          showToast('Directivo eliminado', `${director.name} fue removido del equipo.`, 'deleted');
          await loadDirectors();
        } catch (err) {
          showToast('Error al eliminar', err.message, 'error');
        }
      }
    );
  };

  const handleToggleFeatured = async (director) => {
    try {
      await directivosApi.toggleFeatured(director.id, director.featured);
      if (!director.featured) {
        showToast('⭐ Destacado en portada', `${director.name} aparece ahora en la página principal.`, 'featured');
      } else {
        showToast('Destacado removido', `${director.name} ya no aparece en portada.`, 'info');
      }
      await loadDirectors();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: E }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#0A0F1E', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            Personal Directivo
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            Datos guardados en servidor · Visibles desde cualquier dispositivo
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={loadDirectors} disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#F8FAFF', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Actualizar
          </button>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'linear-gradient(135deg,#1A3FAA,#2649C8)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 14px rgba(26,63,170,0.25)' }}
          >
            <Plus size={16} /> Agregar directivo
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {directors.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: directors.length, color: '#1A3FAA', bg: '#EEF3FF' },
            { label: 'Destacados', value: directors.filter((d) => d.featured).length, color: '#D97706', bg: '#FFF8EE' },
          ].map((s) => (
            <div key={s.label} style={{ padding: '10px 16px', background: '#fff', borderRadius: 12, border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</span>
              <span style={{ fontSize: 12.5, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>{s.label}</span>
            </div>
          ))}
          <div style={{ padding: '10px 16px', background: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#059669', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
              ✓ Guardado en servidor — visible en todos los dispositivos
            </span>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
          Cargando directivos del servidor...
        </div>
      )}

      {/* Estado vacío */}
      {!loading && directors.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', padding: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="#CBD5E1" />
          </div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: '#0A0F1E', margin: 0 }}>Sin personal directivo</p>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Agrega el primer docente o director del semillero</p>
          <button onClick={() => setModalOpen(true)}
            style={{ padding: '10px 20px', background: '#EEF3FF', color: '#1A3FAA', border: '1px solid #C7D5F8', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Agregar el primero →
          </button>
        </motion.div>
      )}

      {/* Grid de tarjetas */}
      {!loading && directors.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          <AnimatePresence>
            {directors.map((d) => (
              <DirectorCard
                key={d.id} director={d}
                onEdit={(dir) => { setEditing(dir); setModalOpen(true); }}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <DirectorModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
        loading={saving}
      />

      <ConfirmModal
        isOpen={confirm.isOpen}
        config={confirm.config}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />

      <ToastNotification
        toast={toast}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
