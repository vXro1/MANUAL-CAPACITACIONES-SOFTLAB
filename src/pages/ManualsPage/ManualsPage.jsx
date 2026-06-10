import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, BookOpen } from 'lucide-react';
import { ManualCard } from '@/widgets/ManualCard/ManualCard';
import { manualesApi, participantesApi } from '@/services/apiService';

const CATEGORY_PALETTE = {
  'Realidad Virtual':       { bg: '#EEF3FF', accent: '#1A3FAA', border: '#C7D7F8' },
  'DevOps':                 { bg: '#FFF7ED', accent: '#C2410C', border: '#FED7AA' },
  'Control de Versiones':   { bg: '#F0FDF4', accent: '#15803D', border: '#BBF7D0' },
  'Desarrollo Frontend':    { bg: '#FDF4FF', accent: '#9333EA', border: '#E9D5FF' },
  'Desarrollo Backend':     { bg: '#FFF1F2', accent: '#E11D48', border: '#FECDD3' },
  'Bases de Datos':         { bg: '#F0F9FF', accent: '#0369A1', border: '#BAE6FD' },
  'Gestión de Proyectos':   { bg: '#FEFCE8', accent: '#CA8A04', border: '#FDE68A' },
  'Seguridad':              { bg: '#F8FAFC', accent: '#475569', border: '#CBD5E1' },
  'Inteligencia Artificial':{ bg: '#ECFDF5', accent: '#059669', border: '#A7F3D0' },
};

function getCategoryPalette(cat) {
  return CATEGORY_PALETTE[cat] || { bg: '#F1F5F9', accent: '#475569', border: '#CBD5E1' };
}

const EASE = [0.22, 1, 0.36, 1];

