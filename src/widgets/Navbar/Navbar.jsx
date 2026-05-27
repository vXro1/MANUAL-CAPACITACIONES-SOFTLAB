import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BookOpen } from 'lucide-react';
import { NAV_LINKS } from '@/shared/constants';

const logoSoftlab = new URL('/src/assets/logosoftlab2.jpg', import.meta.url).href;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const mobileNavRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handle = (e) => {
      if (!mobileNavRef.current?.contains(e.target)) setMobileOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [mobileOpen]);

  return (
    <header
      ref={mobileNavRef}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
        background: scrolled
          ? 'rgba(252,253,255,0.88)'
          : 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled
          ? '1px solid rgba(26,63,170,0.09)'
          : '1px solid rgba(255,255,255,0.50)',
        boxShadow: scrolled
          ? '0 1px 0 rgba(147,197,253,0.18), 0 4px 28px rgba(26,63,170,0.07)'
          : 'none',
      }}
    >
      <a
        href="#main-content"
        style={{
          position: 'absolute', top: -100, left: 16, zIndex: 99,
          padding: '8px 16px', borderRadius: 8,
          background: '#1A3FAA', color: '#fff',
          fontSize: 13, fontWeight: 500,
          transition: 'top 0.15s',
        }}
        onFocus={e => { e.currentTarget.style.top = '16px'; }}
        onBlur={e => { e.currentTarget.style.top = '-100px'; }}
      >
        Ir al contenido principal
      </a>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }} className="nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" aria-label="Softlab — Inicio" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
              <img
                src={logoSoftlab}
                alt="SoftLab"
                style={{ height: 38, width: 'auto', objectFit: 'contain', display: 'block' }}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('nav-logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div id="nav-logo-fallback" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1A3FAA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0F1E', fontFamily: 'Syne, sans-serif' }}>Softlab</div>
                  <div style={{ fontSize: 10, color: '#8A94A6' }}>Manuales de Usuario</div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Nav Desktop */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-desktop" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === '/'}
                style={({ isActive }) => ({
                  padding: '8px 16px', borderRadius: 9,
                  fontSize: 14, fontWeight: isActive ? 600 : 500,
                  fontFamily: 'DM Sans, sans-serif',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  color: isActive ? '#1A3FAA' : '#4B5563',
                  background: isActive
                    ? 'rgba(238,243,255,0.90)'
                    : 'transparent',
                  backdropFilter: isActive ? 'blur(8px)' : 'none',
                  WebkitBackdropFilter: isActive ? 'blur(8px)' : 'none',
                  boxShadow: isActive
                    ? '0 0 0 1px rgba(26,63,170,0.12), 0 2px 8px rgba(26,63,170,0.08)'
                    : 'none',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Hamburger móvil */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            className="nav-hamburger"
            style={{
              display: 'none', padding: 8, borderRadius: 8,
              border: 'none', background: 'transparent',
              cursor: 'pointer', color: '#374151',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              overflow: 'hidden',
              background: 'rgba(252,253,255,0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(226,232,240,0.7)',
            }}
          >
            <nav style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 4 }} aria-label="Navegación móvil">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <NavLink
                    to={link.href}
                    end={link.href === '/'}
                    style={({ isActive }) => ({
                      display: 'block', padding: '12px 16px', borderRadius: 10,
                      fontSize: 15, fontWeight: 500, textDecoration: 'none',
                      fontFamily: 'DM Sans, sans-serif',
                      color: isActive ? '#1A3FAA' : '#374151',
                      background: isActive ? '#EEF3FF' : 'transparent',
                    })}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginTop: 8 }}>
                <Link to="/manuales" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', padding: '13px 16px',
                    background: '#1A3FAA', color: '#fff',
                    borderRadius: 10, border: 'none',
                    fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    <BookOpen size={15} /> Ver manuales
                  </button>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}