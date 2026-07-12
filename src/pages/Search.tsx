import { useSearchParams } from 'react-router-dom';
import type { SearchType } from '@/types';
import { api } from '@/lib/tmdb';
import { useAsync } from '@/hooks/useAsync';
import MediaCard from '@/components/MediaCard';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const TYPE_TABS: Array<{ key: SearchType; label: string }> = [
  { key: 'all', label: 'Todo' },
  { key: 'movie', label: 'Películas' },
  { key: 'tv', label: 'Series' },
];

function parseType(value: string | null): SearchType {
  return value === 'movie' || value === 'tv' ? value : 'all';
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q')?.trim() ?? '';
  const type = parseType(params.get('tipo'));

  const { data, loading, error, reload } = useAsync(
    () => (query ? api.search(query, type) : Promise.resolve(null)),
    [query, type],
  );
  const results = data?.results ?? [];

  function setType(next: SearchType) {
    setParams(
      (prev) => {
        if (next === 'all') prev.delete('tipo');
        else prev.set('tipo', next);
        return prev;
      },
      { replace: true },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-100">
          {query ? (
            <>
              Resultados para <span className="text-accent-400">"{query}"</span>
            </>
          ) : (
            'Buscar'
          )}
        </h1>

        {query && (
          <div className="flex flex-wrap gap-2">
            {TYPE_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setType(t.key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  type === t.key
                    ? 'border-accent-500 bg-accent-500/10 text-accent-400'
                    : 'border-base-700 text-slate-400 hover:border-base-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!query ? (
        <EmptyState icon="🔎" title="Escribe algo para buscar" subtitle="Busca por título de película o serie." />
      ) : loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState title="No pudimos completar la búsqueda" onRetry={reload} />
      ) : results.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          subtitle={
            type === 'all'
              ? 'Prueba con otro título o revisa la ortografía.'
              : `No hay ${type === 'movie' ? 'películas' : 'series'} con ese título. Prueba con la pestaña "Todo".`
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((item) => (
            <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
