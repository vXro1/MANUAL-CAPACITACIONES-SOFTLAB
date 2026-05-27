import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Camera, User, FileText, Link2, Plus, Check,
} from 'lucide-react';
import { participantesApi, rolesApi } from '@/services/apiService';
import { syncParticipantes } from '@/services/dataSync';

// ─── Constantes ───────────────────────────────────────────────────────────────

export const PARTICIPANT_ROLES = [
  // Estudiantes
  'Estudiante',
  // Directivos
  'Coordinador',
  'Docente',
  'Docente Acompañante',
  'Profesor',
  'Director del Semillero',
  'Co-Director del Semillero',
  'Docente Investigador',
  // Ponentes
  'Ponente',
  'Conferencista',
  // Colaboradores
  'Auxiliar de Investigación',
  'Colaborador Externo',
  // Legacy (compatibilidad con datos existentes)
  'Investigador',
  'Co-Investigador',
  'Investigador Principal',
];

// Lista base — se enriquece con los roles reales de la BD al abrir el form
export const ADDITIONAL_ROLE_OPTIONS = [
  'Investigador', 'Co-Investigador', 'Investigador Principal',
  'Desarrollador', 'Ponente', 'Diseñador UX', 'Tester QA',
  'Auxiliar de Investigación', 'Autor', 'Moderador',
];

const ACCENT  = '#1A3FAA';
const BG      = '#EEF3FF';
const BORDER  = '#C7D5F8';
const E       = [0.22, 1, 0.36, 1];

const TABS = [
  { id: 'foto',  label: 'Foto',        icon: Camera   },
  { id: 'info',  label: 'Información', icon: User     },
  { id: 'perfil',label: 'Perfil',      icon: FileText },
  { id: 'redes', label: 'Redes',       icon: Link2    },
];

const DEFAULT_FORM = {
  name: '', role: PARTICIPANT_ROLES[0],
  career: '', semester: '', email: '',
  bio: '', linkedin: '', github: '',
};

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
}

// ─── ParticipantForm (modal con tabs) ────────────────────────────────────────

