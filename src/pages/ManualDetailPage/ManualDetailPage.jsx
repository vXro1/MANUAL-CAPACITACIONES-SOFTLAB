import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { manualsRepository, speakersRepository, participantsRepository } from '@/storage/localStorageRepository';
import { resolvePDFUrl } from '@/storage/pdfStorageService';
import { PDFViewer } from '@/features/manual-viewer/PDFViewer';
import { Gallery } from '@/features/gallery/Gallery';
import { useResolvedGallery } from '@/shared/hooks/useResolvedGallery';
import { Modal } from '@/shared/ui/Modal';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { formatDate, formatTime } from '@/shared/lib/formatDate';

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
    } catch (err) {
      console.error('Error resolviendo PDF:', err);
      setResolvedPdfUrl(manual.pdf);
      setPdfOpen(true);
    } finally {
      setResolvingPdf(false);
    }
  };

  const handleClosePdf = () => {
    setPdfOpen(false);
    if (resolvedPdfUrl && resolvedPdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(resolvedPdfUrl);
    }
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
    <main id="main-content" className="min-h-screen bg-white pt-16">
      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/manuales"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver a manuales
        </Link>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 mt-4">
        <div className="absolute inset-0 opacity-15">
          {manual.cover && (
            <img src={manual.cover} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-950/70 to-brand-900/95" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-5 max-w-3xl"
          >
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/15 text-white border-white/20">
                {manual.category}
              </Badge>
              {manual.featured && (
                <Badge className="bg-yellow-400/20 text-yellow-200 border-yellow-300/20">
                  Destacado
                </Badge>
              )}
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {manual.title}
              </h1>
              {manual.subtitle && (
                <p className="text-brand-300 text-base mt-2 leading-relaxed">
                  {manual.subtitle}
                </p>
              )}
            </div>

            <p className="text-brand-200 text-base leading-relaxed">{manual.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-brand-300">
              {manual.institution && (
                <div className="flex items-center gap-1.5">
                  <Building2 size={14} />
                  <span>{manual.institution}</span>
                </div>
              )}
              {manual.date && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{formatDate(manual.date)}</span>
                </div>
              )}
              {manual.time && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{formatTime(manual.time)}</span>
                </div>
              )}
              {manual.duration && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{manual.duration}</span>
                </div>
              )}
            </div>

            {manual.pdf && (
              <div className="mt-2">
                <Button
                  onClick={handleOpenPdf}
                  size="lg"
                  loading={resolvingPdf}
                  icon={BookOpen}
                  className="bg-white text-brand-700 hover:bg-brand-50 border-0 shadow-lg"
                >
                  {resolvingPdf ? 'Cargando...' : 'Abrir manual PDF'}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            {/* Introduction */}
            {manual.introduction && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">Introducción</h2>
                <div className="flex flex-col gap-3">
                  {manual.introduction.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-slate-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Table of Contents */}
            {manual.tableOfContents && manual.tableOfContents.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="p-5 rounded-2xl bg-brand-50/50 border border-brand-100"
              >
                <div className="flex items-center gap-2 mb-3">
                  <List size={16} className="text-brand-600" />
                  <h3 className="font-semibold text-slate-800">Tabla de contenido</h3>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {manual.tableOfContents.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-brand-400 shrink-0 mt-0.5">&#8250;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Objectives */}
            {manual.objectives && manual.objectives.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">Objetivos</h2>
                <ul className="flex flex-col gap-3">
                  {manual.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-brand-700">{i + 1}</span>
                      </div>
                      <span className="text-slate-600 text-sm leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Gallery */}
            {resolvedGallery.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Gallery images={resolvedGallery} />
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* PDF CTA */}
            {manual.pdf ? (
              <button
                onClick={handleOpenPdf}
                disabled={resolvingPdf}
                className="group p-5 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex flex-col gap-3 text-left hover:shadow-brand-lg transition-all disabled:opacity-70"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  {resolvingPdf ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <BookOpen size={20} />
                  )}
                </div>
                <div>
                  <p className="font-semibold">Ver PDF</p>
                  <p className="text-xs text-brand-200 mt-0.5">
                    Visor normal o modo libro animado
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-brand-200 group-hover:gap-2 transition-all">
                  Abrir <ChevronRight size={14} />
                </div>
              </button>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-3 text-center">
                <FileText size={28} className="text-slate-300" />
                <p className="text-sm text-slate-500">PDF no disponible aún</p>
              </div>
            )}

            {/* Speaker */}
            {speaker && (
              <div className="p-5 rounded-2xl border border-slate-100 bg-white flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Ponente
                </h3>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center shrink-0">
                    {speaker.photo ? (
                      <img src={speaker.photo} alt={speaker.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <User size={18} className="text-brand-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{speaker.name}</p>
                    <p className="text-xs text-brand-600 font-medium">{speaker.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{speaker.institution}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Authors */}
            {authors.length > 0 && (
              <div className="p-5 rounded-2xl border border-slate-100 bg-white flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Autores
                </h3>
                <div className="flex flex-col gap-3">
                  {authors.map((author) => (
                    <div key={author.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                        {author.photo ? (
                          <img src={author.photo} alt={author.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-xs font-bold text-brand-500">
                            {author.name[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{author.name}</p>
                        <p className="text-xs text-slate-400">{author.career}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Institution */}
            {manual.institution && (
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3">
                <Building2 size={15} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Institución</p>
                  <p className="text-sm font-medium text-slate-800">{manual.institution}</p>
                  {manual.faculty && (
                    <p className="text-xs text-slate-400 mt-0.5">{manual.faculty}</p>
                  )}
                </div>
              </div>
            )}

            {/* Editor */}
            {editor && (
              <div className="p-4 rounded-xl border border-slate-100 bg-white flex items-center gap-3">
                <Edit3 size={14} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Editor</p>
                  <p className="text-sm font-medium text-slate-800">{editor.name}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {manual.tags && manual.tags.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Tag size={12} />
                  Etiquetas
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {manual.tags.map((tag) => (
                    <Badge key={tag} variant="slate">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Modal */}
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
