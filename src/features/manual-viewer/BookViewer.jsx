import { useState, useRef, forwardRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  BookOpen,
  FileText,
} from 'lucide-react';
import { Spinner } from '@/shared/ui/Spinner';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function useContainerWidth(ref) {
  const [width, setWidth] = useState(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

const BookPage = forwardRef(({ pageNumber, width, height }, ref) => (
  <div ref={ref} className="bg-white shadow-sm overflow-hidden" style={{ width, height }}>
    <Page
      pageNumber={pageNumber}
      width={width}
      height={height}
      renderTextLayer={false}
      renderAnnotationLayer={false}
    />
  </div>
));
BookPage.displayName = 'BookPage';

const CoverPage = forwardRef(({ title, cover, institution }, ref) => (
  <div
    ref={ref}
    className="flex flex-col items-center justify-center bg-gradient-to-br from-brand-800 to-brand-950 text-white p-8 shadow-inner relative overflow-hidden"
    style={{ width: '100%', height: '100%' }}
  >
    {cover && (
      <img src={cover} alt="" aria-hidden="true" className="w-full h-full object-cover absolute inset-0 opacity-20" />
    )}
    <div className="relative z-10 text-center flex flex-col gap-3">
      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mx-auto">
        <BookOpen size={22} className="text-white" aria-hidden="true" />
      </div>
      <p className="text-xs text-brand-200 uppercase tracking-widest">Softlab</p>
      <h2 className="text-lg font-bold leading-tight">{title}</h2>
      {institution && <p className="text-xs text-brand-300">{institution}</p>}
    </div>
  </div>
));
CoverPage.displayName = 'CoverPage';

export function BookViewer({ url, title, cover, institution }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const containerWidth = useContainerWidth(containerRef);

  // Compute page dimensions responsively from the container width
  const pageWidth = containerWidth
    ? Math.min(380, Math.max(160, Math.floor((containerWidth - 80) / 2)))
    : 300;
  const pageHeight = Math.floor(pageWidth * 1.414);

  const onDocumentLoad = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const goToPrev = () => flipBookRef.current?.pageFlip?.()?.flipPrev('top');
  const goToNext = () => flipBookRef.current?.pageFlip?.()?.flipNext('top');
  const onFlip = (e) => setCurrentPage(e.data);

  const zoomIn = () => setScale((s) => Math.min(s + 0.15, 1.8));
  const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.5));
  const resetZoom = () => setScale(1);

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 py-16 text-slate-400">
        <FileText size={48} className="opacity-30" aria-hidden="true" />
        <p className="font-medium text-slate-600">PDF no disponible</p>
        <p className="text-sm">El archivo aún no ha sido cargado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-slate-800 border-b border-slate-700 flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-2" role="group" aria-label="Navegación de páginas">
          <button
            onClick={goToPrev}
            disabled={currentPage === 0}
            aria-label="Página anterior"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <span
            className="text-xs text-slate-400 px-2 min-w-[72px] text-center tabular-nums"
            aria-live="polite"
            aria-label={`Página ${currentPage + 1} de ${numPages ?? 'desconocido'}`}
          >
            {loading ? '…' : `${currentPage + 1} / ${numPages ?? '?'}`}
          </span>
          <button
            onClick={goToNext}
            disabled={!numPages || currentPage >= numPages - 1}
            aria-label="Página siguiente"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Controles de zoom">
          <button
            onClick={zoomOut}
            aria-label="Reducir zoom"
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            <ZoomOut size={15} aria-hidden="true" />
          </button>
          <span className="text-xs text-slate-400 min-w-[44px] text-center tabular-nums" aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            aria-label="Aumentar zoom"
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            <ZoomIn size={15} aria-hidden="true" />
          </button>
          <button
            onClick={resetZoom}
            aria-label="Restablecer zoom"
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            <RotateCcw size={13} aria-hidden="true" />
          </button>
          <a
            href={url}
            download
            target="_blank"
            rel="noreferrer"
            aria-label="Descargar PDF"
            className="p-2 rounded-lg text-slate-400 hover:bg-brand-800 hover:text-brand-200 transition-colors focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            <Download size={15} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Book canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center py-8 px-4 relative"
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 z-10">
            <Spinner size="lg" className="border-brand-400 border-t-transparent" />
            <p className="text-sm text-slate-400">Cargando documento…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 text-slate-400" role="alert">
            <FileText size={40} className="opacity-30" aria-hidden="true" />
            <p>No se pudo cargar el PDF</p>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoad}
          onLoadError={() => { setError(true); setLoading(false); }}
          loading={null}
        >
          {numPages && !loading && containerWidth && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
              className="transition-transform duration-200"
            >
              <HTMLFlipBook
                ref={flipBookRef}
                width={pageWidth}
                height={pageHeight}
                size="fixed"
                minWidth={160}
                maxWidth={600}
                minHeight={220}
                maxHeight={850}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={onFlip}
                style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
                flippingTime={600}
                usePortrait={false}
                startPage={0}
                drawShadow={true}
                useMouseEvents={true}
              >
                <CoverPage title={title} cover={cover} institution={institution} />
                {Array.from({ length: numPages }, (_, i) => (
                  <BookPage
                    key={i + 1}
                    pageNumber={i + 1}
                    width={pageWidth}
                    height={pageHeight}
                  />
                ))}
                <div className="bg-brand-950 flex items-center justify-center">
                  <div className="text-center text-brand-400">
                    <BookOpen size={28} className="mx-auto mb-2 opacity-40" aria-hidden="true" />
                    <p className="text-xs opacity-60">Softlab</p>
                  </div>
                </div>
              </HTMLFlipBook>
            </motion.div>
          )}
        </Document>
      </div>

      {/* Hint */}
      <p className="flex items-center justify-center py-3 text-xs text-slate-600 shrink-0">
        Haz clic en los bordes del libro o usa las flechas para navegar
      </p>
    </div>
  );
}
