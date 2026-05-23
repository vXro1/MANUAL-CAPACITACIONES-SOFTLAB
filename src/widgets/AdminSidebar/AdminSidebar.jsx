import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  Users,
  LogOut,
  FlaskConical,
  ChevronRight,
  UserPlus,
  X,
  Images,
  ExternalLink,
} from 'lucide-react';
import { adminAuthRepository } from '@/storage/localStorageRepository';
import { cn } from '@/shared/lib/cn';

const NAV_GROUPS = [
  {
    label: 'Contenido',
    items: [
      { label: 'Panel', href: '/panel-softlab-admin', icon: LayoutDashboard, end: true },
      { label: 'Manuales', href: '/panel-softlab-admin/manuales', icon: BookOpen },
      { label: 'Nuevo manual', href: '/panel-softlab-admin/manuales/nuevo', icon: Plus },
    ],
  },
  {
    label: 'Equipo',
    items: [
      { label: 'Participantes', href: '/panel-softlab-admin/participantes', icon: Users },
      { label: 'Agregar participante', href: '/panel-softlab-admin/participantes/nuevo', icon: UserPlus },
    ],
  },
  {
    label: 'Galería',
    items: [
      { label: 'Imágenes', href: '/panel-softlab-admin/galeria', icon: Images },
      { label: 'Ver galería pública', href: '/galeria', icon: ExternalLink, external: true },
    ],
  },
];

function SidebarItem({ item, onClose }) {
  const Icon = item.icon;

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
      >
        <Icon size={17} aria-hidden="true" />
        <span className="flex-1">{item.label}</span>
      </a>
    );
  }

  return (
    <NavLink
      to={item.href}
      end={item.end}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
          isActive
            ? 'bg-brand-600 text-white shadow-brand'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} aria-hidden="true" />
          <span className="flex-1">{item.label}</span>
          {isActive && <ChevronRight size={14} aria-hidden="true" />}
        </>
      )}
    </NavLink>
  );
}

export function AdminSidebar({ isOpen, onClose, onLogout }) {
  const handleLogout = () => {
    adminAuthRepository.logout();
    onLogout?.();
  };

  return (
    <aside
      id="admin-sidebar"
      aria-label="Navegación del panel administrador"
      className={cn(
        // Base
        'bg-white border-r border-slate-100 flex flex-col overflow-hidden z-40',
        // Mobile: fixed overlay, toggled by isOpen
        'fixed top-0 left-0 h-screen w-64',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: in-flow, always visible, no animation
        'md:relative md:w-60 md:h-screen md:translate-x-0 md:transition-none md:shrink-0'
      )}
    >
      {/* Logo + mobile close */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <FlaskConical size={16} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Softlab</p>
            <p className="text-[10px] text-slate-400">Panel administrador</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Cerrar menú de navegación"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-4 p-3 overflow-y-auto" aria-label="Menú principal">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 py-1.5">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <SidebarItem key={item.href} item={item} onClose={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut size={16} aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
