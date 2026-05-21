import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, Mail, BookOpen, X, GitBranch } from 'lucide-react';
import { participantsRepository, manualsRepository } from '@/storage/localStorageRepository';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { Badge } from '@/shared/ui/Badge';
import { Avatar } from '@/shared/ui/Avatar';

const ROLE_COLORS = {
  Investigador: 'blue',
  'Co-Investigador': 'blue',
  'Investigador Principal': 'blue',
  Estudiante: 'slate',
  Docente: 'green',
  'Docente Investigador': 'green',
  Ponente: 'yellow',
  'Director del Semillero': 'red',
  'Co-Director del Semillero': 'red',
  'Auxiliar de Investigación': 'slate',
  'Colaborador Externo': 'slate',
};

function ParticipantCard({ participant, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(participant)}
      aria-label={`Ver perfil de ${participant.name}, ${participant.role}`}
      className="group bg-white rounded-2xl border border-slate-100 p-5 text-left w-full hover:border-brand-200 hover:shadow-brand transition-all duration-300 focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      <div className="flex items-start gap-4">
        <Avatar photo={participant.photo} name={participant.name} size="lg" shape="square" />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-brand-700 transition-colors truncate">
            {participant.name}
          </h3>
          <p className="text-xs font-medium mt-0.5">
            <Badge variant={ROLE_COLORS[participant.role] ?? 'slate'} className="text-[10px]">
              {participant.role}
            </Badge>
          </p>
          <p className="text-xs text-slate-400 mt-1.5 truncate">{participant.career}</p>
        </div>

        <ChevronDown size={14} className="text-slate-300 shrink-0 mt-1 group-hover:text-brand-400 transition-colors" aria-hidden="true" />
      </div>

      {participant.skills && participant.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4" aria-label="Habilidades">
          {participant.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="slate" className="text-[10px]">
              {skill}
            </Badge>
          ))}
          {participant.skills.length > 3 && (
            <Badge variant="slate" className="text-[10px]">
              +{participant.skills.length - 3}
            </Badge>
          )}
        </div>
      )}
    </motion.button>
  );
}

function ParticipantModal({ participant, onClose }) {
  const closeButtonRef = useRef(null);
  const allManuals = manualsRepository.getAll();
  const authorManuals = allManuals.filter((m) => m.authorIds?.includes(participant.id));

  // Focus close button when modal opens
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Trap focus inside modal
  useEffect(() => {
    const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const handle = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const panel = document.getElementById('participant-modal-panel');
      if (!panel) return;
      const focusable = [...panel.querySelectorAll(FOCUSABLE)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { last.focus(); e.preventDefault(); }
      } else {
        if (document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <AnimatePresence>
      {participant && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Perfil de ${participant.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            id="participant-modal-panel"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header gradient */}
            <div className="relative bg-gradient-to-br from-brand-600 to-brand-800 px-6 pt-6 pb-14 shrink-0">
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Cerrar perfil"
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-white"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Profile — scrollable */}
            <div className="px-6 pb-6 overflow-y-auto flex-1">
              <div className="flex items-end gap-4 -mt-10 mb-5">
                <Avatar
                  photo={participant.photo}
                  name={participant.name}
                  size="xl"
                  shape="lg"
                  className="border-4 border-white shadow-lg"
                />
                <div className="flex gap-2 mb-1">
                  {participant.linkedin && participant.linkedin !== '#' && (
                    <a
                      href={participant.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`LinkedIn de ${participant.name}`}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  )}
                  {participant.github && participant.github !== '#' && (
                    <a
                      href={participant.github}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`GitHub de ${participant.name}`}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
                    >
                      <GitBranch size={14} aria-hidden="true" />
                    </a>
                  )}
                  {participant.email && (
                    <a
                      href={`mailto:${participant.email}`}
                      aria-label={`Enviar correo a ${participant.name}`}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
                    >
                      <Mail size={14} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900">{participant.name}</h2>
              <div className="mt-1 mb-1">
                <Badge variant={ROLE_COLORS[participant.role] ?? 'slate'}>{participant.role}</Badge>
              </div>
              {participant.career && (
                <p className="text-xs text-slate-500 mt-1">
                  {participant.career}
                  {participant.semester ? ` — Semestre ${participant.semester}` : ''}
                </p>
              )}

              {participant.bio && (
                <p className="text-sm text-slate-600 leading-relaxed mt-4">{participant.bio}</p>
              )}

              {participant.skills && participant.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Habilidades
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {participant.skills.map((skill) => (
                      <Badge key={skill} variant="blue" className="text-[11px]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {authorManuals.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Manuales como autor
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {authorManuals.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 text-xs text-slate-600">
                        <BookOpen size={11} className="text-brand-400 shrink-0" aria-hidden="true" />
                        <span className="truncate">{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ParticipantsSection() {
  const participants = participantsRepository.getAll();
  const [selected, setSelected] = useState(null);
  const triggerRef = useRef(null);

  // Return focus to the card that opened the modal
  const handleOpen = (participant, element) => {
    triggerRef.current = element;
    setSelected(participant);
  };

  const handleClose = () => {
    setSelected(null);
    triggerRef.current?.focus();
  };

  if (participants.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="Equipo"
          title="Investigadores del semillero"
          description="Conoce a los estudiantes que documentan y lideran las capacitaciones en Softlab."
          className="mb-12"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {participants.map((p) => (
            <ParticipantCard
              key={p.id}
              participant={p}
              onClick={(participant) => setSelected(participant)}
            />
          ))}
        </div>
      </div>

      {selected && (
        <ParticipantModal participant={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
