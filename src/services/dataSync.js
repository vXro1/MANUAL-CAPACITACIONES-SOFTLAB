/**
 * Sincroniza datos del servidor (MySQL) hacia localStorage.
 * Los repositorios existentes leen localStorage de forma síncrona,
 * así que este módulo actúa como capa de caché: carga una vez al inicio
 * y después de cada mutación del admin.
 */
import { manualesApi, participantesApi, galeriaApi } from './apiService';

const KEYS = {
  MANUALS:      'softlab_manuals',
  PARTICIPANTS: 'softlab_participants',
  GALLERY:      'softlab_gallery',
  SYNCED:       'softlab_last_sync',
};

function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// Convierte una fila de participante del servidor al formato del frontend
function normalizeParticipant(p) {
  return {
    id:        String(p.id),
    name:      p.name  ?? p.nombre ?? '',
    role:      p.role  ?? p.rol    ?? '',
    career:    p.career ?? p.carrera ?? '',
    semester:  p.semestre ?? p.semester ?? null,
    bio:       p.bio ?? '',
    skills:    p.skills ?? p.habilidades ?? [],
    linkedin:  p.linkedin ?? '',
    github:    p.github ?? '',
    email:     p.email ?? '',
    photo:     p.foto_path ?? p.photo ?? null,
  };
}

// Convierte una fila de manual del servidor al formato del frontend
function normalizeManual(m) {
  return {
    id:           String(m.id),
    title:        m.titulo ?? m.title ?? '',
    category:     m.categoria ?? m.category ?? '',
    description:  m.descripcion ?? m.description ?? '',
    authorIds:    m.autor_ids ?? m.authorIds ?? [],
    date:         m.fecha ?? m.date ?? '',
    featured:     !!(m.destacado ?? m.featured),
    pdf:          m.pdf_path ?? m.pdf ?? null,
    coverImage:   m.imagen_portada ?? m.coverImage ?? null,
    gallery:      m.galeria_evidencias ?? m.gallery ?? [],
    subtitle:      m.subtitle      ?? null,
    introduction:  m.introduction  ?? null,
    time:          m.time          ?? null,
    duration:      m.duration      ?? null,
    speakerId:     m.speakerId     ?? null,
    speakerIds:    m.speakerIds    ?? (m.speakerId ? [m.speakerId] : []),
    institution:   m.institution   ?? null,
    cover:         m.cover         ?? null,
    objectives:    m.objectives    ?? [],
    auxiliaresIds: m.auxiliaresIds ?? [],
  };
}

// Convierte una fila de galería del servidor al formato del frontend
function normalizeGalleryImage(img) {
  return {
    id:          String(img.id),
    src:         img.imagen_path ?? img.src ?? '',
    title:       img.titulo ?? img.title ?? '',
    featured:    !!(img.destacada ?? img.featured),
    uploadedAt:  img.subido_en ?? img.uploadedAt ?? new Date().toISOString(),
  };
}

// ─── Sincronización completa ───────────────────────────────────────────────────
export async function syncAll() {
  try {
    const [manuals, participants, gallery] = await Promise.all([
      manualesApi.getAll(),
      participantesApi.getAll(),
      galeriaApi.getAll(),
    ]);

    save(KEYS.MANUALS,      manuals.map(normalizeManual));
    save(KEYS.PARTICIPANTS, participants.map(normalizeParticipant));
    save(KEYS.GALLERY,      gallery.map(normalizeGalleryImage));
    save(KEYS.SYNCED,       Date.now());

    return true;
  } catch (err) {
    console.warn('[dataSync] No se pudo sincronizar con el servidor:', err.message);
    return false;
  }
}

// ─── Sincronización parcial (tras mutaciones del admin) ───────────────────────
export async function syncManuales() {
  const data = await manualesApi.getAll();
  save(KEYS.MANUALS, data.map(normalizeManual));
}

export async function syncParticipantes() {
  const data = await participantesApi.getAll();
  save(KEYS.PARTICIPANTS, data.map(normalizeParticipant));
}

export async function syncGaleria() {
  const data = await galeriaApi.getAll();
  save(KEYS.GALLERY, data.map(normalizeGalleryImage));
}
