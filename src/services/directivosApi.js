import { getToken } from './apiService';

const ENDPOINT = 'https://semillerosoftlab.com/api-backend/directivos.php';
const LS_KEY   = 'softlab_directors';

// ─── Cliente interno ──────────────────────────────────────────────────────────

/**
 * Adjunta el token de admin de tres formas (header, query param, campo POST)
 * para sobrevivir a los proxies de Hostinger que eliminan headers en multipart.
 * Para peticiones JSON normales basta con el header; los otros dos son fallback.
 */
function buildUrl(base, extraParams = {}) {
  const token = getToken();
  const url   = new URL(base);
  Object.entries(extraParams).forEach(([k, v]) => url.searchParams.set(k, v));
  if (token) url.searchParams.set('_token', token);
  return url.toString();
}

function authHeaders() {
  const token = getToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['X-Admin-Token'] = token;
  return h;
}

/**
 * Petición JSON genérica.
 * El backend devuelve el objeto directamente (no envuelto en { ok, data }).
 * En caso de error HTTP el body contiene { error: "..." }.
 */
async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers ?? {}) },
    });
  } catch {
    throw new Error('No se pudo conectar al servidor. Verifica tu conexión.');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    // Respuesta no-JSON: PHP devolvió HTML (error 500, error de sintaxis, etc.)
    const preview = (await res.text?.())?.slice(0, 200).replace(/<[^>]*>/g, ' ').trim();
    throw new Error(
      `El servidor devolvió una respuesta inesperada (HTTP ${res.status}).` +
      (preview ? `\nDetalle: ${preview}` : ''),
    );
  }

  if (!res.ok) {
    throw new Error(data?.error ?? `Error ${res.status} del servidor`);
  }

  return data;
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const directivosApi = {
  /** Trae TODOS los directivos (panel admin) */
  getAll() {
    return request(buildUrl(ENDPOINT));
  },

  /** Solo los marcados como featured (portada pública) */
  getFeatured() {
    return request(buildUrl(ENDPOINT, { featured: '1' }));
  },

  getById(id) {
    return request(buildUrl(ENDPOINT, { id }));
  },

  create(data) {
    return request(buildUrl(ENDPOINT), {
      method: 'POST',
      body:   JSON.stringify(data),
    });
  },

  update(id, data) {
    return request(buildUrl(ENDPOINT, { id }), {
      method: 'PUT',
      body:   JSON.stringify(data),
    });
  },

  delete(id) {
    return request(buildUrl(ENDPOINT, { id }), {
      method: 'DELETE',
    });
  },

  /**
   * Invierte el flag `featured` del directivo indicado.
   * @param {string|number} id
   * @param {boolean} currentFeatured  — valor actual; se envía el opuesto
   */
  toggleFeatured(id, currentFeatured) {
    return request(buildUrl(ENDPOINT, { id }), {
      method: 'PUT',
      body:   JSON.stringify({ featured: !currentFeatured }),
    });
  },
};

// ─── Caché local (localStorage) ───────────────────────────────────────────────

export function getFromLS() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

/**
 * Descarga todos los directivos y los guarda en localStorage.
 * Si hay error de red, devuelve lo que haya en caché.
 */
export async function syncDirectivos() {
  try {
    const data = await directivosApi.getAll();
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* cuota llena */ }
    return data;
  } catch (err) {
    console.warn('[directivosApi] Sin conexión, usando caché:', err.message);
    return getFromLS();
  }
}

/**
 * Devuelve los directivos destacados.
 * Fallback: filtra el caché local.
 */
export async function syncDirectivosFeatured() {
  try {
    return await directivosApi.getFeatured();
  } catch {
    return getFromLS().filter((d) => d.featured);
  }
}