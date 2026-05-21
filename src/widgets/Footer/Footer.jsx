import { Link } from 'react-router-dom';
import { FlaskConical, MapPin, Mail, BookOpen } from 'lucide-react';
import { SOFTLAB_INFO, NAV_LINKS } from '@/shared/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-slate-800">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <FlaskConical size={16} className="text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-white">Softlab</span>
                <span className="text-[10px] text-slate-400 font-medium">Manuales de Usuario</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              {SOFTLAB_INFO.description}
            </p>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-brand-400 shrink-0" />
                <span>{SOFTLAB_INFO.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-brand-400 shrink-0" />
                <span>{SOFTLAB_INFO.email}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
              Navegación
            </h3>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institution */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
              Institución
            </h3>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <p className="font-medium text-white">{SOFTLAB_INFO.institution}</p>
              <p>{SOFTLAB_INFO.faculty}</p>
              <p>{SOFTLAB_INFO.department}</p>
              <p className="mt-2 text-xs text-slate-500">
                Semillero de investigación activo desde {SOFTLAB_INFO.year}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {year} {SOFTLAB_INFO.fullName}. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1.5">
            <BookOpen size={12} />
            {SOFTLAB_INFO.institution}
          </p>
        </div>
      </div>
    </footer>
  );
}
