const DB_NAME = 'softlab_pdf_storage';
const STORE_NAME = 'pdfs';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export const PDF_IDB_PREFIX = 'idb:';

export async function storePDFFile(manualId, file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(file, manualId);
    request.onsuccess = () => resolve(`${PDF_IDB_PREFIX}${manualId}`);
    request.onerror = () => reject(request.error);
  });
}

export async function getPDFBlob(manualId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(manualId);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePDFFile(manualId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(manualId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function isIDBKey(value) {
  return typeof value === 'string' && value.startsWith(PDF_IDB_PREFIX);
}

export function getIDFromKey(key) {
  return key.replace(PDF_IDB_PREFIX, '');
}

export async function resolvePDFUrl(pdfValue) {
  if (!pdfValue) return null;
  if (!isIDBKey(pdfValue)) return pdfValue;
  const id = getIDFromKey(pdfValue);
  const blob = await getPDFBlob(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}
