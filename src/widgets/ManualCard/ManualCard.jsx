import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, BookOpen, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/shared/ui/Badge';
import { formatDate } from '@/shared/lib/formatDate';
import { speakersRepository } from '@/storage/localStorageRepository';
import { cn } from '@/shared/lib/cn';

export function ManualCard({ manual, index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const speaker = manual.speakerId ? speakersRepository.getById(manual.speakerId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/manuales/${manual.id}`} className="group block h-full">
        <div className="h-full bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-brand hover:border-brand-200 transition-all duration-300 flex flex-col">
          {/* Cover */}
          <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200">
            {manual.cover && !imgError ? (
              <img
                src={manual.cover}
                alt={manual.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText size={36} className="text-brand-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge variant="blue" className="bg-white/90 backdrop-blur-sm border-0 text-brand-700 shadow-sm">
                {manual.category}
              </Badge>
            </div>
            {manual.pdf && (
              <div className="absolute top-3 right-3">
                <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <BookOpen size={13} className="text-brand-600" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 p-5 flex-1">
            <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
              {manual.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1">
              {manual.description}
            </p>
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-50">
              {speaker && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User size={12} className="text-brand-400 shrink-0" />
                  <span className="truncate">{speaker.name}</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                {manual.date && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={12} />
                    <span>{formatDate(manual.date, { month: 'short' })}</span>
                  </div>
                )}
                {manual.duration && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>{manual.duration}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-brand-600 group-hover:gap-2 transition-all">
              Ver manual
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ManualCardFeatured({ manual }) {
  const [imgError, setImgError] = useState(false);
  const speaker = manual.speakerId ? speakersRepository.getById(manual.speakerId) : null;

  return (
    <Link to={`/manuales/${manual.id}`} className="group block h-full">
      <div
        className="h-full bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-brand-200 transition-all duration-300 flex flex-col"
        style={{ transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(26,63,170,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {/* Image */}
        <div
          className="relative w-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200"
          style={{ aspectRatio: '16/10' }}
        >
          {manual.cover && !imgError ? (
            <img
              src={manual.cover}
              alt={manual.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText size={40} className="text-brand-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: 'rgba(255,255,255,0.92)',
                color: '#1A3FAA',
                backdropFilter: 'blur(8px)',
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '0.02em',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {manual.category}
            </span>
          </div>

          {/* Featured badge */}
          {manual.featured && (
            <div className="absolute top-4 right-4">
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.92)',
                  color: '#92400e',
                  backdropFilter: 'blur(8px)',
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                ★ Destacado
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 p-6 flex-1">
          <h3
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 18,
              fontWeight: 700,
              color: '#0A0F1E',
              margin: 0,
              lineHeight: 1.3,
              letterSpacing: '-0.3px',
            }}
            className="line-clamp-2 group-hover:text-brand-700 transition-colors"
          >
            {manual.title}
          </h3>

          <p
            style={{
              fontSize: 14,
              color: '#64748b',
              margin: 0,
              lineHeight: 1.65,
              fontFamily: 'DM Sans, sans-serif',
            }}
            className="line-clamp-2 flex-1"
          >
            {manual.description}
          </p>

          {/* Meta */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              paddingTop: 12,
              borderTop: '1px solid #f1f5f9',
            }}
          >
            {speaker && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={12} color="#93c5fd" />
                <span
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  {speaker.name}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {manual.date && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: '#94a3b8',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <Calendar size={12} />
                  {formatDate(manual.date, { month: 'short' })}
                </span>
              )}
              {manual.duration && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: '#94a3b8',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <Clock size={12} />
                  {manual.duration}
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              fontWeight: 600,
              color: '#1A3FAA',
              fontFamily: 'DM Sans, sans-serif',
              marginTop: 4,
              transition: 'gap 0.2s',
            }}
            className="group-hover:gap-2"
          >
            Ver manual <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </Link>
  );
}