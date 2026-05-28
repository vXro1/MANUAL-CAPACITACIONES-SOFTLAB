// Shared field normalizers — API returns Spanish keys, components expect English.
// Applied in apiService.js (all callers) and kept in sync with dataSync.js.

// ─── Helpers internos ─────────────────────────────────────────────────────────

function toStr(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    return val.nombre ?? val.name ?? val.label ?? val.titulo ?? val.title ?? String(val.id ?? '');
  }
  return String(val);
}

function toStrArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(toStr).filter(Boolean);
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

export function normalizeManual(m) {
  return {
    id:            String(m.id),
    title:         m.titulo          ?? m.title        ?? '',
    category:      m.categoria       ?? m.category     ?? '',
    description:   m.descripcion     ?? m.description  ?? '',
    authorIds:     m.autor_ids       ?? m.authorIds    ?? [],
    date:          m.fecha           ?? m.date         ?? '',
    featured:      !!(m.destacado    ?? m.featured),
    pdf:           m.pdf_path        ?? m.pdf          ?? null,
    coverImage:    m.imagen_portada  ?? m.coverImage   ?? null,
    cover:         m.cover           ?? null,
    gallery:       m.galeria_evidencias ?? m.gallery   ?? [],
    subtitle:      m.subtitle        ?? null,
    introduction:  m.introduction    ?? null,
    time:          m.time            ?? null,
    duration:      m.duration        ?? null,
    speakerId:     m.speakerId       ?? null,
    speakerIds:    m.speakerIds      ?? (m.speakerId ? [m.speakerId] : []),
    institution:   m.institution     ?? null,
    objectives:    m.objectives      ?? [],
    auxiliaresIds: m.auxiliaresIds   ?? [],
  };
}

export function normalizeParticipant(p) {
  const primaryRole = toStr(p.role ?? p.rol ?? '');

  const rawRoles = Array.isArray(p.roles)
    ? p.roles
    : Array.isArray(p.roles_adicionales)
      ? p.roles_adicionales
      : null;
  const roles = rawRoles ? toStrArray(rawRoles) : (primaryRole ? [primaryRole] : []);

  const rawSkills = (() => {
    const s = p.skills ?? p.habilidades;
    if (Array.isArray(s)) return s;
    if (typeof s === 'string') {
      try { const parsed = JSON.parse(s); return Array.isArray(parsed) ? parsed : []; }
      catch { return s ? [s] : []; }
    }
    return [];
  })();
  const skills = toStrArray(rawSkills);

  return {
    id:       String(p.id),
    name:     toStr(p.name     ?? p.nombre   ?? ''),
    role:     primaryRole,
    roles,
    career:   toStr(p.career   ?? p.carrera  ?? ''),
    semester: toStr(p.semestre ?? p.semester ?? ''),
    bio:      toStr(p.bio      ?? ''),
    skills,
    linkedin: toStr(p.linkedin ?? ''),
    github:   toStr(p.github   ?? ''),
    email:    toStr(p.email    ?? ''),
    photo:    p.foto_path ?? p.photo ?? null,
    featured: !!(p.featured ?? false),
    proyectos: (p.proyectos ?? []).map((pr) => ({
      id:          String(pr.id ?? ''),
      titulo:      toStr(pr.titulo      ?? ''),
      descripcion: toStr(pr.descripcion ?? ''),
      url_link:    pr.url_link    ?? null,
      imagen_path: pr.imagen_path ?? null,
      tipo:        pr.url_link ? 'link' : 'imagen',
    })),
    actividades: (p.actividades ?? []).map((a) => ({
      tipo:      toStr(a.tipo      ?? ''),
      id:        String(a.id       ?? ''),
      titulo:    toStr(a.titulo    ?? a.title    ?? ''),
      fecha:     toStr(a.fecha     ?? a.date     ?? ''),
      categoria: toStr(a.categoria ?? a.category ?? ''),
      rol:       toStr(a.rol       ?? ''),
    })),
  };
}

export function normalizeGalleryImage(img) {
  return {
    id:         String(img.id),
    src:        img.imagen_path ?? img.src     ?? '',
    title:      img.titulo      ?? img.title   ?? '',
    featured:   !!(img.destacada ?? img.featured),
    uploadedAt: img.subido_en   ?? img.uploadedAt ?? new Date().toISOString(),
    heroOrder:  img.heroOrder   ?? img.hero_order ?? null,
    joinOrder:  img.joinOrder   ?? img.join_order ?? null,
  };
}

export function normalizeEvento(ev) {
  return {
    id:               String(ev.id),
    title:            ev.title          ?? ev.titulo      ?? '',
    description:      ev.description    ?? ev.descripcion ?? '',
    date:             ev.date           ?? ev.fecha       ?? '',
    category:         ev.category       ?? ev.categoria   ?? '',
    participantIds:   (ev.participantIds ?? ev.participant_ids ?? []).map(String),
    participantRoles: (ev.participantRoles ?? []).map((pr) => ({
      participante_id: String(pr.participante_id ?? ''),
      rol:             toStr(pr.rol ?? ''),
    })),
    directivoRoles:   (ev.directivoRoles ?? []).map((dr) => ({
      directivo_id: String(dr.directivo_id),
      rol:          dr.rol ?? null,
    })),
    directivoIds:     (ev.directivoIds ?? []).map(String),
    gallery:          (ev.gallery ?? []).map((img) => ({
      id:    String(img.id ?? ''),
      src:   img.src        ?? img.imagen_path ?? '',
      title: img.title      ?? img.titulo      ?? '',
      _serverImage: true,
    })),
    coverImageId: ev.coverImageId ?? ev.cover_image_id ?? null,
    createdAt:    ev.createdAt    ?? ev.created_at      ?? '',
  };
}