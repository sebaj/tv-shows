import type { Genre, MediaType } from '@/types';

export const MOVIE_GENRES: Genre[] = [
  { id: 28, name: 'Acción' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' },
  { id: 80, name: 'Crimen' },
  { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Familia' },
  { id: 14, name: 'Fantasía' },
  { id: 36, name: 'Historia' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Misterio' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ciencia ficción' },
  { id: 53, name: 'Suspenso' },
  { id: 10752, name: 'Bélica' },
  { id: 37, name: 'Western' },
];

export const TV_GENRES: Genre[] = [
  { id: 10759, name: 'Acción y aventura' },
  { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' },
  { id: 80, name: 'Crimen' },
  { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Familia' },
  { id: 9648, name: 'Misterio' },
  { id: 10765, name: 'Ciencia ficción y fantasía' },
  { id: 10768, name: 'Bélica y política' },
  { id: 37, name: 'Western' },
];

export function genresFor(mediaType: MediaType): Genre[] {
  return mediaType === 'movie' ? MOVIE_GENRES : TV_GENRES;
}

export function genreNames(ids: number[], mediaType: MediaType): string[] {
  const list = genresFor(mediaType);
  return ids
    .map((id) => list.find((g) => g.id === id)?.name)
    .filter((n): n is string => Boolean(n));
}
