import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { MediaItem } from '@/types';
import { api } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.search(query).then((res) => {
      if (!cancelled) {
        setResults(res.results);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

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

      {!query.trim() ? (
        <EmptyState icon="🔎" title="Escribe algo para buscar" subtitle="Busca por título de película o serie." />
      ) : loading ? (
        <Spinner />
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
