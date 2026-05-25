/**
 * directivosApi — servicio frontend para el endpoint directivos.php
 *
 * DIAGNÓSTICO: Si ves "respuesta no válida del servidor", significa que el PHP
 * retorna HTML en vez de JSON. Causas comunes:
 *   1. El archivo directivos.php no está en la ruta correcta
 *   2. config.php tiene un error de BD y PHP imprime HTML de error
 *   3. La URL base (VITE_API_URL) no apunta al directorio correcto
 *
 * Abre DevTools → Network → busca la petición a directivos.php
 * y revisa la pestaña "Response" para ver qué devuelve exactamente.
 */

import { getToken } from './apiService';

// ─── Configuración de ruta ────────────────────────────────────────────────────
// Detecta automáticamente la ruta base del backend igual que apiService.js
// Si apiService usa una variable distinta, cámbiala aquí también.
const API_BASE = (() => {
  // 1. Variable de entorno explícita
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // 2. Misma base que la página actual + /api-backend (ajusta si tu carpeta tiene otro nombre)
  return '/api-backend';
})();

const ENDPOINT = `${API_BASE}/directivos.php`;

// Útil para depuración: muestra la URL en consola la primera vez
if (import.meta.env.DEV) {
  console.log('[directivosApi] endpoint →', ENDPOINT);
}

// ─── Headers ─────────────────────────────────────────────────────────────────

function authHeaders() {
  const token = getToken?.();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Fetch central con mejor manejo de errores ────────────────────────────────

async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers ?? {}) },
    });
  } catch (networkErr) {
    throw new Error('No se pudo conectar al servidor. Verifica que el backend esté activo.');
  }

  // Leer el cuerpo como texto primero para poder mostrar errores PHP
  const text = await res.text();

  // Intentar parsear como JSON
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // El servidor devolvió HTML/texto en vez de JSON
    const preview = text.slice(0, 300).replace(/<[^>]*>/g, ' ').trim();
    console.error('[directivosApi] Respuesta no-JSON desde', url, '\n', text.slice(0, 500));
    throw new Error(
      `El servidor devolvió una respuesta inesperada (código ${res.status}).\n` +
      `Verifica que directivos.php esté en: ${url}\n` +
      `Respuesta del servidor: ${preview}`
    );
  }

  if (!res.ok) {
    throw new Error(data?.error ?? `Error ${res.status} del servidor`);
  }

  return data;
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const directivosApi = {
  /** Obtiene todos los directivos */
  getAll() {
    return request(ENDPOINT);
  },

  /** Obtiene solo los destacados (para la página pública) */
  getFeatured() {
    return request(`${ENDPOINT}?featured=1`);
  },

  /** Obtiene un directivo por ID */
  getById(id) {
    return request(`${ENDPOINT}?id=${encodeURIComponent(id)}`);
  },

  /** Crea un nuevo directivo */
  create(data) {
    return request(ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Actualiza un directivo existente */
  update(id, data) {
    return request(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** Elimina un directivo */
  delete(id) {
    return request(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  /** Alterna el estado "destacado" de un directivo */
  toggleFeatured(id, currentFeatured) {
    return request(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ featured: !currentFeatured }),
    });
  },
};

// ─── Caché localStorage ───────────────────────────────────────────────────────

const LS_KEY = 'softlab_directors';

function saveToLS(directors) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(directors));
  } catch {}
}

export function getFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Sincroniza del servidor → localStorage */
export async function syncDirectivos() {
  try {
    const data = await directivosApi.getAll();
    saveToLS(data);
    return data;
  } catch (err) {
    console.warn('[directivosApi] Sin conexión al servidor, usando caché local:', err.message);
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