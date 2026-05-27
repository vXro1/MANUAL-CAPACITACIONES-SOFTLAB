import { getToken } from './apiService';

const ENDPOINT = 'https://semillerosoftlab.com/api-backend/directivos.php';

function withToken(url) {
  const token = getToken();
  if (!token) return url;
  const sep = url.includes('?') ? '&' : '?';
  return url + sep + '_token=' + encodeURIComponent(token);
}

async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(withToken(url), {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    });
  } catch {
    throw new Error('No se pudo conectar al servidor. Verifica que el backend esté activo.');
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    const preview = text.slice(0, 300).replace(/<[^>]*>/g, ' ').trim();
    console.error('[directivosApi] Respuesta no-JSON desde', url, '\n', text.slice(0, 500));
    throw new Error(
      `El servidor devolvió una respuesta inesperada (código ${res.status}).\n` +
      `Respuesta: ${preview}`
    );
  }

  if (!res.ok) {
    throw new Error(data?.error ?? `Error ${res.status} del servidor`);
  }

  return data;
}

export const directivosApi = {
  getAll() {
    return request(ENDPOINT);
  },

  getFeatured() {
    return request(`${ENDPOINT}?featured=1`);
  },

  getById(id) {
    return request(`${ENDPOINT}?id=${encodeURIComponent(id)}`);
  },

  /** Campos que acepta: name, role, profession, faculty, description,
   *  highlights, chips[], docs[], photo, accent, bg, border, badge, featured */
  create(data) {
    return request(ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return request(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return request(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  toggleFeatured(id, currentFeatured) {
    return request(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ featured: !currentFeatured }),
    });
  },
};

const LS_KEY = 'softlab_directors';

export function getFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function syncDirectivos() {
  try {
    const data = await directivosApi.getAll();
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
    return data;
  } catch (err) {
    console.warn('[directivosApi] Sin conexión, usando caché:', err.message);
    return getFromLS();
  }
}

export async function syncDirectivosFeatured() {
  try {
    return await directivosApi.getFeatured();
  } catch {
    return getFromLS().filter((d) => d.featured);
  }
}
