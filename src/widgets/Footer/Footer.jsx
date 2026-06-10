import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Mail, BookOpen } from 'lucide-react';
import { NAV_LINKS, SOFTLAB_INFO } from '@/shared/constants';

const EASE = [0.22, 1, 0.36, 1];

function FooterReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #050913 0%, #080D1A 100%)',
        fontFamily: 'DM Sans, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Atmospheric glows ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20%', left: '-5%',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,63,170,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-10%', right: '10%',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,123,232,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Top glow line ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: '15%', right: '15%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(147,197,253,0.20), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Main content ── */}
      <div
        style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 48px 0', position: 'relative', zIndex: 1 }}
        className="footer-inner"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1fr 1fr',
            gap: 48,
            paddingBottom: 48,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
          className="footer-grid"
        >
          {/* Column 1: Brand */}
          <FooterReveal delay={0}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Glass brand mark */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.08)',
                  width: 'fit-content',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
                }}
              >
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'linear-gradient(135deg, rgba(26,63,170,0.7), rgba(79,123,232,0.5))',
                    border: '1px solid rgba(147,197,253,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={13} color="#93C5FD" aria-hidden="true" />
                </div>
                <span
                  style={{
                    fontSize: 17, fontWeight: 700,
                    fontFamily: 'Syne, sans-serif',
                    letterSpacing: '0.02em',
                  }}
                >
                  <span style={{ color: '#CBD5E1' }}>Soft</span>
                  <span style={{ color: '#60A5FA' }}>Lab</span>
                </span>
              </div>

              <p
                style={{
                  fontSize: 13, lineHeight: 1.82,
                  color: 'rgba(255,255,255,0.30)',
                  maxWidth: 272, margin: 0,
                }}
              >
                {SOFTLAB_INFO.description ??
                  'Semillero de investigación dedicado a documentar y difundir conocimiento técnico en la comunidad académica.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SOFTLAB_INFO.location && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <MapPin size={13} color="#4F7BE8" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', lineHeight: 1.55 }}>
                      {SOFTLAB_INFO.location}
                    </span>
                  </div>
                )}
                {SOFTLAB_INFO.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={13} color="#4F7BE8" aria-hidden="true" />
                    <a
                      href={`mailto:${SOFTLAB_INFO.email}`}
                      style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.28)',
                        textDecoration: 'none',
                        transition: 'color 0.18s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#93C5FD'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
                    >
                      {SOFTLAB_INFO.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </FooterReveal>

          {/* Column 2: Navigation */}
          <FooterReveal delay={0.1}>
            <div>
              <p
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.22)',
                  margin: '0 0 20px',
                }}
              >
                Navegación
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.35)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'color 0.18s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#93C5FD'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
                    >
                      <span
                        style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: 'rgba(79,123,232,0.6)',
                          display: 'inline-block', flexShrink: 0,
                        }}
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </FooterReveal>

          {/* Column 3: Institution */}
          <FooterReveal delay={0.2}>
            <div>
              <p
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.22)',
                  margin: '0 0 20px',
                }}
              >
                Institución
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p
                  style={{
                    fontSize: 13, fontWeight: 700,
                    color: 'rgba(255,255,255,0.70)',
                    margin: 0,
                    fontFamily: 'Syne, sans-serif',
                    lineHeight: 1.45,
                  }}
                >
                  {SOFTLAB_INFO.institution ?? 'Corporación Universitaria Autónoma del Cauca'}
                </p>
                {SOFTLAB_INFO.faculty && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: 0, lineHeight: 1.6 }}>
                    {SOFTLAB_INFO.faculty}
                  </p>
                )}
                {SOFTLAB_INFO.department && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: 0, lineHeight: 1.6 }}>
                    {SOFTLAB_INFO.department}
                  </p>
                )}

                {/* Active pill */}
                <div
                  style={{
                    marginTop: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '6px 12px',
                    background: 'rgba(26,63,170,0.14)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    borderRadius: 99,
                    border: '1px solid rgba(79,123,232,0.22)',
                    width: 'fit-content',
                  }}
                >
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#3B82F6',
                      boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                      display: 'inline-block', flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#93C5FD', fontWeight: 600, letterSpacing: '0.02em' }}>
                    Activo desde {SOFTLAB_INFO.year ?? '2024'}
                  </span>
                </div>
              </div>
            </div>
          </FooterReveal>
        </div>

        {/* ── Bottom bar ── */}
        <div
          style={{
            padding: '20px 0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
          className="footer-bottom"
        >
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 4, height: 4, borderRadius: '50%',
                background: 'rgba(79,123,232,0.5)',
                display: 'inline-block',
              }}
            />
            © {year} {SOFTLAB_INFO.fullName ?? 'Semillero de Investigación Softlab'}. Todos los derechos reservados.
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={11} color="rgba(79,123,232,0.55)" aria-hidden="true" />
            {SOFTLAB_INFO.institution ?? 'Corporación Universitaria Autónoma del Cauca'}
          </p>
        </div>
      </div>
    </footer>
  );
}
