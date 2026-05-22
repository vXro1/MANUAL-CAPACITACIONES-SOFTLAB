import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Mail, BookOpen } from 'lucide-react';
import { NAV_LINKS, SOFTLAB_INFO } from '@/shared/constants';

function FooterReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: '#080D1A', fontFamily: 'DM Sans, sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* ── FOOTER PRINCIPAL ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 48px 0' }} className="footer-inner">
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', gap: 48, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="footer-grid">

          {/* Columna 1: Marca */}
          <FooterReveal delay={0}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Nombre en texto en lugar del logo */}
              <div style={{ display: 'inline-flex', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#CBD5E1', fontFamily: 'Syne, sans-serif', letterSpacing: '0.04em' }}>
                  Soft<span style={{ color: '#3B6FEB' }}>Lab</span>
                </span>
              </div>

              <p style={{ fontSize: 13, lineHeight: 1.8, color: '#4B5B72', maxWidth: 280, margin: 0 }}>
                {SOFTLAB_INFO.description ?? 'Semillero de investigación dedicado a documentar y difundir conocimiento técnico en la comunidad académica.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SOFTLAB_INFO.location && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <MapPin size={13} color="#1A3FAA" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#4B5B72', lineHeight: 1.5 }}>{SOFTLAB_INFO.location}</span>
                  </div>
                )}
                {SOFTLAB_INFO.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={13} color="#1A3FAA" />
                    <a href={'mailto:' + SOFTLAB_INFO.email} style={{ fontSize: 12, color: '#4B5B72', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#93C5FD'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#4B5B72'; }}
                    >
                      {SOFTLAB_INFO.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </FooterReveal>

          {/* Columna 2: Navegación */}
          <FooterReveal delay={0.1}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2D3E55', margin: '0 0 20px' }}>Navegación</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} style={{ fontSize: 13, color: '#3D4F63', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#93C5FD'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#3D4F63'; }}
                    >
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#1A3FAA', display: 'inline-block', flexShrink: 0 }} />
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/manuales" style={{ fontSize: 13, color: '#3D4F63', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#93C5FD'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#3D4F63'; }}
                  >
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#1A3FAA', display: 'inline-block', flexShrink: 0 }} />
                    Biblioteca
                  </Link>
                </li>
              </ul>
            </div>
          </FooterReveal>

          {/* Columna 3: Institución */}
          <FooterReveal delay={0.2}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2D3E55', margin: '0 0 20px' }}>Institución</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#CBD5E1', margin: 0, fontFamily: 'Syne, sans-serif', lineHeight: 1.4 }}>
                  {SOFTLAB_INFO.institution ?? 'Corporación Universitaria Autónoma del Cauca'}
                </p>
                {SOFTLAB_INFO.faculty && (
                  <p style={{ fontSize: 12, color: '#3D4F63', margin: 0, lineHeight: 1.6 }}>{SOFTLAB_INFO.faculty}</p>
                )}
                {SOFTLAB_INFO.department && (
                  <p style={{ fontSize: 12, color: '#3D4F63', margin: 0, lineHeight: 1.6 }}>{SOFTLAB_INFO.department}</p>
                )}
                <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(26,63,170,0.15)', borderRadius: 6, border: '1px solid rgba(26,63,170,0.25)', width: 'fit-content' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#93C5FD', fontWeight: 500 }}>
                    Activo desde {SOFTLAB_INFO.year ?? '2024'}
                  </span>
                </div>
              </div>
            </div>
          </FooterReveal>
        </div>

        {/* ── BARRA INFERIOR ── */}
        <div style={{
          padding: '20px 0 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }} className="footer-bottom">

          <p style={{ fontSize: 11, color: '#7A8FA6', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#1A3FAA', display: 'inline-block' }} />
            &copy; {year} {SOFTLAB_INFO.fullName ?? 'Semillero de Investigación Softlab'}. Todos los derechos reservados.
          </p>

          <p style={{ fontSize: 11, color: '#7A8FA6', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={11} color="#1A3FAA" />
            {SOFTLAB_INFO.institution ?? 'Corporación Universitaria Autónoma del Cauca'}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-inner { padding: 40px 24px 0 !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .footer-grid > div:first-child { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .footer-inner { padding: 32px 20px 0 !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>
    </footer>
  );
}