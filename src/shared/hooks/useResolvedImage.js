import { useState, useEffect } from 'react';
import { resolveImageUrl, isImageIDBKey } from '@/storage/imageStorageService';

export function useResolvedImage(photoValue) {
  const [url, setUrl] = useState(() =>
    photoValue && !isImageIDBKey(photoValue) ? photoValue : null
  );

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    if (!photoValue) {
      setUrl(null);
      return;
    }

    if (!isImageIDBKey(photoValue)) {
      setUrl(photoValue);
      return;
    }

    resolveImageUrl(photoValue).then((resolved) => {
      if (cancelled) return;
      objectUrl = resolved;
      setUrl(resolved);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoValue]);

  return url;
}
