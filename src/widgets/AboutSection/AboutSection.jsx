import { motion } from 'framer-motion';
import { FlaskConical, Target, BookOpen, Users, Award, ExternalLink, Mail } from 'lucide-react';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { Avatar } from '@/shared/ui/Avatar';
import { directors } from '@/data/directors';
import { SOFTLAB_INFO } from '@/shared/constants';

const values = [
  {
    icon: BookOpen,
    title: 'Documentación técnica',
    description:
      'Generamos manuales estructurados y accesibles que preservan el conocimiento adquirido en cada capacitación.',
  },
  {
    icon: Users,
    title: 'Trabajo colaborativo',
    description:
      'Fomentamos la cooperación entre estudiantes con distintos niveles de experiencia y áreas de interés.',
  },
  {
    icon: Target,
    title: 'Investigación formativa',
    description:
      'Desarrollamos competencias investigativas desde la práctica y la curiosidad académica en tecnología.',
  },
  {
    icon: Award,
    title: 'Calidad académica',
    description:
      'Mantenemos estándares altos de rigor técnico y presentación en toda nuestra producción documental.',
  },
];

export function AboutSection() {
  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div className="flex flex-col gap-8">
            <SectionTitle
              label="Sobre nosotros"
              title={`${SOFTLAB_INFO.fullName}`}
              description={`Adscrito al ${SOFTLAB_INFO.department} de la ${SOFTLAB_INFO.institution}, Softlab es un espacio de aprendizaje colaborativo donde estudiantes documentan tecnologías y comparten conocimiento.`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all duration-200"
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-600/10 flex items-center justify-center">
                      <Icon size={18} className="text-brand-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{value.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right — Directors */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Dirección del semillero
            </h3>

            {directors.map((director, i) => (
              <motion.div
                key={director.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-5 p-5 rounded-2xl border border-slate-100 bg-slate-50/50"
              >
                <Avatar
                  photo={director.photo}
                  name={director.name}
                  size="lg"
                  shape="square"
                />

                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{director.name}</h4>
                    <p className="text-xs text-brand-600 font-medium">{director.role}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{director.title}</p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {director.bio}
                  </p>

                  <div className="flex gap-2 mt-1">
                    {director.linkedin && (
                      <a
                        href={director.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`LinkedIn de ${director.name}`}
                        className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
                      >
                        <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    )}
                    {director.email && (
                      <a
                        href={`mailto:${director.email}`}
                        aria-label={`Enviar correo a ${director.name}`}
                        className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
                      >
                        <Mail size={13} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Institution block */}
            <div className="mt-2 p-5 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <FlaskConical size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{SOFTLAB_INFO.institution}</p>
                  <p className="text-xs text-white/70">{SOFTLAB_INFO.faculty}</p>
                </div>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                {SOFTLAB_INFO.department} &middot; Activo desde {SOFTLAB_INFO.year} &middot;{' '}
                {SOFTLAB_INFO.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
