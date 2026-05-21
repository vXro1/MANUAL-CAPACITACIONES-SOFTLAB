import { manualsRepository } from '@/storage/localStorageRepository';

export function useManuals() {
  return manualsRepository.getAll();
}

export function useManual(id) {
  return manualsRepository.getById(id);
}

export function useFeaturedManuals() {
  return manualsRepository.getFeatured();
}

export function getCategories(manuals) {
  return [...new Set(manuals.map((m) => m.category))];
}
