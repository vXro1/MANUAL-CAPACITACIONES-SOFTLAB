import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { ManualCard } from '@/widgets/ManualCard/ManualCard';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';

export function ManualGrid({ manuals }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = useMemo(() => {
    const cats = [...new Set(manuals.map((m) => m.category))];
    return ['Todos', ...cats];
  }, [manuals]);

  const filtered = useMemo(() => {
    return manuals.filter((m) => {
      const matchesSearch =
        !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === 'Todos' || m.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [manuals, search, activeCategory]);

  return (
    <div className="flex flex-col gap-8">
      {/* Search and filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <label htmlFor="manuals-search" className="sr-only">
            Buscar manuales
          </label>
          <input
            id="manuals-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, descripción o categoría…"
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Category filters */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
          role="group"
          aria-label="Filtrar por categoría"
        >
          <SlidersHorizontal size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border',
                activeCategory === cat
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-200 hover:text-brand-700 hover:bg-brand-50'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filtered.length === manuals.length
            ? `${manuals.length} manuales disponibles`
            : `${filtered.length} de ${manuals.length} manuales`}
        </p>
        {(search || activeCategory !== 'Todos') && (
          <button
            onClick={() => { setSearch(''); setActiveCategory('Todos'); }}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            aria-label="Limpiar todos los filtros"
          >
            <X size={12} aria-hidden="true" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((manual, i) => (
            <ManualCard key={manual.id} manual={manual} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400"
        >
          <Search size={36} className="opacity-30" />
          <div className="text-center">
            <p className="font-medium text-slate-600">Sin resultados</p>
            <p className="text-sm mt-1">
              No se encontraron manuales con los filtros actuales.
            </p>
          </div>
          <button
            onClick={() => { setSearch(''); setActiveCategory('Todos'); }}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Ver todos los manuales
          </button>
        </motion.div>
      )}
    </div>
  );
}
