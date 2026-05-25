import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Upload, Trash2, Tag, Users, CalendarDays, AlignLeft, Check, Star,
} from 'lucide-react';
import { eventsRepository, eventCategoriesRepository, participantsRepository } from '@/storage/localStorageRepository';
import { eventosApi, eventosGaleriaApi, categoriasEventosApi, getToken } from '@/services/apiService';
import { syncEventos } from '@/services/dataSync';
import { Button } from '@/shared/ui/Button';

// ─── Category selector con "Nueva categoría" inline ──────────────────────────
function CategoryField({ value, onChange }) {
  const [categories, setCategories] = useState(() => eventCategoriesRepository.getAll());
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState('');

  const handleAdd = async () => {
    const trimmed = newCat.trim();
    if (!trimmed) return;

    // Intentar crear en la API si hay sesión activa
    if (getToken()) {
      try {
        await categoriasEventosApi.create(trimmed);
      } catch {
        // Continúa con localStorage aunque la API falle
      }
    }

    // Siempre actualizar localStorage
    eventCategoriesRepository.add(trimmed);
    setCategories(eventCategoriesRepository.getAll());
    onChange(trimmed);
    setNewCat('');
    setAdding(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700" htmlFor="event-category">
        Categoría <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              value === cat
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-all flex items-center gap-1"
        >
          <Plus size={11} /> Nueva
        </button>
      </div>
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 overflow-hidden"
          >
            <input
              autoFocus
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
                if (e.key === 'Escape') { setAdding(false); setNewCat(''); }
              }}
              placeholder="Nombre de la categoría…"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setNewCat(''); }}
              className="px-3 py-2 rounded-lg bg-slate-100 text-slate-500 text-sm hover:bg-slate-200 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {!value && (
        <p className="text-xs text-slate-400">Selecciona o crea una categoría para el evento.</p>
      )}
    </div>
  );
}

// Roles predefinidos para eventos
const EVENT_ROLES = ['Ponente', 'Asistente', 'Organizador', 'Moderador', 'Coordinador', 'Invitado'];
const OTRO_VALUE  = '__otro__';

