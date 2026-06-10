import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, Image as ImageIcon } from 'lucide-react';
import { galeriaApi } from '@/services/apiService';

const E = [0.22, 1, 0.36, 1];

export function GalleryImagePicker({
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
  title = 'Seleccionar de galería',
  excludeIds = [],
}) {
  const [images,   setImages]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setSelected([]);
    setSearch('');
    setLoading(true);
    galeriaApi.getAll()
      .then((data) => setImages(data))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const excluded = new Set(excludeIds.map(String));
  const filtered = images.filter((img) =>
    !excluded.has(String(img.id)) &&
    (!search || (img.title ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const isSelected = (img) => selected.some((s) => s.id === img.id);

  const toggle = (img) => {
    if (!multiSelect) { setSelected([img]); return; }
    setSelected((prev) =>
      prev.some((s) => s.id === img.id)
        ? prev.filter((s) => s.id !== img.id)
        : [...prev, img]
    );
  };

  const confirm = () => {
    if (!selected.length) return;
    onSelect(selected);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="gip-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(2,6,23,.80)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            key="gip-modal"
            initial={{ opacity: 0, scale: .95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: .95, y: 14 }}
            transition={{ duration: .26, ease: E }}
            style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}
          >
            <div style={{ width: '100%', maxWidth: 740, background: '#fff', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,.20)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 32px)', overflow: 'hidden', pointerEvents: 'auto' }}>

              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1.5px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ImageIcon size={18} style={{ color: '#1A3FAA' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>{title}</h3>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>
                    {multiSelect ? 'Selecciona una o más imágenes' : 'Selecciona una imagen'}
                    {!loading && images.length > 0 && ` · ${images.length} en galería`}
                  </p>
                </div>
                <button onClick={onClose}
                  style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', flexShrink: 0 }}
                  aria-label="Cerrar">
                  <X size={14} />
                </button>
              </div>

              {/* Search */}
              <div style={{ padding: '10px 20px', borderBottom: '1px solid #F8FAFC', flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar imagen por título…"
                    style={{ width: '100%', padding: '8px 12px 8px 30px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '48px 0', color: '#94A3B8' }}>
                    <div style={{ width: 26, height: 26, border: '2.5px solid #E2E8F0', borderTopColor: '#1A3FAA', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                    <span style={{ fontSize: 13 }}>Cargando galería…</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '48px 0', color: '#94A3B8' }}>
                    <ImageIcon size={36} style={{ opacity: .22 }} />
                    <p style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>
                      {search ? 'Sin resultados para tu búsqueda' : 'No hay imágenes en la galería'}
                    </p>
                    {!search && (
                      <p style={{ fontSize: 11, margin: 0, textAlign: 'center', maxWidth: 260 }}>
                        Sube imágenes a la galería principal primero para poder reutilizarlas aquí.
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 10 }}>
                    {filtered.map((img) => {
                      const sel = isSelected(img);
                      return (
                        <div
                          key={img.id}
                          onClick={() => toggle(img)}
                          style={{
                            position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                            border: `2.5px solid ${sel ? '#1A3FAA' : 'transparent'}`,
                            background: '#F1F5F9', aspectRatio: '4/3',
                            transition: 'border-color .15s, transform .15s',
                            transform: sel ? 'scale(0.97)' : 'scale(1)',
                            boxShadow: sel ? '0 0 0 3px rgba(26,63,170,.15)' : 'none',
                          }}
                        >
                          <img
                            src={img.src} alt={img.title || 'Imagen'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />

                          {sel && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,63,170,.18)', pointerEvents: 'none' }} />
                          )}

                          <div style={{
                            position: 'absolute', top: 5, right: 5,
                            width: 22, height: 22, borderRadius: '50%',
                            background: sel ? '#1A3FAA' : 'rgba(0,0,0,.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background .15s',
                          }}>
                            {sel && <Check size={11} color="#fff" strokeWidth={3} />}
                          </div>

                          {img.title && (
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              background: 'linear-gradient(transparent, rgba(0,0,0,.60))',
                              padding: '16px 6px 5px',
                              fontSize: 10, color: '#fff', fontWeight: 500,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {img.title}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 20px', borderTop: '1.5px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ flex: 1, fontSize: 12, color: '#94A3B8' }}>
                  {selected.length > 0
                    ? `${selected.length} ${selected.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}`
                    : 'Ninguna imagen seleccionada'}
                </span>
                <button onClick={onClose}
                  style={{ padding: '8px 16px', borderRadius: 9, border: '1.5px solid #E2E8F0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={confirm} disabled={selected.length === 0}
                  style={{
                    padding: '8px 18px', borderRadius: 9, border: 'none',
                    background: selected.length === 0 ? '#CBD5E1' : '#1A3FAA',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'background .15s',
                  }}>
                  {multiSelect
                    ? `Añadir ${selected.length > 0 ? selected.length + ' ' : ''}imagen${selected.length !== 1 ? 'es' : ''}`
                    : 'Seleccionar'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
