import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Star, Trash2, Images, ImagePlus, X, CheckCircle2, ExternalLink,
  ChevronUp, ChevronDown, Plus, Clapperboard, Heart, LayoutGrid,
} from 'lucide-react';
import { galleryRepository } from '@/storage/localStorageRepository';
import { galeriaApi } from '@/services/apiService';
import { syncGaleria } from '@/services/dataSync';
import { GalleryImagePicker } from '@/shared/ui/GalleryImagePicker';

const E = [0.22, 1, 0.36, 1];

// ─── Tarjeta de imagen (pestaña Fotos) ───────────────────────
function ImageCard({ image, onToggleFeatured, onToggleHero, heroCount, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [heroLoading,   setHeroLoading]   = useState(false);

  const isInHero    = image.heroOrder != null;
  const canAddHero  = !isInHero && heroCount < 5;
  const heroDisabled = !isInHero && !canAddHero;

  const handleHeroClick = async () => {
    if (heroDisabled || heroLoading) return;
    setHeroLoading(true);
    try { await onToggleHero(image.id, isInHero); }
    finally { setHeroLoading(false); }
  };

  const heroBorderColor = isInHero ? '#1A3FAA' : (image.featured ? '#F59E0B' : '#E5E7EB');
  const heroBorderWidth = (isInHero || image.featured) ? '2px' : '1px';
  const heroShadow      = isInHero
    ? '0 4px 20px rgba(26,63,170,0.14)'
    : (image.featured ? '0 4px 20px rgba(245,158,11,0.12)' : '0 1px 4px rgba(0,0,0,0.04)');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, ease: E }}
      style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        border: `${heroBorderWidth} solid ${heroBorderColor}`,
        boxShadow: heroShadow, transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Imagen */}
      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#F1F5F9', position: 'relative' }}>
        {image.src ? (
          <img src={image.src} alt={image.title || 'Imagen'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Images size={28} color="#CBD5E1" />
          </div>
        )}
        {image.featured && (
          <div style={{ position: 'absolute', top: 8, left: 8, background: '#F59E0B', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={9} fill="#fff" /> DESTACADA
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {isInHero && (
            <div style={{ background: '#1A3FAA', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clapperboard size={8} /> HERO #{image.heroOrder}
            </div>
          )}
          {image.joinOrder != null && (
            <div style={{ background: '#059669', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Heart size={8} /> UNIRSE #{image.joinOrder}
            </div>
          )}
        </div>
      </div>

      {/* Toggle "En Hero" */}
      <div style={{ padding: '9px 12px 0', borderBottom: '1px solid #F1F5F9' }}>
        <button
          onClick={handleHeroClick}
          disabled={heroDisabled || heroLoading}
          title={
            isInHero       ? 'Quitar del carrusel principal' :
            canAddHero     ? 'Agregar al carrusel principal (Hero)' :
            'Maximo 5 imagenes en el carrusel'
          }
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '7px 10px', borderRadius: 9, marginBottom: 9,
            border: isInHero ? '1.5px solid #C7D7F8' : '1.5px solid #E5E7EB',
            background: isInHero ? '#EEF3FF' : '#F8FAFC',
            cursor: heroDisabled || heroLoading ? 'not-allowed' : 'pointer',
            opacity: heroDisabled ? 0.45 : 1,
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => {
            if (!heroDisabled && !heroLoading) {
              e.currentTarget.style.background   = isInHero ? '#DBEAFE' : '#F0F9FF';
              e.currentTarget.style.borderColor  = isInHero ? '#93C5FD' : '#BAE6FD';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = isInHero ? '#EEF3FF' : '#F8FAFC';
            e.currentTarget.style.borderColor = isInHero ? '#C7D7F8' : '#E5E7EB';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {heroLoading ? (
              <div style={{ width: 12, height: 12, border: '2px solid #1A3FAA', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            ) : (
              <Clapperboard size={12} color={isInHero ? '#1A3FAA' : (heroDisabled ? '#CBD5E1' : '#64748B')} />
            )}
            <span style={{ fontSize: 11, fontWeight: 600, color: isInHero ? '#1A3FAA' : (heroDisabled ? '#CBD5E1' : '#374151'), fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              {isInHero ? `En carrusel — pos. ${image.heroOrder}` : 'Mostrar en Hero'}
            </span>
          </div>
          {/* Toggle visual */}
          <div style={{
            width: 32, height: 18, borderRadius: 99, position: 'relative', flexShrink: 0,
            background: isInHero ? '#1A3FAA' : '#CBD5E1',
            transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 2,
              left: isInHero ? 16 : 2,
              width: 14, height: 14, borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.20)',
              transition: 'left 0.2s',
            }} />
          </div>
        </button>
      </div>

      {/* Título y acciones */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <p style={{ flex: 1, fontSize: 12, color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
          {image.title || 'Sin titulo'}
        </p>
        <AnimatePresence mode="wait">
          {confirmDelete ? (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#EF4444', fontFamily: 'DM Sans, sans-serif' }}>Eliminar?</span>
              <button onClick={() => onDelete(image)} style={{ width: 26, height: 26, borderRadius: 6, background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Confirmar">
                <CheckCircle2 size={13} />
              </button>
              <button onClick={() => setConfirmDelete(false)} style={{ width: 26, height: 26, borderRadius: 6, background: '#F1F5F9', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Cancelar">
                <X size={13} />
              </button>
            </motion.div>
          ) : (
            <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => onToggleFeatured(image.id)} title={image.featured ? 'Quitar de destacadas' : 'Marcar como destacada'} style={{ width: 28, height: 28, borderRadius: 7, background: image.featured ? '#FFFBEB' : '#F8FAFC', border: `1px solid ${image.featured ? '#FDE68A' : '#E5E7EB'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                <Star size={13} fill={image.featured ? '#F59E0B' : 'none'} color={image.featured ? '#F59E0B' : '#94A3B8'} />
              </button>
              <button onClick={() => setConfirmDelete(true)} title="Eliminar imagen" style={{ width: 28, height: 28, borderRadius: 7, background: '#FEF2F2', border: '1px solid #FECACA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                <Trash2 size={13} color="#EF4444" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Zona de carga ────────────────────────────────────────────
function UploadZone({ onFiles, uploading }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      style={{ border: `2px dashed ${dragOver ? '#1A3FAA' : '#CBD5E1'}`, borderRadius: 16, padding: '36px 24px', textAlign: 'center', background: dragOver ? '#EEF3FF' : '#F8FAFC', transition: 'all 0.2s', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.65 : 1 }}
    >
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => { const files = Array.from(e.target.files); if (files.length) onFiles(files); e.target.value = ''; }} />
      <div style={{ width: 52, height: 52, borderRadius: 14, background: dragOver ? '#C7D7F8' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', transition: 'background 0.2s' }}>
        {uploading ? (
          <div style={{ width: 22, height: 22, border: '3px solid #1A3FAA', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        ) : (
          <Upload size={22} color={dragOver ? '#1A3FAA' : '#6B7280'} />
        )}
      </div>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: '0 0 6px' }}>
        {uploading ? 'Subiendo imágenes…' : dragOver ? 'Suelta aquí' : 'Subir imágenes'}
      </p>
      <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
        {uploading ? 'Por favor espera' : 'Arrastra y suelta o haz clic · PNG, JPG, WEBP · Máx. 5 MB por imagen'}
      </p>
    </div>
  );
}

// ─── Fila de imagen en el gestor de sección ───────────────────
function SlotRow({ image, index, total, onMoveUp, onMoveDown, onRemove, disabled }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: E }}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, marginBottom: 8 }}
    >
      {/* Número de posición */}
      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A3FAA', fontFamily: 'Syne, sans-serif' }}>{index + 1}</span>
      </div>

      {/* Thumbnail */}
      <div style={{ width: 80, height: 54, borderRadius: 8, overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
        <img src={image.src} alt={image.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      {/* Título */}
      <p style={{ flex: 1, fontSize: 13, color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
        {image.title || 'Sin título'}
      </p>

      {/* Controles de orden */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          onClick={onMoveUp}
          disabled={index === 0 || disabled}
          title="Subir"
          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #E5E7EB', background: index === 0 || disabled ? '#F8FAFC' : '#fff', color: index === 0 || disabled ? '#CBD5E1' : '#374151', cursor: index === 0 || disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        >
          <ChevronUp size={15} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1 || disabled}
          title="Bajar"
          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #E5E7EB', background: index === total - 1 || disabled ? '#F8FAFC' : '#fff', color: index === total - 1 || disabled ? '#CBD5E1' : '#374151', cursor: index === total - 1 || disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        >
          <ChevronDown size={15} />
        </button>
        <button
          onClick={onRemove}
          disabled={disabled}
          title="Quitar de esta sección"
          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', opacity: disabled ? 0.5 : 1 }}
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Gestor de sección (Hero o Por qué unirse) ────────────────
function SectionManager({ section, maxSlots, label, accentColor, accentBg }) {
  const [images,  setImages]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await galeriaApi.getSection(section);
      setImages(data);
    } catch {
      setError('Error al cargar la sección. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => { load(); }, [load]);

  const withSaving = async (fn) => {
    setSaving(true);
    setError('');
    try { await fn(); await load(); }
    catch { setError('Error al guardar. Intenta de nuevo.'); }
    finally { setSaving(false); }
  };

  const addImages = (selected) => withSaving(async () => {
    let nextPos = images.length + 1;
    for (const img of selected) {
      if (nextPos > maxSlots) break;
      if (images.some(i => i.id === img.id)) continue;
      await galeriaApi.setSectionSlot(img.id, section, nextPos);
      nextPos++;
    }
  });

  const removeImage = (img, index) => withSaving(async () => {
    await galeriaApi.setSectionSlot(img.id, section, null);
    const remaining = images.filter((_, i) => i !== index);
    for (let i = 0; i < remaining.length; i++) {
      if ((section === 'hero' ? remaining[i].heroOrder : remaining[i].joinOrder) !== i + 1) {
        await galeriaApi.setSectionSlot(remaining[i].id, section, i + 1);
      }
    }
  });

  const moveUp = (index) => withSaving(async () => {
    if (index === 0) return;
    const a = images[index];
    const b = images[index - 1];
    await galeriaApi.setSectionSlot(a.id, section, index);
    await galeriaApi.setSectionSlot(b.id, section, index + 1);
  });

  const moveDown = (index) => withSaving(async () => {
    if (index === images.length - 1) return;
    const a = images[index];
    const b = images[index + 1];
    await galeriaApi.setSectionSlot(a.id, section, index + 2);
    await galeriaApi.setSectionSlot(b.id, section, index + 1);
  });

  const excludeIds = images.map(i => i.id);
  const canAdd = images.length < maxSlots;

  return (
    <div>
      {/* Encabezado de sección */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: maxSlots }, (_, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: i < images.length ? accentColor : '#E5E7EB', transition: 'background 0.3s' }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
              {images.length} de {maxSlots} imágenes configuradas
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            {section === 'hero'
              ? 'Orden de aparición en el carrusel animado de la portada.'
              : 'Orden de aparición en el grid de fotos de la sección inferior.'}
          </p>
        </div>
        {canAdd && (
          <button
            onClick={() => setPickerOpen(true)}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: `0 4px 14px ${accentColor}40`, opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s' }}
          >
            <Plus size={15} /> Agregar imagen
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#DC2626', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
          <div style={{ width: 24, height: 24, border: '3px solid #E5E7EB', borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          Cargando sección…
        </div>
      ) : (
        <>
          <AnimatePresence>
            {images.map((img, i) => (
              <SlotRow
                key={img.id}
                image={img}
                index={i}
                total={images.length}
                disabled={saving}
                onMoveUp={() => moveUp(i)}
                onMoveDown={() => moveDown(i)}
                onRemove={() => removeImage(img, i)}
              />
            ))}
          </AnimatePresence>

          {/* Slots vacíos */}
          {Array.from({ length: maxSlots - images.length }, (_, i) => (
            <div
              key={`empty-${i}`}
              onClick={() => !saving && setPickerOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: `2px dashed ${canAdd ? '#CBD5E1' : '#F1F5F9'}`, borderRadius: 14, marginBottom: 8, cursor: canAdd && !saving ? 'pointer' : 'default', background: '#FAFAFA', transition: 'border-color 0.2s, background 0.2s' }}
              onMouseEnter={(e) => { if (canAdd && !saving) { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.background = accentBg; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#FAFAFA'; }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#CBD5E1', fontFamily: 'Syne, sans-serif' }}>{images.length + i + 1}</span>
              </div>
              <div style={{ width: 80, height: 54, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={18} color="#CBD5E1" />
              </div>
              <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                Slot vacío — haz clic para agregar una imagen
              </p>
            </div>
          ))}

          {images.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '24px 0 8px' }}
            >
              <p style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                No hay imágenes configuradas. Haz clic en un slot o en "Agregar imagen" para comenzar.
              </p>
            </motion.div>
          )}
        </>
      )}

      <GalleryImagePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addImages}
        multiSelect
        title={`Agregar a: ${label}`}
        excludeIds={excludeIds}
      />
    </div>
  );
}

// ─── AdminGalleryPage ─────────────────────────────────────────
const TABS = [
  { id: 'photos', label: 'Todas las fotos', icon: LayoutGrid },
  { id: 'hero',   label: 'Carrusel principal', icon: Clapperboard },
  { id: 'join',   label: 'Por qué unirse',   icon: Heart },
];

export function AdminGalleryPage() {
  const [activeTab, setActiveTab] = useState('photos');
  const [images,    setImages]    = useState(() => galleryRepository.getAll());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const refresh = useCallback(async () => {
    await syncGaleria();
    setImages(galleryRepository.getAll());
  }, []);

  const handleFiles = useCallback(async (files) => {
    const oversize = files.find(f => f.size > 5 * 1024 * 1024);
    if (oversize) {
      setUploadError(`"${oversize.name}" supera el límite de 5 MB (${(oversize.size / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      for (const file of files) {
        const title = file.name.replace(/\.[^.]+$/, '');
        await galeriaApi.upload(file, title);
      }
      await refresh();
    } catch (err) {
      setUploadError(err.message ?? 'Error al subir imagen. Verifica tu sesión.');
    } finally {
      setUploading(false);
    }
  }, [refresh]);

  const handleDelete = useCallback(async (image) => {
    try {
      await galeriaApi.delete(image.id);
      await refresh();
    } catch (err) {
      setUploadError(err.message ?? 'Error al eliminar imagen.');
    }
  }, [refresh]);

  const handleToggleFeatured = useCallback(async (id) => {
    try {
      await galeriaApi.toggleFeatured(id);
      await refresh();
    } catch (err) {
      console.error('Error al actualizar imagen:', err);
    }
  }, [refresh]);

  const featuredCount = images.filter(img => img.featured).length;
  const heroCount     = images.filter(img => img.heroOrder != null).length;

  const handleToggleHero = useCallback(async (id, isCurrentlyInHero) => {
    try {
      if (isCurrentlyInHero) {
        await galeriaApi.setSectionSlot(id, 'hero', null);
        // Renumerar los restantes para mantener orden continuo
        const remaining = images
          .filter(img => img.heroOrder != null && img.id !== id)
          .sort((a, b) => a.heroOrder - b.heroOrder);
        for (let i = 0; i < remaining.length; i++) {
          if (remaining[i].heroOrder !== i + 1) {
            await galeriaApi.setSectionSlot(remaining[i].id, 'hero', i + 1);
          }
        }
      } else {
        const currentHeroCount = images.filter(img => img.heroOrder != null).length;
        if (currentHeroCount >= 5) return;
        await galeriaApi.setSectionSlot(id, 'hero', currentHeroCount + 1);
      }
      await refresh();
    } catch (err) {
      console.error('Error al actualizar hero:', err);
    }
  }, [images, refresh]);

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E }} style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#1A3FAA', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4, fontFamily: 'DM Sans, sans-serif' }}>
          Administrar
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, color: '#0A0F1E', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              Galería de imágenes
            </h1>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              Gestiona tus fotos y configura qué aparece en cada sección de la página principal.
            </p>
          </div>
          <Link
            to="/galeria" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#EEF3FF', border: '1px solid #C7D7F8', color: '#1A3FAA', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <ExternalLink size={14} /> Ver galería pública
          </Link>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #F1F5F9', marginBottom: 28 }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 16px', border: 'none', borderRadius: '10px 10px 0 0', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: 'DM Sans, sans-serif', background: active ? '#fff' : 'transparent', color: active ? (id === 'hero' ? '#1A3FAA' : id === 'join' ? '#059669' : '#1A3FAA') : '#94A3B8', borderBottom: active ? `2px solid ${id === 'hero' ? '#1A3FAA' : id === 'join' ? '#059669' : '#1A3FAA'}` : '2px solid transparent', marginBottom: -2, transition: 'all 0.15s' }}
            >
              <Icon size={14} /> {label}
            </button>
          );
        })}
      </div>

      {/* ── Pestaña: Todas las fotos ── */}
      {activeTab === 'photos' && (
        <motion.div key="photos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 32, alignItems: 'start' }} className="admin-gallery-top">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05, ease: E }}>
              <UploadZone onFiles={handleFiles} uploading={uploading} />
              {uploadError && (
                <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <p style={{ fontSize: 13, color: '#DC2626', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{uploadError}</p>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12, ease: E }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Total de imagenes', value: images.length, icon: ImagePlus, accent: '#1A3FAA', bg: '#EEF3FF' },
                { label: 'En carrusel principal', value: heroCount, icon: Clapperboard, accent: '#1A3FAA', bg: '#EEF3FF' },
                { label: 'Imagenes destacadas', value: featuredCount, icon: Star, accent: '#D97706', bg: '#FFFBEB' },
              ].map(({ label, value, icon: Icon, accent, bg }) => (
                <div key={label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={accent} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, color: '#0A0F1E', margin: 0, letterSpacing: '-0.8px', lineHeight: 1 }}>{value}</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: '3px 0 0', fontFamily: 'DM Sans, sans-serif' }}>{label}</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: '14px 16px', borderRadius: 12, background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                <p style={{ fontSize: 12, color: '#0369A1', fontFamily: 'DM Sans, sans-serif', margin: 0, lineHeight: 1.6 }}>
                  Usa las pestañas <strong>Carrusel principal</strong> y <strong>Por qué unirse</strong> para configurar qué fotos aparecen en cada sección.
                </p>
              </div>
            </motion.div>
          </div>

          {images.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Images size={26} color="#CBD5E1" />
              </div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#94A3B8', margin: 0 }}>Sin imágenes aún</p>
              <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Sube la primera imagen usando la zona de carga de arriba.</p>
            </motion.div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#0A0F1E', margin: 0 }}>Todas las imágenes</h2>
                <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>{images.length} {images.length === 1 ? 'imagen' : 'imágenes'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                <AnimatePresence>
                  {images.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      heroCount={heroCount}
                      onToggleFeatured={handleToggleFeatured}
                      onToggleHero={handleToggleHero}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ── Pestaña: Carrusel principal (Hero) ── */}
      {activeTab === 'hero' && (
        <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <div style={{ background: '#EEF3FF', borderRadius: 16, padding: '16px 20px', border: '1px solid #C7D7F8', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clapperboard size={18} color="#1A3FAA" />
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A3FAA', margin: 0 }}>Carrusel principal (Hero)</p>
                <p style={{ fontSize: 12, color: '#3B5FCE', margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                  Hasta 5 imágenes · Se muestran en el carrusel animado de la portada · El orden aquí es el orden de aparición.
                </p>
              </div>
            </div>
          </div>
          <SectionManager
            section="hero"
            maxSlots={5}
            label="Carrusel principal"
            accentColor="#1A3FAA"
            accentBg="#EEF3FF"
          />
        </motion.div>
      )}

      {/* ── Pestaña: Por qué unirse ── */}
      {activeTab === 'join' && (
        <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <div style={{ background: '#F0FDF4', borderRadius: 16, padding: '16px 20px', border: '1px solid #BBF7D0', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Heart size={18} color="#059669" />
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#059669', margin: 0 }}>Por qué unirse a SoftLab</p>
                <p style={{ fontSize: 12, color: '#047857', margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                  Hasta 6 imágenes · Se muestran en el grid de fotos de la sección inferior de la página principal · El orden aquí es el orden del grid.
                </p>
              </div>
            </div>
          </div>
          <SectionManager
            section="join"
            maxSlots={6}
            label="Por qué unirse a SoftLab"
            accentColor="#059669"
            accentBg="#F0FDF4"
          />
        </motion.div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
