import type { MediaDetails, MediaItem, MediaType, PaginatedResult } from '@/types';
import { ALL_MOCK, MockItem, MockTag, toMediaDetails } from '@/lib/mockData';

const PAGE_SIZE = 8;

function paginate<T>(items: T[], page: number): PaginatedResult<T> {
  const start = (page - 1) * PAGE_SIZE;
  const results = items.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  return { results, page, totalPages };
}

function stripTags(items: MockItem[]): MediaItem[] {
  return items.map(({ tags: _tags, runtime: _r, numberOfSeasons: _s, numberOfEpisodes: _e, status: _st, tagline: _tl, ...rest }) => rest);
}

function byTag(mediaType: MediaType | 'all', tag: MockTag): MockItem[] {
  const pool = mediaType === 'all' ? [...ALL_MOCK.movie, ...ALL_MOCK.tv] : ALL_MOCK[mediaType];
  return pool.filter((i) => i.tags.includes(tag)).sort((a, b) => b.popularity - a.popularity);
}

// Simula latencia de red para que la UI de carga se sienta real.
function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const mockApi = {
  trending(mediaType: MediaType | 'all', timeWindow: 'day' | 'week', page = 1) {
    const tag: MockTag = timeWindow === 'day' ? 'trendingDay' : 'trendingWeek';
    return delay(paginate(stripTags(byTag(mediaType, tag)), page));
  },

  popular(mediaType: MediaType, page = 1) {
    return delay(paginate(stripTags(byTag(mediaType, 'popular')), page));
  },

  topRated(mediaType: MediaType, page = 1) {
    return delay(paginate(stripTags(byTag(mediaType, 'topRated')), page));
  },

  newReleases(mediaType: MediaType, page = 1) {
    return delay(paginate(stripTags(byTag(mediaType, 'newRelease')), page));
  },

  upcoming(mediaType: MediaType, page = 1) {
    return delay(paginate(stripTags(byTag(mediaType, 'upcoming')), page));
  },

  discover(
    mediaType: MediaType,
    opts: { genreId?: number | null; sortBy?: 'popularity' | 'rating' | 'releaseDate'; page?: number } = {},
  ): Promise<PaginatedResult<MediaItem>> {
    let pool = [...ALL_MOCK[mediaType]];
    if (opts.genreId) {
      pool = pool.filter((i) => i.genreIds.includes(opts.genreId!));
    }
    const sortBy = opts.sortBy ?? 'popularity';
    pool.sort((a, b) => {
      if (sortBy === 'rating') return b.voteAverage - a.voteAverage;
      if (sortBy === 'releaseDate') return (b.releaseDate ?? '').localeCompare(a.releaseDate ?? '');
      return b.popularity - a.popularity;
    });
    return delay(paginate(stripTags(pool), opts.page ?? 1));
  },

  search(query: string, page = 1): Promise<PaginatedResult<MediaItem>> {
    const q = query.trim().toLowerCase();
    const pool = [...ALL_MOCK.movie, ...ALL_MOCK.tv].filter((i) => i.title.toLowerCase().includes(q));
    pool.sort((a, b) => b.popularity - a.popularity);
    return delay(paginate(stripTags(pool), page));
  },

  details(mediaType: MediaType, id: number): Promise<MediaDetails | null> {
    const item = ALL_MOCK[mediaType].find((i) => i.id === id);
    return delay(item ? toMediaDetails(item) : null);
  },
};
