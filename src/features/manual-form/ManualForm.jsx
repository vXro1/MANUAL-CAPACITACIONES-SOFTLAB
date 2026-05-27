import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, AlignLeft, Users, Upload, X, Plus, Check,
  Link as LinkIcon, FileText, Image as ImageIcon, Search,
  CheckCircle, ImagePlus,
} from 'lucide-react';
import { CATEGORIES } from '@/shared/constants';
import { manualesApi, evidenciasApi, rolesApi } from '@/services/apiService';
import { syncManuales } from '@/services/dataSync';
import { participantsRepository } from '@/storage/localStorageRepository';
import { GalleryImagePicker } from '@/shared/ui/GalleryImagePicker';

const ACCENT = '#7C3AED';
const BG     = '#F5F3FF';
const BORDER = '#DDD6FE';
const E      = [0.22, 1, 0.36, 1];

const TABS = [
  { id: 'general',   label: 'General',   icon: BookOpen },
  { id: 'contenido', label: 'Contenido', icon: AlignLeft },
  { id: 'personas',  label: 'Personas',  icon: Users },
  { id: 'archivos',  label: 'Archivos',  icon: Upload },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const buildForm = (manual) => ({
  title:        manual?.title        ?? '',
  subtitle:     manual?.subtitle     ?? '',
  description:  manual?.description  ?? '',
  introduction: manual?.introduction ?? '',
  category:     manual?.category     ?? (CATEGORIES[0] ?? ''),
  date:         manual?.date         ?? '',
  time:         manual?.time         ?? '',
  duration:     manual?.duration     ?? '',
  institution:  manual?.institution  ?? '',
  cover:        manual?.cover || manual?.coverImage || null,
  pdf:          manual?.pdf && !manual.pdf.startsWith('idb:') ? manual.pdf : null,
});

// ─── PDFUploadField ───────────────────────────────────────────────────────────
function PDFUploadField({ value, onChange }) {
  const isFile = value instanceof File;
  const isUrl  = typeof value === 'string' && value.startsWith('http');
  const [mode,     setMode]     = useState(isUrl ? 'url' : 'file');
  const [urlInput, setUrlInput] = useState(isUrl ? value : '');

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Solo se permiten archivos PDF.'); e.target.value = ''; return; }
    if (file.size > 20 * 1024 * 1024) { alert(`El PDF supera el límite de 20 MB (tiene ${(file.size / 1024 / 1024).toFixed(1)} MB).`); e.target.value = ''; return; }
    onChange(file);
  };

  const handleUrl = (e) => {
    setUrlInput(e.target.value);
    onChange(e.target.value || null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>PDF del manual</label>

      <div style={{ display: 'flex', borderRadius: 8, border: '1.5px solid #E2E8F0', overflow: 'hidden', width: 'fit-content' }}>
        {[['file', Upload, 'Subir archivo'], ['url', LinkIcon, 'URL externa']].map(([m, Icon, label], i) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              fontSize: 12, fontWeight: 500,
              borderLeft: i > 0 ? '1.5px solid #E2E8F0' : 'none',
              background: mode === m ? ACCENT : '#fff',
              color: mode === m ? '#fff' : '#475569',
              border: 'none', cursor: 'pointer', transition: 'all .15s',
            }}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '20px 16px', borderRadius: 12,
          border: `2px dashed ${(isFile || isUrl) ? '#86EFAC' : '#E2E8F0'}`,
          background: isFile ? '#F0FDF4' : isUrl ? BG : '#F8FAFC',
          cursor: 'pointer', transition: 'all .15s',
        }}>
          <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFile} />
          {isFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#15803D' }}>
              <CheckCircle size={22} style={{ color: '#22C55E' }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{value.name}</span>
              <span style={{ fontSize: 11, color: '#16A34A' }}>Listo para subir. Haz clic para reemplazar.</span>
            </div>
          ) : isUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: ACCENT }}>
              <CheckCircle size={22} style={{ color: ACCENT }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>PDF guardado en el servidor</span>
              <span style={{ fontSize: 11 }}>Haz clic para reemplazar.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#64748B' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} style={{ color: '#94A3B8' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Haz clic para seleccionar el PDF</span>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>Solo archivos .pdf · Máx 50 MB</span>
            </div>
          )}
        </label>
      ) : (
        <input type="url" value={urlInput} onChange={handleUrl}
          placeholder="https://ejemplo.com/manual.pdf"
          style={{ width: '100%', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
      )}
    </div>
  );
}

