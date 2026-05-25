import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Star, Edit2, Trash2, Camera, FileText,
  Users, Save, GraduationCap, RefreshCw,
} from 'lucide-react';
import { directivosApi, syncDirectivos } from '@/services/directivosApi';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ACCENT_OPTIONS = [
  { accent: '#1A3FAA', bg: '#EEF3FF', border: '#C7D5F8', label: 'Azul' },
  { accent: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Verde' },
  { accent: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Ámbar' },
  { accent: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', label: 'Morado' },
  { accent: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC', label: 'Cian' },
  { accent: '#E11D48', bg: '#FFF1F2', border: '#FECDD3', label: 'Rojo' },
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
  'Otra',
];

const BADGES = [
  'Directora', 'Director', 'Docente', 'Co-directora', 'Co-director',
  'Coordinadora', 'Coordinador', 'Investigadora', 'Investigador',
];

const E = [0.22, 1, 0.36, 1];

const DEFAULT_FORM = {
  name: '', role: '', profession: '', professionCustom: '', faculty: '',
  description: '', highlights: '', badge: '', featured: false,
  accent: '#1A3FAA', bg: '#EEF3FF', border: '#C7D5F8',
};

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, show, type = 'success' }) {
  const bg = type === 'error' ? '#E11D48' : '#0A0F1E';
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 300,
            padding: '12px 20px', background: bg, color: '#fff',
            borderRadius: 12, fontSize: 13, fontWeight: 600,
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Director Card ────────────────────────────────────────────────────────────

function DirectorCard({ director, onEdit, onDelete, onToggleFeatured }) {
  const initials = director.initials || getInitials(director.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: E }}
      whileHover={{ y: -3, boxShadow: '0 10px 28px rgba(0,0,0,0.09)' }}
      style={{
        background: '#fff', borderRadius: 18, border: '1px solid #F1F5F9',
        overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Header coloreado */}
      <div style={{
        background: director.bg || '#EEF3FF',
        padding: '24px 18px 18px',
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        {director.featured && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
            background: '#FFF8EE', color: '#D97706', border: '1px solid #FDE68A',
            fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em',
          }}>
            ⭐ Destacado
          </div>
        )}

        {/* Badge de rol */}
        {director.badge && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
            background: '#fff', color: director.accent || '#1A3FAA',
            border: `1px solid ${director.borderColor || director.border || '#C7D5F8'}`,
            fontFamily: 'DM Sans, sans-serif',
          }}>
            {director.badge}
          </div>
        )}

        {/* Avatar */}
        <div style={{
          width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
          background: director.accent || '#1A3FAA', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '3px solid #fff',
          boxShadow: `0 4px 14px ${director.accent || '#1A3FAA'}40`,
        }}>
          {director.photo
            ? <img src={director.photo} alt={director.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{initials}</span>
          }
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: '0 0 3px' }}>
            {director.name}
          </p>
          <p style={{ fontSize: 12, fontWeight: 600, color: director.accent || '#1A3FAA', margin: '0 0 2px', fontFamily: 'DM Sans, sans-serif' }}>
            {director.role}
          </p>
          {director.profession && (
            <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              {director.profession}
            </p>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: director.borderColor || director.border || '#C7D5F8' }} />

      {/* Cuerpo */}
      <div style={{ padding: '14px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {director.description && (
          <p style={{
            fontSize: 12.5, color: '#64748B', lineHeight: 1.7, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {director.description}
          </p>
        )}

        {director.chips?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {director.chips.map((ch) => (
              <span key={ch} style={{
                fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6,
                background: director.bg || '#EEF3FF',
                color: director.accent || '#1A3FAA',
                border: `1px solid ${director.borderColor || director.border || '#C7D5F8'}`,
                fontFamily: 'DM Sans, sans-serif',
              }}>{ch}</span>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #F8FAFF', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button
          onClick={() => onToggleFeatured(director)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
            background: director.featured ? '#D97706' : '#FFF8EE',
            color: director.featured ? '#fff' : '#D97706',
            borderColor: director.featured ? '#D97706' : '#FDE68A',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <Star size={12} /> {director.featured ? 'Quitar' : 'Destacar'}
        </button>
        <button
          onClick={() => onEdit(director)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', background: '#EEF3FF', color: '#1A3FAA',
            border: '1px solid #C7D5F8', transition: 'all 0.15s',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <Edit2 size={12} /> Editar
        </button>
        <button
          onClick={() => onDelete(director)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 10px', borderRadius: 8, fontSize: 12,
            cursor: 'pointer', background: '#FFF1F2', color: '#E11D48',
            border: '1px solid #FECDD3', transition: 'all 0.15s',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Modal Form ───────────────────────────────────────────────────────────────

function DirectorModal({ isOpen, onClose, onSave, initial, loading }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [chips, setChips] = useState([]);
  const [chipInput, setChipInput] = useState('');
  const [docs, setDocs] = useState([]);
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();

  // Sincronizar cuando abre
  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setForm({
        name:            initial.name        ?? '',
        role:            initial.role        ?? '',
        profession:      PROFESIONES.includes(initial.profession) ? initial.profession : (initial.profession ? 'Otra' : ''),
        professionCustom: PROFESIONES.includes(initial.profession) ? '' : (initial.profession ?? ''),
        faculty:         initial.faculty     ?? '',
        description:     initial.description ?? '',
        highlights:      initial.highlights  ?? '',
        badge:           initial.badge       ?? '',
        featured:        !!initial.featured,
        accent:          initial.accent      ?? '#1A3FAA',
        bg:              initial.bg          ?? '#EEF3FF',
        border:          initial.borderColor ?? initial.border ?? '#C7D5F8',
      });
      setChips(initial.chips ?? []);
      setDocs(initial.docs ?? []);
      setPhoto(initial.photo ?? null);
    } else {
      setForm(DEFAULT_FORM);
      setChips([]);
      setDocs([]);
      setPhoto(null);
    }
    setChipInput('');
    setDocName('');
    setDocUrl('');
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
    setDocName('');
    setDocUrl('');
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.role.trim()) {
      alert('Nombre y cargo son campos obligatorios');
      return;
    }
    const finalProfession = form.profession === 'Otra' ? form.professionCustom : form.profession;
    onSave({ ...form, profession: finalProfession, chips, docs, photo });
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    border: '1.5px solid #E2E8F0', borderRadius: 10,
    fontSize: 13.5, color: '#0A0F1E', background: '#FAFAFA',
    fontFamily: 'DM Sans, sans-serif', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: '#374151',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    marginBottom: 6, display: 'block', fontFamily: 'DM Sans, sans-serif',
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,30,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: E }}
          style={{
            position: 'relative', background: '#fff', borderRadius: 20,
            width: '100%', maxWidth: 640, maxHeight: '92vh',
            overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 16px', borderBottom: '1px solid #F1F5F9',
            position: 'sticky', top: 0, background: '#fff', zIndex: 2, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#EEF3FF', border: '1px solid #C7D5F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={16} color="#1A3FAA" />
              </div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: 0 }}>
                {initial ? 'Editar directivo' : 'Agregar directivo'}
              </p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: '#F8FAFF', border: '1px solid #EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
              <X size={15} />
            </button>
          </div>

          {/* Cuerpo del formulario */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>

            {/* Nombre + Cargo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre completo *</label>
                <input style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej. Zulema León" />
              </div>
              <div>
                <label style={labelStyle}>Cargo / Rol *</label>
                <input style={inputStyle} value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Ej. Directora del semillero" />
              </div>
            </div>

            {/* Profesión (select) + Badge */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Profesión</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                  value={form.profession}
                  onChange={(e) => set('profession', e.target.value)}
                >
                  <option value="">— Seleccionar —</option>
                  {PROFESIONES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {form.profession === 'Otra' && (
                  <input
                    style={{ ...inputStyle, marginTop: 8 }}
                    value={form.professionCustom}
                    onChange={(e) => set('professionCustom', e.target.value)}
                    placeholder="Escribe la profesión"
                  />
                )}
              </div>
              <div>
                <label style={labelStyle}>Etiqueta visible (badge)</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                  value={form.badge}
                  onChange={(e) => set('badge', e.target.value)}
                >
                  <option value="">— Seleccionar —</option>
                  {BADGES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Institución / Facultad */}
            <div>
              <label style={labelStyle}>Institución / Facultad</label>
              <input style={inputStyle} value={form.faculty} onChange={(e) => set('faculty', e.target.value)} placeholder="Ej. Facultad de Ingeniería — UniAutónoma del Cauca" />
            </div>

            {/* Descripción */}
            <div>
              <label style={labelStyle}>Descripción / Responsabilidades</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 88, lineHeight: 1.65 }}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe el rol, responsabilidades y aportes del docente..."
              />
            </div>

            {/* Highlights */}
            <div>
              <label style={labelStyle}>En qué se destaca</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 64, lineHeight: 1.65 }}
                value={form.highlights}
                onChange={(e) => set('highlights', e.target.value)}
                placeholder="Áreas de expertise, logros, habilidades destacadas..."
              />
            </div>

            {/* Chips / Áreas */}
            <div>
              <label style={labelStyle}>
                Áreas / Etiquetas{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: '#94A3B8' }}>
                  (Enter para agregar)
                </span>
              </label>
              <div
                style={{
                  display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px',
                  border: '1.5px solid #E2E8F0', borderRadius: 10, background: '#FAFAFA',
                  minHeight: 44, cursor: 'text', alignItems: 'center',
                }}
                onClick={() => document.getElementById('chip-field')?.focus()}
              >
                {chips.map((ch) => (
                  <span key={ch} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: form.bg, color: form.accent, border: `1px solid ${form.border}`,
                  }}>
                    {ch}
                    <button onClick={() => setChips((c) => c.filter((x) => x !== ch))}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: form.accent, fontSize: 14, lineHeight: 1, padding: 0 }}>
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="chip-field"
                  value={chipInput}
                  onChange={(e) => setChipInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addChip(); } }}
                  placeholder={chips.length === 0 ? 'Ej. DevOps, Investigación...' : ''}
                  style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', minWidth: 130, color: '#0A0F1E', fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>
            </div>

            {/* Foto */}
            <div>
              <label style={labelStyle}>
                Foto del docente{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: '#94A3B8' }}>
                  (máx. 3 MB, se guarda en servidor)
                </span>
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handlePhoto(e.dataTransfer.files[0]); }}
                style={{
                  border: '2px dashed #E2E8F0', borderRadius: 12, padding: 20,
                  textAlign: 'center', cursor: 'pointer', background: '#FAFAFA',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1A3FAA'; e.currentTarget.style.background = '#F0F4FF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FAFAFA'; }}
              >
                {photo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img src={photo} alt="preview" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 13, color: '#374151', margin: 0, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>Foto cargada</p>
                      <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Haz clic para cambiar</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera size={24} color="#94A3B8" style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Haz clic o arrastra la foto aquí</p>
                    <p style={{ fontSize: 11.5, color: '#CBD5E1', margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif' }}>JPG, PNG, WEBP · máx. 3 MB</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhoto(e.target.files[0])} />
            </div>

            {/* Documentos */}
            <div>
              <label style={labelStyle}>Documentos / Proyectos asociados</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <input
                  style={{ ...inputStyle, flex: '1 1 160px' }}
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDoc()}
                  placeholder="Nombre del documento"
                />
                <input
                  style={{ ...inputStyle, flex: '1 1 160px' }}
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDoc()}
                  placeholder="URL (opcional)"
                />
                <button
                  onClick={addDoc}
                  style={{ padding: '10px 14px', background: '#EEF3FF', color: '#1A3FAA', border: '1px solid #C7D5F8', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}
                >
                  + Agregar
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {docs.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F8FAFF', borderRadius: 8, border: '1px solid #F1F5F9' }}>
                    <FileText size={13} color="#1A3FAA" />
                    <span style={{ flex: 1, fontSize: 12.5, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
                      {doc.name}{doc.url && <span style={{ color: '#94A3B8', fontSize: 11 }}> — {doc.url}</span>}
                    </span>
                    <button onClick={() => setDocs((d) => d.filter((_, j) => j !== i))}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#E11D48', display: 'flex', padding: 2 }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Color de acento */}
            <div>
              <label style={labelStyle}>Color de acento</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ACCENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.accent}
                    onClick={() => setColor(opt)}
                    title={opt.label}
                    style={{
                      width: 28, height: 28, borderRadius: 8, background: opt.accent,
                      border: form.accent === opt.accent ? '3px solid #0A0F1E' : '2px solid transparent',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Destacar */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px 14px', background: '#F8FAFF', borderRadius: 10, border: '1px solid #F1F5F9' }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#1A3FAA', cursor: 'pointer' }}
              />
              <div>
                <p style={{ fontSize: 13.5, color: '#0A0F1E', margin: 0, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
                  Destacar en la página principal
                </p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                  Aparecerá en la sección "Equipo Directivo" del sitio público (máx. 3 recomendado)
                </p>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', gap: 10, justifyContent: 'flex-end',
            padding: '16px 24px', borderTop: '1px solid #F1F5F9',
            position: 'sticky', bottom: 0, background: '#fff', flexShrink: 0,
          }}>
            <button onClick={onClose} disabled={loading} style={{ padding: '10px 18px', background: '#F8FAFF', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px',
                background: loading ? '#94A3B8' : 'linear-gradient(135deg,#1A3FAA,#2649C8)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 14px rgba(26,63,170,0.25)',
              }}
            >
              <Save size={15} /> {loading ? 'Guardando...' : 'Guardar directivo'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export function AdminDirectors() {
  const [directors, setDirectors]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [toast, setToast]           = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  const loadDirectors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await directivosApi.getAll();
      setDirectors(data);
      // Actualizar caché local también
      try { localStorage.setItem('softlab_directors', JSON.stringify(data)); } catch {}
    } catch (err) {
      showToast('Error al cargar directivos: ' + err.message, 'error');
      // Fallback a localStorage
      try {
        const cached = JSON.parse(localStorage.getItem('softlab_directors') ?? '[]');
        setDirectors(cached);
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDirectors();
  }, [loadDirectors]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      let saved;
      if (editing) {
        saved = await directivosApi.update(editing.id, data);
        showToast('Directivo actualizado ✓');
      } else {
        saved = await directivosApi.create(data);
        showToast('Directivo creado ✓');
      }
      // Refrescar lista
      await loadDirectors();
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (director) => {
    if (!confirm(`¿Eliminar a "${director.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await directivosApi.delete(director.id);
      showToast('Directivo eliminado');
      await loadDirectors();
    } catch (err) {
      showToast('Error al eliminar: ' + err.message, 'error');
    }
  };

  const handleToggleFeatured = async (director) => {
    try {
      await directivosApi.toggleFeatured(director.id, director.featured);
      showToast(director.featured ? 'Se quitó el destacado' : 'Destacado en página principal ⭐');
      await loadDirectors();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
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
            onClick={loadDirectors}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 14px', background: '#F8FAFF',
              color: '#64748B', border: '1px solid #E2E8F0',
              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Actualizar
          </button>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px',
              background: 'linear-gradient(135deg,#1A3FAA,#2649C8)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 4px 14px rgba(26,63,170,0.25)',
            }}
          >
            <Plus size={16} /> Agregar directivo
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {directors.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}
        >
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

      {/* Estado de carga */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
          Cargando directivos del servidor...
        </div>
      )}

      {/* Grid o estado vacío */}
      {!loading && directors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9',
            padding: '56px 24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="#CBD5E1" />
          </div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: '#0A0F1E', margin: 0 }}>
            Sin personal directivo
          </p>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            Agrega el primer docente o director del semillero
          </p>
          <button
            onClick={() => setModalOpen(true)}
            style={{ padding: '10px 20px', background: '#EEF3FF', color: '#1A3FAA', border: '1px solid #C7D5F8', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
          >
            Agregar el primero →
          </button>
        </motion.div>
      )}

      {!loading && directors.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          <AnimatePresence>
            {directors.map((d) => (
              <DirectorCard
                key={d.id}
                director={d}
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

      <Toast {...toast} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}