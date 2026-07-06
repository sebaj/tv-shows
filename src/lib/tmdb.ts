import type { Episode, MediaDetails, MediaItem, MediaType, PaginatedResult, SearchType } from '@/types';
import { mockApi } from '@/lib/mockApi';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
export const IS_DEMO = !API_KEY;

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getImageUrl(path: string | null, size: 'w200' | 'w342' | 'w500' | 'original' = 'w500'): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

async function fetchTMDB<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY ?? '');
  url.searchParams.set('language', 'es-ES');
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

interface RawMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  release_date: string | null;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number | null;
  status?: string;
  tagline?: string;
}

interface RawSeason {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
}

interface RawEpisode {
  id: number;
  season_number: number;
  episode_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  runtime: number | null;
}

interface RawTv {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  first_air_date: string | null;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
  seasons?: RawSeason[];
  next_episode_to_air?: RawEpisode | null;
}

interface RawMulti extends RawMovie, RawTv {
  media_type?: 'movie' | 'tv' | 'person';
}

function normalizeMovie(raw: RawMovie): MediaItem {
  return {
    id: raw.id,
    mediaType: 'movie',
    title: raw.title,
    overview: raw.overview,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    voteAverage: raw.vote_average,
    voteCount: raw.vote_count,
    popularity: raw.popularity,
    releaseDate: raw.release_date,
    genreIds: raw.genre_ids ?? raw.genres?.map((g) => g.id) ?? [],
  };
}

function normalizeTv(raw: RawTv): MediaItem {
  return {
    id: raw.id,
    mediaType: 'tv',
    title: raw.name,
    overview: raw.overview,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    voteAverage: raw.vote_average,
    voteCount: raw.vote_count,
    popularity: raw.popularity,
    releaseDate: raw.first_air_date,
    genreIds: raw.genre_ids ?? raw.genres?.map((g) => g.id) ?? [],
  };
}

function normalizeMovieDetails(raw: RawMovie): MediaDetails {
  return {
    ...normalizeMovie(raw),
    genres: raw.genres ?? [],
    runtime: raw.runtime ?? null,
    numberOfSeasons: null,
    numberOfEpisodes: null,
    status: raw.status ?? null,
    tagline: raw.tagline ?? null,
    seasons: [],
    nextEpisode: null,
  };
}

function normalizeEpisode(raw: RawEpisode): Episode {
  return {
    id: raw.id,
    seasonNumber: raw.season_number,
    episodeNumber: raw.episode_number,
    name: raw.name,
    overview: raw.overview,
    airDate: raw.air_date,
    runtime: raw.runtime ?? null,
  };
}

function normalizeTvDetails(raw: RawTv): MediaDetails {
  const next = raw.next_episode_to_air;
  return {
    ...normalizeTv(raw),
    genres: raw.genres ?? [],
    runtime: null,
    numberOfSeasons: raw.number_of_seasons ?? null,
    numberOfEpisodes: raw.number_of_episodes ?? null,
    status: raw.status ?? null,
    tagline: raw.tagline ?? null,
    seasons: (raw.seasons ?? []).map((s) => ({
      id: s.id,
      seasonNumber: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
      airDate: s.air_date,
      posterPath: s.poster_path,
    })),
    nextEpisode: next
      ? { seasonNumber: next.season_number, episodeNumber: next.episode_number, name: next.name, airDate: next.air_date }
      : null,
  };
}

interface TMDBListResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
}

function toPaginated<T>(res: TMDBListResponse<T>, mapper: (raw: T) => MediaItem): PaginatedResult<MediaItem> {
  return {
    results: res.results.map(mapper),
    page: res.page,
    totalPages: res.total_pages,
  };
}

