import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  FileText,
  BookOpen,
  LayoutTemplate,
} from 'lucide-react';
import { Spinner } from '@/shared/ui/Spinner';
import { Button } from '@/shared/ui/Button';
import { BookViewer } from './BookViewer';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PROD_ORIGIN = 'https://semillerosoftlab.com';
function normalizeUrl(url) {
  if (!url) return url;
  if (url.startsWith(PROD_ORIGIN + '/')) return url.slice(PROD_ORIGIN.length);
  return url;
}

function NormalViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [direction, setDirection] = useState(1);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const goToPrev = () => {
    if (pageNumber > 1) {
      setDirection(-1);
      setPageNumber((p) => p - 1);
    }
  };

  const goToNext = () => {
    if (pageNumber < numPages) {
      setDirection(1);
      setPageNumber((p) => p + 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-white border-b border-slate-100 flex-wrap gap-2">
        {/* Page navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2" role="group" aria-label="Navegación de páginas">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrev}
            disabled={pageNumber <= 1}
            icon={ChevronLeft}
            aria-label="Página anterior"
          >
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          <span
            className="text-sm text-slate-600 whitespace-nowrap px-2 tabular-nums"
            aria-live="polite"
            aria-label={`Página ${pageNumber} de ${numPages ?? 'desconocido'}`}
          >
            {loading ? '…' : `${pageNumber} / ${numPages ?? '?'}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={!numPages || pageNumber >= numPages}
            iconRight={ChevronRight}
            aria-label="Página siguiente"
          >
            <span className="hidden sm:inline">Siguiente</span>
          </Button>
        </div>

        {/* Zoom + download */}
        <div className="flex items-center gap-1" role="group" aria-label="Controles de zoom">
          <button
            onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
            aria-label="Reducir zoom"
          >
            <ZoomOut size={16} aria-hidden="true" />
          </button>
          <span
            className="text-xs text-slate-600 min-w-[44px] text-center font-medium tabular-nums"
            aria-live="polite"
            aria-label={`Zoom ${Math.round(scale * 100)}%`}
          >
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(s + 0.2, 2.5))}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
            aria-label="Aumentar zoom"
          >
            <ZoomIn size={16} aria-hidden="true" />
          </button>
          <button
            onClick={() => setScale(1)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
            aria-label="Restablecer zoom al 100%"
          >
            <RotateCcw size={14} aria-hidden="true" />
          </button>
          <a
            href={url}
            download
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-700 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600"
            aria-label="Descargar PDF"
          >
            <Download size={16} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Document area */}
      <div className="flex-1 overflow-auto flex justify-center py-6 px-4 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-3 z-10">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Cargando documento…</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex flex-col items-center gap-4 py-16 text-slate-400" role="alert">
            <FileText size={40} className="opacity-30" aria-hidden="true" />
            <p>No se pudo cargar el PDF</p>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={() => { setError(true); setLoading(false); }}
          loading={null}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageNumber}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 20 }}
              transition={{ duration: 0.2 }}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                className="shadow-xl rounded-lg overflow-hidden"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </motion.div>
          </AnimatePresence>
        </Document>
      </div>
    </div>
  );
}

export function PDFViewer({ url, title, cover, institution }) {
  const [mode, setMode] = useState('normal');
  const resolvedUrl = normalizeUrl(url);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 py-16 px-8">
        <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center">
          <FileText size={36} className="text-brand-400" aria-hidden="true" />
        </div>
        <div className="text-center">
          <p className="text-slate-600 font-medium">PDF no disponible</p>
          <p className="text-slate-400 text-sm mt-1">
            El PDF de este manual aún no ha sido cargado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mode toggle */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200 shrink-0"
        role="group"
        aria-label="Modo de visualización"
      >
        <span className="text-xs text-slate-500 mr-2" id="view-mode-label">Vista:</span>
        <button
          onClick={() => setMode('normal')}
          aria-pressed={mode === 'normal'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-brand-600 ${
            mode === 'normal'
              ? 'bg-white text-brand-700 shadow-sm border border-brand-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
          }`}
        >
          <LayoutTemplate size={13} aria-hidden="true" />
          Normal
        </button>
        <button
          onClick={() => setMode('book')}
          aria-pressed={mode === 'book'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-brand-600 ${
            mode === 'book'
              ? 'bg-white text-brand-700 shadow-sm border border-brand-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
          }`}
        >
          <BookOpen size={13} aria-hidden="true" />
          Modo libro
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {mode === 'normal' ? (
              <NormalViewer url={resolvedUrl} />
            ) : (
              <BookViewer
                url={resolvedUrl}
                title={title}
                cover={cover}
                institution={institution}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
