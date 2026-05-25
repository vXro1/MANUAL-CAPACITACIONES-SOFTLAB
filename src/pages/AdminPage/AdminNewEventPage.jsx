import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { EventForm } from '@/features/event-form/EventForm';

export function AdminNewEventPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-4 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo evento</h1>
        <p className="text-sm text-slate-500 mt-1">Completa los campos para registrar un nuevo evento del semillero.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      >
        <EventForm
          onSuccess={() => navigate('/panel-softlab-admin/eventos')}
          onCancel={() => navigate(-1)}
        />
      </motion.div>
    </div>
  );
}
