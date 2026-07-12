import { Link } from 'react-router-dom';
import type { MediaItem } from '@/types';
import { getImageUrl } from '@/lib/tmdb';
import { yearOf, ratingColor } from '@/lib/format';
import { useAgendaStore } from '@/store/agendaStore';

const GRADIENTS = [
  'from-fuchsia-700 to-indigo-800',
  'from-emerald-700 to-cyan-800',
  'from-orange-600 to-rose-800',
  'from-sky-700 to-blue-900',
  'from-amber-600 to-red-800',
  'from-purple-700 to-slate-900',
];

function gradientFor(id: number): string {
  return GRADIENTS[id % GRADIENTS.length];
}

export default function MediaCard({ item }: { item: MediaItem }) {
  const poster = getImageUrl(item.posterPath, 'w342');
  const inAgenda = useAgendaStore((s) => Boolean(s.getEntry(item.id, item.mediaType)));
  const addEntry = useAgendaStore((s) => s.addEntry);
  const removeEntry = useAgendaStore((s) => s.removeEntry);

  return (
    <Link
      to={`/detalle/${item.mediaType}/${item.id}`}
      className="group relative flex w-full flex-col overflow-hidden rounded-xl bg-base-850 shadow-lg shadow-black/20 transition-transform hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-base-800">
        {poster ? (
          <img
            src={poster}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientFor(item.id)} p-3 text-center`}>
            <span className="text-sm font-semibold text-white/90">{item.title}</span>
          </div>
        )}

        <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-200">
          {item.mediaType === 'movie' ? 'Película' : 'Serie'}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (inAgenda) removeEntry(item.id, item.mediaType);
            else addEntry(item, 'pendiente', null);
          }}
          aria-label={inAgenda ? 'Quitar de mi agenda' : 'Agregar a mi agenda'}
          className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-sm shadow transition-colors ${
            inAgenda ? 'bg-accent-500 text-base-950' : 'bg-black/60 text-slate-200 hover:bg-black/80'
          }`}
        >
          {inAgenda ? '✓' : '+'}
        </button>

        {item.voteAverage > 0 && (
          <span className={`absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-bold ${ratingColor(item.voteAverage)}`}>
            {item.voteAverage.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        <span className="line-clamp-2 text-sm font-medium leading-snug text-slate-100">{item.title}</span>
        <span className="text-xs text-slate-500">{yearOf(item.releaseDate)}</span>
      </div>
    </Link>
  );
}
