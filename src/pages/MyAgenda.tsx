import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AgendaEntry, AgendaStatus, ShareReceived } from '@/types';
import { useAgendaStore } from '@/store/agendaStore';
import { useAuthStore } from '@/store/authStore';
import { HAS_AUTH } from '@/lib/supabase';
import { deleteEntryFor, fetchEntriesOf, fetchSharesReceived, upsertEntryFor } from '@/lib/agendaSync';
import { useAsync } from '@/hooks/useAsync';
import { getImageUrl } from '@/lib/tmdb';
import { formatDate } from '@/lib/format';
import ScheduleModal from '@/components/ScheduleModal';
import ShareAgendaModal from '@/components/ShareAgendaModal';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';

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

function pillClass(active: boolean): string {
  return `rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
    active ? 'border-accent-500 bg-accent-500/10 text-accent-400' : 'border-base-700 text-slate-400 hover:border-base-600'
  }`;
}

function sortEntries(list: AgendaEntry[]): AgendaEntry[] {
  return [...list].sort((a, b) => {
    if (a.scheduledDate && b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
    if (a.scheduledDate) return -1;
    if (b.scheduledDate) return 1;
    return b.addedAt.localeCompare(a.addedAt);
  });
}

function AgendaRow({
  entry,
  onEdit,
  onRemove,
}: {
  entry: AgendaEntry;
  onEdit?: () => void;
  onRemove?: () => void;
}) {
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

      {(onEdit || onRemove) && (
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-base-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-accent-500 hover:text-accent-400"
            >
              Editar
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg border border-base-700 px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-red-500 hover:text-red-400"
            >
              Quitar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyAgenda() {
  const ownEntries = useAgendaStore((s) => Object.values(s.entries));
  const updateEntry = useAgendaStore((s) => s.updateEntry);
  const removeEntry = useAgendaStore((s) => s.removeEntry);
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState<'all' | AgendaStatus>('all');
  const [editing, setEditing] = useState<AgendaEntry | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [viewOwnerId, setViewOwnerId] = useState<string | null>(null);

  const signedIn = authStatus === 'signedIn';

  const sharesReceived = useAsync(
    () => (signedIn ? fetchSharesReceived() : Promise.resolve<ShareReceived[]>([])),
    [signedIn, user?.id],
  );
  const shares = sharesReceived.data ?? [];
  const viewing = shares.find((s) => s.ownerId === viewOwnerId) ?? null;

  const sharedEntries = useAsync(
    () => (viewing ? fetchEntriesOf(viewing.ownerId) : Promise.resolve<AgendaEntry[] | null>(null)),
    [viewing?.ownerId],
  );

  const entries = viewing ? sharedEntries.data ?? [] : ownEntries;
  const canEdit = !viewing || viewing.permission === 'write';

  const filtered = useMemo(
    () => sortEntries(tab === 'all' ? entries : entries.filter((e) => e.status === tab)),
    [entries, tab],
  );

  function handleSave(status: AgendaStatus, date: string | null) {
    if (!editing) return;
    if (viewing) {
      upsertEntryFor(viewing.ownerId, { ...editing, status, scheduledDate: date })
        .then(() => sharedEntries.reload())
        .catch((err) => console.error('No se pudo actualizar la agenda compartida:', err));
    } else {
      updateEntry(editing.id, editing.mediaType, { status, scheduledDate: date });
    }
    setEditing(null);
  }

  function handleRemove(entry: AgendaEntry) {
    if (viewing) {
      deleteEntryFor(viewing.ownerId, entry.id, entry.mediaType)
        .then(() => sharedEntries.reload())
        .catch((err) => console.error('No se pudo actualizar la agenda compartida:', err));
    } else {
      removeEntry(entry.id, entry.mediaType);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Mi agenda</h1>
          <p className="text-sm text-slate-400">Todo lo que quieres ver, lo que estás viendo y lo que ya viste.</p>
          {HAS_AUTH && authStatus === 'signedOut' && (
            <p className="mt-1 text-sm text-accent-300">
              💡 Inicia sesión con Google para guardar tu agenda en la nube y acceder desde cualquier dispositivo.
            </p>
          )}
        </div>
        {signedIn && (
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="rounded-lg border border-base-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-accent-500 hover:text-accent-400"
          >
            👥 Compartir mi agenda
          </button>
        )}
      </div>

      {shares.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setViewOwnerId(null)} className={pillClass(!viewing)}>
            Mi agenda
          </button>
          {shares.map((s) => (
            <button
              key={s.ownerId}
              type="button"
              onClick={() => setViewOwnerId(s.ownerId)}
              className={pillClass(viewing?.ownerId === s.ownerId)}
            >
              👥 {s.ownerEmail}
            </button>
          ))}
        </div>
      )}

      {viewing && (
        <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 px-4 py-2.5 text-sm text-accent-200">
          Estás viendo la agenda de <strong>{viewing.ownerEmail}</strong> ·{' '}
          {viewing.permission === 'write' ? 'puedes editarla' : 'solo lectura'}
        </div>
      )}

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={pillClass(tab === t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {viewing && sharedEntries.loading ? (
        <Spinner label="Cargando agenda compartida..." />
      ) : viewing && sharedEntries.error ? (
        <ErrorState title="No pudimos cargar esta agenda" onRetry={sharedEntries.reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🗓️"
          title="Aún no hay nada aquí"
          subtitle={
            viewing
              ? 'Esta agenda todavía no tiene títulos en esta categoría.'
              : 'Explora el catálogo y presiona “+ Agregar a mi agenda” en las películas o series que quieras ver.'
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <AgendaRow
              key={`${entry.mediaType}-${entry.id}`}
              entry={entry}
              onEdit={canEdit ? () => setEditing(entry) : undefined}
              onRemove={canEdit ? () => handleRemove(entry) : undefined}
            />
          ))}
        </div>
      )}

      {editing && (
        <ScheduleModal
          initialStatus={editing.status}
          initialDate={editing.scheduledDate}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {shareModalOpen && <ShareAgendaModal onClose={() => setShareModalOpen(false)} />}
    </div>
  );
}
