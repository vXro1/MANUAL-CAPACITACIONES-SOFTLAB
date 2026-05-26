import { useForm } from 'react-hook-form';
import {
  Save, Plus, X, Upload, Link as LinkIcon, FileText, CheckCircle,
  ImagePlus, Image as ImageIcon, Search, Users, User, Mic,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input, Textarea } from '@/shared/ui/Input';
import { CATEGORIES } from '@/shared/constants';
import { manualesApi } from '@/services/apiService';
import { syncManuales } from '@/services/dataSync';
import { participantsRepository } from '@/storage/localStorageRepository';
import { evidenciasApi } from '@/services/apiService';
import { cn } from '@/shared/lib/cn';

// ─── Campo PDF ────────────────────────────────────────────────────────────────
function PDFUploadField({ value, onChange }) {
  const isFile    = value instanceof File;
  const isUrl     = typeof value === 'string' && value.startsWith('http');
  const [mode, setMode]         = useState(isUrl ? 'url' : 'file');
  const [urlInput, setUrlInput] = useState(isUrl ? value : '');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Solo se permiten archivos PDF.'); return; }
    onChange(file);
  };

  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
    onChange(e.target.value || null);
  };

  const hasFile = isFile || isUrl;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">PDF del manual</label>
      <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs w-fit">
        {[['file', Upload, 'Subir archivo'], ['url', LinkIcon, 'URL externa']].map(([m, Icon, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors',
              m !== 'file' && 'border-l border-slate-200',
              mode === m ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        <label className={cn(
          'flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all',
          hasFile && isFile ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/30'
        )}>
          <input type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />
          {isFile ? (
            <div className="flex flex-col items-center gap-1.5 text-green-700">
              <CheckCircle size={24} className="text-green-500" />
              <span className="text-sm font-medium">{value.name}</span>
              <span className="text-xs text-green-600">Listo para subir. Haz clic para reemplazar.</span>
            </div>
          ) : isUrl ? (
            <div className="flex flex-col items-center gap-1.5 text-brand-700">
              <CheckCircle size={24} className="text-brand-500" />
              <span className="text-sm font-medium">PDF guardado en el servidor</span>
              <span className="text-xs text-brand-600">Haz clic para reemplazar.</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-slate-500">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <FileText size={20} className="text-slate-400" />
              </div>
              <span className="text-sm font-medium text-slate-700">Haz clic para seleccionar el PDF</span>
              <span className="text-xs text-slate-400">Solo archivos .pdf · Máx 50 MB</span>
            </div>
          )}
        </label>
      ) : (
        <input
          type="url"
          value={urlInput}
          onChange={handleUrlChange}
          placeholder="https://ejemplo.com/manual.pdf"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      )}
    </div>
  );
}

