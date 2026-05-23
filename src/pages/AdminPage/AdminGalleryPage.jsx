import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Star, Trash2, Images, ImagePlus, X, CheckCircle2, ExternalLink,
} from 'lucide-react';
import { galleryRepository } from '@/storage/localStorageRepository';
import { galeriaApi } from '@/services/apiService';
import { syncGaleria } from '@/services/dataSync';

const E = [0.22, 1, 0.36, 1];

// ─── Thumbnail individual ─────────────────────────────────────
function ImageCard({ image, onToggleFeatured, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, ease: E }}
      style={{
        background: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        border: image.featured ? '2px solid #F59E0B' : '1px solid #E5E7EB',
        boxShadow: image.featured ? '0 4px 20px rgba(245,158,11,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Thumbnail */}
      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#F1F5F9', position: 'relative' }}>
        {image.src ? (
          <img
            src={image.src}
            alt={image.title || 'Imagen'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Images size={28} color="#CBD5E1" />
          </div>
        )}

        {/* Badge destacada */}
        {image.featured && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: '#F59E0B', color: '#fff',
            fontSize: 10, fontWeight: 700,
            padding: '2px 8px', borderRadius: 99,
            fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', gap: 4,
            letterSpacing: '0.04em',
          }}>
            <Star size={9} fill="#fff" /> DESTACADA
          </div>
        )}
      </div>

      {/* Info + acciones */}
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <p style={{
          flex: 1, fontSize: 12, color: '#374151', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {image.title || 'Sin título'}
        </p>

        <AnimatePresence mode="wait">
          {confirmDelete ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: 'flex', gap: 4, alignItems: 'center' }}
            >
              <span style={{ fontSize: 11, color: '#EF4444', fontFamily: 'DM Sans, sans-serif' }}>¿Eliminar?</span>
              <button
                onClick={() => onDelete(image)}
                style={{ width: 26, height: 26, borderRadius: 6, background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Confirmar"
              >
                <CheckCircle2 size={13} />
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ width: 26, height: 26, borderRadius: 6, background: '#F1F5F9', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Cancelar"
              >
                <X size={13} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: 4 }}
            >
              <button
                onClick={() => onToggleFeatured(image.id)}
                title={image.featured ? 'Quitar de destacadas' : 'Marcar como destacada'}
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: image.featured ? '#FFFBEB' : '#F8FAFC',
                  border: `1px solid ${image.featured ? '#FDE68A' : '#E5E7EB'}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <Star size={13} fill={image.featured ? '#F59E0B' : 'none'} color={image.featured ? '#F59E0B' : '#94A3B8'} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                title="Eliminar imagen"
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
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
      style={{
        border: `2px dashed ${dragOver ? '#1A3FAA' : '#CBD5E1'}`,
        borderRadius: 16,
        padding: '36px 24px',
        textAlign: 'center',
        background: dragOver ? '#EEF3FF' : '#F8FAFC',
        transition: 'all 0.2s',
        cursor: uploading ? 'not-allowed' : 'pointer',
        opacity: uploading ? 0.65 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files);
          if (files.length) onFiles(files);
          e.target.value = '';
        }}
      />

      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: dragOver ? '#C7D7F8' : '#E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
        transition: 'background 0.2s',
      }}>
        {uploading ? (
          <div style={{
            width: 22, height: 22, border: '3px solid #1A3FAA',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
        ) : (
          <Upload size={22} color={dragOver ? '#1A3FAA' : '#6B7280'} />
        )}
      </div>

      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#0A0F1E', margin: '0 0 6px' }}>
        {uploading ? 'Subiendo imágenes…' : dragOver ? 'Suelta aquí' : 'Subir imágenes'}
      </p>
      <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
        {uploading ? 'Por favor espera' : 'Arrastra y suelta o haz clic · PNG, JPG, WEBP'}
      </p>
    </div>
  );
}

// ─── AdminGalleryPage ─────────────────────────────────────────
export function AdminGalleryPage() {
  const [images, setImages] = useState(() => galleryRepository.getAll());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const refresh = useCallback(async () => {
    await syncGaleria();
    setImages(galleryRepository.getAll());
  }, []);

  const handleFiles = useCallback(async (files) => {
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

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: E }}
        style={{ marginBottom: 28 }}
      >
        <p style={{ fontSize: 12, fontWeight: 600, color: '#1A3FAA', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4, fontFamily: 'DM Sans, sans-serif' }}>
          Administrar
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, color: '#0A0F1E', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              Galería de imágenes
            </h1>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              Las imágenes marcadas como <strong style={{ color: '#F59E0B' }}>destacadas</strong> aparecen en la sección principal del inicio.
            </p>
          </div>
          <Link
            to="/galeria"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: '#EEF3FF', border: '1px solid #C7D7F8',
              color: '#1A3FAA', fontSize: 13, fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif', textDecoration: 'none',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            <ExternalLink size={14} />
            Ver galería pública
          </Link>
        </div>
      </motion.div>

      {/* Stats + zona de carga */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 32, alignItems: 'start' }} className="admin-gallery-top">

        {/* Zona de carga */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: E }}
        >
          <UploadZone onFiles={handleFiles} uploading={uploading} />
          {uploadError && (
            <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <p style={{ fontSize: 13, color: '#DC2626', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                {uploadError}
              </p>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: E }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {[
            { label: 'Total de imágenes', value: images.length, icon: ImagePlus, accent: '#1A3FAA', bg: '#EEF3FF' },
            { label: 'Imágenes destacadas', value: featuredCount, icon: Star, accent: '#D97706', bg: '#FFFBEB' },
          ].map(({ label, value, icon: Icon, accent, bg }) => (
            <div
              key={label}
              style={{
                background: '#fff', borderRadius: 14, padding: '18px 20px',
                border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={accent} />
              </div>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, color: '#0A0F1E', margin: 0, letterSpacing: '-0.8px', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: '3px 0 0', fontFamily: 'DM Sans, sans-serif' }}>{label}</p>
              </div>
            </div>
          ))}

          <div style={{ padding: '14px 16px', borderRadius: 12, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <p style={{ fontSize: 12, color: '#166534', fontFamily: 'DM Sans, sans-serif', margin: 0, lineHeight: 1.6 }}>
              <strong>Máx. 5 destacadas</strong> se muestran en la sección del inicio. Puedes tener más, pero solo las primeras 5 son visibles.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Grid de imágenes */}
      {images.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Images size={26} color="#CBD5E1" />
          </div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#94A3B8', margin: 0 }}>Sin imágenes aún</p>
          <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>Sube la primera imagen usando la zona de carga de arriba.</p>
        </motion.div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#0A0F1E', margin: 0 }}>
              Todas las imágenes
            </h2>
            <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
              {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            <AnimatePresence>
              {images.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onToggleFeatured={handleToggleFeatured}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

    </div>
  );
}
