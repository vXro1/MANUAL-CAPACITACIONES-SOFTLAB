import { manuals as defaultManuals } from '@/data/manuals';
import { participants as defaultParticipants } from '@/data/participants';
import { speakers as defaultSpeakers } from '@/data/speakers';

const KEYS = {
  MANUALS: 'softlab_manuals',
  PARTICIPANTS: 'softlab_participants',
  SPEAKERS: 'softlab_speakers',
  ADMIN_AUTH: 'softlab_admin_auth',
  GALLERY: 'softlab_gallery',
  DIRECTORS: 'softlab_directors',
};

function getItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const manualsRepository = {
  getAll() {
    return getItem(KEYS.MANUALS, defaultManuals);
  },

  getById(id) {
    const all = this.getAll();
    return all.find((m) => m.id === id) ?? null;
  },

  getFeatured() {
    return this.getAll().filter((m) => m.featured);
  },

  getByCategory(category) {
    return this.getAll().filter((m) => m.category === category);
  },

  save(manual) {
    const all = this.getAll();
    const index = all.findIndex((m) => m.id === manual.id);
    if (index >= 0) {
      all[index] = manual;
    } else {
      all.unshift({ ...manual, id: Date.now().toString() });
    }
    return setItem(KEYS.MANUALS, all);
  },

  delete(id) {
    const filtered = this.getAll().filter((m) => m.id !== id);
    return setItem(KEYS.MANUALS, filtered);
  },

  reset() {
    return setItem(KEYS.MANUALS, defaultManuals);
  },
};

export const participantsRepository = {
  getAll() {
    return getItem(KEYS.PARTICIPANTS, defaultParticipants);
  },

  getById(id) {
    return this.getAll().find((p) => p.id === id) ?? null;
  },

  save(participant) {
    const all = this.getAll();
    const index = all.findIndex((p) => p.id === participant.id);
    if (index >= 0) {
      all[index] = participant;
    } else {
      all.push({ ...participant, id: Date.now().toString() });
    }
    return setItem(KEYS.PARTICIPANTS, all);
  },

  delete(id) {
    const filtered = this.getAll().filter((p) => p.id !== id);
    return setItem(KEYS.PARTICIPANTS, filtered);
  },
};

export const speakersRepository = {
  getAll() {
    return getItem(KEYS.SPEAKERS, defaultSpeakers);
  },

  getById(id) {
    return this.getAll().find((s) => s.id === id) ?? null;
  },
};

export const galleryRepository = {
  getAll() {
    return getItem(KEYS.GALLERY, []);
  },

  getFeatured() {
    return this.getAll().filter((img) => img.featured);
  },

  save(image) {
    const all = this.getAll();
    const index = all.findIndex((i) => i.id === image.id);
    if (index >= 0) {
      all[index] = image;
    } else {
      all.unshift({ ...image, id: Date.now().toString(), uploadedAt: new Date().toISOString() });
    }
    return setItem(KEYS.GALLERY, all);
  },

  delete(id) {
    const filtered = this.getAll().filter((i) => i.id !== id);
    return setItem(KEYS.GALLERY, filtered);
  },

  toggleFeatured(id) {
    const all = this.getAll();
    const index = all.findIndex((i) => i.id === id);
    if (index >= 0) {
      all[index] = { ...all[index], featured: !all[index].featured };
      setItem(KEYS.GALLERY, all);
    }
  },
};

export const adminAuthRepository = {
  ADMIN_PASSWORD: 'softlab2024',

  isAuthenticated() {
    return getItem(KEYS.ADMIN_AUTH, false);
  },

  login(password) {
    if (password === this.ADMIN_PASSWORD) {
      setItem(KEYS.ADMIN_AUTH, true);
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem(KEYS.ADMIN_AUTH);
  },
};

export const directorsRepository = {
  getAll() {
    return getItem(KEYS.DIRECTORS, []);
  },

  getById(id) {
    return this.getAll().find((d) => d.id === id) ?? null;
  },

  getFeatured() {
    return this.getAll().filter((d) => d.featured);
  },

  save(director) {
    const all = this.getAll();
    const index = all.findIndex((d) => d.id === director.id);
    if (index >= 0) {
      all[index] = director;
    } else {
      all.unshift({ ...director, id: Date.now().toString(), createdAt: new Date().toISOString() });
    }
    return setItem(KEYS.DIRECTORS, all);
  },

  delete(id) {
    const filtered = this.getAll().filter((d) => d.id !== id);
    return setItem(KEYS.DIRECTORS, filtered);
  },

  toggleFeatured(id) {
    const all = this.getAll();
    const index = all.findIndex((d) => d.id === id);
    if (index >= 0) {
      all[index] = { ...all[index], featured: !all[index].featured };
      setItem(KEYS.DIRECTORS, all);
    }
    return this.getById(id);
  },
};