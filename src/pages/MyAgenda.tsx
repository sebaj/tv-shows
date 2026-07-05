import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AgendaEntry, AgendaStatus } from '@/types';
import { useAgendaStore } from '@/store/agendaStore';
import { getImageUrl } from '@/lib/tmdb';
import { formatDate } from '@/lib/format';
import ScheduleModal from '@/components/ScheduleModal';
import EmptyState from '@/components/EmptyState';

const STATUS_LABELS: Record<AgendaStatus, string> = {
  pendiente: 'Por ver',
  viendo: 'Viendo',
  vista: 'Vista',
};

const TABS: Array<{ key: 'all' | AgendaStatus; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'pendiente', label: 'Por ver' },
  { key: 'viendo', label: 'Viendo' },
  { key: 'vista', label: 'Vistas' },
];

function AgendaRow({ entry, onEdit }: { entry: AgendaEntry; onEdit: () => void }) {
  const removeEntry = useAgendaStore((s) => s.removeEntry);
  const poster = getImageUrl(entry.posterPath, 'w200');

  return (
    <div className="flex items-center gap-4 rounded-xl border border-base-800 bg-base-900 p-3">
      <Link to={`/detalle/${entry.mediaType}/${entry.id}`} className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-base-800">
        {poster ? (
          <img src={poster} alt={entry.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-fuchsia-700 to-indigo-900 p-1 text-center text-[10px] font-semibold text-white/90">
            {entry.title}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link to={`/detalle/${entry.mediaType}/${entry.id}`} className="font-medium text-slate-100 hover:text-accent-400">
          {entry.title}
        </Link>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          {entry.mediaType === 'movie' ? 'Película' : 'Serie'}
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-base-700 px-2 py-0.5 text-slate-300">{STATUS_LABELS[entry.status]}</span>
          {entry.scheduledDate && (
            <span className="rounded-full border border-accent-500/40 bg-accent-500/10 px-2 py-0.5 text-accent-300">
              📅 {formatDate(entry.scheduledDate)}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-base-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-accent-500 hover:text-accent-400"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => removeEntry(entry.id, entry.mediaType)}
          className="rounded-lg border border-base-700 px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-red-500 hover:text-red-400"
        >
          Quitar
        </button>
      </div>
    </div>
  );
}

export default function MyAgenda() {
  const entries = useAgendaStore((s) => Object.values(s.entries));
  const updateEntry = useAgendaStore((s) => s.updateEntry);
  const [tab, setTab] = useState<'all' | AgendaStatus>('all');
  const [editing, setEditing] = useState<AgendaEntry | null>(null);

  const filtered = useMemo(() => {
    const list = tab === 'all' ? entries : entries.filter((e) => e.status === tab);
    return [...list].sort((a, b) => {
      if (a.scheduledDate && b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
      if (a.scheduledDate) return -1;
      if (b.scheduledDate) return 1;
      return b.addedAt.localeCompare(a.addedAt);
    });
  }, [entries, tab]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Mi agenda</h1>
        <p className="text-sm text-slate-400">Todo lo que quieres ver, lo que estás viendo y lo que ya viste.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'border-accent-500 bg-accent-500/10 text-accent-400' : 'border-base-700 text-slate-400 hover:border-base-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="Aún no hay nada aquí"
          subtitle="Explora el catálogo y presiona “+ Agregar a mi agenda” en las películas o series que quieras ver."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <AgendaRow key={`${entry.mediaType}-${entry.id}`} entry={entry} onEdit={() => setEditing(entry)} />
          ))}
        </div>
      )}

      {editing && (
        <ScheduleModal
          initialStatus={editing.status}
          initialDate={editing.scheduledDate}
          onClose={() => setEditing(null)}
          onSave={(status, date) => {
            updateEntry(editing.id, editing.mediaType, { status, scheduledDate: date });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
