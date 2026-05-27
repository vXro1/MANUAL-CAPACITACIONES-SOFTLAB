import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Upload, Trash2, Tag, Users, CalendarDays, AlignLeft, Check, Star,
  Image as ImageIcon,
} from 'lucide-react';
import { eventsRepository, eventCategoriesRepository, participantsRepository } from '@/storage/localStorageRepository';
import { eventosApi, eventosGaleriaApi, categoriasEventosApi, rolesApi, getToken } from '@/services/apiService';
import { syncEventos } from '@/services/dataSync';
import { GalleryImagePicker } from '@/shared/ui/GalleryImagePicker';

const ACCENT = '#059669';
const BG     = '#ECFDF5';
const BORDER = '#A7F3D0';
const E      = [0.22, 1, 0.36, 1];

const TABS = [
  { id: 'general',       label: 'General',       icon: CalendarDays },
  { id: 'participantes', label: 'Participantes', icon: Users },
  { id: 'galeria',       label: 'Galería',       icon: ImageIcon },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const buildForm = (event) => ({
  title:            event?.title          ?? '',
  description:      event?.description   ?? '',
  date:             event?.date           ?? '',
  category:         event?.category      ?? '',
  participantRoles: event?.participantRoles?.length
    ? event.participantRoles
    : (event?.participantIds ?? []).map((id) => ({ participante_id: id, rol: 'Ponente' })),
  coverImageId: event?.coverImageId ?? null,
  gallery:      (event?.gallery ?? []).map((g) => ({ ...g, _serverImage: true })),
});

// ─── CategoryField ────────────────────────────────────────────────────────────
function CategoryField({ value, onChange }) {
  const [categories, setCategories] = useState(() => eventCategoriesRepository.getAll());
  const [adding,   setAdding]   = useState(false);
  const [newCat,   setNewCat]   = useState('');

  const handleAdd = async () => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    if (getToken()) { try { await categoriasEventosApi.create(trimmed); } catch {} }
    eventCategoriesRepository.add(trimmed);
    setCategories(eventCategoriesRepository.getAll());
    onChange(trimmed);
    setNewCat('');
    setAdding(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
        Categoría <span style={{ color: '#EF4444' }}>*</span>
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {categories.map((cat) => (
          <button
            key={cat} type="button" onClick={() => onChange(cat)}
            style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${value === cat ? ACCENT : '#E2E8F0'}`,
              background: value === cat ? ACCENT : '#F8FAFC',
              color: value === cat ? '#fff' : '#475569',
              cursor: 'pointer', transition: 'all .15s',
            }}
          >{cat}</button>
        ))}
        <button
          type="button" onClick={() => setAdding(true)}
          style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            border: '1.5px dashed #CBD5E1', background: 'transparent',
            color: '#94A3B8', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, transition: 'all .15s',
          }}
        ><Plus size={11} /> Nueva</button>
      </div>
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', display: 'flex', gap: 8 }}
          >
            <input
              autoFocus type="text" value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
                if (e.key === 'Escape') { setAdding(false); setNewCat(''); }
              }}
              placeholder="Nombre de la categoría…"
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8,
                border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', background: '#fff',
              }}
            />
            <button type="button" onClick={handleAdd}
              style={{ padding: '8px 12px', borderRadius: 8, background: ACCENT, color: '#fff', border: 'none', cursor: 'pointer' }}>
              <Check size={14} />
            </button>
            <button type="button" onClick={() => { setAdding(false); setNewCat(''); }}
              style={{ padding: '8px 12px', borderRadius: 8, background: '#F1F5F9', color: '#64748B', border: 'none', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── RoleSelector ─────────────────────────────────────────────────────────────
const BASE_EVENT_ROLES = ['Ponente', 'Asistente', 'Organizador', 'Moderador', 'Coordinador', 'Invitado', 'Autor', 'Auxiliar'];
const OTRO_VALUE       = '__otro__';

function RoleSelector({ participanteId, rol, onChangeRol, name, globalRoles, onAddRole }) {
  const allRoles    = [...new Set([...BASE_EVENT_ROLES, ...(globalRoles ?? [])])];
  const isCustom    = Boolean(rol) && !allRoles.includes(rol);
  const [custom, setCustom] = useState(isCustom);
  const [customVal, setCustomVal] = useState(isCustom ? (rol ?? '') : '');

  const selectValue = custom ? OTRO_VALUE : (allRoles.includes(rol) ? rol : allRoles[0]);

  const handleSelect = (e) => {
    const val = e.target.value;
    if (val === OTRO_VALUE) { setCustom(true); setCustomVal(''); }
    else { setCustom(false); onChangeRol(participanteId, val); }
  };

  const confirmCustom = () => {
    const v = customVal.trim();
    if (!v) return;
    onChangeRol(participanteId, v);
    onAddRole?.(v);
    setCustom(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
      <select value={selectValue} onChange={handleSelect}
        aria-label={`Rol de ${name} en el evento`}
        style={{
          width: 140, padding: '4px 8px', borderRadius: 8,
          border: `1.5px solid ${BORDER}`, fontSize: 12,
          color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none',
        }}
      >
        {allRoles.map((r) => <option key={r} value={r}>{r}</option>)}
        <option value={OTRO_VALUE}>+ Nuevo rol…</option>
      </select>
      {custom && (
        <div style={{ display: 'flex', gap: 4 }}>
          <input autoFocus type="text"
            value={customVal}
            onChange={(e) => setCustomVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmCustom(); } if (e.key === 'Escape') setCustom(false); }}
            placeholder="Nombre del rol…"
            style={{
              width: 106, padding: '4px 8px', borderRadius: 8,
              border: `1.5px solid ${BORDER}`, fontSize: 12, color: '#374151', outline: 'none',
            }}
            aria-label={`Rol personalizado de ${name}`}
          />
          <button type="button" onClick={confirmCustom}
            style={{ padding: '4px 7px', borderRadius: 7, background: ACCENT, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Check size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ParticipantsField ────────────────────────────────────────────────────────
function ParticipantsField({ value, onChange }) {
  const [search, setSearch] = useState('');
  const [globalRoles, setGlobalRoles] = useState(BASE_EVENT_ROLES);
  const all      = participantsRepository.getAll();
  const filtered = all.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const selectedIds = value.map((pr) => pr.participante_id);

  useEffect(() => {
    rolesApi.getAll()
      .then((remote) => {
        if (Array.isArray(remote) && remote.length > 0) {
          setGlobalRoles((prev) => [...new Set([...prev, ...remote])].sort());
        }
      })
      .catch(() => {});
  }, []);

  const toggle = (id) => {
    if (selectedIds.includes(id)) onChange(value.filter((pr) => pr.participante_id !== id));
    else onChange([...value, { participante_id: id, rol: BASE_EVENT_ROLES[0] }]);
  };

  const setRol = (id, rol) =>
    onChange(value.map((pr) => pr.participante_id === id ? { ...pr, rol } : pr));

  const addRole = (rol) =>
    setGlobalRoles((prev) => [...new Set([...prev, rol])].sort());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Participantes</label>
        {value.length > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, background: BG, padding: '2px 8px', borderRadius: 20 }}>
            {value.length} seleccionado{value.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar participante…"
          style={{
            width: '100%', padding: '8px 12px 8px 34px', borderRadius: 10,
            border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none',
            background: '#fff', boxSizing: 'border-box',
          }}
        />
        <Users size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
      </div>
      {all.length === 0 ? (
        <p style={{ fontSize: 12, color: '#94A3B8', padding: '8px 0' }}>
          No hay participantes registrados. Agrega participantes primero desde el panel.
        </p>
      ) : (
        <div style={{ maxHeight: 280, overflowY: 'auto', borderRadius: 12, border: '1.5px solid #E2E8F0', background: '#fff' }}>
          {filtered.length === 0
            ? <p style={{ fontSize: 12, color: '#94A3B8', padding: 12 }}>Sin resultados.</p>
            : filtered.map((p) => {
                const selected = selectedIds.includes(p.id);
                const pr       = value.find((r) => r.participante_id === p.id);
                const initials = p.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: selected ? BG : 'transparent',
                    borderBottom: '1px solid #F1F5F9', transition: 'background .15s',
                  }}>
                    <input type="checkbox" checked={selected} onChange={() => toggle(p.id)}
                      style={{ width: 16, height: 16, accentColor: ACCENT, flexShrink: 0, cursor: 'pointer' }}
                      aria-label={`Seleccionar ${p.name}`} />
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: BG, color: ACCENT,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0, overflow: 'hidden',
                    }}>
                      {p.photo
                        ? <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : initials}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.career || p.role || ''}</p>
                    </div>
                    {selected && (
                      <RoleSelector participanteId={p.id} rol={pr?.rol ?? BASE_EVENT_ROLES[0]} onChangeRol={setRol} name={p.name} globalRoles={globalRoles} onAddRole={addRole} />
                    )}
                  </div>
                );
              })
          }
        </div>
      )}
    </div>
  );
}

// ─── GalleryField ─────────────────────────────────────────────────────────────
function GalleryField({ value, onChange, onRemoveServerImage, coverImageId, onSetCover, onPickFromGallery }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const [error,     setError]     = useState('');
  const inputRef = useRef(null);

  const processFiles = async (files) => {
    setUploading(true); setError('');
    try {
      const results = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 3 * 1024 * 1024) { setError(`"${file.name}" supera los 3 MB permitidos.`); continue; }
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error('Error al leer el archivo'));
          reader.readAsDataURL(file);
        });
        results.push({
          id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          src: base64, title: file.name.replace(/\.[^.]+$/, ''), _file: file,
        });
      }
      if (results.length) onChange([...value, ...results]);
    } catch { setError('Error al procesar alguna imagen. Intenta de nuevo.'); }
    finally { setUploading(false); }
  };

  const removeImage = (img) => {
    if (img._serverImage) onRemoveServerImage?.(img.id);
    onChange(value.filter((i) => i.id !== img.id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Galería de evidencias</label>
        {value.length > 0 && (
          <span style={{ fontSize: 11, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 20 }}>
            {value.length} {value.length === 1 ? 'imagen' : 'imágenes'}
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
          if (files.length) processFiles(files);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          borderRadius: 12, border: `2px dashed ${dragOver ? ACCENT : '#CBD5E1'}`,
          padding: '28px 16px', textAlign: 'center', cursor: 'pointer',
          background: dragOver ? BG : '#F8FAFC', transition: 'all .2s',
        }}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={(e) => { const f = Array.from(e.target.files); if (f.length) processFiles(f); e.target.value = ''; }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {uploading
            ? <div style={{ width: 32, height: 32, border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            : <div style={{ width: 40, height: 40, borderRadius: 10, background: dragOver ? BORDER : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={18} style={{ color: dragOver ? ACCENT : '#6B7280' }} />
              </div>
          }
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
            {uploading ? 'Procesando…' : dragOver ? 'Suelta aquí' : 'Subir imágenes'}
          </p>
          <p style={{ fontSize: 11, color: '#94A3B8' }}>Arrastra y suelta o haz clic · PNG, JPG, WEBP · máx. 3 MB</p>
        </div>
      </div>

      {onPickFromGallery && (
        <button type="button" onClick={onPickFromGallery}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: BG, color: ACCENT, fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
          <ImageIcon size={14} /> Elegir de galería principal
        </button>
      )}

      {error && (
        <p style={{ fontSize: 12, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '6px 12px' }}>{error}</p>
      )}

      {value.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: '#94A3B8' }}>Haz clic en ★ para definir la imagen de portada del evento.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
            <AnimatePresence>
              {value.map((img) => {
                const isCover = img.id === coverImageId;
                return (
                  <motion.div
                    key={img.id} layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: .2 }}
                    style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#F1F5F9', aspectRatio: '1' }}
                  >
                    <img src={img.src} alt={img.title || 'Imagen'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isCover && (
                      <span style={{
                        position: 'absolute', top: 4, left: 4, background: ACCENT, color: '#fff',
                        fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        textTransform: 'uppercase', letterSpacing: '.04em',
                      }}>★ Portada</span>
                    )}
                    <div
                      style={{ position: 'absolute', inset: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .2s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,.4)';
                        e.currentTarget.querySelectorAll('button').forEach((b) => (b.style.opacity = '1'));
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.querySelectorAll('button').forEach((b) => (b.style.opacity = '0'));
                      }}
                    >
                      <button type="button" onClick={() => onSetCover?.(isCover ? null : img.id)}
                        aria-label={isCover ? 'Quitar portada' : 'Establecer como portada'}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: isCover ? '#F59E0B' : 'rgba(255,255,255,.25)', color: '#fff', border: 'none', cursor: 'pointer', opacity: 0, transition: 'opacity .2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={13} fill={isCover ? '#fff' : 'none'} />
                      </button>
                      <button type="button" onClick={() => removeImage(img)}
                        aria-label={`Eliminar imagen ${img.title}`}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', opacity: 0, transition: 'opacity .2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

// ─── EventForm ────────────────────────────────────────────────────────────────
export function EventForm({ isOpen, onClose, event, onSuccess }) {
  const isEdit = !!event?.id;

  const [form,              setForm]              = useState(() => buildForm(event));
  const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);
  const [errors,            setErrors]            = useState({});
  const [saving,            setSaving]            = useState(false);
  const [saveError,         setSaveError]         = useState('');
  const [activeTab,         setActiveTab]         = useState('general');
  const [pickerOpen,        setPickerOpen]        = useState(false);

  const handlePickerSelect = (imgs) => {
    const newItems = imgs.map((img) => ({
      id: `gallery-${img.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      src: img.src,
      title: img.title,
      _fromGallery: true,
    }));
    setForm((f) => ({ ...f, gallery: [...f.gallery, ...newItems] }));
    setPickerOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      setForm(buildForm(event));
      setDeletedGalleryIds([]);
      setErrors({});
      setSaveError('');
      setActiveTab('general');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const set      = (field) => (val)  => setForm((f) => ({ ...f, [field]: val }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title    = 'El título es obligatorio.';
    if (!form.date)         e.date     = 'La fecha es obligatoria.';
    if (!form.category)     e.category = 'Selecciona una categoría.';
    return e;
  };

  const handleRemoveServerImage = (id) => {
    setDeletedGalleryIds((prev) => [...prev, id]);
    if (form.coverImageId === id) setForm((f) => ({ ...f, coverImageId: null }));
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); setActiveTab('general'); return; }
    setSaving(true); setSaveError('');
    try {
      if (getToken()) {
        const payload = {
          titulo:           form.title.trim(),
          descripcion:      form.description.trim(),
          fecha:            form.date,
          categoria:        form.category,
          participantRoles: form.participantRoles,
          participantIds:   form.participantRoles.map((pr) => pr.participante_id),
          coverImageId:     form.coverImageId,
        };
        const savedEvent = isEdit
          ? await eventosApi.update(event.id, payload)
          : await eventosApi.create(payload);
        const eventId = savedEvent.id;
        await Promise.all(deletedGalleryIds.map((id) => eventosGaleriaApi.delete(id).catch(() => {})));
        const newImages = form.gallery.filter((g) => g._file);
        await Promise.all(newImages.map((g) => eventosGaleriaApi.upload(eventId, g._file, g.title).catch(() => {})));
        const galleryRefs = form.gallery.filter((g) => g._fromGallery);
        await Promise.all(galleryRefs.map(async (g) => {
          try {
            const res  = await fetch(g.src);
            const blob = await res.blob();
            const ext  = blob.type.split('/')[1] || 'jpg';
            const file = new File([blob], `${g.title || 'imagen'}.${ext}`, { type: blob.type });
            await eventosGaleriaApi.upload(eventId, file, g.title);
          } catch {}
        }));
        await syncEventos().catch(() => {});
      } else {
        eventsRepository.save({
          ...(isEdit ? { id: event.id, createdAt: event.createdAt } : {}),
          title:            form.title.trim(),
          description:      form.description.trim(),
          date:             form.date,
          category:         form.category,
          participantRoles: form.participantRoles,
          participantIds:   form.participantRoles.map((pr) => pr.participante_id),
          coverImageId:     form.coverImageId,
          gallery:          form.gallery.map((g) => ({ id: g.id, src: g.src, title: g.title })),
        });
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setSaveError(err.message ?? 'Error al guardar el evento. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const tabIdx = TABS.findIndex((t) => t.id === activeTab);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="event-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(2,6,23,.72)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            key="event-modal"
            initial={{ opacity: 0, scale: .96, y: 16 }}
            animate={{ opacity: 1, scale: 1,   y: 0 }}
            exit={{   opacity: 0, scale: .96, y: 16 }}
            transition={{ duration: .28, ease: E }}
            style={{ position: 'fixed', inset: 0, zIndex: 51, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}
          >
            <div style={{ width: '100%', maxWidth: 620, background: '#fff', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,.18)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 32px)', overflow: 'hidden', pointerEvents: 'auto' }}>

              {/* Header */}
              <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CalendarDays size={22} style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {isEdit ? 'Editar evento' : 'Nuevo evento'}
                      </h2>
                      <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>
                        {isEdit ? 'Modifica los datos del evento' : 'Completa la información del evento'}
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
                <div style={{ display: 'flex', borderBottom: '2px solid #F1F5F9' }}>
                  {TABS.map((tab) => {
                    const Icon   = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                          fontSize: 13, fontWeight: active ? 600 : 400,
                          color: active ? ACCENT : '#64748B',
                          background: 'none', border: 'none', cursor: 'pointer',
                          borderBottom: `2px solid ${active ? ACCENT : 'transparent'}`,
                          marginBottom: -2, transition: 'all .15s',
                        }}
                      >
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
                    style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                  >
                    {/* ── Tab: General ── */}
                    {activeTab === 'general' && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Tag size={13} style={{ color: '#94A3B8' }} />
                            Título <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text" value={form.title} onChange={setField('title')}
                            placeholder="Ej: Feria de Ciencias 2025"
                            style={{
                              width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                              border: `1.5px solid ${errors.title ? '#FCA5A5' : '#E2E8F0'}`,
                              background: errors.title ? '#FEF2F2' : '#fff',
                              outline: 'none', boxSizing: 'border-box',
                            }}
                          />
                          {errors.title && <p style={{ fontSize: 12, color: '#EF4444' }}>{errors.title}</p>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CalendarDays size={13} style={{ color: '#94A3B8' }} />
                            Fecha <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="date" value={form.date} onChange={setField('date')}
                            style={{
                              width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                              border: `1.5px solid ${errors.date ? '#FCA5A5' : '#E2E8F0'}`,
                              background: errors.date ? '#FEF2F2' : '#fff',
                              outline: 'none', boxSizing: 'border-box',
                            }}
                          />
                          {errors.date && <p style={{ fontSize: 12, color: '#EF4444' }}>{errors.date}</p>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlignLeft size={13} style={{ color: '#94A3B8' }} />
                            Descripción
                          </label>
                          <textarea
                            value={form.description} onChange={setField('description')} rows={4}
                            placeholder="Describe brevemente el evento, sus objetivos y resultados…"
                            style={{
                              width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                              border: '1.5px solid #E2E8F0', background: '#fff',
                              outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                            }}
                          />
                        </div>

                        <CategoryField value={form.category} onChange={set('category')} />
                        {errors.category && <p style={{ fontSize: 12, color: '#EF4444', marginTop: -12 }}>{errors.category}</p>}
                      </>
                    )}

                    {/* ── Tab: Participantes ── */}
                    {activeTab === 'participantes' && (
                      <ParticipantsField
                        value={form.participantRoles}
                        onChange={(roles) => setForm((f) => ({ ...f, participantRoles: roles }))}
                      />
                    )}

                    {/* ── Tab: Galería ── */}
                    {activeTab === 'galeria' && (
                      <GalleryField
                        value={form.gallery}
                        onChange={(gallery) => setForm((f) => ({ ...f, gallery }))}
                        onRemoveServerImage={handleRemoveServerImage}
                        coverImageId={form.coverImageId}
                        onSetCover={(id) => setForm((f) => ({ ...f, coverImageId: id }))}
                        onPickFromGallery={() => setPickerOpen(true)}
                      />
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
                    <button
                      key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                      aria-label={`Ir a ${tab.label}`}
                      style={{
                        height: 6, width: activeTab === tab.id ? 20 : 6,
                        borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0,
                        background: activeTab === tab.id ? ACCENT : '#E2E8F0',
                        transition: 'all .25s',
                      }}
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
                    {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear evento'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <GalleryImagePicker
            isOpen={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={handlePickerSelect}
            multiSelect
            title="Añadir imágenes desde galería"
          />
        </>
      )}
    </AnimatePresence>
  );
}
