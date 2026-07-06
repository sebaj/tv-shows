import { useEffect, useState } from 'react';
import type { MediaItem, MediaType } from '@/types';
import { api } from '@/lib/tmdb';
import { genresFor } from '@/lib/genres';
import MediaCard from '@/components/MediaCard';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

type SortBy = 'popularity' | 'rating' | 'releaseDate';

export default function Catalog({ mediaType }: { mediaType: MediaType }) {
  const genres = genresFor(mediaType);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('popularity');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    api.discover(mediaType, { genreId, sortBy, page }).then(
      (res) => {
        if (cancelled) return;
        setItems((prev) => (page === 1 ? res.results : [...prev, ...res.results]));
        setTotalPages(res.totalPages);
        setLoading(false);
      },
      () => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [mediaType, genreId, sortBy, page, attempt]);

  const retry = () => setAttempt((a) => a + 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-100">{mediaType === 'movie' ? 'Películas' : 'Series'}</h1>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={genreId ?? ''}
            onChange={(e) => {
              setGenreId(e.target.value ? Number(e.target.value) : null);
              setPage(1);
            }}
            className="rounded-lg border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-slate-200 focus:border-accent-500 focus:outline-none"
          >
            <option value="">Todos los géneros</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortBy);
              setPage(1);
            }}
            className="rounded-lg border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-slate-200 focus:border-accent-500 focus:outline-none"
          >
            <option value="popularity">Más populares</option>
            <option value="rating">Mejor valoradas</option>
            <option value="releaseDate">Más recientes</option>
          </select>
        </div>
      </div>

      {items.length === 0 && loading ? (
        <Spinner />
      ) : error && items.length === 0 ? (
        <ErrorState title="No pudimos cargar el catálogo" onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState title="Sin resultados" subtitle="Prueba con otro género o criterio de orden." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item) => (
              <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
            ))}
          </div>

          {error ? (
            <button
              type="button"
              onClick={retry}
              className="mx-auto w-fit rounded-lg border border-red-500/50 px-5 py-2 text-sm font-medium text-red-400 hover:border-red-500"
            >
              Error al cargar más. Reintentar
            </button>
          ) : (
            page < totalPages && (
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="mx-auto w-fit rounded-lg border border-base-700 px-5 py-2 text-sm font-medium text-slate-200 hover:border-accent-500 hover:text-accent-400 disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            )
          )}
        </>
      )}
    </div>
  );
}
