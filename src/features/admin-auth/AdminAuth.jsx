import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { authApi } from '@/services/apiService';
import { syncAll } from '@/services/dataSync';

// ─── Rate-limit local (el backend es la barrera real) ────────────────────────
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 60_000;
const ATTEMPT_KEY  = 'sl_login_attempts';
const LOCKOUT_KEY  = 'sl_login_lockout';

function getAttempts()   { return parseInt(sessionStorage.getItem(ATTEMPT_KEY)  ?? '0', 10); }
function getLockout()    { return parseInt(sessionStorage.getItem(LOCKOUT_KEY)  ?? '0', 10); }
function bumpAttempts()  { sessionStorage.setItem(ATTEMPT_KEY, String(getAttempts() + 1)); }
function setLockout()    { sessionStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MS)); }
function clearAttempts() { sessionStorage.removeItem(ATTEMPT_KEY); sessionStorage.removeItem(LOCKOUT_KEY); }
function isLockedOut()   { const t = getLockout(); return t > 0 && Date.now() < t; }
function lockoutSecsLeft() { return Math.ceil((getLockout() - Date.now()) / 1000); }

const E = [0.22, 1, 0.36, 1];

export function AdminAuth({ onSuccess }) {
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [adminName,    setAdminName]    = useState('');
  const [secsLeft,     setSecsLeft]     = useState(0);
  const [attempts,     setAttempts]     = useState(getAttempts);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const timerRef    = useRef(null);

  const startCountdown = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const s = lockoutSecsLeft();
      if (s <= 0) {
        clearInterval(timerRef.current);
        setSecsLeft(0);
        clearAttempts();
        setAttempts(0);
        setError('');
        usernameRef.current?.focus();
      } else {
        setSecsLeft(s);
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (isLockedOut()) { setSecsLeft(lockoutSecsLeft()); startCountdown(); }
    return () => clearInterval(timerRef.current);
  }, [startCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || success) return;

    if (isLockedOut()) { setSecsLeft(lockoutSecsLeft()); startCountdown(); return; }
    if (!username.trim()) { setError('Ingresa tu nombre de usuario.'); usernameRef.current?.focus(); return; }
    if (!password.trim()) { setError('Ingresa la clave de acceso.'); passwordRef.current?.focus(); return; }

    setLoading(true);
    setError('');

    try {
      // authApi.login ahora recibe { username, password }
      const res = await authApi.login({ username: username.trim(), password });
      clearAttempts();
      setAdminName(res?.display_name ?? 'Admin');
      setSuccess(true);
      await syncAll().catch(() => {});
      setTimeout(() => onSuccess?.({ adminId: res?.admin_id, displayName: res?.display_name }), 800);
    } catch (err) {
      bumpAttempts();
      const newAttempts = getAttempts();
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockout();
        setSecsLeft(lockoutSecsLeft());
        startCountdown();
        setError(`Demasiados intentos fallidos. Espera ${LOCKOUT_MS / 1000}s.`);
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        const msg = err.message?.toLowerCase() ?? '';
        if (msg.includes('credenciales') || msg.includes('incorrectas') || msg.includes('clave')) {
          setError(`Credenciales incorrectas. ${remaining} intento${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`);
        } else if (msg.includes('servidor') || msg.includes('network') || msg.includes('fetch')) {
          setError('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else {
          setError('Error de autenticación. Intenta de nuevo.');
        }
      }
      setPassword('');
      setTimeout(() => passwordRef.current?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const locked      = isLockedOut() || secsLeft > 0;
  const attemptsBar = Math.min(attempts / MAX_ATTEMPTS, 1);
  const canSubmit   = !loading && !locked && !success && username.trim() && password.trim();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes rotate-slow { to { transform: rotate(360deg); } }
        @keyframes pulse-ring  { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.18);opacity:.08} }
        .sl-input {
          width: 100%; padding: 13px 44px 13px 44px;
          border-radius: 13px; border: 1.5px solid #D8E2F8;
          background: #F7F9FF; color: #0C1A3A;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border 0.2s, box-shadow 0.2s, background 0.2s;
          letter-spacing: 0.02em;
        }
        .sl-input:focus { border-color: #1A3FAA; background: #fff; box-shadow: 0 0 0 4px rgba(26,63,170,0.1); }
        .sl-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .sl-input::placeholder { color: #AAB4CC; }
        .sl-btn {
          width: 100%; padding: 14px; border-radius: 13px; border: none;
          font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.22s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .sl-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(26,63,170,0.3); }
        .sl-btn:not(:disabled):active { transform: translateY(0); }
        .sl-btn:disabled { cursor: not-allowed; opacity: 0.65; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #050913 0%, #0F1E55 55%, #1A3FAA 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden',
      }}>
        {/* Fondo decorativo */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '26px 26px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,140,255,0.14) 0%, transparent 65%)', pointerEvents: 'none', animation: 'rotate-slow 40s linear infinite' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,63,170,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: E }}
          style={{ width: '100%', maxWidth: 420, position: 'relative' }}
        >
          <div style={{
            background: '#fff', borderRadius: 24,
            boxShadow: '0 40px 100px rgba(3,7,24,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>

            {/* Header azul */}
            <div style={{
              background: 'linear-gradient(135deg, #0F1E55 0%, #1A3FAA 100%)',
              padding: '36px 36px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 130, height: 130, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', animation: 'pulse-ring 3s ease-in-out infinite', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse-ring 3s ease-in-out infinite 0.8s', pointerEvents: 'none' }} />

              <motion.div
                animate={success ? { scale: [1, 1.12, 1], rotate: [0, 8, -8, 0] } : {}}
                transition={{ duration: 0.5 }}
                style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: success ? 'rgba(5,150,105,0.9)' : 'rgba(255,255,255,0.12)',
                  border: `1.5px solid ${success ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.18)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px', position: 'relative', zIndex: 1,
                  backdropFilter: 'blur(4px)',
                  transition: 'background 0.4s, border-color 0.4s',
                  boxShadow: success ? '0 0 0 8px rgba(5,150,105,0.15)' : '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                      <CheckCircle size={28} color="#fff" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <motion.div key="shield" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                      <Shield size={28} color="#fff" strokeWidth={1.8} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.5px', position: 'relative', zIndex: 1 }}>
                {success ? `¡Bienvenido, ${adminName}!` : 'Panel Administrador'}
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(147,197,253,0.85)', margin: 0, fontFamily: 'DM Sans, sans-serif', position: 'relative', zIndex: 1 }}>
                {success ? 'Redirigiendo al panel...' : 'Semillero Softlab · Acceso restringido'}
              </p>
            </div>

            {/* Formulario */}
            <div style={{ padding: '32px 36px 36px' }}>

              {/* Barra de intentos */}
              <AnimatePresence>
                {attempts > 0 && !success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: 20, overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11.5, color: '#8A93A8', fontFamily: 'DM Sans, sans-serif' }}>Intentos de acceso</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: attempts >= MAX_ATTEMPTS - 1 ? '#DC2626' : '#8A93A8', fontFamily: 'DM Sans, sans-serif' }}>
                        {attempts} / {MAX_ATTEMPTS}
                      </span>
                    </div>
                    <div style={{ height: 4, background: '#F1F4FB', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        animate={{ width: `${attemptsBar * 100}%` }}
                        transition={{ duration: 0.4, ease: E }}
                        style={{ height: '100%', borderRadius: 99, background: attemptsBar > 0.6 ? '#DC2626' : attemptsBar > 0.4 ? '#F59E0B' : '#1A3FAA' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>

                {/* Campo usuario */}
                <div>
                  <label htmlFor="sl-username" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>
                    Usuario
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <User size={16} color={locked ? '#DC2626' : '#AAB4CC'} />
                    </div>
                    <input
                      ref={usernameRef}
                      id="sl-username"
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); if (error && !locked) setError(''); }}
                      placeholder={locked ? `Bloqueado por ${secsLeft}s` : 'Tu usuario'}
                      className="sl-input"
                      disabled={loading || locked || success}
                      required
                      autoFocus
                      autoComplete="username"
                      maxLength={64}
                    />
                  </div>
                </div>

                {/* Campo contraseña */}
                <div>
                  <label htmlFor="sl-password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>
                    Clave de acceso
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <Lock size={16} color={locked ? '#DC2626' : '#AAB4CC'} />
                    </div>
                    <input
                      ref={passwordRef}
                      id="sl-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); if (error && !locked) setError(''); }}
                      placeholder={locked ? `Bloqueado por ${secsLeft}s` : 'Tu clave'}
                      className="sl-input"
                      disabled={loading || locked || success}
                      required
                      autoComplete="current-password"
                      aria-describedby={error ? 'sl-error' : undefined}
                      maxLength={128}
                    />
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                        style={{
                          position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                          color: '#AAB4CC', display: 'flex', alignItems: 'center',
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Error / Lockout */}
                <AnimatePresence mode="wait">
                  {(error || locked) && !success && (
                    <motion.div
                      id="sl-error"
                      role="alert"
                      key={error}
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.22, ease: E }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '12px 14px', borderRadius: 12,
                        background: locked ? '#FFF7ED' : '#FFF1F2',
                        border: `1.5px solid ${locked ? '#FED7AA' : '#FECDD3'}`,
                      }}
                    >
                      <div style={{ flexShrink: 0, paddingTop: 1 }}>
                        {locked ? <Clock size={15} color="#D97706" /> : <AlertTriangle size={15} color="#DC2626" />}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: locked ? '#92400E' : '#9F1239', margin: '0 0 2px', fontFamily: 'DM Sans, sans-serif' }}>
                          {locked ? `Acceso bloqueado — ${secsLeft}s` : 'Acceso denegado'}
                        </p>
                        <p style={{ fontSize: 12, color: locked ? '#B45309' : '#BE123C', margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
                          {locked ? 'Demasiados intentos fallidos. Espera antes de continuar.' : error}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="sl-btn"
                  disabled={!canSubmit}
                  style={{
                    background: success
                      ? 'linear-gradient(135deg, #059669, #10B981)'
                      : locked
                      ? '#E2E8F0'
                      : 'linear-gradient(135deg, #1A3FAA 0%, #2D55CC 100%)',
                    color: locked ? '#94A3B8' : '#fff',
                    marginTop: 4,
                    boxShadow: canSubmit ? '0 6px 20px rgba(26,63,170,0.3)' : 'none',
                  }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                      />
                      Verificando...
                    </>
                  ) : success ? (
                    <><CheckCircle size={17} /> Acceso concedido</>
                  ) : locked ? (
                    <><Clock size={17} /> Bloqueado ({secsLeft}s)</>
                  ) : (
                    <><Shield size={17} /> Ingresar al Panel</>
                  )}
                </button>
              </form>

              <div style={{ marginTop: 24, padding: '16px 0 0', borderTop: '1px solid #F1F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontSize: 11.5, color: '#AAB4CC', fontFamily: 'DM Sans, sans-serif' }}>
                  Conexión cifrada · Acceso restringido al equipo Softlab
                </span>
              </div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'DM Sans, sans-serif', marginTop: 16 }}
          >
            Softlab Admin · v3.0
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}