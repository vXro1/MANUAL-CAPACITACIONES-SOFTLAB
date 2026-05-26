import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { AboutSection } from '@/widgets/AboutSection/AboutSection';
import { ParticipantsSection } from '@/widgets/ParticipantsSection/ParticipantsSection';

export function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <FlaskConical size={20} className="text-white" />
              </div>
              <span className="text-brand-200 text-sm font-medium">Semillero de Investigación</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Sobre Softlab
            </h1>
            <p className="text-brand-200 text-base max-w-xl leading-relaxed">
              Conoce el equipo de investigadores, la misión del semillero y las personas que
              hacen posible este proyecto académico.
            </p>
          </motion.div>
        </div>
      </div>

      <AboutSection showDirectors />
      <ParticipantsSection />
    </main>
  );
}
