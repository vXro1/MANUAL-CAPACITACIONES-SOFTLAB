import { useState, useEffect } from 'react';
import { resolveImageUrl } from '@/storage/imageStorageService';

export function useResolvedGallery(gallery = []) {
  const [resolved, setResolved] = useState([]);

  const galleryKey = gallery?.join(',') ?? '';

  useEffect(() => {
    if (!gallery || gallery.length === 0) {
      setResolved([]);
      return;
    }

    let cancelled = false;
    const blobUrls = [];

    Promise.all(
      gallery.map(async (item) => {
        const url = await resolveImageUrl(item);
        if (url?.startsWith('blob:')) blobUrls.push(url);
        return url;
      })
    ).then((urls) => {
      if (!cancelled) setResolved(urls.filter(Boolean));
    });

    return () => {
      cancelled = true;
      blobUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [galleryKey]);

  return resolved;
}