// ─── CoverImageField ──────────────────────────────────────────────────────────
function CoverImageField({ value, onChange, onPickFromGallery }) {
  const isBase64 = typeof value === 'string' && value.startsWith('data:');
  const isUrl    = typeof value === 'string' && !isBase64 && value.length > 0;
  const [mode,     setMode]     = useState(isUrl ? 'url' : 'file');
  const [urlInput, setUrlInput] = useState(isUrl ? value : '');

  const preview = (isBase64 || isUrl) ? value : null;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert(`La imagen supera el límite de 5 MB (tiene ${(file.size / 1024 / 1024).toFixed(1)} MB).`); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUrl = (e) => { setUrlInput(e.target.value); onChange(e.target.value || null); };
  const clear = () => { setUrlInput(''); onChange(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Portada del manual</label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', borderRadius: 8, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
          {[['file', Upload, 'Subir imagen'], ['url', LinkIcon, 'URL externa']].map(([m, Icon, label], i) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                fontSize: 12, fontWeight: 500,
                borderLeft: i > 0 ? '1.5px solid #E2E8F0' : 'none',
                background: mode === m ? ACCENT : '#fff',
                color: mode === m ? '#fff' : '#475569',
                border: 'none', cursor: 'pointer', transition: 'all .15s',
              }}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
        {onPickFromGallery && (
          <button type="button" onClick={onPickFromGallery}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: `1.5px solid ${BORDER}`, background: BG, color: ACCENT, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            <ImagePlus size={12} /> De galería
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {mode === 'file' ? (
          <label style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 10, padding: '18px 16px', borderRadius: 12,
            border: `2px dashed ${isBase64 ? '#86EFAC' : isUrl ? BORDER : '#E2E8F0'}`,
            background: isBase64 ? '#F0FDF4' : isUrl ? BG : '#F8FAFC',
            cursor: 'pointer', transition: 'all .15s',
          }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            {isBase64 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#15803D' }}>
                <CheckCircle size={20} style={{ color: '#22C55E' }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>✓ Imagen lista para guardar</span>
                <span style={{ fontSize: 11, color: '#16A34A' }}>Haz clic para reemplazar</span>
              </div>
            ) : isUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: ACCENT }}>
                <CheckCircle size={20} style={{ color: ACCENT }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>Portada guardada en servidor</span>
                <span style={{ fontSize: 11 }}>Haz clic para reemplazar con archivo</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#64748B' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={20} style={{ color: '#94A3B8' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Haz clic para seleccionar imagen</span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>PNG, JPG, WEBP · máx. 3 MB</span>
              </div>
            )}
          </label>
        ) : (
          <input type="url" value={urlInput} onChange={handleUrl}
            placeholder="https://images.unsplash.com/..."
            style={{ flex: 1, borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        )}

        {preview && (
          <div style={{ position: 'relative', width: 88, height: 88, borderRadius: 10, overflow: 'hidden', border: '1.5px solid #E2E8F0', background: '#F1F5F9', flexShrink: 0 }}>
            <img src={preview} alt="Vista previa portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={clear}
              style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Quitar portada"><X size={10} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

const BASE_MANUAL_ROLES = ['Ponente', 'Autor', 'Auxiliar', 'Coordinador', 'Moderador', 'Asistente', 'Investigador'];

// ─── ParticipantRolePicker ─────────────────────────────────────────────────────
function ParticipantRolePicker({ participants, value, onChange, globalRoles, onAddRole }) {
  const [search,    setSearch]    = useState('');
  const [customId,  setCustomId]  = useState(null);
  const [customVal, setCustomVal] = useState('');

  const allRoles    = [...new Set([...BASE_MANUAL_ROLES, ...(globalRoles ?? [])])];
  const selectedIds = value.map((r) => r.participante_id);
  const filtered    = participants.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.career ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    if (selectedIds.includes(id))
      onChange(value.filter((r) => r.participante_id !== id));
    else
      onChange([...value, { participante_id: id, rol: BASE_MANUAL_ROLES[1] }]);
  };

  const setRol = (id, rol) =>
    onChange(value.map((r) => r.participante_id === id ? { ...r, rol } : r));

  const confirmCustom = (id) => {
    const v = customVal.trim();
    if (v) { setRol(id, v); onAddRole?.(v); }
    setCustomId(null); setCustomVal('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Users size={14} style={{ color: ACCENT }} />
        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Participantes y roles</label>
        {value.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 11, background: BG, color: ACCENT, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
            {value.length} seleccionado{value.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar participante…"
          style={{ width: '100%', borderRadius: 10, border: '1.5px solid #E2E8F0', padding: '7px 12px 7px 32px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ maxHeight: 280, overflowY: 'auto', border: '1.5px solid #E2E8F0', borderRadius: 10, background: '#fff' }}>
        {filtered.length === 0
          ? <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: '12px 0' }}>Sin resultados</p>
          : filtered.map((p) => {
              const selected = selectedIds.includes(p.id);
              const pr       = value.find((r) => r.participante_id === p.id);
              const rolVal   = pr?.rol ?? BASE_MANUAL_ROLES[1];
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderBottom: '1px solid #F1F5F9',
                  background: selected ? BG : 'transparent', transition: 'background .15s',
                }}>
                  <input type="checkbox" checked={selected} onChange={() => toggle(p.id)}
                    style={{ accentColor: ACCENT, flexShrink: 0, cursor: 'pointer', width: 15, height: 15 }} />
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: BG, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: ACCENT, flexShrink: 0 }}>
                    {p.photo ? <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.name?.[0] ?? '?')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{p.career ?? p.role ?? ''}</p>
                  </div>
                  {selected && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
                      {customId === p.id ? (
                        <div style={{ display: 'flex', gap: 3 }}>
                          <input autoFocus type="text" value={customVal}
                            onChange={(e) => setCustomVal(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmCustom(p.id); } if (e.key === 'Escape') { setCustomId(null); setCustomVal(''); } }}
                            placeholder="Nuevo rol…"
                            style={{ width: 100, padding: '3px 7px', borderRadius: 7, border: `1.5px solid ${BORDER}`, fontSize: 12, outline: 'none' }}
                          />
                          <button type="button" onClick={() => confirmCustom(p.id)}
                            style={{ padding: '3px 7px', borderRadius: 7, background: ACCENT, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Check size={11} />
                          </button>
                        </div>
                      ) : (
                        <select value={rolVal}
                          onChange={(e) => {
                            if (e.target.value === '__nuevo__') { setCustomId(p.id); setCustomVal(''); }
                            else setRol(p.id, e.target.value);
                          }}
                          style={{ width: 130, padding: '3px 7px', borderRadius: 7, border: `1.5px solid ${BORDER}`, fontSize: 12, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none' }}
                        >
                          {allRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                          <option value="__nuevo__">+ Nuevo rol…</option>
                        </select>
                      )}
                    </div>
                  )}
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

// ─── ManualForm ───────────────────────────────────────────────────────────────
export function ManualForm({ isOpen, onClose, manual, onSuccess }) {
  const isEdit     = Boolean(manual?.id);
  const participants = participantsRepository.getAll();

  const [form,           setForm]           = useState(() => buildForm(manual));
  const [objectives,     setObjectives]     = useState(() =>
    manual?.objectives?.length ? manual.objectives : ['']
  );
  const [participantRoles, setParticipantRoles] = useState(() => {
    const sp  = (manual?.speakerIds ?? (manual?.speakerId ? [manual.speakerId] : [])).map((id) => ({ participante_id: id, rol: 'Ponente' }));
    const au  = (manual?.authorIds  ?? []).map((id) => ({ participante_id: id, rol: 'Autor' }));
    const aux = (manual?.auxiliaresIds ?? []).map((id) => ({ participante_id: id, rol: 'Auxiliar' }));
    const seen = new Set();
    return [...sp, ...au, ...aux].filter((r) => { if (seen.has(r.participante_id)) return false; seen.add(r.participante_id); return true; });
  });
  const [globalRoles, setGlobalRoles] = useState(BASE_MANUAL_ROLES);

  const [galleryItems,   setGalleryItems]   = useState(() =>
    (manual?.gallery ?? []).filter((v) => typeof v === 'string' && v.startsWith('http'))
  );
  const [galleryUrlInput,  setGalleryUrlInput]  = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryError,     setGalleryError]     = useState('');
  const [draggingOver,     setDraggingOver]     = useState(false);

  const [errors,       setErrors]       = useState({});
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState('');
  const [activeTab,    setActiveTab]    = useState('general');
  const [pickerTarget, setPickerTarget] = useState(null);

  const fileInputRef = useRef(null);

  const handlePickerSelect = (imgs) => {
    if (pickerTarget === 'cover') {
      setForm((f) => ({ ...f, cover: imgs[0].src }));
    } else if (pickerTarget === 'evidence') {
      setGalleryItems((p) => [...p, ...imgs.map((i) => i.src)]);
    }
    setPickerTarget(null);
  };

  useEffect(() => {
    if (isOpen) {
      setForm(buildForm(manual));
      setObjectives(manual?.objectives?.length ? manual.objectives : ['']);
      const sp  = (manual?.speakerIds ?? (manual?.speakerId ? [manual.speakerId] : [])).map((id) => ({ participante_id: id, rol: 'Ponente' }));
      const au  = (manual?.authorIds  ?? []).map((id) => ({ participante_id: id, rol: 'Autor' }));
      const aux = (manual?.auxiliaresIds ?? []).map((id) => ({ participante_id: id, rol: 'Auxiliar' }));
      const seen = new Set();
      setParticipantRoles([...sp, ...au, ...aux].filter((r) => { if (seen.has(r.participante_id)) return false; seen.add(r.participante_id); return true; }));
      setGalleryItems((manual?.gallery ?? []).filter((v) => typeof v === 'string' && v.startsWith('http')));
      setGalleryUrlInput('');
      setGalleryError('');
      setErrors({});
      setSaveError('');
      setActiveTab('general');
      // Cargar roles globales
      rolesApi.getAll()
        .then((remote) => {
          if (Array.isArray(remote) && remote.length > 0)
            setGlobalRoles((prev) => [...new Set([...prev, ...remote])].sort());
        })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const set      = (field) => (val)  => setForm((f) => ({ ...f, [field]: val }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'El título es requerido.';
    if (!form.description.trim()) e.description = 'La descripción es requerida.';
    if (!form.date)               e.date        = 'La fecha es requerida.';
    return e;
  };

  const uploadGalleryFiles = async (files) => {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (!images.length) return;
    const oversize = images.find((f) => f.size > 5 * 1024 * 1024);
    if (oversize) { setGalleryError(`"${oversize.name}" supera el límite de 5 MB (${(oversize.size / 1024 / 1024).toFixed(1)} MB).`); return; }
    setUploadingGallery(true); setGalleryError('');
    try {
      const results = await Promise.all(images.map((f) => evidenciasApi.upload(f)));
      setGalleryItems((p) => [...p, ...results.map((r) => r.url)]);
    } catch (err) {
      setGalleryError('Error al subir imágenes: ' + (err.message ?? 'Intenta de nuevo'));
    } finally {
      setUploadingGallery(false);
    }
  };

  const addGalleryUrl = () => {
    const url = galleryUrlInput.trim();
    if (url) { setGalleryItems((p) => [...p, url]); setGalleryUrlInput(''); }
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); setActiveTab('general'); return; }
    setSaving(true); setSaveError('');

    const coverValue   = form.cover;
    const coverIsBase64 = typeof coverValue === 'string' && coverValue.startsWith('data:');
    const coverUrl      = typeof coverValue === 'string' && !coverIsBase64 ? coverValue : undefined;
    let coverFile;
    if (coverIsBase64) {
      const [header, b64] = coverValue.split(',');
      const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
      const binary = atob(b64);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      coverFile = new File([bytes], 'portada.jpg', { type: mime });
    }

    const pdfValue = form.pdf;
    const pdfFile  = pdfValue instanceof File ? pdfValue : undefined;
    const pdfUrl   = typeof pdfValue === 'string' ? pdfValue : undefined;

    const payload = {
      titulo:       form.title,
      categoria:    form.category,
      descripcion:  form.description,
      fecha:        form.date,
      destacado:    manual?.featured ?? false,
      // Nuevo formato unificado (tiene prioridad en el backend)
      participantes: participantRoles,
      // Formato legacy para compatibilidad
      autor_ids:    participantRoles.filter((r) => r.rol === 'Autor').map((r) => r.participante_id),
      speakerId:    participantRoles.find((r) => r.rol === 'Ponente')?.participante_id ?? null,
      speakerIds:   participantRoles.filter((r) => r.rol === 'Ponente').map((r) => r.participante_id),
      auxiliaresIds: participantRoles.filter((r) => r.rol === 'Auxiliar').map((r) => r.participante_id),
      subtitle:     form.subtitle,
      introduction: form.introduction,
      time:         form.time,
      duration:     form.duration,
      institution:  form.institution,
      cover:        coverFile ? undefined : coverUrl,
      objectives:   objectives.filter(Boolean),
      galeria_evidencias: galleryItems,
      ...(pdfUrl && !pdfFile ? { pdf_path: pdfUrl } : {}),
    };

    try {
      if (isEdit) {
        await manualesApi.update(manual.id, payload, pdfFile, coverFile);
      } else {
        await manualesApi.create(payload, pdfFile, coverFile);
      }
      await syncManuales();
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setSaveError(err.message ?? 'Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const tabIdx = TABS.findIndex((t) => t.id === activeTab);

  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
    border: `1.5px solid ${hasError ? '#FCA5A5' : '#E2E8F0'}`,
    background: hasError ? '#FEF2F2' : '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="manual-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(2,6,23,.72)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            key="manual-modal"
            initial={{ opacity: 0, scale: .96, y: 16 }}
            animate={{ opacity: 1, scale: 1,   y: 0 }}
            exit={{   opacity: 0, scale: .96, y: 16 }}
            transition={{ duration: .28, ease: E }}
            style={{ position: 'fixed', inset: 0, zIndex: 51, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}
          >
            <div style={{ width: '100%', maxWidth: 660, background: '#fff', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,.18)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 32px)', overflow: 'hidden', pointerEvents: 'auto' }}>

              {/* Header */}
              <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={22} style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {isEdit ? 'Editar manual' : 'Nuevo manual'}
                      </h2>
                      <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>
                        {isEdit ? 'Modifica los datos del manual' : 'Completa la información de la capacitación'}
                      </p>
                    </div>
                  </div>
                  <button onClick={onClose}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', flexShrink: 0 }}
                    aria-label="Cerrar">
                    <X size={16} />
                  </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '2px solid #F1F5F9', overflowX: 'auto' }}>
                  {TABS.map((tab) => {
                    const Icon   = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                          fontSize: 13, fontWeight: active ? 600 : 400,
                          color: active ? ACCENT : '#64748B',
                          background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                          borderBottom: `2px solid ${active ? ACCENT : 'transparent'}`,
                          marginBottom: -2, transition: 'all .15s',
                        }}>
                        <Icon size={14} />{tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{   opacity: 0, x: 12 }}
                    transition={{ duration: .2, ease: E }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                  >

                    {/* ── Tab: General ── */}
                    {activeTab === 'general' && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Título del manual <span style={{ color: '#EF4444' }}>*</span></label>
                          <input type="text" value={form.title} onChange={setField('title')} placeholder="Ej: Manual de Docker" style={inputStyle(errors.title)} />
                          {errors.title && <p style={{ fontSize: 12, color: '#EF4444' }}>{errors.title}</p>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Subtítulo (opcional)</label>
                          <input type="text" value={form.subtitle} onChange={setField('subtitle')} placeholder="Descripción breve del tema" style={inputStyle(false)} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Categoría</label>
                            <input list="manual-categories" value={form.category} onChange={setField('category')} placeholder="Selecciona o escribe una categoría" style={inputStyle(false)} />
                            <datalist id="manual-categories">
                              {CATEGORIES.map((c) => <option key={c} value={c} />)}
                            </datalist>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Fecha <span style={{ color: '#EF4444' }}>*</span></label>
                            <input type="date" value={form.date} onChange={setField('date')} style={inputStyle(errors.date)} />
                            {errors.date && <p style={{ fontSize: 12, color: '#EF4444' }}>{errors.date}</p>}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Hora</label>
                            <input type="time" value={form.time} onChange={setField('time')} style={inputStyle(false)} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Duración</label>
                            <input type="text" value={form.duration} onChange={setField('duration')} placeholder="Ej: 3 horas" style={inputStyle(false)} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Institución</label>
                          <input type="text" value={form.institution} onChange={setField('institution')} placeholder="Universidad Autónoma del Cauca" style={inputStyle(false)} />
                        </div>
                      </>
                    )}

                    {/* ── Tab: Contenido ── */}
                    {activeTab === 'contenido' && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Descripción <span style={{ color: '#EF4444' }}>*</span></label>
                          <textarea value={form.description} onChange={setField('description')} rows={3} placeholder="Resumen del contenido..."
                            style={{ ...inputStyle(errors.description), resize: 'none' }} />
                          {errors.description && <p style={{ fontSize: 12, color: '#EF4444' }}>{errors.description}</p>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Introducción</label>
                          <textarea value={form.introduction} onChange={setField('introduction')} rows={5} placeholder="Introducción completa al tema..."
                            style={{ ...inputStyle(false), resize: 'none' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Objetivos</label>
                            <button type="button" onClick={() => setObjectives((p) => [...p, ''])}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                              <Plus size={13} /> Agregar objetivo
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {objectives.map((obj, i) => (
                              <div key={i} style={{ display: 'flex', gap: 8 }}>
                                <input value={obj} onChange={(e) => setObjectives((p) => p.map((o, idx) => idx === i ? e.target.value : o))}
                                  placeholder={`Objetivo ${i + 1}`}
                                  style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none', background: '#fff' }}
                                />
                                {objectives.length > 1 && (
                                  <button type="button" onClick={() => setObjectives((p) => p.filter((_, idx) => idx !== i))}
                                    style={{ padding: '8px 10px', borderRadius: 8, background: 'none', border: '1.5px solid #E2E8F0', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ── Tab: Personas ── */}
                    {activeTab === 'personas' && (
                      <ParticipantRolePicker
                        participants={participants}
                        value={participantRoles}
                        onChange={setParticipantRoles}
                        globalRoles={globalRoles}
                        onAddRole={(r) => setGlobalRoles((prev) => [...new Set([...prev, r])].sort())}
                      />
                    )}

                    {/* ── Tab: Archivos ── */}
                    {activeTab === 'archivos' && (
                      <>
                        <CoverImageField value={form.cover} onChange={set('cover')} onPickFromGallery={() => setPickerTarget('cover')} />
                        <PDFUploadField  value={form.pdf}   onChange={set('pdf')}   />

                        {/* Galería de evidencias */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 6, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImagePlus size={13} style={{ color: ACCENT }} />
                            </div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Galería de evidencias</label>
                            {galleryItems.length > 0 && (
                              <span style={{ fontSize: 11, color: '#64748B' }}>
                                {galleryItems.length} imagen{galleryItems.length !== 1 ? 'es' : ''}
                              </span>
                            )}
                            <button type="button" onClick={() => setPickerTarget('evidence')}
                              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1.5px solid ${BORDER}`, background: BG, color: ACCENT, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                              <ImagePlus size={12} /> De galería
                            </button>
                          </div>

                          <div
                            onDrop={async (e) => { e.preventDefault(); setDraggingOver(false); await uploadGalleryFiles(Array.from(e.dataTransfer.files)); }}
                            onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
                            onDragLeave={() => setDraggingOver(false)}
                            onClick={() => fileInputRef.current?.click()}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 16px', borderRadius: 12, border: `2px dashed ${draggingOver ? ACCENT : '#E2E8F0'}`, background: draggingOver ? BG : '#F8FAFC', cursor: 'pointer', transition: 'all .2s' }}
                          >
                            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                              onChange={async (e) => { await uploadGalleryFiles(Array.from(e.target.files)); e.target.value = ''; }} />
                            {uploadingGallery ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: ACCENT }}>
                                <div style={{ width: 20, height: 20, border: `2px solid ${ACCENT}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                                <span style={{ fontSize: 12 }}>Guardando imágenes...</span>
                              </div>
                            ) : (
                              <>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <ImagePlus size={18} style={{ color: '#C4B5FD' }} />
                                </div>
                                <p style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                                  {draggingOver ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic'}
                                </p>
                                <p style={{ fontSize: 11, color: '#94A3B8' }}>PNG, JPG, WEBP</p>
                              </>
                            )}
                          </div>

                          {galleryError && <p style={{ fontSize: 12, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '6px 12px' }}>{galleryError}</p>}

                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                              <LinkIcon size={11} /> O por URL:
                            </span>
                            <input value={galleryUrlInput} onChange={(e) => setGalleryUrlInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGalleryUrl())}
                              placeholder="https://..."
                              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #E2E8F0', padding: '6px 10px', fontSize: 12, outline: 'none', minWidth: 0 }}
                            />
                            <button type="button" onClick={addGalleryUrl}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '6px 10px', borderRadius: 8, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                              <Plus size={12} /> Agregar
                            </button>
                          </div>

                          {galleryItems.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                              {galleryItems.map((item, i) => (
                                <div key={`${item}-${i}`}
                                  style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#F1F5F9', aspectRatio: '16/9' }}
                                  onMouseEnter={(e) => { e.currentTarget.querySelector('button').style.opacity = '1'; }}
                                  onMouseLeave={(e) => { e.currentTarget.querySelector('button').style.opacity = '0'; }}
                                >
                                  <img src={item} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  <button type="button" onClick={() => setGalleryItems((p) => p.filter((_, idx) => idx !== i))}
                                    style={{ position: 'absolute', top: 4, right: 4, padding: 4, borderRadius: 6, background: 'rgba(0,0,0,.55)', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0, transition: 'opacity .2s', display: 'flex' }}
                                    aria-label="Eliminar imagen">
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Error global */}
              {saveError && (
                <div style={{ padding: '0 24px' }}>
                  <p style={{ fontSize: 12, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', margin: 0 }}>{saveError}</p>
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1.5px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {/* Dot nav */}
                <div style={{ display: 'flex', gap: 5, flex: 1 }}>
                  {TABS.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                      aria-label={`Ir a ${tab.label}`}
                      style={{ height: 6, width: activeTab === tab.id ? 20 : 6, borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0, background: activeTab === tab.id ? ACCENT : '#E2E8F0', transition: 'all .25s' }}
                    />
                  ))}
                </div>

                <button type="button" onClick={onClose}
                  style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Cancelar
                </button>

                {tabIdx < TABS.length - 1 ? (
                  <button type="button" onClick={() => setActiveTab(TABS[tabIdx + 1].id)}
                    style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: ACCENT, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Siguiente →
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={saving}
                    style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: saving ? '#94A3B8' : ACCENT, color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                    {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear manual'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <GalleryImagePicker
            isOpen={pickerTarget !== null}
            onClose={() => setPickerTarget(null)}
            onSelect={handlePickerSelect}
            multiSelect={pickerTarget === 'evidence'}
            title={pickerTarget === 'cover' ? 'Seleccionar portada de galería' : 'Añadir evidencias desde galería'}
          />
        </>
      )}
    </AnimatePresence>
  );
}
