import type { Episode, MediaDetails, MediaItem, MediaType, NextEpisode, PaginatedResult, SearchType, SeasonSummary } from '@/types';
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

const EPISODES_PER_SEASON = 8;

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Temporadas sintéticas para el modo demo: una por año desde el estreno,
// con episodios semanales.
function mockSeasons(item: MockItem): SeasonSummary[] {
  const count = item.numberOfSeasons ?? 0;
  if (!item.releaseDate || count === 0) return [];
  return Array.from({ length: count }, (_, i) => ({
    id: item.id * 100 + i + 1,
    seasonNumber: i + 1,
    name: `Temporada ${i + 1}`,
    episodeCount: EPISODES_PER_SEASON,
    airDate: addDays(item.releaseDate as string, i * 365),
    posterPath: null,
  }));
}

function mockEpisodes(item: MockItem, seasonNumber: number): Episode[] {
  const season = mockSeasons(item).find((s) => s.seasonNumber === seasonNumber);
  if (!season?.airDate) return [];
  const seasonStart = season.airDate;
  return Array.from({ length: season.episodeCount }, (_, i) => ({
    id: item.id * 10000 + seasonNumber * 100 + i + 1,
    seasonNumber,
    episodeNumber: i + 1,
    name: `Episodio ${i + 1}`,
    overview: '',
    airDate: addDays(seasonStart, i * 7),
    runtime: 45,
  }));
}

function mockNextEpisode(item: MockItem): NextEpisode | null {
  const today = new Date().toISOString().slice(0, 10);
  for (const season of mockSeasons(item)) {
    const upcoming = mockEpisodes(item, season.seasonNumber).find((ep) => ep.airDate && ep.airDate > today);
    if (upcoming) {
      return {
        seasonNumber: upcoming.seasonNumber,
        episodeNumber: upcoming.episodeNumber,
        name: upcoming.name,
        airDate: upcoming.airDate,
      };
    }
  }
  return null;
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

  search(query: string, type: SearchType = 'all', page = 1): Promise<PaginatedResult<MediaItem>> {
    const q = query.trim().toLowerCase();
    const source = type === 'all' ? [...ALL_MOCK.movie, ...ALL_MOCK.tv] : ALL_MOCK[type];
    const pool = source.filter((i) => i.title.toLowerCase().includes(q));
    pool.sort((a, b) => b.popularity - a.popularity);
    return delay(paginate(stripTags(pool), page));
  },

  details(mediaType: MediaType, id: number): Promise<MediaDetails | null> {
    const item = ALL_MOCK[mediaType].find((i) => i.id === id);
    if (!item) return delay(null);
    const details = toMediaDetails(item);
    if (mediaType === 'tv') {
      details.seasons = mockSeasons(item);
      details.nextEpisode = mockNextEpisode(item);
    }
    return delay(details);
  },

  seasonEpisodes(tvId: number, seasonNumber: number): Promise<Episode[]> {
    const item = ALL_MOCK.tv.find((i) => i.id === tvId);
    return delay(item ? mockEpisodes(item, seasonNumber) : []);
  },
};
