import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { AboutSection } from '@/widgets/AboutSection/AboutSection';
import { ParticipantsSection } from '@/widgets/ParticipantsSection/ParticipantsSection';

const EASE = [0.22, 1, 0.36, 1];

export function AboutPage() {
  return (
    <main id="main-content" style={{ minHeight: '100vh', background: '#fff' }}>

      {/* ── Dark futuristic header ── */}
      <div
        style={{
          background: 'linear-gradient(145deg, #050913 0%, #0F1E55 55%, #1A3FAA 100%)',
          paddingTop: 'clamp(80px, 10vw, 120px)',
          paddingBottom: 'clamp(60px, 8vw, 96px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid lines */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />

        {/* Glow orb — top right */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,123,232,0.28) 0%, rgba(26,63,170,0.12) 45%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Glow orb — bottom left */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: '-30%', left: '-8%',
            width: 480, height: 480, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(147,197,253,0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Bottom fade */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to bottom, transparent, rgba(26,63,170,0.08))',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '0 clamp(20px, 5vw, 48px)',
            position: 'relative', zIndex: 1,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Icon + label */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
                  flexShrink: 0,
                }}
              >
                <FlaskConical size={18} color="#93C5FD" aria-hidden="true" />
              </div>
              <span
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#93C5FD',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Semillero de Investigación
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, delay: 0.12, ease: EASE }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 800, color: '#fff',
                margin: 0, lineHeight: 1.1, letterSpacing: '-1.5px',
              }}
            >
              Sobre{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #60A5FA 0%, #A78BFA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Softlab
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              style={{
                fontSize: 'clamp(14px, 2vw, 17px)',
                color: 'rgba(147,197,253,0.82)',
                margin: 0, fontFamily: 'DM Sans, sans-serif',
                lineHeight: 1.65, maxWidth: 540,
              }}
            >
              Conoce el equipo de investigadores, la misión del semillero y las personas que
              hacen posible este proyecto académico.
            </motion.p>
          </motion.div>
        </div>
      </div>

      <AboutSection showDirectors />
      <ParticipantsSection
        skipPonentes
        skipExternal
        groupByRole
        paddingTop="clamp(28px, 4vw, 44px)"
        sectionTitle="Equipo de Investigación"
        sectionSubtitle="Semillero"
      />
      <ParticipantsSection
        collaboratorsOnly
        groupByRole
        paddingTop="clamp(20px, 3vw, 36px)"
        sectionTitle="Ponentes y Colaboradores Externos"
        sectionSubtitle="Colaboradores"
      />
    </main>
  );
}
