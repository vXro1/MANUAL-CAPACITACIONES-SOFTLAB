import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ParticipantForm } from '@/features/participant-form/ParticipantForm';

export function AdminNewParticipantPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 flex flex-col gap-6 max-w-2xl">
      <div>
        <button
          onClick={() => navigate('/panel-softlab-admin/participantes')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-4 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver a participantes
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo participante</h1>
        <p className="text-sm text-slate-500 mt-1">
          Agrega un nuevo miembro al semillero de investigación.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      >
        <ParticipantForm
          onSuccess={() => navigate('/panel-softlab-admin/participantes')}
          onCancel={() => navigate('/panel-softlab-admin/participantes')}
        />
      </motion.div>
    </div>
  );
}
