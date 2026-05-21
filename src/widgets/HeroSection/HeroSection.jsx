import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Users, FileText, Star } from 'lucide-react';
import { manualsRepository } from '@/storage/localStorageRepository';
import { Button } from '@/shared/ui/Button';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

const stats = [
  { icon: FileText, label: 'Manuales publicados', getValue: () => manualsRepository.getAll().length },
  { icon: Users, label: 'Investigadores', value: 6 },
  { icon: Star, label: 'Capacitaciones activas', value: 6 },
];

export function HeroSection() {
  return (
    <section id="main-content" className="relative min-h-[92vh] flex items-center bg-white pt-16" aria-label="Biblioteca Digital de Capacitaciones">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-50 via-white to-white" />
        <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-brand-200/20 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231d4ed8' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="max-w-3xl">
          {/* Label */}
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2.5 mb-6">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-200 text-brand-700 text-xs font-semibold">
              <BookOpen size={12} />
              Semillero de Investigación
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            {...fadeUp(0.1)}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.05] tracking-tight"
          >
            Biblioteca{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-800">
              Digital
            </span>{' '}
            de Capacitaciones
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeUp(0.2)}
            className="mt-6 text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl"
          >
            Manuales de usuario documentados por el semillero de investigación{' '}
            <strong className="text-slate-700 font-semibold">Softlab</strong> de la Universidad
            de Córdoba. Conocimiento técnico, estructurado y accesible.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-wrap gap-3">
            <Link to="/manuales">
              <Button size="lg" iconRight={ArrowRight}>
                Explorar manuales
              </Button>
            </Link>
            <Link to="/nosotros">
              <Button size="lg" variant="secondary" icon={Users}>
                Conocer el equipo
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            {...fadeUp(0.4)}
            className="mt-14 flex flex-wrap gap-6 md:gap-10"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const value = stat.getValue ? stat.getValue() : stat.value;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                    <Icon size={18} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-brand-300" />
        <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
      </motion.div>
    </section>
  );
}
