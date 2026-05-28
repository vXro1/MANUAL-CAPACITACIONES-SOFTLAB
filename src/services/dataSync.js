/**
 * dataSync.js — Sincroniza datos del servidor (MySQL) hacia localStorage.
 * Los repositorios existentes leen localStorage de forma síncrona,
 * así que este módulo actúa como capa de caché: carga una vez al inicio
 * y después de cada mutación del admin.
 */
import { manualesApi, participantesApi, galeriaApi, eventosApi, categoriasEventosApi } from './apiService';
import { directivosApi } from './directivosApi';
import { normalizeManual, normalizeParticipant, normalizeGalleryImage, normalizeEvento } from './normalizers';



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
  const raw = await participantesApi.getAll();
  const normalized = (raw ?? []).map(normalizeParticipant);
  participantsRepository.saveAll(normalized); 
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