export function ManualsPage() {
  const [manuals, setManuals] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  useEffect(() => {
    let cancelled = false;
    Promise.all([manualesApi.getAll(), participantesApi.getAll()])
      .then(([m, p]) => {
        if (!cancelled) {
          setManuals(m ?? []);
          setParticipants(p ?? []);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(manuals.map((m) => m.category).filter(Boolean))];
    return ['Todos', ...cats];
  }, [manuals]);

  const filtered = useMemo(() => {
    return manuals.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (m.title ?? '').toLowerCase().includes(q) ||
        (m.description ?? '').toLowerCase().includes(q) ||
        (m.category ?? '').toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === 'Todos' || m.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [manuals, search, activeCategory]);

  const hasFilters = search || activeCategory !== 'Todos';

  return (
    <main id="main-content" style={{ minHeight: '100vh', background: '#fff' }}>

      {/* ── Hero ── */}
      <div
        style={{
          background: 'linear-gradient(145deg, #050913 0%, #0F1E55 55%, #1A3FAA 100%)',
          paddingTop: 'clamp(80px, 10vw, 120px)',
          paddingBottom: 'clamp(60px, 8vw, 96px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid lines */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />

        {/* Primary glow orb — top right */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,123,232,0.28) 0%, rgba(26,63,170,0.12) 45%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Secondary glow orb — bottom left */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: '-30%', left: '-8%',
            width: 480, height: 480, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(147,197,253,0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Bottom fade to white */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to bottom, transparent, rgba(26,63,170,0.08))',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '0 clamp(20px, 5vw, 48px)',
            position: 'relative', zIndex: 1,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
              style={{
                fontSize: 11, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#93C5FD', fontFamily: 'DM Sans, sans-serif', margin: 0,
              }}
            >
              Biblioteca Digital
            </motion.p>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, delay: 0.12, ease: EASE }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 800, color: '#fff',
                margin: 0, lineHeight: 1.1, letterSpacing: '-1px',
              }}
            >
              Manuales de{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #60A5FA, #A78BFA)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >
                usuario
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              style={{
                fontSize: 'clamp(14px, 2vw, 17px)',
                color: 'rgba(147,197,253,0.82)',
                margin: 0, fontFamily: 'DM Sans, sans-serif',
                lineHeight: 1.65, maxWidth: 520,
              }}
            >
              Documentación técnica de capacitaciones realizadas por el semillero de
              investigación Softlab.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.3, ease: EASE }}
              style={{ position: 'relative', maxWidth: 520 }}
            >
              <label htmlFor="manuals-search" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                Buscar manual
              </label>
              <Search
                size={16}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}
                aria-hidden="true"
              />
              <input
                id="manuals-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar manual…"
                style={{
                  width: '100%',
                  paddingLeft: 44, paddingRight: search ? 44 : 16,
                  paddingTop: 14, paddingBottom: 14,
                  borderRadius: 14,
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.96)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  fontSize: 14, color: '#0A0F1E',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none', boxSizing: 'border-box',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#60A5FA';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.20), 0 0 0 3px rgba(96,165,250,0.22)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.20)';
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Limpiar búsqueda"
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 4, color: '#64748b', display: 'flex', alignItems: 'center',
                  }}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </motion.div>

            {/* Count pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.42 }}
            >
              <span
                style={{
                  display: 'inline-block', padding: '6px 16px', borderRadius: 999,
                  fontSize: 13, fontWeight: 600,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#E2E8F0', fontFamily: 'DM Sans, sans-serif',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {filtered.length} manuales disponibles
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Filters + Grid ── */}
      <div
        style={{
          background: 'linear-gradient(180deg, #F8FAFF 0%, #fff 60px)',
          maxWidth: 1200, margin: '0 auto',
          padding: 'clamp(40px, 6vw, 72px) clamp(20px, 5vw, 48px)',
        }}
      >
        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            overflowX: 'auto', paddingBottom: 8, marginBottom: 36,
            scrollbarWidth: 'none',
          }}
          role="group"
          aria-label="Filtrar por categoría"
        >
          <SlidersHorizontal size={14} color="#94a3b8" aria-hidden="true" style={{ flexShrink: 0 }} />
          {categories.map((cat) => {
            const isActive = cat === activeCategory;
            const pal = cat === 'Todos'
              ? { accent: '#1A3FAA', bg: '#EEF3FF', border: '#C7D7F8' }
              : getCategoryPalette(cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={isActive}
                style={{
                  flexShrink: 0,
                  padding: '7px 16px', borderRadius: 999,
                  fontSize: 12, fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                  border: isActive ? `1.5px solid ${pal.accent}` : '1.5px solid #E2E8F0',
                  background: isActive ? pal.accent : '#fff',
                  color: isActive ? '#fff' : '#475569',
                  cursor: 'pointer',
                  transition: 'background 0.18s, color 0.18s, border-color 0.18s, box-shadow 0.18s',
                  boxShadow: isActive ? `0 4px 16px ${pal.accent}28` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = pal.border;
                    e.currentTarget.style.color = pal.accent;
                    e.currentTarget.style.background = pal.bg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.background = '#fff';
                  }
                }}
              >
                {cat}
              </button>
            );
          })}

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setActiveCategory('Todos'); }}
              aria-label="Limpiar todos los filtros"
              style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '7px 14px', borderRadius: 999,
                fontSize: 12, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                border: '1.5px solid #FECDD3', background: '#FFF1F2', color: '#E11D48',
                cursor: 'pointer',
                transition: 'background 0.18s',
              }}
            >
              <X size={11} aria-hidden="true" /> Limpiar
            </button>
          )}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 20,
              }}
            >
              {filtered.map((manual, i) => {
                const speakerId = manual.speakerIds?.[0] ?? manual.speakerId ?? null;
                const speaker = speakerId ? participants.find(p => String(p.id) === String(speakerId)) ?? null : null;
                return <ManualCard key={manual.id} manual={manual} index={i} speaker={speaker} />;
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: EASE }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', paddingTop: 80, paddingBottom: 80, gap: 16,
              }}
            >
              <div
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: '#EEF3FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(26,63,170,0.10)',
                }}
              >
                <BookOpen size={32} color="#1A3FAA" style={{ opacity: 0.5 }} aria-hidden="true" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#0A0F1E', margin: '0 0 6px' }}>
                  Sin resultados
                </p>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                  No se encontraron manuales con los filtros actuales.
                </p>
              </div>
              <button
                onClick={() => { setSearch(''); setActiveCategory('Todos'); }}
                style={{
                  padding: '10px 22px', borderRadius: 10,
                  background: '#1A3FAA', color: '#fff',
                  border: 'none', fontSize: 13, fontWeight: 700,
                  fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                  marginTop: 4,
                  boxShadow: '0 4px 16px rgba(26,63,170,0.22)',
                  transition: 'opacity 0.18s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Ver todos los manuales
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
