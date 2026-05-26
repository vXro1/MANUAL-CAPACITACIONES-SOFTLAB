import { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LayoutDashboard, BookOpen,
  Users, LogOut, FlaskConical, ChevronRight,
  Images, ExternalLink, GraduationCap, CalendarDays,
} from 'lucide-react';
import { AdminAuth } from '@/features/admin-auth/AdminAuth';
import { getToken, removeToken } from '@/services/apiService';
import { cn } from '@/shared/lib/cn';

// ─── Constantes de navegación ─────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Contenido',
    items: [
      { label: 'Panel',           href: '/panel-softlab-admin',               icon: LayoutDashboard, end: true },
      { label: 'Manuales',        href: '/panel-softlab-admin/manuales',       icon: BookOpen },
    ],
  },
  {
    label: 'Equipo',
    items: [
      { label: 'Participantes',      href: '/panel-softlab-admin/participantes', icon: Users },
      { label: 'Personal directivo', href: '/panel-softlab-admin/directivos',   icon: GraduationCap },
    ],
  },
  {
    label: 'Eventos',
    items: [
      { label: 'Eventos', href: '/panel-softlab-admin/eventos', icon: CalendarDays },
    ],
  },
  {
    label: 'Galería',
    items: [
      { label: 'Imágenes',            href: '/panel-softlab-admin/galeria', icon: Images },
      { label: 'Ver galería pública', href: '/galeria', icon: ExternalLink, external: true },
    ],
  },
];

// ─── Mapa de títulos por ruta ─────────────────────────────────────────────────
const PAGE_TITLES = {
  '/panel-softlab-admin':                     { title: 'Panel principal',       sub: 'Resumen general del sistema' },
  '/panel-softlab-admin/manuales':            { title: 'Gestión de manuales',   sub: 'Administra el catálogo de manuales' },
  '/panel-softlab-admin/manuales/nuevo':      { title: 'Nuevo manual',          sub: 'Crea una nueva capacitación' },
  '/panel-softlab-admin/participantes':       { title: 'Participantes',         sub: 'Equipo del semillero' },
  '/panel-softlab-admin/participantes/nuevo': { title: 'Nuevo participante',    sub: 'Agregar miembro al equipo' },
  '/panel-softlab-admin/galeria':             { title: 'Galería de imágenes',   sub: 'Gestiona las fotos del semillero' },
  '/panel-softlab-admin/directivos':          { title: 'Personal Directivo',    sub: 'Docentes y directores del semillero' },
  '/panel-softlab-admin/eventos':             { title: 'Gestión de eventos',    sub: 'Administra los eventos del semillero' },
  '/panel-softlab-admin/eventos/nuevo':       { title: 'Nuevo evento',          sub: 'Crear un nuevo evento' },
};

// ─── SidebarItem ──────────────────────────────────────────────────────────────
function SidebarItem({ item, onClose }) {
  const Icon = item.icon;

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, textDecoration: 'none', color: '#94A3B8', fontSize: 13.5, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFF'; e.currentTarget.style.color = '#1A3FAA'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: '#F8FAFF', border: '1px solid #EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} aria-hidden="true" />
        </div>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
      </a>
    );
  }

  return (
    <NavLink
      to={item.href}
      end={item.end}
      onClick={onClose}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
        isActive
          ? 'bg-[#1A3FAA] text-white shadow-[0_4px_16px_rgba(26,63,170,0.25)]'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      )}
    >
      {({ isActive }) => (
        <>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: isActive ? 'rgba(255,255,255,0.18)' : '#F8FAFF',
            border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid #EEF2FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            <Icon size={15} aria-hidden="true" />
          </div>
          <span className="flex-1 truncate">{item.label}</span>
          {isActive && <ChevronRight size={13} className="opacity-60" aria-hidden="true" />}
        </>
      )}
    </NavLink>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function AdminSidebar({ isOpen, onClose, onLogout }) {
  const handleLogout = () => {
    removeToken();
    onLogout?.();
  };

  return (
    <aside
      id="admin-sidebar"
      aria-label="Navegación del panel administrador"
      className={cn(
        'bg-white flex flex-col overflow-hidden z-40',
        'fixed top-0 left-0 h-screen w-64',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:relative md:w-[220px] md:h-screen md:translate-x-0 md:transition-none md:shrink-0',
      )}
      style={{ borderRight: '1px solid #F1F5F9' }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 16px', borderBottom: '1px solid #F1F5F9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #1A3FAA 0%, #3B63E3 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(26,63,170,0.3)',
          }}>
            <FlaskConical size={16} color="#fff" aria-hidden="true" />
          </div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0A0F1E', margin: 0, fontFamily: 'Syne, sans-serif' }}>
              Softlab
            </p>
            <p style={{ fontSize: 10, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              Panel administrador
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden"
          style={{
            width: 28, height: 28, borderRadius: 7,
            background: '#F8FAFF', border: '1px solid #EEF2FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748B',
          }}
          aria-label="Cerrar menú"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto"
        style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 20 }}
        aria-label="Menú principal"
      >
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: '#CBD5E1',
              padding: '0 12px', marginBottom: 6, fontFamily: 'DM Sans, sans-serif',
            }}>
              {group.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map(item => (
                <SidebarItem key={item.href} item={item} onClose={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px', borderTop: '1px solid #F1F5F9' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12, border: 'none',
            background: 'transparent', cursor: 'pointer',
            fontSize: 13.5, fontWeight: 500, color: '#94A3B8',
            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#FFF1F2';
            e.currentTarget.style.color = '#E11D48';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#94A3B8';
          }}
        >
          <LogOut size={15} aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────
export function AdminLayout() {
  const [authenticated, setAuthenticated] = useState(() => !!getToken());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Panel', sub: '' };

  if (!authenticated) {
    return <AdminAuth onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFF' }}>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 30,
              background: 'rgba(10,15,30,0.5)', backdropFilter: 'blur(4px)',
            }}
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => setAuthenticated(false)}
      />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 60, background: '#fff', borderBottom: '1px solid #F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Mobile hamburger */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: '#F8FAFF', border: '1px solid #EEF2FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#374151',
              }}
              aria-label="Abrir menú"
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
            >
              <Menu size={17} aria-hidden="true" />
            </button>

            {/* Page title */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  <p style={{
                    fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
                    color: '#0A0F1E', margin: 0, lineHeight: 1.2,
                  }}>
                    {pageInfo.title}
                  </p>
                  {pageInfo.sub && (
                    <p style={{
                      fontSize: 11.5, color: '#94A3B8', margin: 0,
                      fontFamily: 'DM Sans, sans-serif',
                    }}>
                      {pageInfo.sub}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Topbar right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
              textTransform: 'uppercase', color: '#1A3FAA',
              background: '#EEF3FF', border: '1px solid #C7D5F8',
              padding: '4px 10px', borderRadius: 8,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              Admin
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1A3FAA, #3B63E3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700,
              fontFamily: 'Syne, sans-serif',
            }}>
              SL
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
          id="admin-main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}