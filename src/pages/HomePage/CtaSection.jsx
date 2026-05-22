import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users } from 'lucide-react';

export function CtaSection() {
  return (
    <section
      aria-label="Explorar la biblioteca"
      style={{
        padding: '80px 0',
        background: '#f8fafc',
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="cta-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 24,
          }}
        >
          {/* Ícono */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#1A3FAA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={24} color="#fff" aria-hidden="true" />
          </div>

          {/* Texto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
            <h2
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 700,
                color: '#0A0F1E',
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Explora toda la biblioteca de capacitaciones
            </h2>
            <p
              style={{
                fontSize: 15,
                color: '#64748b',
                lineHeight: 1.75,
                margin: 0,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Accede a los manuales técnicos documentados por el equipo Softlab. Contenido
              estructurado y disponible para toda la comunidad académica.
            </p>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/manuales" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 26px',
                  background: '#1A3FAA',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,63,170,0.28)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Ver todos los manuales <ArrowRight size={15} />
              </button>
            </Link>

            <Link to="/nosotros" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 26px',
                  background: '#fff',
                  color: '#1A3FAA',
                  border: '1.5px solid #1A3FAA',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#eef3ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
              >
                <Users size={15} /> Conocer el equipo
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .cta-container { padding: 0 20px !important; }
        }
      `}</style>
    </section>
  );
}