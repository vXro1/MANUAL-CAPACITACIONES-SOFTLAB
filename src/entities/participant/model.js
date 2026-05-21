import { participantsRepository } from '@/storage/localStorageRepository';

export function useParticipants() {
  return participantsRepository.getAll();
}

export function useParticipant(id) {
  return participantsRepository.getById(id);
}
