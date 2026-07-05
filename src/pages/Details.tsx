import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { MediaDetails, MediaType } from '@/types';
import { api, getImageUrl } from '@/lib/tmdb';
import { formatDate, ratingColor } from '@/lib/format';
import { useAgendaStore } from '@/store/agendaStore';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import ScheduleModal from '@/components/ScheduleModal';

export default function Details() {
  const { mediaType, id } = useParams<{ mediaType: MediaType; id: string }>();
  const [item, setItem] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const entry = useAgendaStore((s) => (item ? s.getEntry(item.id, item.mediaType) : undefined));
  const addEntry = useAgendaStore((s) => s.addEntry);
  const updateEntry = useAgendaStore((s) => s.updateEntry);
  const removeEntry = useAgendaStore((s) => s.removeEntry);

  useEffect(() => {
    if (!mediaType || !id) return;
    let cancelled = false;
    setLoading(true);
    api.details(mediaType as MediaType, Number(id)).then((res) => {
      if (!cancelled) {
        setItem(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mediaType, id]);

  if (loading) return <Spinner label="Cargando título..." />;
  if (!item) return <EmptyState icon="🚫" title="No encontramos este título" subtitle="Puede que ya no esté disponible en el catálogo." />;

  const backdrop = getImageUrl(item.backdropPath, 'original');
  const poster = getImageUrl(item.posterPath, 'w500');

  return (
    <div className="flex flex-col gap-6">
      <div className="relative -mx-4 overflow-hidden rounded-b-2xl sm:-mx-6">
        <div className="absolute inset-0">
          {backdrop ? (
            <img src={backdrop} alt="" className="h-full w-full object-cover opacity-30" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-base-900 to-base-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-base-950 to-base-950/40" />
        </div>

        <div className="relative flex flex-col gap-5 px-4 py-8 sm:flex-row sm:px-10 sm:py-12">
          <div className="mx-auto w-40 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:mx-0 sm:w-56">
            {poster ? (
              <img src={poster} alt={item.title} className="w-full" />
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center bg-gradient-to-br from-fuchsia-700 to-indigo-900 p-4 text-center text-sm font-semibold text-white/90">
                {item.title}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
            <span className="mx-auto w-fit rounded-full bg-base-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 sm:mx-0">
              {item.mediaType === 'movie' ? 'Película' : 'Serie'}
            </span>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{item.title}</h1>
            {item.tagline && <p className="italic text-slate-400">"{item.tagline}"</p>}

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300 sm:justify-start">
              {item.voteAverage > 0 && (
                <span className={`font-bold ${ratingColor(item.voteAverage)}`}>★ {item.voteAverage.toFixed(1)}</span>
              )}
              <span>{formatDate(item.releaseDate)}</span>
              {item.runtime ? <span>{item.runtime} min</span> : null}
              {item.numberOfSeasons ? (
                <span>
                  {item.numberOfSeasons} temporada{item.numberOfSeasons > 1 ? 's' : ''} · {item.numberOfEpisodes} episodios
                </span>
              ) : null}
            </div>

            {item.genres.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                {item.genres.map((g) => (
                  <span key={g.id} className="rounded-full border border-base-700 px-3 py-1 text-xs text-slate-300">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <p className="mx-auto max-w-2xl text-sm text-slate-300 sm:mx-0 sm:text-base">{item.overview}</p>

            <div className="mt-2 flex flex-wrap justify-center gap-3 sm:justify-start">
              {entry ? (
                <>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="rounded-lg bg-accent-500 px-5 py-2 text-sm font-semibold text-base-950 hover:bg-accent-400"
                  >
                    En mi agenda · {entry.status === 'pendiente' ? 'Por ver' : entry.status === 'viendo' ? 'Viendo' : 'Vista'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEntry(item.id, item.mediaType)}
                    className="rounded-lg border border-base-700 px-5 py-2 text-sm font-medium text-slate-300 hover:border-red-500 hover:text-red-400"
                  >
                    Quitar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    addEntry(item, 'pendiente', null);
                    setModalOpen(true);
                  }}
                  className="rounded-lg bg-accent-500 px-5 py-2 text-sm font-semibold text-base-950 hover:bg-accent-400"
                >
                  + Agregar a mi agenda
                </button>
              )}
              <Link
                to="/agenda"
                className="rounded-lg border border-base-700 px-5 py-2 text-sm font-medium text-slate-300 hover:border-accent-500 hover:text-accent-400"
              >
                Ver mi agenda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <ScheduleModal
          initialStatus={entry?.status ?? 'pendiente'}
          initialDate={entry?.scheduledDate ?? null}
          onClose={() => setModalOpen(false)}
          onSave={(status, date) => {
            updateEntry(item.id, item.mediaType, { status, scheduledDate: date });
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
