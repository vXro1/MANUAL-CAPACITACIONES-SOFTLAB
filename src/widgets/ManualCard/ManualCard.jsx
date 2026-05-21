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

            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="blue" className="bg-white/90 backdrop-blur-sm border-0 text-brand-700 shadow-sm">
                {manual.category}
              </Badge>
            </div>

            {/* PDF indicator */}
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
    <Link to={`/manuales/${manual.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-brand-lg hover:border-brand-200 transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-64 lg:w-80 aspect-video md:aspect-auto overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 shrink-0">
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
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/20 hidden md:block" />
          </div>

          <div className="flex flex-col gap-4 p-6 flex-1 justify-center">
            <div className="flex flex-wrap gap-2">
              <Badge variant="blue">{manual.category}</Badge>
              <Badge variant="slate">Destacado</Badge>
            </div>

            <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
              {manual.title}
            </h3>

            <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
              {manual.description}
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              {speaker && (
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-brand-400" />
                  <span>{speaker.name}</span>
                </div>
              )}
              {manual.date && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>{formatDate(manual.date)}</span>
                </div>
              )}
              {manual.duration && (
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>{manual.duration}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm font-medium text-brand-600 group-hover:gap-2.5 transition-all">
              Explorar manual
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
