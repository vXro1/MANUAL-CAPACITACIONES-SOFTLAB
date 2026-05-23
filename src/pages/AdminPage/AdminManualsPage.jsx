import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, BookOpen, Star, Search, Eye } from 'lucide-react';
import { manualsRepository } from '@/storage/localStorageRepository';
import { manualesApi } from '@/services/apiService';
import { syncManuales } from '@/services/dataSync';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ManualForm } from '@/features/manual-form/ManualForm';
import { formatDate } from '@/shared/lib/formatDate';

export function AdminManualsPage() {
  const [manuals, setManuals] = useState(() => manualsRepository.getAll());
  const [search, setSearch] = useState('');
  const [editManual, setEditManual] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const reload = () => setManuals(manualsRepository.getAll());

  const filtered = manuals.filter(
    (m) =>
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      await manualesApi.delete(id);
      await syncManuales();
      reload();
    } catch (err) {
      console.error('Error al eliminar manual:', err);
    }
    setDeleteId(null);
  };

  const handleToggleFeatured = async (manual) => {
    try {
      await manualesApi.update(manual.id, {
        titulo: manual.title,
        categoria: manual.category,
        descripcion: manual.description,
        autor_ids: manual.authorIds,
        fecha: manual.date,
        destacado: !manual.featured,
      });
      await syncManuales();
      reload();
    } catch (err) {
      console.error('Error al actualizar manual:', err);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manuales</h1>
          <p className="text-sm text-slate-500 mt-1">{manuals.length} manuales registrados</p>
        </div>
        <Link to="/panel-softlab-admin/manuales/nuevo">
          <Button icon={Plus}>Nuevo manual</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
        <label htmlFor="admin-manuals-search" className="sr-only">Buscar manual</label>
        <input
          id="admin-manuals-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar manual…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <BookOpen size={32} className="opacity-30" />
            <p className="text-sm">No hay manuales</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Título</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Categoría</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Fecha</th>
                  <th className="text-left px-5 py-3">PDF</th>
                  <th className="text-left px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((manual, i) => (
                  <motion.tr
                    key={manual.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {manual.cover && (
                          <div className="w-10 h-7 rounded overflow-hidden bg-slate-100 shrink-0 hidden sm:block">
                            <img src={manual.cover} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-1">{manual.title}</p>
                          {manual.featured && (
                            <span className="text-[10px] text-yellow-600 flex items-center gap-0.5 mt-0.5">
                              <Star size={9} /> Destacado
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge variant="blue">{manual.category}</Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-500 hidden lg:table-cell">
                      {formatDate(manual.date, { month: 'short' })}
                    </td>
                    <td className="px-5 py-4">
                      {manual.pdf ? (
                        <Badge variant="green">Si</Badge>
                      ) : (
                        <Badge variant="yellow">No</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/manuales/${manual.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
                          aria-label={`Ver manual: ${manual.title}`}
                        >
                          <Eye size={15} aria-hidden="true" />
                        </Link>
                        <button
                          onClick={() => setEditManual(manual)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
                          aria-label={`Editar manual: ${manual.title}`}
                        >
                          <Edit2 size={15} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(manual)}
                          className={`p-1.5 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-brand-600 ${
                            manual.featured
                              ? 'text-yellow-500 hover:bg-yellow-50'
                              : 'text-slate-400 hover:bg-yellow-50 hover:text-yellow-500'
                          }`}
                          aria-label={manual.featured ? `Quitar de destacados: ${manual.title}` : `Destacar manual: ${manual.title}`}
                          aria-pressed={manual.featured}
                        >
                          <Star size={15} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setDeleteId(manual.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-red-500"
                          aria-label={`Eliminar manual: ${manual.title}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editManual}
        onClose={() => setEditManual(null)}
        title="Editar manual"
        size="xl"
      >
        {editManual && (
          <ManualForm
            manual={editManual}
            onSuccess={() => { reload(); setEditManual(null); }}
            onCancel={() => setEditManual(null)}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Esta acción eliminará el manual permanentemente. No se puede deshacer.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteId)} className="flex-1">
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
