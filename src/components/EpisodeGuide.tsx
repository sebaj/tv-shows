import { useState } from 'react';
import type { SeasonSummary } from '@/types';
import { api } from '@/lib/tmdb';
import { formatDate, isUpcoming } from '@/lib/format';
import { useAsync } from '@/hooks/useAsync';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';

function seasonLabel(season: SeasonSummary): string {
  return season.seasonNumber === 0 ? 'Especiales' : season.name;
}

export default function EpisodeGuide({ tvId, seasons }: { tvId: number; seasons: SeasonSummary[] }) {
  // Por defecto, la última temporada: es donde están los episodios por estrenar.
  const regular = seasons.filter((s) => s.seasonNumber > 0);
  const defaultSeason = regular.length > 0 ? regular[regular.length - 1].seasonNumber : seasons[0]?.seasonNumber;
  const [seasonNumber, setSeasonNumber] = useState(defaultSeason);

  const { data: episodes, loading, error, reload } = useAsync(() => api.seasonEpisodes(tvId, seasonNumber), [tvId, seasonNumber]);

  if (seasons.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-100">Episodios</h2>
        <select
          value={seasonNumber}
          onChange={(e) => setSeasonNumber(Number(e.target.value))}
          className="rounded-lg border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-slate-200 focus:border-accent-500 focus:outline-none"
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.seasonNumber}>
              {seasonLabel(s)} · {s.episodeCount} ep.
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner label="Cargando episodios..." />
      ) : error ? (
        <ErrorState title="No pudimos cargar los episodios" onRetry={reload} />
      ) : !episodes || episodes.length === 0 ? (
        <EmptyState icon="🎞️" title="Sin episodios anunciados" subtitle="Esta temporada todavía no tiene episodios publicados." />
      ) : (
        <div className="flex flex-col gap-2">
          {episodes.map((ep) => {
            const upcoming = isUpcoming(ep.airDate);
            return (
              <div
                key={ep.id}
                className={`flex flex-col gap-1 rounded-xl border p-3 sm:flex-row sm:items-baseline sm:gap-4 ${
                  upcoming ? 'border-accent-500/40 bg-accent-500/5' : 'border-base-800 bg-base-900'
                }`}
              >
                <span className="shrink-0 text-sm font-semibold text-slate-500">
                  E{String(ep.episodeNumber).padStart(2, '0')}
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="font-medium text-slate-100">{ep.name}</span>
                  {ep.overview && <p className="line-clamp-2 text-sm text-slate-400">{ep.overview}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
                  {ep.runtime ? <span>{ep.runtime} min</span> : null}
                  {ep.airDate ? (
                    upcoming ? (
                      <span className="rounded-full border border-accent-500/40 bg-accent-500/10 px-2 py-0.5 font-medium text-accent-300">
                        📅 Se estrena el {formatDate(ep.airDate)}
                      </span>
                    ) : (
                      <span>{formatDate(ep.airDate)}</span>
                    )
                  ) : (
                    <span className="rounded-full border border-base-700 px-2 py-0.5">Fecha por anunciar</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
