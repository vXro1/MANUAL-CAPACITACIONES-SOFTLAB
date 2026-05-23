import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X, Users } from 'lucide-react';
import { participantsRepository } from '@/storage/localStorageRepository';
import { participantesApi } from '@/services/apiService';
import { syncParticipantes } from '@/services/dataSync';
import { ParticipantForm, PARTICIPANT_ROLES } from '@/features/participant-form/ParticipantForm';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';

const ROLE_COLORS = {
  Investigador: 'blue',
  'Co-Investigador': 'blue',
  'Investigador Principal': 'blue',
  Estudiante: 'slate',
  Docente: 'green',
  'Docente Investigador': 'green',
  Ponente: 'yellow',
  'Director del Semillero': 'red',
  'Co-Director del Semillero': 'red',
  'Auxiliar de Investigación': 'slate',
  'Colaborador Externo': 'slate',
};

function ParticipantRow({ participant, index, onEdit, onDelete }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group"
    >
      {/* Participant */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            photo={participant.photo}
            name={participant.name}
            size="md"
            shape="square"
          />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{participant.name}</p>
            {participant.career && (
              <p className="text-xs text-slate-400 truncate">{participant.career}</p>
            )}
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-5 py-4 hidden sm:table-cell">
        <Badge variant={ROLE_COLORS[participant.role] ?? 'slate'}>
          {participant.role}
        </Badge>
      </td>

      {/* Semester */}
      <td className="px-5 py-4 hidden md:table-cell">
        <span className="text-sm text-slate-500">
          {participant.semester ? `Semestre ${participant.semester}` : '—'}
        </span>
      </td>

      {/* Skills */}
      <td className="px-5 py-4 hidden lg:table-cell">
        <div className="flex gap-1 flex-wrap">
          {(participant.skills ?? []).slice(0, 3).map((s) => (
            <Badge key={s} variant="slate" className="text-[10px]">{s}</Badge>
          ))}
          {(participant.skills ?? []).length > 3 && (
            <Badge variant="slate" className="text-[10px]">
              +{participant.skills.length - 3}
            </Badge>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(participant)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
            aria-label={`Editar participante: ${participant.name}`}
          >
            <Edit2 size={15} aria-hidden="true" />
          </button>
          <button
            onClick={() => onDelete(participant)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-red-500"
            aria-label={`Eliminar participante: ${participant.name}`}
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Users size={28} className="opacity-40" />
      </div>
      <div className="text-center">
        <p className="font-medium text-slate-600">Sin participantes</p>
        <p className="text-sm mt-1">Agrega el primer miembro del semillero.</p>
      </div>
      <Button icon={Plus} onClick={onAdd}>
        Agregar participante
      </Button>
    </div>
  );
}

export function AdminParticipantsPage() {
  const [participants, setParticipants] = useState(() => participantsRepository.getAll());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const reload = () => setParticipants(participantsRepository.getAll());

  const filtered = participants.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.career ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.role ?? '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'Todos' || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  const presentRoles = ['Todos', ...new Set(participants.map((p) => p.role).filter(Boolean))];

  const openAdd = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (p) => { setEditTarget(p); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditTarget(null); };

  const handleFormSuccess = () => {
    reload();
    closeForm();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await participantesApi.delete(deleteTarget.id);
      await syncParticipantes();
      reload();
    } catch (err) {
      console.error('Error al eliminar participante:', err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Participantes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {participants.length} miembro{participants.length !== 1 ? 's' : ''} en el semillero
          </p>
        </div>
        <Button icon={Plus} onClick={openAdd}>
          Agregar participante
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <label htmlFor="admin-participants-search" className="sr-only">Buscar participante</label>
          <input
            id="admin-participants-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, carrera o rol…"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Limpiar búsqueda"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {presentRoles.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                roleFilter === role
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-200 hover:text-brand-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {participants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100">
          <EmptyState onAdd={openAdd} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <Search size={28} className="opacity-30" />
          <p className="text-sm">Sin resultados para la búsqueda actual.</p>
          <button onClick={() => { setSearch(''); setRoleFilter('Todos'); }} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Participante</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Rol</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Semestre</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Habilidades</th>
                  <th className="text-left px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p, i) => (
                    <ParticipantRow
                      key={p.id}
                      participant={p}
                      index={i}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editTarget ? `Editar: ${editTarget.name}` : 'Nuevo participante'}
        size="lg"
      >
        <ParticipantForm
          participant={editTarget}
          onSuccess={handleFormSuccess}
          onCancel={closeForm}
        />
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar eliminación"
        size="sm"
      >
        {deleteTarget && (
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar
                photo={deleteTarget.photo}
                name={deleteTarget.name}
                size="lg"
                shape="square"
              />
              <div>
                <p className="font-semibold text-slate-900">{deleteTarget.name}</p>
                <p className="text-sm text-slate-500">{deleteTarget.role}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Esta acción eliminará al participante y su foto de perfil permanentemente.
              No se puede deshacer.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="flex-1"
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
                className="flex-1"
                icon={Trash2}
              >
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
