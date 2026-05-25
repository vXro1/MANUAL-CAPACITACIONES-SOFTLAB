/**
 * dataSync.js — Sincroniza datos del servidor (MySQL) hacia localStorage.
 * Los repositorios existentes leen localStorage de forma síncrona,
 * así que este módulo actúa como capa de caché: carga una vez al inicio
 * y después de cada mutación del admin.
 */
import { manualesApi, participantesApi, galeriaApi, eventosApi, categoriasEventosApi } from './apiService';
import { directivosApi } from './directivosApi';

const KEYS = {
  MANUALS:      'softlab_manuals',
  PARTICIPANTS: 'softlab_participants',
  GALLERY:      'softlab_gallery',
  DIRECTORS:    'softlab_directors',
  EVENTS:       'softlab_events',
  EVENT_CATS:   'softlab_event_categories',
  SYNCED:       'softlab_last_sync',
};

function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ─── Normalizadores ───────────────────────────────────────────────────────────

function normalizeParticipant(p) {
  return {
    id:         String(p.id),
    name:       p.name     ?? p.nombre   ?? '',
    role:       p.role     ?? p.rol      ?? '',
    career:     p.career   ?? p.carrera  ?? '',
    semester:   p.semestre ?? p.semester ?? null,
    bio:        p.bio      ?? '',
    skills:     p.skills   ?? p.habilidades ?? [],
    linkedin:   p.linkedin ?? '',
    github:     p.github   ?? '',
    email:      p.email    ?? '',
    photo:      p.foto_path ?? p.photo   ?? null,
    actividades: (p.actividades ?? []).map((a) => ({
      tipo:      a.tipo,
      id:        String(a.id),
      titulo:    a.titulo   ?? a.title    ?? '',
      fecha:     a.fecha    ?? a.date     ?? null,
      categoria: a.categoria ?? a.category ?? null,
      rol:       a.rol      ?? null,
    })),
  };
}

function normalizeManual(m) {
  return {
    id:            String(m.id),
    title:         m.titulo       ?? m.title        ?? '',
    category:      m.categoria    ?? m.category     ?? '',
    description:   m.descripcion  ?? m.description  ?? '',
    authorIds:     m.autor_ids    ?? m.authorIds    ?? [],
    date:          m.fecha        ?? m.date         ?? '',
    featured:      !!(m.destacado ?? m.featured),
    pdf:           m.pdf_path     ?? m.pdf          ?? null,
    coverImage:    m.imagen_portada ?? m.coverImage ?? null,
    gallery:       m.galeria_evidencias ?? m.gallery ?? [],
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

function normalizeGalleryImage(img) {
  return {
    id:         String(img.id),
    src:        img.imagen_path ?? img.src     ?? '',
    title:      img.titulo      ?? img.title   ?? '',
    featured:   !!(img.destacada ?? img.featured),
    uploadedAt: img.subido_en   ?? img.uploadedAt ?? new Date().toISOString(),
  };
}

function normalizeEvento(ev) {
  return {
    id:               String(ev.id),
    title:            ev.title          ?? ev.titulo      ?? '',
    description:      ev.description    ?? ev.descripcion ?? '',
    date:             ev.date           ?? ev.fecha       ?? '',
    category:         ev.category       ?? ev.categoria   ?? '',
    participantIds:   (ev.participantIds ?? ev.participant_ids ?? []).map(String),
    participantRoles: (ev.participantRoles ?? []).map((pr) => ({
      participante_id: String(pr.participante_id),
      rol:             pr.rol ?? null,
    })),
    gallery:          (ev.gallery       ?? []).map((img) => ({
      id:    String(img.id),
      src:   img.src        ?? img.imagen_path ?? '',
      title: img.title      ?? img.titulo      ?? '',
      _serverImage: true,
    })),
    createdAt:        ev.createdAt      ?? ev.created_at  ?? '',
  };
}

// Los directivos ya vienen normalizados desde directivosApi/directivos.php
function normalizeDirectivo(d) {
  return {
    id:          String(d.id),
    name:        d.name        ?? d.nombre       ?? '',
    role:        d.role        ?? d.rol          ?? '',
    profession:  d.profession  ?? d.profesion    ?? '',
    faculty:     d.faculty     ?? d.facultad     ?? '',
    description: d.description ?? d.descripcion  ?? '',
    highlights:  d.highlights  ?? '',
    chips:       d.chips       ?? [],
    docs:        d.docs        ?? [],
    photo:       d.photo       ?? d.foto         ?? null,
    accent:      d.accent      ?? '#1A3FAA',
    bg:          d.bg          ?? '#EEF3FF',
    borderColor: d.borderColor ?? d.border_color ?? '#C7D5F8',
    border:      d.borderColor ?? d.border_color ?? '#C7D5F8',
    badge:       d.badge       ?? d.role         ?? '',
    featured:    !!(d.featured),
    createdAt:   d.createdAt   ?? d.created_at   ?? '',
    initials:    d.initials    ?? (d.name ?? d.nombre ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join(''),
  };
}

// ─── Sincronización completa ──────────────────────────────────────────────────

export async function syncAll() {
  try {
    const [manuals, participants, gallery, directors, events, eventCats] = await Promise.allSettled([
      manualesApi.getAll(),
      participantesApi.getAll(),
      galeriaApi.getAll(),
      directivosApi.getAll(),
      eventosApi.getAll(),
      categoriasEventosApi.getAll(),
    ]);

    if (manuals.status      === 'fulfilled') save(KEYS.MANUALS,      manuals.value.map(normalizeManual));
    if (participants.status === 'fulfilled') save(KEYS.PARTICIPANTS,  participants.value.map(normalizeParticipant));
    if (gallery.status      === 'fulfilled') save(KEYS.GALLERY,       gallery.value.map(normalizeGalleryImage));
    if (directors.status    === 'fulfilled') save(KEYS.DIRECTORS,     directors.value.map(normalizeDirectivo));
    if (events.status       === 'fulfilled') save(KEYS.EVENTS,        events.value.map(normalizeEvento));
    if (eventCats.status    === 'fulfilled') save(KEYS.EVENT_CATS,    eventCats.value.map((c) => c.name ?? c.nombre ?? c));

    save(KEYS.SYNCED, Date.now());
    return true;
  } catch (err) {
    console.warn('[dataSync] No se pudo sincronizar con el servidor:', err.message);
    return false;
  }
}

// ─── Sincronización parcial (tras mutaciones del admin) ──────────────────────

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

export async function syncDirectivos() {
  const data = await directivosApi.getAll();
  save(KEYS.DIRECTORS, data.map(normalizeDirectivo));
}

export async function syncEventos() {
  const data = await eventosApi.getAll();
  save(KEYS.EVENTS, data.map(normalizeEvento));
}

export async function syncCategoriasEventos() {
  const data = await categoriasEventosApi.getAll();
  save(KEYS.EVENT_CATS, data.map((c) => c.name ?? c.nombre ?? c));
}