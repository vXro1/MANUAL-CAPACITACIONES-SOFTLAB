import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, Star, FileText, ArrowRight,
  Plus, UserPlus, TrendingUp, Clock, CheckCircle2, AlertCircle,
  ChevronRight, Layers, Images,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { manualsRepository, participantsRepository, galleryRepository } from '@/storage/localStorageRepository';
import { formatDate } from '@/shared/lib/formatDate';

// ─── Easing ───────────────────────────────────────────────────────────────────
const E = [0.22, 1, 0.36, 1];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_CFG = {
  'Realidad Virtual': { color: '#EEF3FF', accent: '#1A3FAA', icon: Layers },
  DevOps:             { color: '#FFF8EE', accent: '#B45309', icon: FileText },
  Capacitación:       { color: '#F0F9FF', accent: '#0369A1', icon: BookOpen },
  default:            { color: '#F8FAFF', accent: '#374151', icon: FileText },
};

function getCategoryStyle(cat) {
  return CATEGORY_CFG[cat] || CATEGORY_CFG.default;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, bg, change, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: E }}
      style={{
        background: '#fff', borderRadius: 18, padding: '22px 24px',
        border: '1px solid #F1F5F9', display: 'flex',
        flexDirection: 'column', gap: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: bg, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={19} color={accent} strokeWidth={1.6} />
        </div>
        {change !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: '#10B981',
            background: '#ECFDF5', padding: '3px 8px', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 3,
            fontFamily: 'DM Sans, sans-serif',
          }}>
            <TrendingUp size={10} /> {change}
          </span>
        )}
      </div>
      <div>
        <p style={{
          fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 700,
          color: '#0A0F1E', lineHeight: 1, margin: '0 0 5px',
          letterSpacing: '-1px',
        }}>
          {value}
        </p>
        <p style={{
          fontSize: 12.5, color: '#94A3B8', margin: 0,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({ to, icon: Icon, title, sub, primary, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: E }}
    >
      <Link to={to} style={{ textDecoration: 'none' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
            background: primary
              ? 'linear-gradient(135deg, #1A3FAA 0%, #2649C8 100%)'
              : '#fff',
            border: primary ? 'none' : '1px solid #F1F5F9',
            boxShadow: primary
              ? '0 8px 24px rgba(26,63,170,0.25)'
              : '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = primary
              ? '0 14px 36px rgba(26,63,170,0.35)'
              : '0 6px 20px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = primary
              ? '0 8px 24px rgba(26,63,170,0.25)'
              : '0 1px 4px rgba(0,0,0,0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: primary ? 'rgba(255,255,255,0.15)' : '#F0F4FF',
              border: primary ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E8EFFE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} color={primary ? '#fff' : '#1A3FAA'} />
            </div>
            <div>
              <p style={{
                fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
                color: primary ? '#fff' : '#0A0F1E', margin: 0,
              }}>
                {title}
              </p>
              <p style={{
                fontSize: 12, margin: 0, fontFamily: 'DM Sans, sans-serif',
                color: primary ? 'rgba(255,255,255,0.65)' : '#94A3B8',
              }}>
                {sub}
              </p>
            </div>
          </div>
          <ArrowRight size={16} color={primary ? 'rgba(255,255,255,0.7)' : '#C7D5F8'} />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Manual Row ───────────────────────────────────────────────────────────────
function ManualRow({ manual, index }) {
  const cfg = getCategoryStyle(manual.category);
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.5 + index * 0.06, ease: E }}
    >
      <Link to={`/manuales/${manual.id}`} style={{ textDecoration: 'none' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 16px', borderRadius: 12, cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#F8FAFF';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {/* Icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: cfg.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={16} color={cfg.accent} strokeWidth={1.5} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'Syne, sans-serif', fontSize: 13.5, fontWeight: 600,
              color: '#0A0F1E', margin: 0, lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {manual.title}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em',
                textTransform: 'uppercase', color: cfg.accent,
                background: cfg.color, padding: '2px 7px', borderRadius: 5,
                fontFamily: 'DM Sans, sans-serif',
              }}>
                {manual.category}
              </span>
              {manual.date && (
                <span style={{ fontSize: 11.5, color: '#CBD5E1', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={10} /> {formatDate(manual.date, { month: 'short' })}
                </span>
              )}
            </div>
          </div>

          {/* PDF status */}
          <div style={{ flexShrink: 0 }}>
            {manual.pdf ? (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 600, color: '#059669',
                background: '#ECFDF5', border: '1px solid #D1FAE5',
                padding: '3px 9px', borderRadius: 7,
                fontFamily: 'DM Sans, sans-serif',
              }}>
                <CheckCircle2 size={11} /> PDF
              </span>
            ) : (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 600, color: '#D97706',
                background: '#FFFBEB', border: '1px solid #FDE68A',
                padding: '3px 9px', borderRadius: 7,
                fontFamily: 'DM Sans, sans-serif',
              }}>
                <AlertCircle size={11} /> Pendiente
              </span>
            )}
          </div>

          <ChevronRight size={14} color="#E2E8F0" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const manuals = useMemo(() => manualsRepository.getAll(), []);
  const participants = useMemo(() => participantsRepository.getAll(), []);
  const gallery = useMemo(() => galleryRepository.getAll(), []);
  const featured = manuals.filter(m => m.featured);
  const withPDF = manuals.filter(m => m.pdf);

  const STATS = [
    {
      icon: BookOpen, label: 'Total manuales', value: manuals.length,
      accent: '#1A3FAA', bg: '#EEF3FF', delay: 0.05,
    },
    {
      icon: Star, label: 'Destacados', value: featured.length,
      accent: '#D97706', bg: '#FFFBEB', delay: 0.12,
    },
    {
      icon: Users, label: 'Participantes', value: participants.length,
      accent: '#059669', bg: '#ECFDF5', delay: 0.19,
    },
    {
      icon: FileText, label: 'Con PDF', value: withPDF.length,
      accent: '#7C3AED', bg: '#F3E8FF', delay: 0.26,
    },
    {
      icon: Images, label: 'Fotos galería', value: gallery.length,
      accent: '#0891B2', bg: '#ECFEFF', delay: 0.33,
    },
  ];

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div style={{
      padding: '32px 28px', display: 'flex', flexDirection: 'column',
      gap: 32, maxWidth: 1100, margin: '0 auto', width: '100%',
    }}>

      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: E }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <p style={{
            fontSize: 12, fontWeight: 600, color: '#1A3FAA',
            textTransform: 'uppercase', letterSpacing: '0.07em',
            marginBottom: 4, fontFamily: 'DM Sans, sans-serif',
          }}>
            Bienvenido de nuevo
          </p>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700,
            color: '#0A0F1E', margin: 0, letterSpacing: '-0.5px',
          }}>
            Panel principal
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </p>
        </div>

        {/* Progress pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', background: '#fff', borderRadius: 12,
          border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
              PDFs cargados
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 120, height: 5, borderRadius: 99,
                background: '#F1F5F9', overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: manuals.length ? `${Math.round((withPDF.length / manuals.length) * 100)}%` : '0%' }}
                  transition={{ duration: 1, delay: 0.4, ease: E }}
                  style={{ height: '100%', background: '#1A3FAA', borderRadius: 99 }}
                />
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, color: '#1A3FAA',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                {manuals.length ? Math.round((withPDF.length / manuals.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {STATS.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Main content: 2 cols */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }} className="dash-grid">

        {/* Recent manuals */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: E }}
          style={{
            background: '#fff', borderRadius: 20, overflow: 'hidden',
            border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px 14px', borderBottom: '1px solid #F8FAFF',
          }}>
            <div>
              <p style={{
                fontFamily: 'Syne, sans-serif', fontSize: 14.5, fontWeight: 700,
                color: '#0A0F1E', margin: 0,
              }}>
                Manuales recientes
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                Últimas {Math.min(manuals.length, 5)} capacitaciones publicadas
              </p>
            </div>
            <Link to="/panel-softlab-admin/manuales" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 600, color: '#1A3FAA',
                  background: '#EEF3FF', border: '1px solid #C7D5F8',
                  padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#dce8ff'}
                onMouseLeave={e => e.currentTarget.style.background = '#EEF3FF'}
              >
                Ver todos <ArrowRight size={12} />
              </button>
            </Link>
          </div>

          {/* List */}
          <div style={{ padding: '8px 6px' }}>
            {manuals.length === 0 ? (
              <div style={{
                padding: '40px 20px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: '#F8FAFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BookOpen size={22} color="#CBD5E1" />
                </div>
                <p style={{ fontSize: 13.5, color: '#94A3B8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                  No hay manuales aún
                </p>
                <Link to="/panel-softlab-admin/manuales/nuevo" style={{ textDecoration: 'none' }}>
                  <button style={{
                    fontSize: 12.5, fontWeight: 600, color: '#1A3FAA',
                    background: '#EEF3FF', border: 'none', borderRadius: 8,
                    padding: '7px 14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  }}>
                    Crear el primero →
                  </button>
                </Link>
              </div>
            ) : (
              manuals.slice(0, 5).map((m, i) => (
                <ManualRow key={m.id} manual={m} index={i} />
              ))
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42, ease: E }}
            style={{
              background: '#fff', borderRadius: 20, padding: '18px 16px',
              border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}
          >
            <p style={{
              fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
              color: '#0A0F1E', margin: 0,
            }}>
              Acciones rápidas
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <QuickAction
                to="/panel-softlab-admin/manuales/nuevo"
                icon={Plus} title="Nuevo manual" sub="Agregar capacitación"
                primary delay={0.5}
              />
              <QuickAction
                to="/panel-softlab-admin/manuales"
                icon={BookOpen} title="Ver manuales" sub="Gestionar catálogo"
                delay={0.56}
              />
              <QuickAction
                to="/panel-softlab-admin/participantes/nuevo"
                icon={UserPlus} title="Nuevo participante" sub="Agregar al equipo"
                delay={0.62}
              />
              <QuickAction
                to="/panel-softlab-admin/galeria"
                icon={Images} title="Galería de fotos" sub="Subir y gestionar imágenes"
                delay={0.68}
              />
            </div>
          </motion.div>

          {/* Team summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.52, ease: E }}
            style={{
              background: '#fff', borderRadius: 20, padding: '18px 16px',
              border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
            }}>
              <p style={{
                fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
                color: '#0A0F1E', margin: 0,
              }}>
                Equipo
              </p>
              <Link to="/panel-softlab-admin/participantes" style={{
                fontSize: 11.5, fontWeight: 600, color: '#1A3FAA',
                textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
              }}>
                Ver todos →
              </Link>
            </div>

            {participants.length === 0 ? (
              <p style={{ fontSize: 13, color: '#CBD5E1', fontFamily: 'DM Sans, sans-serif' }}>
                Sin participantes registrados
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {participants.slice(0, 4).map((p, i) => {
                  const colors = ['#1A3FAA', '#0369A1', '#059669', '#7C3AED'];
                  const c = colors[i % colors.length];
                  const initials = p.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.58 + i * 0.06, ease: E }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 10,
                        transition: 'background 0.15s', cursor: 'default',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFF'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `${c}18`, border: `1.5px solid ${c}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden',
                      }}>
                        {p.photo ? (
                          <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: 'Syne, sans-serif' }}>
                            {initials}
                          </span>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                          color: '#0A0F1E', margin: 0, overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {p.name}
                        </p>
                        <p style={{
                          fontSize: 11, color: '#94A3B8', margin: 0,
                          fontFamily: 'DM Sans, sans-serif', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {p.role}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                {participants.length > 4 && (
                  <p style={{
                    fontSize: 12, color: '#94A3B8', margin: '4px 0 0 10px',
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                    + {participants.length - 4} más en el equipo
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

    </div>
  );
}