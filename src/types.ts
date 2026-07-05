export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  releaseDate: string | null;
  genreIds: number[];
}

export interface MediaDetails extends MediaItem {
  genres: Genre[];
  runtime: number | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  status: string | null;
  tagline: string | null;
}

export type AgendaStatus = 'pendiente' | 'viendo' | 'vista';

export interface AgendaEntry {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  status: AgendaStatus;
  scheduledDate: string | null;
  addedAt: string;
}

export interface PaginatedResult<T> {
  results: T[];
  page: number;
  totalPages: number;
}
