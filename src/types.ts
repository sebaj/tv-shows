export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  mediaType: MediaType;
  title: string;
  /** Título en su idioma original: permite buscar por el nombre en inglés. */
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  releaseDate: string | null;
  genreIds: number[];
}

export interface SeasonSummary {
  id: number;
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string | null;
  posterPath: string | null;
}

export interface Episode {
  id: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string | null;
  runtime: number | null;
}

export interface NextEpisode {
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  airDate: string | null;
}

export interface MediaDetails extends MediaItem {
  genres: Genre[];
  runtime: number | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  status: string | null;
  tagline: string | null;
  seasons: SeasonSummary[];
  nextEpisode: NextEpisode | null;
}

export type SearchType = 'all' | MediaType;

export type SharePermission = 'read' | 'write';

/** Un permiso que yo otorgué sobre mi agenda. */
export interface ShareGiven {
  sharedWithEmail: string;
  permission: SharePermission;
}

/** Una agenda ajena a la que me dieron acceso. */
export interface ShareReceived {
  ownerId: string;
  ownerEmail: string;
  permission: SharePermission;
}

export type AgendaStatus = 'pendiente' | 'viendo' | 'vista';

export interface AgendaEntry {
  id: number;
  mediaType: MediaType;
  title: string;
  /** Opcional: las entradas guardadas antes de esta función no lo tienen. */
  originalTitle?: string | null;
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
