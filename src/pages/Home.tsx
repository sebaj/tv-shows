import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MediaItem } from '@/types';
import { api, getImageUrl, IS_DEMO } from '@/lib/tmdb';
import MediaRow from '@/components/MediaRow';
import { ratingColor, yearOf } from '@/lib/format';

interface Sections {
  trendingDay: MediaItem[];
  trendingWeek: MediaItem[];
  popularMovies: MediaItem[];
  popularTv: MediaItem[];
  topRatedMovies: MediaItem[];
  topRatedTv: MediaItem[];
  newMovies: MediaItem[];
  newTv: MediaItem[];
  upcomingMovies: MediaItem[];
  upcomingTv: MediaItem[];
}

const EMPTY: Sections = {
  trendingDay: [],
  trendingWeek: [],
  popularMovies: [],
  popularTv: [],
  topRatedMovies: [],
  topRatedTv: [],
  newMovies: [],
  newTv: [],
  upcomingMovies: [],
  upcomingTv: [],
};

export default function Home() {
  const [sections, setSections] = useState<Sections>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      api.trending('all', 'day'),
      api.trending('all', 'week'),
      api.popular('movie'),
      api.popular('tv'),
      api.topRated('movie'),
      api.topRated('tv'),
      api.newReleases('movie'),
      api.newReleases('tv'),
      api.upcoming('movie'),
      api.upcoming('tv'),
    ])
      .then(
        ([
          trendingDay,
          trendingWeek,
          popularMovies,
          popularTv,
          topRatedMovies,
          topRatedTv,
          newMovies,
          newTv,
          upcomingMovies,
          upcomingTv,
        ]) => {
          if (cancelled) return;
          setSections({
            trendingDay: trendingDay.results,
            trendingWeek: trendingWeek.results,
            popularMovies: popularMovies.results,
            popularTv: popularTv.results,
            topRatedMovies: topRatedMovies.results,
            topRatedTv: topRatedTv.results,
            newMovies: newMovies.results,
            newTv: newTv.results,
            upcomingMovies: upcomingMovies.results,
            upcomingTv: upcomingTv.results,
          });
        },
      )
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const hero = sections.trendingDay[0];
  const backdrop = hero ? getImageUrl(hero.backdropPath, 'original') : null;

  return (
    <div className="flex flex-col gap-10">
      {IS_DEMO && (
        <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 px-4 py-3 text-sm text-accent-200">
          Estás viendo un <strong>catálogo de demostración</strong>. Configura <code className="rounded bg-black/30 px-1">VITE_TMDB_API_KEY</code>{' '}
          en un archivo <code className="rounded bg-black/30 px-1">.env</code> (ver <code className="rounded bg-black/30 px-1">.env.example</code>) para cargar el catálogo real y actualizado de TMDB.
        </div>
      )}

      {hero && (
        <section className="relative overflow-hidden rounded-2xl border border-base-800">
          <div className="absolute inset-0">
            {backdrop ? (
              <img src={backdrop} alt="" className="h-full w-full object-cover opacity-40" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-base-900 to-base-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/60 to-transparent" />
          </div>
          <div className="relative flex flex-col gap-3 px-6 py-10 sm:px-10 sm:py-16">
            <span className="w-fit rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-400">
              Tendencia de hoy
            </span>
            <h1 className="max-w-2xl text-2xl font-bold text-white sm:text-4xl">{hero.title}</h1>
            <p className="max-w-xl text-sm text-slate-300 sm:text-base line-clamp-3">{hero.overview}</p>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className={`font-bold ${ratingColor(hero.voteAverage)}`}>★ {hero.voteAverage.toFixed(1)}</span>
              <span>{yearOf(hero.releaseDate)}</span>
              <span className="uppercase">{hero.mediaType === 'movie' ? 'Película' : 'Serie'}</span>
            </div>
            <Link
              to={`/detalle/${hero.mediaType}/${hero.id}`}
              className="mt-2 w-fit rounded-lg bg-accent-500 px-5 py-2 text-sm font-semibold text-base-950 hover:bg-accent-400"
            >
              Ver detalles
            </Link>
          </div>
        </section>
      )}

      <MediaRow title="🔥 Tendencias de la semana" items={sections.trendingWeek} loading={loading} />
      <MediaRow title="🎬 Novedades en cine" items={sections.newMovies} loading={loading} moreLink="/peliculas" />
      <MediaRow title="📺 Series en emisión ahora" items={sections.newTv} loading={loading} moreLink="/series" />
      <MediaRow title="⭐ Populares en películas" items={sections.popularMovies} loading={loading} moreLink="/peliculas" />
      <MediaRow title="⭐ Populares en series" items={sections.popularTv} loading={loading} moreLink="/series" />
      <MediaRow title="🏆 Mejor valoradas: películas" items={sections.topRatedMovies} loading={loading} moreLink="/peliculas" />
      <MediaRow title="🏆 Mejor valoradas: series" items={sections.topRatedTv} loading={loading} moreLink="/series" />
      <MediaRow title="📅 Próximos estrenos: películas" items={sections.upcomingMovies} loading={loading} moreLink="/peliculas" />
      <MediaRow title="📅 Próximas series" items={sections.upcomingTv} loading={loading} moreLink="/series" />
    </div>
  );
}
