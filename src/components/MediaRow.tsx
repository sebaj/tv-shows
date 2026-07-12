import { Link } from 'react-router-dom';
import type { MediaItem } from '@/types';
import MediaCard from '@/components/MediaCard';

export default function MediaRow({
  title,
  items,
  loading,
  moreLink,
}: {
  title: string;
  items: MediaItem[];
  loading?: boolean;
  moreLink?: string;
}) {
  if (!loading && items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100 sm:text-xl">{title}</h2>
        {moreLink && (
          <Link to={moreLink} className="text-sm font-medium text-accent-400 hover:text-accent-500">
            Ver todo →
          </Link>
        )}
      </div>
      <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] w-40 shrink-0 animate-pulse rounded-xl bg-base-850 sm:w-44" />
            ))
          : items.map((item) => (
              <div key={`${item.mediaType}-${item.id}`} className="w-40 shrink-0 sm:w-44">
                <MediaCard item={item} />
              </div>
            ))}
      </div>
    </section>
  );
}
