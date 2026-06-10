import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  animate,
} from 'framer-motion';
import { ArrowRight, Users, FileText, Calendar, MapPin } from 'lucide-react';
import { FocusCarousel } from '@/shared/ui/FocusCarousel';

/* ─── Fallback slides ────────────────────────────────────────────────── */
const foto1 = new URL('/src/assets/foto1semillero.png', import.meta.url).href;
const foto2 = new URL('/src/assets/foto2semillero.png', import.meta.url).href;
const foto3 = new URL('/src/assets/foto3semillero.png', import.meta.url).href;
const foto4 = new URL('/src/assets/foto4semillero.JPG', import.meta.url).href;
const foto5 = new URL('/src/assets/foto5semillero.JPG', import.meta.url).href;
const FALLBACK_SLIDES = [foto1, foto2, foto3, foto4, foto5].map(src => ({ image: src }));
const EASE = [0.22, 1, 0.36, 1];

/* ─── useBreakpoint ──────────────────────────────────────────────────── */
function useBreakpoint(px) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth <= px : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${px}px)`);
    const h = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [px]);
  return matches;
}

/* ─── Counter ────────────────────────────────────────────────────────── */
function Counter({ end, suffix = '+', delay = 0 }) {
  const ref      = useRef(null);
  const mv       = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!end) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const c = animate(mv, end, {
        duration: 1.3, delay: delay / 1000, ease: [0, 0.4, 0.8, 1],
        onUpdate: (v) => setDisplay(Math.round(v)),
      });
      return c.stop;
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, delay, mv]);
  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {display}{suffix}
    </span>
  );
}

/* ─── MolecularCanvas ────────────────────────────────────────────────── */
function MolecularCanvas({ mouseRef, isMobile }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const stateRef  = useRef({ particles: [], flows: [], tick: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    const dpr          = Math.min(window.devicePixelRatio || 1, 2);
    const COUNT        = isMobile ? 58  : 115;
    const CONNECT_DIST = isMobile ? 90  : 120;
    const MOUSE_R      = isMobile ? 75  : 140;
    const EDGE_M       = 48; /* repulsión a 48px del borde */

    /* Spawner — genera una partícula dentro del canvas */
    const spawn = (w, h, idx) => {
      const ratio = idx / COUNT;
      /* tipos: 12% hub, 12% data-packet, resto node */
      const type  = ratio < 0.12 ? 'hub' : ratio < 0.24 ? 'data' : 'node';
      return {
        x:    Math.random() * (w - EDGE_M * 2) + EDGE_M,
        y:    Math.random() * (h - EDGE_M * 2) + EDGE_M,
        vx:   (Math.random() - 0.5) * (type === 'data' ? 0.70 : 0.32),
        vy:   (Math.random() - 0.5) * (type === 'data' ? 0.70 : 0.32),
        r:    type === 'hub' ? 2.4 + Math.random() : type === 'data' ? 0.85 : 0.9 + Math.random() * 1.0,
        base: type === 'hub' ? 0.52 : type === 'data' ? 0.42 : 0.22 + Math.random() * 0.30,
        type,
        phase: Math.random() * Math.PI * 2,
      };
    };

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      stateRef.current.particles = Array.from({ length: COUNT }, (_, i) => spawn(w, h, i));
      stateRef.current.flows     = [];
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const S   = stateRef.current;
      const pts = S.particles;
      S.tick++;

      const { x: mx, y: my } = mouseRef.current;

      /* ── UPDATE ──────────────────────────────────────────────── */
      for (const p of pts) {
        /* Repulsión de bordes — empuja hacia adentro suavemente */
        if (p.x < EDGE_M)     p.vx += (1 - p.x / EDGE_M) * 0.28;
        if (p.x > w - EDGE_M) p.vx -= (1 - (w - p.x) / EDGE_M) * 0.28;
        if (p.y < EDGE_M)     p.vy += (1 - p.y / EDGE_M) * 0.28;
        if (p.y > h - EDGE_M) p.vy -= (1 - (h - p.y) / EDGE_M) * 0.28;

        /* Repulsión de mouse */
        const dx = p.x - mx, dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_R * MOUSE_R && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / MOUSE_R) * 0.52;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        /* Amortiguación */
        const damp = p.type === 'data' ? 0.984 : 0.972;
        p.vx *= damp;
        p.vy *= damp;

        /* Límite de velocidad */
        const maxV = p.type === 'data' ? 2.2 : 1.75;
        const spd  = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > maxV) { p.vx = p.vx / spd * maxV; p.vy = p.vy / spd * maxV; }

        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.018;

        /* Respawn automático si escapa — no debería pasar con edge repulsion */
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          const fresh = spawn(w, h, pts.indexOf(p));
          Object.assign(p, fresh);
        }
      }

      /* ── CONNECTIONS ─────────────────────────────────────────── */
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const isHub = a.type === 'hub' || b.type === 'hub';
          const maxD  = isHub ? CONNECT_DIST * 1.45 : CONNECT_DIST;
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > maxD * maxD) continue;

          const d    = Math.sqrt(d2);
          const t    = 1 - d / maxD;
          const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
          const mdx  = midX - mx,       mdy  = midY - my;
          const md   = Math.sqrt(mdx * mdx + mdy * mdy);
          const boost = md < 200 ? (1 - md / 200) * 0.36 : 0;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(37,99,235,${t * (isHub ? 0.24 : 0.16) + boost})`;
          ctx.lineWidth   = isHub ? 1.1 : 0.62;
          ctx.stroke();
        }
      }

      /* ── DATA FLOWS (paquetes viajando entre hubs) ───────────── */
      /* Spawn nuevo flow cada ~80 frames si hay menos de 10 activos */
      if (S.tick % 80 === 0 && S.flows.length < 10) {
        const hubs = pts.filter(p => p.type === 'hub');
        if (hubs.length >= 2) {
          for (let attempts = 0; attempts < 8; attempts++) {
            const a = hubs[Math.floor(Math.random() * hubs.length)];
            const b = hubs[Math.floor(Math.random() * hubs.length)];
            if (a === b) continue;
            const dx = a.x - b.x, dy = a.y - b.y;
            if (dx * dx + dy * dy < (CONNECT_DIST * 1.45) ** 2) {
              S.flows.push({
                ai: pts.indexOf(a), bi: pts.indexOf(b),
                t: 0, spd: 0.007 + Math.random() * 0.009,
              });
              break;
            }
          }
        }
      }

      /* Dibujar y avanzar flows */
      for (let i = S.flows.length - 1; i >= 0; i--) {
        const f = S.flows[i];
        f.t += f.spd;
        if (f.t > 1) { S.flows.splice(i, 1); continue; }

        const a = pts[f.ai], b = pts[f.bi];
        if (!a || !b) { S.flows.splice(i, 1); continue; }

        const fx = a.x + (b.x - a.x) * f.t;
        const fy = a.y + (b.y - a.y) * f.t;
        const fade = 1 - f.t * 0.4;

        /* Halo del paquete */
        const grd = ctx.createRadialGradient(fx, fy, 0, fx, fy, 6);
        grd.addColorStop(0, `rgba(59,130,246,${0.55 * fade})`);
        grd.addColorStop(1, 'rgba(59,130,246,0)');
        ctx.beginPath(); ctx.arc(fx, fy, 6, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();

        /* Núcleo del paquete */
        ctx.beginPath(); ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${0.85 * fade})`; ctx.fill();
      }

      /* ── NODOS ───────────────────────────────────────────────── */
      for (const p of pts) {
        const dx = p.x - mx, dy = p.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        const boost = d < 170 ? (1 - d / 170) * 0.50 : 0;

        /* Anillo pulsante en hubs */
        if (p.type === 'hub') {
          const pulseR = p.r * (3.2 + Math.sin(p.phase) * 1.4);
          const pAlpha = (0.07 + boost * 0.10) * (0.55 + Math.sin(p.phase) * 0.45);
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseR);
          grd.addColorStop(0, `rgba(37,99,235,${pAlpha * 2})`);
          grd.addColorStop(0.5, `rgba(37,99,235,${pAlpha})`);
          grd.addColorStop(1, 'rgba(37,99,235,0)');
          ctx.beginPath(); ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
        }

        /* Halo para hubs y partículas cerca del cursor */
        if (boost > 0.05 || p.type === 'hub') {
          const haloR = p.r * (p.type === 'hub' ? 4.2 : 5.8);
          const alpha = (p.type === 'hub' ? 0.09 : 0) + boost * 0.15;
          const grd   = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
          grd.addColorStop(0, `rgba(37,99,235,${alpha})`);
          grd.addColorStop(1, 'rgba(37,99,235,0)');
          ctx.beginPath(); ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
        }

        /* Punto central */
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const opacity = p.base + boost * 0.40;
        if (p.type === 'hub')
          ctx.fillStyle = `rgba(26,63,170,${Math.min(opacity + 0.18, 0.82)})`;
        else if (p.type === 'data')
          ctx.fillStyle = `rgba(37,99,235,${Math.min(opacity + 0.12, 0.75)})`;
        else
          ctx.fillStyle = `rgba(26,63,170,${Math.min(opacity, 0.72)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [isMobile, mouseRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

/* ─── HeroSection ────────────────────────────────────────────────────── */
export function HeroSection({ slides: apiSlides = [] }) {
  const carouselItems = (apiSlides.length > 0 ? apiSlides : FALLBACK_SLIDES).map(s =>
    s.image ? s : { image: s.src, alt: s.alt }
  );

  const isMobile = useBreakpoint(640);
  const isTablet = useBreakpoint(960);

  const sectionRef = useRef(null);
  const rectRef    = useRef(null);
  const mouseRef   = useRef({ x: -9999, y: -9999 });

  const { scrollYProgress } = useScroll({
    target: sectionRef, offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ['0px', '-36px']);
  const imgY     = useTransform(scrollYProgress, [0, 1], ['0px', '-60px']);

  /* Spring spotlight */
  const spotX = useMotionValue(-9999);
  const spotY = useMotionValue(-9999);
  const sX = useSpring(spotX, { stiffness: 50, damping: 26, mass: 1 });
  const sY = useSpring(spotY, { stiffness: 50, damping: 26, mass: 1 });

  useEffect(() => {
    const update = () => {
      rectRef.current = sectionRef.current?.getBoundingClientRect() ?? null;
    };
    update();
    const ro = new ResizeObserver(update);
    if (sectionRef.current) ro.observe(sectionRef.current);
    return () => ro.disconnect();
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = rectRef.current;
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current = { x, y };
    spotX.set(x);
    spotY.set(y);
  }, [spotX, spotY]);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
    spotX.set(-9999);
    spotY.set(-9999);
  }, [spotX, spotY]);

  const handleTouchMove = useCallback((e) => {
    const rect = rectRef.current;
    if (!rect || !e.touches[0]) return;
    mouseRef.current = {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  }, []);

  const [stats] = useState(() => {
    const read = (k) => {
      try { return JSON.parse(localStorage.getItem(k) ?? 'null'); } catch { return null; }
    };
    return [
      { icon: FileText, label: 'Manuales',              value: read('softlab_manuals')?.length      ?? 2,  color: '#2563EB', bg: 'rgba(37,99,235,0.08)'   },
      { icon: Users,    label: 'Estudiantes',             value: read('softlab_participants')?.length  ?? 8,  color: '#1A3FAA', bg: 'rgba(26,63,170,0.08)'   },
      { icon: Calendar, label: 'Eventos',                value: read('softlab_events')?.length        ?? 4,  color: '#4F7BE8', bg: 'rgba(79,123,232,0.08)'  },
    ];
  });

  return (
    <section
      ref={sectionRef}
      aria-label="Biblioteca digital de capacitaciones Softlab"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      style={{
        minHeight: 'clamp(620px, 90vh, 940px)',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(160deg, #F4F8FF 0%, #FFFFFF 40%, #F8FAFF 100%)',
        paddingTop: 64,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Molecular canvas (layer 0) */}
      <MolecularCanvas mouseRef={mouseRef} isMobile={isMobile} />

      {/* ── Grid sutil (layer 1) */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(37,99,235,0.038) 1px, transparent 1px),
          linear-gradient(90deg, rgba(37,99,235,0.038) 1px, transparent 1px)
        `,
        backgroundSize: '54px 54px',
      }} />

      {/* ── Glows atmosféricos (layer 1) */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-18%', right: '-10%', zIndex: 1,
        width: 'min(78vw, 880px)', height: 'min(78vw, 880px)', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,197,253,0.28) 0%, rgba(99,140,255,0.08) 42%, transparent 68%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-16%', left: '-6%', zIndex: 1,
        width: 'min(58vw, 640px)', height: 'min(58vw, 640px)', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(199,215,248,0.22) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      {/* Aurora band superior */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%', zIndex: 1,
        background: 'linear-gradient(180deg, rgba(147,197,253,0.12) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Cursor spotlight (layer 2) */}
      {!isMobile && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute', zIndex: 2, pointerEvents: 'none',
            width: 520, height: 520, borderRadius: '50%',
            x: sX, y: sY,
            translateX: '-50%', translateY: '-50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.09) 0%, rgba(26,63,170,0.03) 38%, transparent 62%)',
          }}
        />
      )}

      {/* ── Fade inferior (layer 3) */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 160, zIndex: 3, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))',
      }} />

      {/* ── Main layout (layer 4) */}
      <div
        className="hero-layout"
        style={{
          position: 'relative', zIndex: 4,
          maxWidth: 1200, margin: '0 auto', width: '100%',
          padding: isMobile
            ? '18px 20px 36px'
            : isTablet
              ? 'clamp(24px, 4vw, 44px) clamp(20px, 4vw, 40px)'
              : 'clamp(20px, 2.8vw, 44px) clamp(20px, 5vw, 48px)',
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '46% 54%',
          gap: isMobile ? '28px' : isTablet ? '36px' : 'clamp(32px, 3.5vw, 52px)',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >

        {/* ════ LEFT — Text content ════ */}
        <motion.div style={{ y: contentY, order: 0, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 22px)' }}>

            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.06, duration: 0.68, ease: EASE }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 16px 7px 8px', borderRadius: 999,
                border: '1px solid rgba(26,63,170,0.12)',
                background: 'rgba(239,246,255,0.92)',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#1D4ED8',
                fontFamily: 'DM Sans, sans-serif',
                boxShadow: '0 2px 12px rgba(26,63,170,0.07)',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #1A3FAA, #3B82F6)',
                }}>
                  <MapPin size={10} color="#fff" aria-hidden="true" />
                </span>
                Semillero · Uniautónoma del Cauca
              </span>
            </motion.div>

            {/* Heading */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.80, ease: EASE }}
                style={{
                  fontFamily: 'Syne, sans-serif', margin: 0,
                  fontSize: isMobile
                    ? 'clamp(28px, 8vw, 36px)'
                    : isTablet
                      ? 'clamp(34px, 5vw, 46px)'
                      : 'clamp(34px, 3.2vw, 48px)',
                  fontWeight: 800, lineHeight: 1.06, letterSpacing: '-1.6px',
                  color: '#0F172A',
                  overflowWrap: 'break-word', wordBreak: 'break-word',
                }}
              >
                Biblioteca{' '}
                <span style={{
                  background: 'linear-gradient(128deg, #1A3FAA 0%, #3B82F6 52%, #60A5FA 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Digital
                </span>
              </motion.h1>
              <motion.span
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.80, ease: EASE }}
                style={{
                  display: 'block', fontFamily: 'Syne, sans-serif',
                  fontSize: isMobile
                    ? 'clamp(28px, 8vw, 36px)'
                    : isTablet
                      ? 'clamp(34px, 5vw, 46px)'
                      : 'clamp(34px, 3.2vw, 48px)',
                  fontWeight: 800, lineHeight: 1.06, letterSpacing: '-1.6px',
                  color: '#0F172A',
                  overflowWrap: 'break-word', wordBreak: 'break-word',
                }}
              >
                de Capacitaciones
              </motion.span>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48, duration: 0.62, ease: EASE }}
              style={{
                fontSize: 'clamp(14px, 1.15vw, 15.5px)', lineHeight: 1.82,
                color: '#475569', maxWidth: 420, margin: 0,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Manuales técnicos documentados por el semillero{' '}
              <strong style={{ color: '#1D4ED8', fontWeight: 600 }}>Softlab</strong>{' '}
              de la Corporación Universitaria Autónoma del Cauca.
              Conocimiento estructurado, accesible y de libre uso.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.60, duration: 0.50, ease: EASE }}
              className="hero-ctas"
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <Link to="/manuales" style={{ textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 20px 44px rgba(26,63,170,0.30)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px 28px', width: isMobile ? '100%' : 'auto',
                    background: 'linear-gradient(135deg, #1A3FAA 0%, #2563EB 100%)',
                    color: '#fff', border: 'none',
                    borderRadius: 14, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    boxShadow: '0 8px 28px rgba(26,63,170,0.24)',
                    transition: 'box-shadow 0.22s', whiteSpace: 'nowrap',
                  }}
                >
                  Explorar manuales <ArrowRight size={15} aria-hidden="true" />
                </motion.button>
              </Link>

              <Link to="/nosotros" style={{ textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                <motion.button
                  whileHover={{ y: -2, background: 'rgba(239,246,255,0.96)', borderColor: 'rgba(59,130,246,0.28)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px 24px', width: isMobile ? '100%' : 'auto',
                    background: 'rgba(248,250,255,0.94)',
                    color: '#1E3A8A',
                    border: '1.5px solid rgba(203,213,225,0.75)',
                    borderRadius: 14, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Users size={15} aria-hidden="true" /> Conocer el equipo
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.84, duration: 0.50 }}
              className="hero-stats"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: isMobile ? 8 : 10,
                paddingTop: 'clamp(14px, 1.8vw, 22px)',
                borderTop: '1px solid rgba(203,213,225,0.55)',
              }}
            >
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 8,
                      padding: isMobile ? '10px 9px' : '13px 14px',
                      borderRadius: 13,
                      backgroundColor: 'rgba(245,248,255,0.94)',
                      border: '1px solid rgba(226,232,240,0.75)',
                      boxShadow: '0 2px 10px rgba(100,120,200,0.05)',
                      cursor: 'default',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: s.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={13} color={s.color} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{
                        fontSize: isMobile ? 'clamp(16px, 5vw, 20px)' : 'clamp(18px, 2vw, 23px)',
                        fontWeight: 800, fontFamily: 'Syne, sans-serif',
                        color: '#0F172A', letterSpacing: '-0.5px', lineHeight: 1,
                      }}>
                        <Counter end={s.value} delay={i * 180} />
                      </div>
                      <div style={{
                        fontSize: isMobile ? 9 : 10,
                        color: '#64748B',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                        marginTop: 4, letterSpacing: '0.01em', lineHeight: 1.3,
                      }}>
                        {s.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </motion.div>

        {/* ════ RIGHT — 3D Carousel ════ */}
        <motion.div
          initial={{ opacity: 0, x: isTablet ? 0 : 40, y: isTablet ? 16 : 0, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ delay: 0.28, duration: 0.92, ease: EASE }}
          className="hero-visual"
          style={{
            y: imgY,
            order: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Glow ring behind carousel */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            width: isMobile ? '90%' : '75%',
            aspectRatio: '1',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 65%)',
            pointerEvents: 'none',
            filter: 'blur(20px)',
            zIndex: 0,
          }} />
          <div style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : isTablet ? 500 : 'none',
            position: 'relative', zIndex: 1,
          }}>
            <FocusCarousel items={carouselItems} autoplay />
          </div>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9, duration: 0.6 }}
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)', zIndex: 5,
        }}
      >
        <div style={{
          width: 20, height: 32, borderRadius: 10,
          border: '1.5px solid rgba(26,63,170,0.18)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '5px 0 0',
          background: 'rgba(248,250,255,0.92)',
        }}>
          <motion.div
            animate={{ opacity: [1, 0, 1], y: [0, 10, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 4, height: 7, borderRadius: 2, background: 'rgba(26,63,170,0.36)' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
