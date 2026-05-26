// Shared field normalizers — API returns Spanish keys, components expect English.
// Applied in apiService.js (all callers) and kept in sync with dataSync.js.

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
      titulo:    a.titulo    ?? a.title    ?? '',
      fecha:     a.fecha     ?? a.date     ?? null,
      categoria: a.categoria ?? a.category ?? null,
      rol:       a.rol       ?? null,
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
      participante_id: String(pr.participante_id),
      rol:             pr.rol ?? null,
    })),
    gallery:          (ev.gallery ?? []).map((img) => ({
      id:    String(img.id),
      src:   img.src        ?? img.imagen_path ?? '',
      title: img.title      ?? img.titulo      ?? '',
      _serverImage: true,
    })),
    coverImageId:     ev.coverImageId   ?? ev.cover_image_id ?? null,
    createdAt:        ev.createdAt      ?? ev.created_at  ?? '',
  };
}
