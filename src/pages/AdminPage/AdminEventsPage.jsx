import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, CalendarDays, Search, Images, Users } from 'lucide-react';
import { eventsRepository, participantsRepository } from '@/storage/localStorageRepository';
import { eventosApi, getToken } from '@/services/apiService';
import { syncEventos } from '@/services/dataSync';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Modal } from '@/shared/ui/Modal';
import { EventForm } from '@/features/event-form/EventForm';
import { formatDate } from '@/shared/lib/formatDate';

const CATEGORY_COLORS = {
  'Divulgación Científica':  'blue',
  'Salida Técnica':          'green',
  'Movilidad Internacional': 'purple',
  'Movilidad Nacional':      'yellow',
};

function categoryVariant(cat) {
  return CATEGORY_COLORS[cat] ?? 'blue';
}

export function AdminEventsPage() {
  const [events,     setEvents]     = useState(() => eventsRepository.getAll());
  const [participants]              = useState(() => participantsRepository.getAll());
  const [search,     setSearch]     = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent,  setEditEvent]  = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    syncEventos()
      .then(() => setEvents(eventsRepository.getAll()))
      .catch(() => {});
  }, []);

  const reload = () => setEvents(eventsRepository.getAll());

  const filtered = events.filter(
    (ev) =>
      !search ||
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.category.toLowerCase().includes(search.toLowerCase())
  );

  const getParticipantNames = (ids = []) =>
    ids.map((id) => participants.find((p) => p.id === id)?.name).filter(Boolean);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (getToken()) {
        await eventosApi.delete(deleteId);
        await syncEventos().catch(() => {});
      } else {
        eventsRepository.delete(deleteId);
      }
      reload();
    } catch {
      eventsRepository.delete(deleteId);
      reload();
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSuccess = async () => {
    await syncEventos().catch(() => {});
    reload();
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Eventos</h1>
          <p className="text-sm text-slate-500 mt-1">
            {events.length} evento{events.length !== 1 ? 's' : ''} registrado{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button icon={Plus} onClick={() => setCreateOpen(true)}>Nuevo evento</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
        <label htmlFor="admin-events-search" className="sr-only">Buscar evento</label>
        <input
          id="admin-events-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar evento…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <CalendarDays size={32} className="opacity-30" />
            <p className="text-sm">{search ? 'Sin resultados' : 'No hay eventos aún'}</p>
            {!search && (
              <Button variant="outline" icon={Plus} onClick={() => setCreateOpen(true)}>
                Crear el primero
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Evento</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Categoría</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Fecha</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Participantes</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Galería</th>
                  <th className="text-left px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) => {
                  const names = getParticipantNames(ev.participantIds);
                  return (
                    <motion.tr
                      key={ev.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-1">{ev.title}</p>
                          {ev.description && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{ev.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <Badge variant={categoryVariant(ev.category)}>{ev.category}</Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-500 hidden lg:table-cell">
                        {ev.date ? formatDate(ev.date, { month: 'short' }) : '—'}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        {names.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <Users size={12} className="text-slate-400" aria-hidden="true" />
                            <span className="text-xs text-slate-500">{names.length}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        {(ev.gallery?.length ?? 0) > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <Images size={12} className="text-slate-400" aria-hidden="true" />
                            <span className="text-xs text-slate-500">{ev.gallery.length}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditEvent(ev)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
                            aria-label={`Editar evento: ${ev.title}`}
                          >
                            <Edit2 size={15} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => setDeleteId(ev.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-red-500"
                            aria-label={`Eliminar evento: ${ev.title}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      <EventForm
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Edit modal */}
      <EventForm
        isOpen={!!editEvent}
        onClose={() => setEditEvent(null)}
        event={editEvent}
        onSuccess={handleSuccess}
      />

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar eliminación" size="sm">
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Esta acción eliminará el evento y su galería permanentemente. No se puede deshacer.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1" disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1" disabled={deleting}>
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
