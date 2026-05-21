import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Save, Plus, X, Upload, Link as LinkIcon, FileText, CheckCircle,
  ImagePlus, Image as ImageIcon,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input, Textarea, Select } from '@/shared/ui/Input';
import { CATEGORIES } from '@/shared/constants';
import { manualsRepository, speakersRepository } from '@/storage/localStorageRepository';
import { storePDFFile, isIDBKey } from '@/storage/pdfStorageService';
import { storeImage, resolveImageUrl } from '@/storage/imageStorageService';
import { cn } from '@/shared/lib/cn';

function PDFUploadField({ value, onChange }) {
  const [inputMode, setInputMode] = useState(isIDBKey(value) || !value ? 'file' : 'url');
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(isIDBKey(value) ? 'Archivo guardado localmente' : '');
  const [urlInput, setUrlInput] = useState(!isIDBKey(value) ? (value ?? '') : '');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF.');
      return;
    }
    setUploading(true);
    try {
      const tempId = `pdf_${Date.now()}`;
      const idbKey = await storePDFFile(tempId, file);
      setFileName(file.name);
      onChange(idbKey);
    } catch (err) {
      console.error('Error al guardar PDF:', err);
      alert('No se pudo guardar el PDF. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    setUrlInput(e.target.value);
    onChange(e.target.value);
  };

  const hasValue = Boolean(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium text-slate-700">PDF del manual</label>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs w-fit">
        <button
          type="button"
          onClick={() => setInputMode('file')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors',
            inputMode === 'file'
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          <Upload size={12} />
          Subir archivo
        </button>
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors border-l border-slate-200',
            inputMode === 'url'
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          <LinkIcon size={12} />
          URL externa
        </button>
      </div>

      {inputMode === 'file' ? (
        <div>
          <label className={cn(
            'flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
            hasValue && isIDBKey(value)
              ? 'border-green-300 bg-green-50'
              : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/30'
          )}>
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-brand-600">
                <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Guardando PDF...</span>
              </div>
            ) : hasValue && isIDBKey(value) ? (
              <div className="flex flex-col items-center gap-1.5 text-green-700">
                <CheckCircle size={24} className="text-green-500" />
                <span className="text-sm font-medium">{fileName || 'PDF cargado'}</span>
                <span className="text-xs text-green-600">Guardado localmente. Haz clic para reemplazar.</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-slate-500">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                  <FileText size={20} className="text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-700">Haz clic para seleccionar el PDF</span>
                <span className="text-xs text-slate-400">Solo archivos .pdf</span>
              </div>
            )}
          </label>
          {hasValue && isIDBKey(value) && (
            <div className="mt-2 flex items-center gap-2 p-3 rounded-lg bg-brand-50 border border-brand-100 text-xs text-brand-700">
              <CheckCircle size={13} className="text-brand-500 shrink-0" />
              <span>
                El PDF está guardado en el navegador. Al abrir el manual se cargará automáticamente con la animación de libro.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="url"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="https://ejemplo.com/manual.pdf"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          {urlInput && (
            <p className="text-xs text-slate-500 mt-1.5">
              Se usará esta URL directamente para el visor de PDF.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function GalleryItemPreview({ value, onRemove, index }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    resolveImageUrl(value).then((url) => {
      objectUrl = url;
      setSrc(url);
    });
    return () => {
      if (objectUrl?.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden group border border-slate-200 bg-slate-100">
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
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

export function ManualForm({ manual, onSuccess, onCancel }) {
  const speakers = speakersRepository.getAll();
  const isEdit = Boolean(manual?.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      title: manual?.title ?? '',
      subtitle: manual?.subtitle ?? '',
      description: manual?.description ?? '',
      introduction: manual?.introduction ?? '',
      category: manual?.category ?? CATEGORIES[0],
      date: manual?.date ?? '',
      time: manual?.time ?? '',
      duration: manual?.duration ?? '',
      speakerId: manual?.speakerId ?? (speakers[0]?.id ?? ''),
      institution: manual?.institution ?? '',
      cover: manual?.cover ?? '',
      pdf: manual?.pdf ?? '',
    },
  });

  const pdfValue = watch('pdf');

  const [objectives, setObjectives] = useState(manual?.objectives ?? ['']);
  const [galleryItems, setGalleryItems] = useState(manual?.gallery ?? []);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  const addObjective = () => setObjectives((prev) => [...prev, '']);
  const removeObjective = (i) => setObjectives((prev) => prev.filter((_, idx) => idx !== i));
  const updateObjective = (i, val) =>
    setObjectives((prev) => prev.map((o, idx) => (idx === i ? val : o)));

  const uploadGalleryFiles = async (files) => {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (!images.length) return;
    setUploadingGallery(true);
    try {
      const keys = await Promise.all(
        images.map(async (file) => {
          const key = `gallery_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          return storeImage(key, file);
        })
      );
      setGalleryItems((prev) => [...prev, ...keys]);
    } catch (err) {
      console.error('Error al guardar imágenes:', err);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleGalleryFilePick = async (e) => {
    const files = Array.from(e.target.files ?? []);
    await uploadGalleryFiles(files);
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDraggingOver(false);
    const files = Array.from(e.dataTransfer.files);
    await uploadGalleryFiles(files);
  };

  const addGalleryUrl = () => {
    const url = galleryUrlInput.trim();
    if (url) {
      setGalleryItems((prev) => [...prev, url]);
      setGalleryUrlInput('');
    }
  };

  const removeGalleryItem = (i) => setGalleryItems((prev) => prev.filter((_, idx) => idx !== i));

  const onSubmit = (data) => {
    const saved = {
      ...manual,
      ...data,
      objectives: objectives.filter(Boolean),
      gallery: galleryItems,
      featured: manual?.featured ?? false,
      tags: manual?.tags ?? [],
      authorIds: manual?.authorIds ?? [],
      editorId: manual?.editorId ?? null,
    };
    manualsRepository.save(saved);
    onSuccess?.();
  };

  const allCategories = [...CATEGORIES, 'Realidad Virtual'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Título del manual"
            placeholder="Ej: Manual de Docker"
            error={errors.title?.message}
            {...register('title', { required: 'El título es requerido' })}
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Subtítulo (opcional)"
            placeholder="Subtítulo o descripción breve del tema"
            {...register('subtitle')}
          />
        </div>

        <Select label="Categoría" {...register('category')}>
          {allCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        <Select label="Ponente" {...register('speakerId')}>
          <option value="">Sin ponente asignado</option>
          {speakers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>

        <Input
          label="Fecha"
          type="date"
          {...register('date', { required: 'La fecha es requerida' })}
          error={errors.date?.message}
        />

        <Input label="Hora" type="time" {...register('time')} />
        <Input label="Duración" placeholder="Ej: 3 horas" {...register('duration')} />
        <Input
          label="Institución"
          placeholder="Universidad Autónoma del Cauca"
          {...register('institution')}
        />

        <div className="md:col-span-2">
          <Textarea
            label="Descripción breve"
            placeholder="Resumen del contenido del manual..."
            rows={3}
            {...register('description', { required: 'La descripción es requerida' })}
            error={errors.description?.message}
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Introducción"
            placeholder="Introducción completa al tema..."
            rows={5}
            {...register('introduction')}
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="URL portada (imagen)"
            placeholder="https://images.unsplash.com/..."
            {...register('cover')}
          />
        </div>

        {/* PDF Upload */}
        <div className="md:col-span-2">
          <PDFUploadField
            value={pdfValue}
            onChange={(val) => setValue('pdf', val, { shouldDirty: true })}
          />
        </div>
      </div>

      {/* Objectives */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Objetivos</label>
          <button
            type="button"
            onClick={addObjective}
            className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            <Plus size={14} />
            Agregar objetivo
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {objectives.map((obj, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={obj}
                onChange={(e) => updateObjective(i, e.target.value)}
                placeholder={`Objetivo ${i + 1}`}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeObjective(i)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-brand-100 flex items-center justify-center">
            <ImageIcon size={13} className="text-brand-600" />
          </div>
          <label className="text-sm font-medium text-slate-700">
            Galería de evidencias
          </label>
          {galleryItems.length > 0 && (
            <span className="ml-auto text-xs text-slate-400">{galleryItems.length} imagen{galleryItems.length !== 1 ? 'es' : ''}</span>
          )}
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
          onDragLeave={() => setDraggingOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
            draggingOver
              ? 'border-brand-400 bg-brand-50'
              : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/40'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleGalleryFilePick}
          />
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
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  {draggingOver ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP — puedes subir varias a la vez</p>
              </div>
            </>
          )}
        </div>

        {/* URL alternative */}
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <LinkIcon size={11} />
            O por URL:
          </div>
          <input
            value={galleryUrlInput}
            onChange={(e) => setGalleryUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGalleryUrl())}
            placeholder="https://..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-0"
          />
          <button
            type="button"
            onClick={addGalleryUrl}
            className="shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          >
            <Plus size={12} />
            Agregar
          </button>
        </div>

        {/* Preview grid */}
        {galleryItems.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {galleryItems.map((item, i) => (
              <GalleryItemPreview key={`${item}-${i}`} value={item} index={i} onRemove={removeGalleryItem} />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} icon={Save} className="flex-1">
          {isEdit ? 'Guardar cambios' : 'Crear manual'}
        </Button>
      </div>
    </form>
  );
}
