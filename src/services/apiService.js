import {
  normalizeManual,
  normalizeParticipant,
  normalizeGalleryImage,
  normalizeEvento,
} from './normalizers';

const API_BASE = 'https://semillerosoftlab.com/api-backend';

// ─── Token admin ───────────────────────────────────────────────────────────────
const TOKEN_KEY = 'softlab_api_token';

export function getToken()          { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t)         { localStorage.setItem(TOKEN_KEY, t); }
export function removeToken()       { localStorage.removeItem(TOKEN_KEY); }

// ─── Cliente base ──────────────────────────────────────────────────────────────

// Cuando un endpoint devuelve 401, verificamos primero si el token sigue siendo válido.
// Si la comprobación de auth también falla → logout real.
// Si el token sigue siendo válido → el 401 es un bug del endpoint, no cerramos sesión.
function handleUnauth(status) {
  if (status !== 401) return;
  const token = getToken();
  if (!token) return;

  fetch(API_BASE + '/auth.php?action=check', {
    headers: { 'X-Admin-Token': token },
  })
    .then((r) => r.json())
    .then((json) => {
      if (!json.ok) {
        removeToken();
        if (window.location.pathname.startsWith('/panel-softlab-admin')) {
          window.location.reload();
        }
      }
      // Si json.ok es true → token válido, el 401 fue de un endpoint específico; no cerramos sesión
    })
    .catch(() => {
      // Error de red: no cerramos sesión para no expulsar al usuario sin motivo
    });
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers ?? {}) };
  if (token) headers['X-Admin-Token'] = token;

  const res  = await fetch(API_BASE + path, { ...options, headers });
  const json = await res.json();
  if (!json.ok) {
    handleUnauth(res.status);
    throw new Error(json.error ?? 'Error del servidor');
  }
  return json.data;
}

// Petición con FormData (para subir archivos)
async function requestForm(path, formData, method = 'POST') {
  const token = getToken();
  const headers = {};
  let url = API_BASE + path;
  if (token) {
    headers['X-Admin-Token'] = token;
    // Hostinger elimina headers en multipart: enviamos el token también como
    // query param ($_GET) y campo de formulario ($_POST) para triple fallback.
    formData.append('_token', token);
    url += (path.includes('?') ? '&' : '?') + '_token=' + encodeURIComponent(token);
  }

  const res  = await fetch(url, { method, body: formData, headers });
  const json = await res.json();
  if (!json.ok) {
    handleUnauth(res.status);
    throw new Error(json.error ?? 'Error del servidor');
  }
  return json.data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  async login({ username, password }) {
    const data = await request('/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    });
    setToken(data.token);
    return data;
  },

  async logout() {
    await request('/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
    removeToken();
  },

  async check() {
    return request('/auth.php?action=check');
  },
};

// ─── Manuales ──────────────────────────────────────────────────────────────────
export const manualesApi = {
  getAll()    { return request('/manuales.php').then(data => (data ?? []).map(normalizeManual)); },
  getById(id) { return request(`/manuales.php?id=${id}`).then(normalizeManual); },

  create(datos, pdfFile, imagenFile) {
    const fd = new FormData();
    fd.append('data', JSON.stringify(datos));
    if (pdfFile)    fd.append('pdf',    pdfFile);
    if (imagenFile) fd.append('imagen', imagenFile);
    return requestForm('/manuales.php', fd, 'POST');
  },

  update(id, datos, pdfFile, imagenFile) {
    const fd = new FormData();
    fd.append('data', JSON.stringify(datos));
    if (pdfFile)    fd.append('pdf',    pdfFile);
    if (imagenFile) fd.append('imagen', imagenFile);
    // PHP no parsea $_POST/$_FILES en PUT multipart; usamos POST + _method override
    return requestForm(`/manuales.php?id=${id}&_method=PUT`, fd, 'POST');
  },

  delete(id) {
    return request(`/manuales.php?id=${id}`, { method: 'DELETE' });
  },
};

// ─── Participantes ─────────────────────────────────────────────────────────────
export const participantesApi = {
  getAll()    { return request('/participantes.php').then(data => (data ?? []).map(normalizeParticipant)); },
  getById(id) { return request(`/participantes.php?id=${id}`).then(normalizeParticipant); },

  create(datos, fotoFile) {
    const fd = new FormData();
    fd.append('data', JSON.stringify(datos));
    if (fotoFile) fd.append('foto', fotoFile);
    return requestForm('/participantes.php', fd, 'POST');
  },

  update(id, datos, fotoFile) {
    const fd = new FormData();
    fd.append('data', JSON.stringify(datos));
    if (fotoFile) fd.append('foto', fotoFile);
    // PHP no parsea $_POST/$_FILES en PUT multipart; usamos POST + _method override
    return requestForm(`/participantes.php?id=${id}&_method=PUT`, fd, 'POST');
  },

  delete(id) {
    return request(`/participantes.php?id=${id}`, { method: 'DELETE' });
  },
};

// ─── Evidencias (fotos de manuales) ───────────────────────────────────────────
export const evidenciasApi = {
  upload(imagenFile) {
    const fd = new FormData();
    fd.append('imagen', imagenFile);
    return requestForm('/evidencias.php', fd, 'POST');
  },

  delete(url) {
    return request('/evidencias.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  },
};

// ─── Galería ───────────────────────────────────────────────────────────────────
export const galeriaApi = {
  getAll()        { return request('/galeria.php').then(data => (data ?? []).map(normalizeGalleryImage)); },
  getFeatured()   { return request('/galeria.php?featured').then(data => (data ?? []).map(normalizeGalleryImage)); },

  upload(imagenFile, titulo = '') {
    const fd = new FormData();
    fd.append('imagen', imagenFile);
    fd.append('data', JSON.stringify({ title: titulo }));
    return requestForm('/galeria.php', fd, 'POST');
  },

  toggleFeatured(id) {
    return request(`/galeria.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toggle_featured: true }),
    });
  },

  delete(id) {
    return request(`/galeria.php?id=${id}`, { method: 'DELETE' });
  },
};

// ─── Eventos ───────────────────────────────────────────────────────────────────
export const eventosApi = {
  getAll()    { return request('/eventos.php').then(data => (data ?? []).map(normalizeEvento)); },
  getById(id) { return request(`/eventos.php?id=${id}`).then(normalizeEvento); },
  create(datos) {
    return request('/eventos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
  },
  update(id, datos) {
    return request(`/eventos.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
  },
  delete(id) { return request(`/eventos.php?id=${id}`, { method: 'DELETE' }); },
};

// ─── Galería de eventos ────────────────────────────────────────────────────────
export const eventosGaleriaApi = {
  upload(eventoId, imagenFile, titulo = '') {
    const fd = new FormData();
    fd.append('evento_id', String(eventoId));
    fd.append('imagen', imagenFile);
    fd.append('titulo', titulo);
    return requestForm('/eventos_galeria.php', fd, 'POST');
  },
  delete(id) { return request(`/eventos_galeria.php?id=${id}`, { method: 'DELETE' }); },
};

// ─── Categorías de eventos ────────────────────────────────────────────────────
export const categoriasEventosApi = {
  getAll() { return request('/categorias_eventos.php'); },
  create(nombre) {
    return request('/categorias_eventos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    });
  },
  delete(id) { return request(`/categorias_eventos.php?id=${id}`, { method: 'DELETE' }); },
};
