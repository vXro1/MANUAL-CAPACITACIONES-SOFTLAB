import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, BookOpen, Sparkles } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1];

export function CtaSection() {
  return (
    <section
      aria-label="Explorar la biblioteca"
      style={{
        padding: '110px 0',
        background: 'linear-gradient(180deg, #0B1222 0%, #080D1A 50%, #050913 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Central ambient glow ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 720px)',
          height: 'min(90vw, 720px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,63,170,0.22) 0%, rgba(26,63,170,0.08) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Edge glows ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-10%', left: '-8%',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,123,232,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-15%', right: '-5%',
          width: 350, height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147,197,253,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Content ── */}
      <div
        className="cta-container"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: EASE }}
          style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}
        >
          {/* Glass card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 32,
              padding: 'clamp(40px, 6vw, 64px) clamp(28px, 5vw, 56px)',
              boxShadow: '0 0 0 1px rgba(147,197,253,0.05), 0 48px 100px rgba(0,0,0,0.35)',
              position: 'relative',
            }}
          >
            {/* Top border glow line */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0, left: '20%', right: '20%',
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(147,197,253,0.35), transparent)',
                borderRadius: 999,
              }}
            />

            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.55, ease: EASE }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 62,
                height: 62,
                borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(26,63,170,0.55), rgba(79,123,232,0.35))',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(147,197,253,0.20)',
                marginBottom: 28,
                boxShadow: '0 8px 28px rgba(26,63,170,0.28)',
              }}
            >
              <BookOpen size={26} color="#93C5FD" aria-hidden="true" />
            </motion.div>

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#93C5FD',
                fontFamily: 'DM Sans, sans-serif',
                marginBottom: 14,
              }}
            >
              Biblioteca Digital · Softlab
            </motion.p>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.28, duration: 0.6, ease: EASE }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(26px, 4vw, 46px)',
                fontWeight: 800,
                letterSpacing: '-1.2px',
                lineHeight: 1.12,
                margin: '0 0 18px',
              }}
            >
              <span style={{ color: '#fff' }}>Explora la </span>
              <span
                style={{
                  background: 'linear-gradient(95deg, #93C5FD 0%, #DBEAFE 65%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                biblioteca completa
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.36, duration: 0.5 }}
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.42)',
                lineHeight: 1.78,
                margin: '0 0 38px',
                fontFamily: 'DM Sans, sans-serif',
                maxWidth: 460,
                marginInline: 'auto',
              }}
            >
              Accede a los manuales técnicos documentados por el equipo Softlab.
              Contenido estructurado y disponible para toda la comunidad académica.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.44, duration: 0.5, ease: EASE }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
            >
              <Link to="/manuales" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 20px 52px rgba(26,63,170,0.45)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #1A3FAA 0%, #2553CC 100%)',
                    color: '#fff',
                    borderRadius: 14,
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    boxShadow: '0 8px 32px rgba(26,63,170,0.32)',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  Ver todos los manuales <ArrowRight size={15} aria-hidden="true" />
                </motion.button>
              </Link>

              <Link to="/nosotros" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ y: -2, background: 'rgba(255,255,255,0.10)', borderColor: 'rgba(147,197,253,0.28)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 26px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: 'rgba(255,255,255,0.75)',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <Users size={15} aria-hidden="true" /> Conocer el equipo
                </motion.button>
              </Link>
            </motion.div>

            {/* Bottom decoration — floating dots */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="cta-features"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                marginTop: 38,
                paddingTop: 32,
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {['Manuales técnicos', 'Capacitaciones', 'Comunidad académica'].map((label, i) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.28)',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  <Sparkles size={11} color="rgba(147,197,253,0.45)" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