// ─── Selector de rol: dropdown + campo de texto cuando se elige "Otro" ─────────
function RoleSelector({ participanteId, rol, onChangeRol, name }) {
  // Estado local: ¿está en modo personalizado?
  // Se inicializa en true si el rol actual ya es un valor no predefinido.
  const [custom, setCustom] = useState(() => Boolean(rol) && !EVENT_ROLES.includes(rol));

  const selectValue = custom ? OTRO_VALUE : (EVENT_ROLES.includes(rol) ? rol : EVENT_ROLES[0]);

  const handleSelect = (e) => {
    const val = e.target.value;
    if (val === OTRO_VALUE) {
      setCustom(true);
      // No tocamos rol todavía; el usuario escribirá en el input
    } else {
      setCustom(false);
      onChangeRol(participanteId, val);
    }
  };

  return (
    <div className="shrink-0 flex flex-col gap-1 items-end">
      <select
        value={selectValue}
        onChange={handleSelect}
        aria-label={`Rol de ${name} en el evento`}
        className="w-36 px-2 py-1 rounded-lg border border-brand-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
      >
        {EVENT_ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
        <option value={OTRO_VALUE}>Otro…</option>
      </select>

      {/* Campo de texto: solo visible en modo personalizado */}
      {custom && (
        <input
          autoFocus
          type="text"
          value={EVENT_ROLES.includes(rol) ? '' : (rol ?? '')}
          onChange={(e) => onChangeRol(participanteId, e.target.value)}
          placeholder="Escribe el rol…"
          className="w-36 px-2 py-1 rounded-lg border border-brand-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label={`Rol personalizado de ${name}`}
        />
      )}
    </div>
  );
}

// ─── Selector de participantes con rol por participante ───────────────────────
// value: [{ participante_id, rol }]
function ParticipantsField({ value, onChange }) {
  const [search, setSearch] = useState('');
  const all = participantsRepository.getAll();
  const filtered = all.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedIds = value.map((pr) => pr.participante_id);

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(value.filter((pr) => pr.participante_id !== id));
    } else {
      onChange([...value, { participante_id: id, rol: EVENT_ROLES[0] }]);
    }
  };

  const setRol = (id, rol) => {
    onChange(value.map((pr) => pr.participante_id === id ? { ...pr, rol } : pr));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">
        Participantes
        {value.length > 0 && (
          <span className="ml-2 text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
            {value.length} seleccionado{value.length !== 1 ? 's' : ''}
          </span>
        )}
      </label>
      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar participante…"
          className="w-full px-3 py-2 pl-8 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <Users size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
      </div>
      {all.length === 0 ? (
        <p className="text-xs text-slate-400 py-2">
          No hay participantes registrados. Agrega participantes primero desde el panel.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 p-3">Sin resultados.</p>
          ) : (
            filtered.map((p) => {
              const selected = selectedIds.includes(p.id);
              const pr       = value.find((r) => r.participante_id === p.id);
              const initials = p.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                    selected ? 'bg-brand-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggle(p.id)}
                    className="w-4 h-4 rounded accent-brand-600 shrink-0"
                    aria-label={`Seleccionar ${p.name}`}
                  />
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: '#EEF3FF', color: '#1A3FAA' }}
                  >
                    {p.photo ? (
                      <img src={p.photo} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.career || p.role || ''}</p>
                  </div>
                  {selected && (
                    <RoleSelector
                      participanteId={p.id}
                      rol={pr?.rol ?? EVENT_ROLES[0]}
                      onChangeRol={setRol}
                      name={p.name}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Galería de imágenes ──────────────────────────────────────────────────────
// Cada item del array puede ser:
//   { id, src (URL servidor), title, _serverImage: true }  → imagen existente en el servidor
//   { id, src (blob URL), title, _file: File }             → imagen nueva pendiente de subir
function GalleryField({ value, onChange, onRemoveServerImage, coverImageId, onSetCover }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const processFiles = async (files) => {
    setUploading(true);
    setError('');
    try {
      const results = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        results.push({
          id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          src: URL.createObjectURL(file),
          title: file.name.replace(/\.[^.]+$/, ''),
          _file: file,
        });
      }
      onChange([...value, ...results]);
    } catch {
      setError('Error al procesar alguna imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length) processFiles(files);
  };

  const removeImage = (img) => {
    // Si es una imagen del servidor, notificar al padre para que la elimine vía API
    if (img._serverImage) onRemoveServerImage?.(img.id);
    // Si es un blob URL temporal, liberarlo
    if (img._file) URL.revokeObjectURL(img.src);
    onChange(value.filter((i) => i.id !== img.id));
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700">
        Galería de evidencias
        {value.length > 0 && (
          <span className="ml-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {value.length} {value.length === 1 ? 'imagen' : 'imágenes'}
          </span>
        )}
      </label>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className="rounded-xl border-2 border-dashed py-8 px-4 text-center cursor-pointer transition-all"
        style={{
          borderColor: dragOver ? '#1A3FAA' : '#CBD5E1',
          background: dragOver ? '#EEF3FF' : '#F8FAFC',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (files.length) processFiles(files);
            e.target.value = '';
          }}
        />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: dragOver ? '#C7D7F8' : '#E5E7EB' }}
            >
              <Upload size={18} style={{ color: dragOver ? '#1A3FAA' : '#6B7280' }} aria-hidden="true" />
            </div>
          )}
          <p className="text-sm font-semibold text-slate-700" style={{ fontFamily: 'Syne, sans-serif' }}>
            {uploading ? 'Procesando…' : dragOver ? 'Suelta aquí' : 'Subir imágenes'}
          </p>
          <p className="text-xs text-slate-400">Arrastra y suelta o haz clic · PNG, JPG, WEBP</p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      {/* Thumbnails */}
      {value.length > 0 && (
        <>
          <p className="text-xs text-slate-400">
            Haz clic en <Star size={10} className="inline" /> para definir la imagen de portada del evento.
          </p>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            <AnimatePresence>
              {value.map((img) => {
                const isCover = img.id === coverImageId;
                return (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2 }}
                    className="relative group rounded-xl overflow-hidden bg-slate-100"
                    style={{ aspectRatio: '1' }}
                  >
                    <img src={img.src} alt={img.title || 'Imagen'} className="w-full h-full object-cover" />

                    {/* Cover badge */}
                    {isCover && (
                      <span style={{
                        position: 'absolute', top: 5, left: 5,
                        background: '#1A3FAA', color: '#fff',
                        fontSize: 8, fontWeight: 700, padding: '2px 6px',
                        borderRadius: 5, fontFamily: 'DM Sans, sans-serif',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        <Star size={7} fill="#fff" /> Portada
                      </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1.5">
                      {/* Set cover button */}
                      <button
                        type="button"
                        onClick={() => onSetCover?.(isCover ? null : img.id)}
                        aria-label={isCover ? 'Quitar portada' : 'Establecer como portada'}
                        title={isCover ? 'Quitar portada' : 'Establecer como portada'}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg"
                        style={{ background: isCover ? '#F59E0B' : 'rgba(255,255,255,0.25)' }}
                      >
                        <Star size={13} fill={isCover ? '#fff' : 'none'} aria-hidden="true" />
                      </button>
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => removeImage(img)}
                        aria-label={`Eliminar imagen ${img.title}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
                      >
                        <Trash2 size={13} aria-hidden="true" />
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
export function EventForm({ event, onSuccess, onCancel }) {
  const isEdit = !!event?.id;

  // Reconstruir participantRoles desde datos existentes del evento
  const initialParticipantRoles = (() => {
    if (event?.participantRoles?.length) return event.participantRoles;
    // Fallback: IDs sin rol → rol vacío
    return (event?.participantIds ?? []).map((id) => ({ participante_id: id, rol: 'Ponente' }));
  })();

  const [form, setForm] = useState({
    title:             event?.title          ?? '',
    description:       event?.description    ?? '',
    date:              event?.date           ?? '',
    category:          event?.category       ?? '',
    participantRoles:  initialParticipantRoles,
    coverImageId:      event?.coverImageId   ?? null,
    // Imágenes existentes del servidor se marcan con _serverImage: true
    gallery: (event?.gallery ?? []).map((g) => ({ ...g, _serverImage: true })),
  });
  const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'El título es obligatorio.';
    if (!form.date)         e.date  = 'La fecha es obligatoria.';
    if (!form.category)     e.category = 'Selecciona una categoría.';
    return e;
  };

  const handleRemoveServerImage = (id) => {
    setDeletedGalleryIds((prev) => [...prev, id]);
    // Clear cover if it was the removed image
    if (form.coverImageId === id) setForm((f) => ({ ...f, coverImageId: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setSaveError('');

    try {
      if (getToken()) {
        // ── Flujo API ──────────────────────────────────────────────────────────
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

        // Eliminar imágenes del servidor que el usuario quitó
        await Promise.all(
          deletedGalleryIds.map((id) => eventosGaleriaApi.delete(id).catch(() => {}))
        );

        // Subir imágenes nuevas (las que tienen _file)
        const newImages = form.gallery.filter((g) => g._file);
        await Promise.all(
          newImages.map((g) => eventosGaleriaApi.upload(eventId, g._file, g.title).catch(() => {}))
        );

        // Sincronizar localStorage con los datos actualizados del servidor
        await syncEventos().catch(() => {});
      } else {
        // ── Fallback localStorage ──────────────────────────────────────────────
        eventsRepository.save({
          ...(isEdit ? { id: event.id, createdAt: event.createdAt } : {}),
          title:            form.title.trim(),
          description:      form.description.trim(),
          date:             form.date,
          category:         form.category,
          participantRoles: form.participantRoles,
          participantIds:   form.participantRoles.map((pr) => pr.participante_id),
          coverImageId:     form.coverImageId,
          gallery: form.gallery.map((g) => ({ id: g.id, src: g.src, title: g.title })),
        });
      }

      onSuccess?.();
    } catch (err) {
      setSaveError(err.message ?? 'Error al guardar el evento. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
    }`;

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6" noValidate>

      {/* Título */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-title" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <Tag size={13} className="text-slate-400" aria-hidden="true" />
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="event-title"
          type="text"
          value={form.title}
          onChange={set('title')}
          placeholder="Ej: Feria de Ciencias 2025"
          className={inputClass('title')}
        />
        {errors.title && <p className="text-xs text-red-500" role="alert">{errors.title}</p>}
      </div>

      {/* Fecha */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-date" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <CalendarDays size={13} className="text-slate-400" aria-hidden="true" />
          Fecha <span className="text-red-500">*</span>
        </label>
        <input
          id="event-date"
          type="date"
          value={form.date}
          onChange={set('date')}
          className={inputClass('date')}
        />
        {errors.date && <p className="text-xs text-red-500" role="alert">{errors.date}</p>}
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-description" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <AlignLeft size={13} className="text-slate-400" aria-hidden="true" />
          Descripción
        </label>
        <textarea
          id="event-description"
          value={form.description}
          onChange={set('description')}
          rows={4}
          placeholder="Describe brevemente el evento, sus objetivos y resultados…"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      {/* Categoría */}
      <CategoryField
        value={form.category}
        onChange={(cat) => setForm((f) => ({ ...f, category: cat }))}
      />
      {errors.category && <p className="text-xs text-red-500 -mt-4" role="alert">{errors.category}</p>}

      {/* Participantes con roles */}
      <ParticipantsField
        value={form.participantRoles}
        onChange={(roles) => setForm((f) => ({ ...f, participantRoles: roles }))}
      />

      {/* Galería */}
      <GalleryField
        value={form.gallery}
        onChange={(gallery) => setForm((f) => ({ ...f, gallery }))}
        onRemoveServerImage={handleRemoveServerImage}
        coverImageId={form.coverImageId}
        onSetCover={(id) => setForm((f) => ({ ...f, coverImageId: id }))}
      />

      {/* Error de guardado */}
      {saveError && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
          {saveError}
        </p>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear evento'}
        </Button>
      </div>
    </form>
  );
}
