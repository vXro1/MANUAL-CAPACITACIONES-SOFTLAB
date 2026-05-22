import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  BookOpen,
  FileText,
  ChevronRight,
  Tag,
  Edit3,
  Building2,
  List,
  ExternalLink,
} from 'lucide-react';
import { manualsRepository, speakersRepository, participantsRepository } from '@/storage/localStorageRepository';
import { resolvePDFUrl } from '@/storage/pdfStorageService';
import { PDFViewer } from '@/features/manual-viewer/PDFViewer';
import { Gallery } from '@/features/gallery/Gallery';
import { useResolvedGallery } from '@/shared/hooks/useResolvedGallery';
import { Modal } from '@/shared/ui/Modal';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { formatDate, formatTime } from '@/shared/lib/formatDate';

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ─── tiny helpers ─── */
function MetaChip({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-slate-500">
      <Icon size={13} className="text-slate-400 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function SectionCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
      {children}
    </p>
  );
}

/* ─── main component ─── */
export function ManualDetailPage() {
  const { id } = useParams();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState(null);
  const [resolvingPdf, setResolvingPdf] = useState(false);

  const manual = manualsRepository.getById(id);
  const resolvedGallery = useResolvedGallery(manual?.gallery ?? []);

  const handleOpenPdf = async () => {
    if (!manual?.pdf) return;
    setResolvingPdf(true);
    try {
      const url = await resolvePDFUrl(manual.pdf);
      setResolvedPdfUrl(url);
      setPdfOpen(true);
    } catch {
      setResolvedPdfUrl(manual.pdf);
      setPdfOpen(true);
    } finally {
      setResolvingPdf(false);
    }
  };

  const handleClosePdf = () => {
    setPdfOpen(false);
    if (resolvedPdfUrl?.startsWith('blob:')) URL.revokeObjectURL(resolvedPdfUrl);
    setResolvedPdfUrl(null);
  };

  if (!manual) return <Navigate to="/manuales" replace />;

  const speaker = manual.speakerId ? speakersRepository.getById(manual.speakerId) : null;
  const allParticipants = participantsRepository.getAll();
  const authors = (manual.authorIds ?? [])
    .map((aid) => allParticipants.find((p) => p.id === aid))
    .filter(Boolean);
  const editor = manual.editorId
    ? allParticipants.find((p) => p.id === manual.editorId)
    : null;

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 pt-16">

      {/* ── Back nav ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/manuales"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} />
          Manuales
        </Link>
      </div>

      {/* ── Hero card (sin fondo azul) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm"
        >
          {/* subtle cover texture */}
          {manual.cover && (
            <div className="absolute inset-0 opacity-[0.06]">
              <img src={manual.cover} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="relative p-8 md:p-10">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-medium text-brand-700">
                {manual.category}
              </span>
              {manual.featured && (
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-700">
                  Destacado
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
              {/* left: title + meta */}
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
                    {manual.title}
                  </h1>
                  {manual.subtitle && (
                    <p className="mt-1.5 text-base text-brand-600 font-medium">
                      {manual.subtitle}
                    </p>
                  )}
                </div>

                {manual.description && (
                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                    {manual.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  {manual.institution && (
                    <MetaChip icon={Building2}>{manual.institution}</MetaChip>
                  )}
                  {manual.date && (
                    <MetaChip icon={Calendar}>{formatDate(manual.date)}</MetaChip>
                  )}
                  {manual.time && (
                    <MetaChip icon={Clock}>{formatTime(manual.time)}</MetaChip>
                  )}
                  {manual.duration && (
                    <MetaChip icon={Clock}>{manual.duration}</MetaChip>
                  )}
                </div>
              </div>

              {/* right: PDF button */}
              {manual.pdf && (
                <motion.button
                  onClick={handleOpenPdf}
                  disabled={resolvingPdf}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-3 rounded-2xl bg-brand-600 px-5 py-4 text-white shadow-md shadow-brand-200 hover:bg-brand-700 transition-colors disabled:opacity-60 shrink-0 self-start"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                    {resolvingPdf ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <BookOpen size={18} />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-tight">
                      {resolvingPdf ? 'Cargando…' : 'Abrir manual'}
                    </p>
                    <p className="text-xs text-white/60 mt-0.5">Ver en PDF</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="ml-1 text-white/50 group-hover:translate-x-0.5 transition-transform"
                  />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* ── Left column ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8"
          >
            {/* Introduction */}
            {manual.introduction && (
              <motion.section variants={fadeUp}>
                <h2 className="text-base font-semibold text-slate-900 mb-3">Introducción</h2>
                <div className="flex flex-col gap-3">
                  {manual.introduction.split('\n\n').map((p, i) => (
                    <p key={i} className="text-slate-500 text-sm leading-relaxed">{p}</p>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Table of Contents */}
            {manual.tableOfContents?.length > 0 && (
              <motion.section variants={fadeUp}>
                <div className="rounded-2xl border border-slate-100 bg-white p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <List size={15} className="text-brand-500" />
                    <h3 className="text-sm font-semibold text-slate-800">Tabla de contenido</h3>
                  </div>
                  <ol className="flex flex-col gap-2">
                    {manual.tableOfContents.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-600 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-slate-600 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.section>
            )}

            {/* Objectives */}
            {manual.objectives?.length > 0 && (
              <motion.section variants={fadeUp}>
                <h2 className="text-base font-semibold text-slate-900 mb-4">Objetivos</h2>
                <div className="grid gap-3">
                  {manual.objectives.map((obj, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      custom={i}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3"
                    >
                      <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-slate-600 text-sm leading-relaxed">{obj}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Gallery */}
            {resolvedGallery.length > 0 && (
              <motion.section variants={fadeUp}>
                <h2 className="text-base font-semibold text-slate-900 mb-4">Galería</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {resolvedGallery.map((img, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      custom={i}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                    >
                      <img
                        src={typeof img === 'string' ? img : img.url ?? img.src}
                        alt={img.caption ?? `Imagen ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {img.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-xs leading-tight">{img.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </motion.div>

          {/* ── Sidebar ── */}
          <motion.aside
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4"
          >
            {/* PDF CTA — si no hay botón arriba */}
            {!manual.pdf && (
              <motion.div
                variants={fadeUp}
                className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 flex flex-col items-center gap-2 text-center"
              >
                <FileText size={22} className="text-slate-300" />
                <p className="text-xs text-slate-400">PDF no disponible aún</p>
              </motion.div>
            )}

            {manual.pdf && (
              <motion.button
                variants={fadeUp}
                onClick={handleOpenPdf}
                disabled={resolvingPdf}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group w-full rounded-2xl border border-brand-100 bg-brand-50 p-4 flex items-center gap-3 hover:bg-brand-100 transition-colors text-left disabled:opacity-60"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0">
                  {resolvingPdf ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <BookOpen size={18} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-800 leading-tight">
                    {resolvingPdf ? 'Cargando…' : 'Ver manual PDF'}
                  </p>
                  <p className="text-xs text-brand-500 mt-0.5">Visor interactivo</p>
                </div>
                <ExternalLink size={14} className="text-brand-400 shrink-0 group-hover:text-brand-600 transition-colors" />
              </motion.button>
            )}

            {/* Speaker */}
            {speaker && (
              <motion.div variants={fadeUp}>
                <SectionCard>
                  <SectionLabel>Ponente</SectionLabel>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 overflow-hidden shrink-0">
                      {speaker.photo ? (
                        <img src={speaker.photo} alt={speaker.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={16} className="text-brand-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{speaker.name}</p>
                      <p className="text-xs text-brand-600 font-medium mt-0.5">{speaker.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{speaker.institution}</p>
                    </div>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Authors */}
            {authors.length > 0 && (
              <motion.div variants={fadeUp}>
                <SectionCard>
                  <SectionLabel>Autores</SectionLabel>
                  <div className="flex flex-col gap-3">
                    {authors.map((author) => (
                      <div key={author.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          {author.photo ? (
                            <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                              {author.name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 leading-tight">{author.name}</p>
                          <p className="text-xs text-slate-400">{author.career}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Institution */}
            {manual.institution && (
              <motion.div variants={fadeUp}>
                <SectionCard>
                  <SectionLabel>Institución</SectionLabel>
                  <div className="flex items-start gap-2">
                    <Building2 size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{manual.institution}</p>
                      {manual.faculty && (
                        <p className="text-xs text-slate-400 mt-0.5">{manual.faculty}</p>
                      )}
                    </div>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Editor */}
            {editor && (
              <motion.div variants={fadeUp}>
                <SectionCard>
                  <SectionLabel>Editor</SectionLabel>
                  <div className="flex items-center gap-2">
                    <Edit3 size={13} className="text-slate-400" />
                    <p className="text-sm font-medium text-slate-800">{editor.name}</p>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* Tags */}
            {manual.tags?.length > 0 && (
              <motion.div variants={fadeUp} className="flex flex-col gap-2 px-1">
                <div className="flex items-center gap-1.5">
                  <Tag size={12} className="text-slate-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Etiquetas
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {manual.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.aside>
        </div>
      </div>

      {/* ── PDF Modal ── */}
      <Modal
        isOpen={pdfOpen}
        onClose={handleClosePdf}
        size="full"
        className="!max-w-[95vw] !h-[95vh]"
      >
        <PDFViewer
          url={resolvedPdfUrl}
          title={manual.title}
          cover={manual.cover}
          institution={manual.institution}
        />
      </Modal>
    </main>
  );
}