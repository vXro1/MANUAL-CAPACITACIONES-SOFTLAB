import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { AdminAuth } from '@/features/admin-auth/AdminAuth';
import { AdminSidebar } from '@/widgets/AdminSidebar/AdminSidebar';
import { adminAuthRepository } from '@/storage/localStorageRepository';

export function AdminLayout() {
  const [authenticated, setAuthenticated] = useState(
    adminAuthRepository.isAuthenticated()
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!authenticated) {
    return <AdminAuth onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
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

      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Abrir menú de navegación"
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-slate-900">Panel Admin</span>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
