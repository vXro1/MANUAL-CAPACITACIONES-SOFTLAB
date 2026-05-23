import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { authApi } from '@/services/apiService';
import { syncAll } from '@/services/dataSync';
import { Button } from '@/shared/ui/Button';

export function AdminAuth({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authApi.login(password);
      await syncAll();
      onSuccess?.();
    } catch (err) {
      setError(err.message === 'Contraseña incorrecta' ? 'Clave incorrecta. Intenta de nuevo.' : 'Error al conectar con el servidor.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-brand-lg">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-brand">
              <Shield size={26} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-900">Panel Administrador</h1>
              <p className="text-sm text-slate-500 mt-1">Softlab Manuales de Usuario</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-sm font-medium text-slate-700">
                Clave de acceso
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
                  <Lock size={16} />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la clave"
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                  autoFocus
                  autoComplete="current-password"
                  aria-describedby={error ? 'admin-auth-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {error && (
                <motion.p
                  id="admin-auth-error"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 flex items-center gap-1"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              {loading ? 'Verificando...' : 'Ingresar al Panel'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Acceso restringido al equipo Softlab
          </p>
        </div>
      </motion.div>
    </div>
  );
}
