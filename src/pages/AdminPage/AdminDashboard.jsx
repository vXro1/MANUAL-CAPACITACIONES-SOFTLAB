import { motion } from 'framer-motion';
import { BookOpen, Users, Star, FileText, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { manualsRepository, participantsRepository } from '@/storage/localStorageRepository';
import { Badge } from '@/shared/ui/Badge';
import { formatDate } from '@/shared/lib/formatDate';

export function AdminDashboard() {
  const manuals = manualsRepository.getAll();
  const participants = participantsRepository.getAll();
  const featured = manuals.filter((m) => m.featured);

  const stats = [
    { icon: BookOpen, label: 'Total manuales', value: manuals.length, color: 'text-brand-600', bg: 'bg-brand-50' },
    { icon: Star, label: 'Destacados', value: featured.length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: Users, label: 'Participantes', value: participants.length, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: FileText, label: 'Con PDF', value: manuals.filter((m) => m.pdf).length, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <div className="p-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel principal</h1>
        <p className="text-sm text-slate-500 mt-1">Resumen general del contenido publicado.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <Icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/panel-softlab-admin/manuales/nuevo"
          className="group flex items-center justify-between p-5 bg-brand-600 rounded-2xl text-white hover:bg-brand-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <p className="font-semibold">Nuevo manual</p>
              <p className="text-xs text-brand-200">Agregar capacitación</p>
            </div>
          </div>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/panel-softlab-admin/manuales"
          className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl text-slate-900 hover:border-brand-200 hover:shadow-brand transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <BookOpen size={20} className="text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Gestionar manuales</p>
              <p className="text-xs text-slate-400">Ver, editar o eliminar</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-brand-600 transition-all" />
        </Link>
      </div>

      {/* Recent manuals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Manuales recientes</h2>
          <Link to="/panel-softlab-admin/manuales" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Título</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Fecha</th>
                <th className="text-left px-5 py-3">PDF</th>
              </tr>
            </thead>
            <tbody>
              {manuals.slice(0, 5).map((manual) => (
                <tr key={manual.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900 truncate max-w-[200px]">{manual.title}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <Badge variant="blue">{manual.category}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">
                    {formatDate(manual.date, { month: 'short' })}
                  </td>
                  <td className="px-5 py-3.5">
                    {manual.pdf ? (
                      <Badge variant="green">Disponible</Badge>
                    ) : (
                      <Badge variant="yellow">Pendiente</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
