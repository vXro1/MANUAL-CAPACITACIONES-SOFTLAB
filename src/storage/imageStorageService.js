const DB_NAME = 'softlab_image_storage';
const STORE_NAME = 'images';
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

export const IMAGE_IDB_PREFIX = 'img:';

export async function storeImage(key, file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(file, key);
    request.onsuccess = () => resolve(`${IMAGE_IDB_PREFIX}${key}`);
    request.onerror = () => reject(request.error);
  });
}

export async function getImageBlob(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteImage(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function isImageIDBKey(value) {
  return typeof value === 'string' && value.startsWith(IMAGE_IDB_PREFIX);
}

export function getRawKey(idbKey) {
  return idbKey.replace(IMAGE_IDB_PREFIX, '');
}

export async function resolveImageUrl(photoValue) {
  if (!photoValue) return null;
  if (!isImageIDBKey(photoValue)) return photoValue;
  const rawKey = getRawKey(photoValue);
  const blob = await getImageBlob(rawKey);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}