const realApi = {
  async trending(mediaType: MediaType | 'all', timeWindow: 'day' | 'week', page = 1): Promise<PaginatedResult<MediaItem>> {
    const res = await fetchTMDB<TMDBListResponse<RawMulti>>(`/trending/${mediaType}/${timeWindow}`, { page });
    return toPaginated(res, (raw) => (raw.media_type === 'tv' || mediaType === 'tv' ? normalizeTv(raw) : normalizeMovie(raw)));
  },

  async popular(mediaType: MediaType, page = 1): Promise<PaginatedResult<MediaItem>> {
    const res = await fetchTMDB<TMDBListResponse<RawMovie & RawTv>>(`/${mediaType}/popular`, { page });
    return toPaginated(res, mediaType === 'movie' ? normalizeMovie : normalizeTv);
  },

  async topRated(mediaType: MediaType, page = 1): Promise<PaginatedResult<MediaItem>> {
    const res = await fetchTMDB<TMDBListResponse<RawMovie & RawTv>>(`/${mediaType}/top_rated`, { page });
    return toPaginated(res, mediaType === 'movie' ? normalizeMovie : normalizeTv);
  },

  async newReleases(mediaType: MediaType, page = 1): Promise<PaginatedResult<MediaItem>> {
    const endpoint = mediaType === 'movie' ? '/movie/now_playing' : '/tv/airing_today';
    const res = await fetchTMDB<TMDBListResponse<RawMovie & RawTv>>(endpoint, { page });
    return toPaginated(res, mediaType === 'movie' ? normalizeMovie : normalizeTv);
  },

  async upcoming(mediaType: MediaType, page = 1): Promise<PaginatedResult<MediaItem>> {
    const endpoint = mediaType === 'movie' ? '/movie/upcoming' : '/tv/on_the_air';
    const res = await fetchTMDB<TMDBListResponse<RawMovie & RawTv>>(endpoint, { page });
    return toPaginated(res, mediaType === 'movie' ? normalizeMovie : normalizeTv);
  },

  async discover(
    mediaType: MediaType,
    opts: { genreId?: number | null; sortBy?: 'popularity' | 'rating' | 'releaseDate'; page?: number } = {},
  ): Promise<PaginatedResult<MediaItem>> {
    const sortMap = {
      popularity: 'popularity.desc',
      rating: 'vote_average.desc',
      releaseDate: mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc',
    };
    const res = await fetchTMDB<TMDBListResponse<RawMovie & RawTv>>(`/discover/${mediaType}`, {
      page: opts.page ?? 1,
      with_genres: opts.genreId ?? undefined,
      sort_by: sortMap[opts.sortBy ?? 'popularity'],
      ...(opts.sortBy === 'rating' ? { 'vote_count.gte': 50 } : {}),
    });
    return toPaginated(res, mediaType === 'movie' ? normalizeMovie : normalizeTv);
  },

  async search(query: string, type: SearchType = 'all', page = 1): Promise<PaginatedResult<MediaItem>> {
    if (type !== 'all') {
      const res = await fetchTMDB<TMDBListResponse<RawMovie & RawTv>>(`/search/${type}`, { query, page });
      return toPaginated(res, type === 'movie' ? normalizeMovie : normalizeTv);
    }
    const res = await fetchTMDB<TMDBListResponse<RawMulti>>('/search/multi', { query, page });
    const filtered = res.results.filter((r) => r.media_type === 'movie' || r.media_type === 'tv');
    return {
      results: filtered.map((raw) => (raw.media_type === 'tv' ? normalizeTv(raw) : normalizeMovie(raw))),
      page: res.page,
      totalPages: res.total_pages,
    };
  },

  async seasonEpisodes(tvId: number, seasonNumber: number): Promise<Episode[]> {
    const raw = await fetchTMDB<{ episodes: RawEpisode[] }>(`/tv/${tvId}/season/${seasonNumber}`, {});
    return raw.episodes.map(normalizeEpisode);
  },

  async details(mediaType: MediaType, id: number): Promise<MediaDetails | null> {
    try {
      const raw = await fetchTMDB<RawMovie & RawTv>(`/${mediaType}/${id}`, {});
      return mediaType === 'movie' ? normalizeMovieDetails(raw) : normalizeTvDetails(raw);
    } catch {
      return null;
    }
  },
};

export const api = IS_DEMO ? mockApi : realApi;