export function ParticipantForm({ isOpen, onClose, participant, onSuccess }) {
  const [form, setForm]             = useState(DEFAULT_FORM);
  const [photo, setPhoto]           = useState(null);
  const [skills, setSkills]         = useState([]);
  const [additionalRoles, setAdditionalRoles] = useState([]);
  const [globalRoles, setGlobalRoles]         = useState(ADDITIONAL_ROLE_OPTIONS);
  const [newRoleInput, setNewRoleInput]       = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [activeTab, setActiveTab]   = useState('foto');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const fileRef = useRef();

  const isEdit = Boolean(participant?.id);

  // Cargar etiquetas globales cada vez que se abre el form
  useEffect(() => {
    if (!isOpen) return;
    rolesApi.getAll()
      .then((remote) => {
        if (Array.isArray(remote) && remote.length > 0) {
          setGlobalRoles((prev) => {
            const combined = [...new Set([...prev, ...remote])];
            combined.sort();
            return combined;
          });
        }
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('foto');
    setError('');
    if (participant) {
      setForm({
        name:     participant.name     ?? '',
        role:     participant.role     ?? PARTICIPANT_ROLES[0],
        career:   participant.career   ?? '',
        semester: participant.semester ?? '',
        email:    participant.email    ?? '',
        bio:      participant.bio      ?? '',
        linkedin: participant.linkedin ?? '',
        github:   participant.github   ?? '',
      });
      setSkills(participant.skills ?? []);
      setPhoto(participant.photo  ?? null);
      // Roles adicionales: roles[1..] si vienen del API, o arreglo vacío
      const allRoles = participant.roles ?? [];
      setAdditionalRoles(allRoles.length > 1 ? allRoles.slice(1) : []);
    } else {
      setForm(DEFAULT_FORM);
      setSkills([]);
      setAdditionalRoles([]);
      setPhoto(null);
    }
    setSkillInput('');
  }, [isOpen, participant]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handlePhoto = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert(`La foto supera el límite de 5 MB (tiene ${(file.size / 1024 / 1024).toFixed(1)} MB).`); return; }
    const reader = new FileReader();
    reader.onload = (e) => setPhoto(e.target.result);
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const v = skillInput.trim().replace(',', '');
    if (v && !skills.includes(v)) setSkills((s) => [...s, v]);
    setSkillInput('');
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true);
    setError('');
    try {
      let fotoFile;
      if (typeof photo === 'string' && photo.startsWith('data:')) {
        const [header, b64] = photo.split(',');
        const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        fotoFile = new File([bytes], 'foto.jpg', { type: mime });
      }
      const payload = {
        nombre:            form.name,
        rol:               form.role,
        carrera:           form.career,
        semestre:          form.semester || null,
        bio:               form.bio,
        email:             form.email,
        linkedin:          form.linkedin,
        github:            form.github,
        habilidades:       skills,
        roles_adicionales: additionalRoles,
      };
      if (isEdit) {
        await participantesApi.update(participant.id, payload, fotoFile);
      } else {
        await participantesApi.create(payload, fotoFile);
      }
      await syncParticipantes();
      onSuccess?.();
    } catch (err) {
      setError(err.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%', padding: '10px 13px', border: `1.5px solid #E2E8F0`, borderRadius: 10,
    fontSize: 13.5, color: '#0A0F1E', background: '#FAFAFA', fontFamily: 'DM Sans, sans-serif',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: '#374151', letterSpacing: '0.06em',
    textTransform: 'uppercase', marginBottom: 6, display: 'block', fontFamily: 'DM Sans, sans-serif',
  };
  const onFocus = (e) => { e.currentTarget.style.borderColor = ACCENT; };
  const onBlur  = (e) => { e.currentTarget.style.borderColor = '#E2E8F0'; };

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        />

        {/* Panel */}
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
          <div style={{ background: BG, padding: '22px 28px 0', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Mini avatar */}
                <div style={{ width: 42, height: 42, borderRadius: 13, background: ACCENT, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${BORDER}`, boxShadow: `0 4px 12px ${ACCENT}40` }}>
                  {photo
                    ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{getInitials(form.name)}</span>
                  }
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: 0 }}>
                    {isEdit ? 'Editar participante' : 'Nuevo participante'}
                  </p>
                  <p style={{ fontSize: 11.5, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                    {form.name || 'Sin nombre'}{form.role ? ` · ${form.role}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
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
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: active ? 700 : 500, background: active ? '#fff' : 'transparent', color: active ? ACCENT : '#94A3B8', fontFamily: 'DM Sans, sans-serif', borderBottom: active ? `2px solid ${ACCENT}` : '2px solid transparent', transition: 'all 0.15s' }}>
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
                      style={{ width: 150, height: 150, borderRadius: '50%', margin: '0 auto 16px', background: photo ? 'transparent' : BG, border: `3px dashed ${photo ? ACCENT : '#CBD5E1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', boxShadow: photo ? `0 0 0 5px ${BORDER}, 0 8px 32px ${ACCENT}30` : 'none', transition: 'all 0.25s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = ACCENT; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = photo ? ACCENT : '#CBD5E1'; }}
                    >
                      {photo
                        ? <img src={photo} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ textAlign: 'center' }}>
                            <Camera size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
                            <p style={{ fontSize: 12.5, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Subir foto</p>
                          </div>
                      }
                    </div>
                    <p style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>JPG, PNG, WEBP · máx. 3 MB</p>
                    {photo && (
                      <button onClick={() => setPhoto(null)} style={{ fontSize: 12, color: '#E11D48', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                        Quitar foto
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhoto(e.target.files[0])} />

                  {/* Preview tamaños */}
                  <div style={{ background: '#F8FAFF', borderRadius: 16, padding: 16, border: '1px dashed #E2E8F0' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: 'DM Sans, sans-serif' }}>Vista previa en distintos tamaños</p>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      {[80, 56, 40].map((size) => (
                        <div key={size} style={{ width: size, height: size, borderRadius: '50%', background: ACCENT, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: `0 0 0 2px ${BORDER}`, flexShrink: 0 }}>
                          {photo
                            ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ color: '#fff', fontSize: size * 0.28, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{getInitials(form.name)}</span>
                          }
                        </div>
                      ))}
                      <p style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
                        {photo ? '✓ Foto cargada' : `Iniciales: "${getInitials(form.name)}"`}
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
                  <div>
                    <label style={labelStyle}>Nombre completo *</label>
                    <input style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nombre y apellidos" onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>Rol principal *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }} value={form.role} onChange={(e) => set('role', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                      {PARTICIPANT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <p style={{ fontSize: 11, color: '#94A3B8', margin: '5px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                      Determina en qué sección aparece la persona en "Nosotros".
                    </p>
                  </div>

                  {/* Cargos adicionales — dinámicos + creación de nuevos */}
                  <div>
                    <label style={labelStyle}>Cargos adicionales</label>
                    <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 8px', fontFamily: 'DM Sans, sans-serif' }}>
                      Etiquetas visibles en la tarjeta. Escoge existentes o crea nuevas.
                    </p>
                    {/* Chips existentes (excluye el rol principal seleccionado) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {globalRoles
                        .filter((r) => r !== form.role)
                        .map((r) => {
                          const active = additionalRoles.includes(r);
                          return (
                            <button key={r} type="button"
                              onClick={() => setAdditionalRoles((prev) =>
                                prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
                              )}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '4px 11px', borderRadius: 999,
                                fontSize: 12, fontWeight: 600,
                                background: active ? ACCENT : '#F8FAFF',
                                color: active ? '#fff' : '#64748B',
                                border: `1.5px solid ${active ? ACCENT : '#E2E8F0'}`,
                                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                transition: 'all 0.15s',
                              }}
                            >
                              {active && <Check size={10} />}{r}
                            </button>
                          );
                      })}
                    </div>
                    {/* Input para crear nueva etiqueta */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        value={newRoleInput}
                        onChange={(e) => setNewRoleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            const v = newRoleInput.trim().replace(',', '');
                            if (v && !additionalRoles.includes(v)) {
                              setAdditionalRoles((p) => [...p, v]);
                              setGlobalRoles((p) => [...new Set([...p, v])].sort());
                            }
                            setNewRoleInput('');
                          }
                        }}
                        placeholder="Nueva etiqueta… (Enter para agregar)"
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={onFocus} onBlur={onBlur}
                      />
                      <button type="button"
                        onClick={() => {
                          const v = newRoleInput.trim();
                          if (v && !additionalRoles.includes(v)) {
                            setAdditionalRoles((p) => [...p, v]);
                            setGlobalRoles((p) => [...new Set([...p, v])].sort());
                          }
                          setNewRoleInput('');
                        }}
                        style={{
                          padding: '0 14px', borderRadius: 10, border: 'none',
                          background: ACCENT, color: '#fff', cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Carrera / Programa</label>
                      <input style={inputStyle} value={form.career} onChange={(e) => set('career', e.target.value)} placeholder="Ej: Ingeniería de Software" onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div>
                      <label style={labelStyle}>Semestre</label>
                      <input style={inputStyle} value={form.semester} onChange={(e) => set('semester', e.target.value)} placeholder="Ej: 6" onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Correo electrónico</label>
                    <input style={inputStyle} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="correo@universidad.edu" onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </motion.div>
              )}

              {/* ── TAB PERFIL ── */}
              {activeTab === 'perfil' && (
                <motion.div key="perfil"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Descripción / Biografía</label>
                    <textarea
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 100, lineHeight: 1.65 }}
                      value={form.bio} onChange={(e) => set('bio', e.target.value)}
                      placeholder="Breve presentación, áreas de interés, aportes al semillero..."
                      onFocus={onFocus} onBlur={onBlur}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Habilidades / Tecnologías{' '}
                      <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: '#94A3B8' }}>(Enter o coma)</span>
                    </label>
                    <div
                      style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 10, background: '#FAFAFA', minHeight: 44, alignItems: 'center', cursor: 'text' }}
                      onClick={() => document.getElementById('skill-field-p')?.focus()}
                    >
                      {skills.map((sk) => (
                        <span key={sk} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: BG, color: ACCENT, border: `1px solid ${BORDER}` }}>
                          {sk}
                          <button onClick={() => setSkills((s) => s.filter((x) => x !== sk))}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: ACCENT, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                        </span>
                      ))}
                      <input
                        id="skill-field-p"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } }}
                        placeholder={skills.length === 0 ? 'Ej. React, Docker, Python...' : ''}
                        style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', minWidth: 130, color: '#0A0F1E', fontFamily: 'DM Sans, sans-serif' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── TAB REDES ── */}
              {activeTab === 'redes' && (
                <motion.div key="redes"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>LinkedIn</label>
                    <input style={inputStyle} type="url" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>GitHub</label>
                    <input style={inputStyle} type="url" value={form.github} onChange={(e) => set('github', e.target.value)} placeholder="https://github.com/..." onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  {/* Vista previa redes */}
                  {(form.linkedin || form.github) && (
                    <div style={{ background: '#F8FAFF', borderRadius: 16, padding: 16, border: '1px dashed #E2E8F0' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: 'DM Sans, sans-serif' }}>Vista previa</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {form.linkedin && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', borderRadius: 10, border: `1px solid ${BORDER}` }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0077B5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>in</span>
                            </div>
                            <span style={{ fontSize: 12.5, color: '#374151', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.linkedin}</span>
                          </div>
                        )}
                        {form.github && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', borderRadius: 10, border: `1px solid ${BORDER}` }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0A0F1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>GH</span>
                            </div>
                            <span style={{ fontSize: 12.5, color: '#374151', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.github}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ marginTop: 16, padding: '10px 14px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, fontSize: 13, color: '#E11D48', fontFamily: 'DM Sans, sans-serif' }}>
                {error}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', borderTop: '1px solid #F1F5F9', background: '#FAFCFF', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ width: activeTab === t.id ? 20 : 7, height: 7, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, background: activeTab === t.id ? ACCENT : '#E2E8F0', transition: 'all 0.25s' }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} disabled={saving}
                style={{ padding: '10px 18px', background: '#F8FAFF', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Cancelar
              </button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleSubmit} disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: saving ? '#94A3B8' : `linear-gradient(135deg, ${ACCENT}, ${ACCENT}CC)`, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: saving ? 'none' : `0 4px 16px ${ACCENT}40`, transition: 'all 0.2s' }}>
                <Save size={14} /> {saving ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear participante')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
