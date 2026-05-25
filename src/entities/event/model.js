import { eventsRepository, eventCategoriesRepository } from '@/storage/localStorageRepository';

export function useEvents() {
  return eventsRepository.getAll();
}

export function useEvent(id) {
  return eventsRepository.getById(id);
}

export function useEventsByCategory(category) {
  if (!category) return eventsRepository.getAll();
  return eventsRepository.getByCategory(category);
}

export function useEventCategories() {
  return eventCategoriesRepository.getAll();
}
