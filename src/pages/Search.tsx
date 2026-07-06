import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/tmdb';
import { useAsync } from '@/hooks/useAsync';
import MediaCard from '@/components/MediaCard';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get('q')?.trim() ?? '';

  const { data, loading, error, reload } = useAsync(
    () => (query ? api.search(query) : Promise.resolve(null)),
    [query],
  );
  const results = data?.results ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-100">
        {query ? (
          <>
            Resultados para <span className="text-accent-400">"{query}"</span>
          </>
        ) : (
          'Buscar'
        )}
      </h1>

      {!query ? (
        <EmptyState icon="🔎" title="Escribe algo para buscar" subtitle="Busca por título de película o serie." />
      ) : loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState title="No pudimos completar la búsqueda" onRetry={reload} />
      ) : results.length === 0 ? (
        <EmptyState title="Sin resultados" subtitle="Prueba con otro título o revisa la ortografía." />
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
