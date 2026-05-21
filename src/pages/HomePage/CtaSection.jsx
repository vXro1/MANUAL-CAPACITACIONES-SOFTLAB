import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center flex flex-col items-center gap-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <BookOpen size={26} className="text-white" />
          </div>

          <div className="flex flex-col gap-3 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Explora toda la biblioteca de capacitaciones
            </h2>
            <p className="text-brand-200 text-base leading-relaxed">
              Accede a los manuales técnicos documentados por el equipo Softlab. Contenido de
              calidad, estructurado y disponible para toda la comunidad académica.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/manuales">
              <Button
                size="lg"
                className="bg-white text-brand-700 hover:bg-brand-50 border-0 shadow-lg"
                iconRight={ArrowRight}
              >
                Ver todos los manuales
              </Button>
            </Link>
            <Link to="/nosotros">
              <Button
                size="lg"
                className="bg-white/10 text-white border border-white/20 hover:bg-white/20 shadow-none"
              >
                Conocer el equipo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