// ─── Campo portada ───────────────────────────────────────────────────────────
function CoverImageField({ value, onChange }) {
  // value: null | base64 string (nueva) | URL http string (existente en servidor)
  const isBase64 = typeof value === 'string' && value.startsWith('data:');
  const isUrl    = typeof value === 'string' && !isBase64 && value.length > 0;
  const [mode, setMode]         = useState(isUrl ? 'url' : 'file');
  const [urlInput, setUrlInput] = useState(isUrl ? value : '');

  const preview = isBase64 || isUrl ? value : null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes.'); return; }
    if (file.size > 3 * 1024 * 1024) { alert('La imagen no puede superar 3 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
    onChange(e.target.value || null);
  };

  const clear = () => {
    setUrlInput('');
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">Portada del manual</label>

      <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs w-fit">
        {[['file', Upload, 'Subir imagen'], ['url', LinkIcon, 'URL externa']].map(([m, Icon, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors',
              m !== 'file' && 'border-l border-slate-200',
              mode === m ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 items-start">
        {mode === 'file' ? (
          <label className={cn(
            'flex-1 flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all',
            isBase64 ? 'border-green-300 bg-green-50'
              : isUrl ? 'border-brand-200 bg-brand-50/30'
              : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/30'
          )}>
            <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
            {isBase64 ? (
              <div className="flex flex-col items-center gap-1.5 text-green-700">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-sm font-medium">✓ Imagen lista para guardar</span>
                <span className="text-xs text-green-600">Haz clic para reemplazar</span>
              </div>
            ) : isUrl ? (
              <div className="flex flex-col items-center gap-1.5 text-brand-700">
                <CheckCircle size={20} className="text-brand-500" />
                <span className="text-sm font-medium">Portada guardada en servidor</span>
                <span className="text-xs text-brand-600">Haz clic para reemplazar con archivo</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-slate-500">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                  <ImageIcon size={20} className="text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-700">Haz clic para seleccionar imagen</span>
                <span className="text-xs text-slate-400">PNG, JPG, WEBP · máx. 3 MB</span>
              </div>
            )}
          </label>
        ) : (
          <input
            type="url"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        )}

        {/* Preview */}
        {preview && (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
            <img src={preview} alt="Vista previa portada" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clear}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              aria-label="Quitar portada"
            >
              <X size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Selector de participantes (multi) ────────────────────────────────────────
function ParticipantPicker({ label, icon: Icon, participants, value, onChange }) {
  const [search, setSearch] = useState('');
  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.career ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const toggle = (id) =>
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-brand-500" />}
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {value.length > 0 && (
          <span className="ml-auto text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
            {value.length}
          </span>
        )}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Lista */}
      <div className="max-h-44 overflow-y-auto flex flex-col gap-0.5 border border-slate-200 rounded-xl p-1.5 bg-slate-50">
        {filtered.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-3">Sin resultados</p>
        )}
        {filtered.map(p => {
          const selected = value.includes(p.id);
          return (
            <label
              key={p.id}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors select-none',
                selected ? 'bg-brand-50 border border-brand-100' : 'hover:bg-white'
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(p.id)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <div className="w-7 h-7 rounded-full bg-brand-100 overflow-hidden flex items-center justify-center text-xs font-bold text-brand-600 shrink-0">
                {p.photo
                  ? <img src={p.photo} alt="" className="w-full h-full object-cover" />
                  : (p.name?.[0] ?? '?')}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-400 truncate">{p.career ?? p.role ?? ''}</p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Chips de seleccionados */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(id => {
            const p = participants.find(x => x.id === id);
            return p ? (
              <span
                key={id}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs font-medium text-brand-700"
              >
                {p.name}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="text-brand-300 hover:text-red-500 transition-colors ml-0.5"
                  aria-label={`Quitar ${p.name}`}
                >
                  <X size={10} />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

// ─── Evidencias (galería del manual) ─────────────────────────────────────────
function GalleryItemPreview({ value, onRemove, index }) {
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden group border border-slate-200 bg-slate-100">
      <img src={value} alt="" className="w-full h-full object-cover" />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        aria-label="Eliminar imagen"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ─── ManualForm ───────────────────────────────────────────────────────────────
export function ManualForm({ manual, onSuccess, onCancel }) {
  const participants = participantsRepository.getAll();
  const isEdit       = Boolean(manual?.id);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm({
    defaultValues: {
      title:        manual?.title        ?? '',
      subtitle:     manual?.subtitle     ?? '',
      description:  manual?.description  ?? '',
      introduction: manual?.introduction ?? '',
      category:     manual?.category     ?? CATEGORIES[0],
      date:         manual?.date         ?? '',
      time:         manual?.time         ?? '',
      duration:     manual?.duration     ?? '',
      institution:  manual?.institution  ?? '',
      // portada: puede ser File (nueva) o string URL (servidor/externa)
      cover:        manual?.cover || manual?.coverImage || null,
      pdf:          manual?.pdf && !manual.pdf.startsWith('idb:') ? manual.pdf : null,
    },
  });

  const pdfValue   = watch('pdf');
  const coverValue = watch('cover');

  // ── Roles ──
  const [speakerIds, setSpeakerIds]       = useState(
    manual?.speakerId ? [manual.speakerId] : (manual?.speakerIds ?? [])
  );
  const [authorIds, setAuthorIds]         = useState(manual?.authorIds ?? []);
  const [auxiliaresIds, setAuxiliaresIds] = useState(manual?.auxiliaresIds ?? []);

  // ── Objetivos ──
  const [objectives, setObjectives]   = useState(manual?.objectives?.length ? manual.objectives : ['']);
  const addObjective    = () => setObjectives(p => [...p, '']);
  const removeObjective = (i) => setObjectives(p => p.filter((_, idx) => idx !== i));
  const updateObjective = (i, val) => setObjectives(p => p.map((o, idx) => idx === i ? val : o));

  // ── Galería de evidencias ──
  const [galleryItems, setGalleryItems]       = useState(
    (manual?.gallery ?? []).filter(v => typeof v === 'string' && v.startsWith('http'))
  );
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryError, setGalleryError]       = useState('');
  const [draggingOver, setDraggingOver]       = useState(false);
  const [apiError, setApiError]               = useState('');
  const fileInputRef = useRef(null);

  const uploadGalleryFiles = async (files) => {
    const images = files.filter(f => f.type.startsWith('image/'));
    if (!images.length) return;
    setUploadingGallery(true);
    setGalleryError('');
    try {
      const results = await Promise.all(images.map(f => evidenciasApi.upload(f)));
      setGalleryItems(p => [...p, ...results.map(r => r.url)]);
    } catch (err) {
      setGalleryError('Error al subir imágenes: ' + (err.message ?? 'Intenta de nuevo'));
    } finally {
      setUploadingGallery(false);
    }
  };

  const addGalleryUrl = () => {
    const url = galleryUrlInput.trim();
    if (url) { setGalleryItems(p => [...p, url]); setGalleryUrlInput(''); }
  };

  const onSubmit = async (data) => {
    setApiError('');
    const pdfFile = data.pdf instanceof File ? data.pdf : undefined;
    const pdfUrl  = typeof data.pdf === 'string' ? data.pdf : undefined;

    // Portada: puede ser base64 (nueva), URL http (existente) o null
    const coverIsBase64 = typeof coverValue === 'string' && coverValue.startsWith('data:');
    const coverUrl = typeof coverValue === 'string' && !coverIsBase64 ? coverValue : undefined;
    let coverFile;
    if (coverIsBase64) {
      const [header, b64] = coverValue.split(',');
      const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      coverFile = new File([bytes], 'portada.jpg', { type: mime });
    }

    const payload = {
      titulo:       data.title,
      categoria:    data.category,
      descripcion:  data.description,
      fecha:        data.date,
      destacado:    manual?.featured ?? false,
      // roles
      autor_ids:     authorIds,
      speakerId:     speakerIds[0] ?? null,
      speakerIds:    speakerIds,
      auxiliaresIds: auxiliaresIds,
      // campos extra
      subtitle:      data.subtitle,
      introduction:  data.introduction,
      time:          data.time,
      duration:      data.duration,
      institution:   data.institution,
      // portada URL (si no hay archivo nuevo)
      cover:         coverFile ? undefined : coverUrl,
      objectives:    objectives.filter(Boolean),
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
    } catch (err) {
      setApiError(err.message ?? 'Error al guardar. Intenta de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-6">

      {/* ── Información básica ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input label="Título del manual" placeholder="Ej: Manual de Docker"
            error={errors.title?.message} {...register('title', { required: 'El título es requerido' })} />
        </div>
        <div className="md:col-span-2">
          <Input label="Subtítulo (opcional)" placeholder="Descripción breve del tema" {...register('subtitle')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Categoría</label>
          <input
            list="manual-categories"
            placeholder="Selecciona o escribe una categoría"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            {...register('category')}
          />
          <datalist id="manual-categories">
            {CATEGORIES.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <Input label="Fecha" type="date" {...register('date', { required: 'La fecha es requerida' })} error={errors.date?.message} />
        <Input label="Hora" type="time" {...register('time')} />
        <Input label="Duración" placeholder="Ej: 3 horas" {...register('duration')} />
        <div className="md:col-span-2">
          <Input label="Institución" placeholder="Universidad Autónoma del Cauca" {...register('institution')} />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Descripción breve" placeholder="Resumen del contenido..." rows={3}
            {...register('description', { required: 'La descripción es requerida' })} error={errors.description?.message} />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Introducción" placeholder="Introducción completa al tema..." rows={5} {...register('introduction')} />
        </div>
        <div className="md:col-span-2">
          <CoverImageField
            value={coverValue}
            onChange={val => setValue('cover', val, { shouldDirty: true })}
          />
        </div>
        <div className="md:col-span-2">
          <PDFUploadField value={pdfValue} onChange={val => setValue('pdf', val, { shouldDirty: true })} />
        </div>
      </div>

      {/* ── Objetivos ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Objetivos</label>
          <button type="button" onClick={addObjective}
            className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium">
            <Plus size={14} /> Agregar objetivo
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {objectives.map((obj, i) => (
            <div key={i} className="flex gap-2">
              <input value={obj} onChange={e => updateObjective(i, e.target.value)}
                placeholder={`Objetivo ${i + 1}`}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {objectives.length > 1 && (
                <button type="button" onClick={() => removeObjective(i)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Roles ── */}
      <div className="flex flex-col gap-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Personas involucradas</p>

        <ParticipantPicker
          label="Ponente(s)"
          icon={Mic}
          participants={participants}
          value={speakerIds}
          onChange={setSpeakerIds}
        />

        <div className="border-t border-slate-200" />

        <ParticipantPicker
          label="Autores / Estudiantes encargados"
          icon={Users}
          participants={participants}
          value={authorIds}
          onChange={setAuthorIds}
        />

        <div className="border-t border-slate-200" />

        <ParticipantPicker
          label="Auxiliares externos"
          icon={User}
          participants={participants}
          value={auxiliaresIds}
          onChange={setAuxiliaresIds}
        />
      </div>

      {/* ── Galería de evidencias ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-brand-100 flex items-center justify-center">
            <ImageIcon size={13} className="text-brand-600" />
          </div>
          <label className="text-sm font-medium text-slate-700">Galería de evidencias</label>
          {galleryItems.length > 0 && (
            <span className="ml-auto text-xs text-slate-400">
              {galleryItems.length} imagen{galleryItems.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        <div
          onDrop={async e => { e.preventDefault(); setDraggingOver(false); await uploadGalleryFiles(Array.from(e.dataTransfer.files)); }}
          onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
          onDragLeave={() => setDraggingOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all',
            draggingOver ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/40'
          )}
        >
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only"
            onChange={async e => { await uploadGalleryFiles(Array.from(e.target.files)); e.target.value = ''; }} />
          {uploadingGallery ? (
            <div className="flex flex-col items-center gap-2 text-brand-600">
              <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Guardando imágenes...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <ImagePlus size={18} className="text-brand-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                {draggingOver ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-slate-400">PNG, JPG, WEBP</p>
            </>
          )}
        </div>
        {galleryError && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{galleryError}</p>
        )}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1.5"><LinkIcon size={11} /> O por URL:</span>
          <input value={galleryUrlInput} onChange={e => setGalleryUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addGalleryUrl())}
            placeholder="https://..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-0" />
          <button type="button" onClick={addGalleryUrl}
            className="shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600">
            <Plus size={12} /> Agregar
          </button>
        </div>
        {galleryItems.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {galleryItems.map((item, i) => (
              <GalleryItemPreview key={`${item}-${i}`} value={item} index={i}
                onRemove={i => setGalleryItems(p => p.filter((_, idx) => idx !== i))} />
            ))}
          </div>
        )}
      </div>

      {apiError && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{apiError}</p>
      )}

      <div className="flex gap-3 pt-2 border-t border-slate-100">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>}
        <Button type="submit" loading={isSubmitting} icon={Save} className="flex-1">
          {isEdit ? 'Guardar cambios' : 'Crear manual'}
        </Button>
      </div>
    </form>
  );
}
