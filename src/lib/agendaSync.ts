import { supabase } from '@/lib/supabase';
import type { AgendaEntry, AgendaStatus, MediaType } from '@/types';

/**
 * Sincronización de la agenda con Supabase. Todas las operaciones son no-op
 * mientras no haya un usuario autenticado, así el store de la agenda no
 * necesita conocer el estado de sesión.
 */
let remoteEnabled = false;

export function setRemoteEnabled(enabled: boolean): void {
  remoteEnabled = enabled;
}

interface AgendaRow {
  media_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  status: AgendaStatus;
  scheduled_date: string | null;
  added_at: string;
}

// user_id no se envía: la columna tiene `default auth.uid()` en la base.
function toRow(entry: AgendaEntry): AgendaRow {
  return {
    media_id: entry.id,
    media_type: entry.mediaType,
    title: entry.title,
    poster_path: entry.posterPath,
    status: entry.status,
    scheduled_date: entry.scheduledDate,
    added_at: entry.addedAt,
  };
}

function toEntry(row: AgendaRow): AgendaEntry {
  return {
    id: row.media_id,
    mediaType: row.media_type,
    title: row.title,
    posterPath: row.poster_path,
    status: row.status,
    scheduledDate: row.scheduled_date,
    addedAt: row.added_at,
  };
}

export async function fetchRemoteEntries(): Promise<AgendaEntry[]> {
  if (!supabase || !remoteEnabled) return [];
  const { data, error } = await supabase.from('agenda_entries').select();
  if (error) throw error;
  return (data as AgendaRow[]).map(toEntry);
}

export async function upsertRemoteEntries(entries: AgendaEntry[]): Promise<void> {
  if (!supabase || !remoteEnabled || entries.length === 0) return;
  const { error } = await supabase.from('agenda_entries').upsert(entries.map(toRow));
  if (error) throw error;
}

/** Versión fire-and-forget para usar desde las acciones del store. */
export function pushEntry(entry: AgendaEntry): void {
  upsertRemoteEntries([entry]).catch((err) => console.error('No se pudo sincronizar la agenda:', err));
}

export function pushRemoval(id: number, mediaType: MediaType): void {
  if (!supabase || !remoteEnabled) return;
  supabase
    .from('agenda_entries')
    .delete()
    .eq('media_id', id)
    .eq('media_type', mediaType)
    .then(({ error }) => {
      if (error) console.error('No se pudo sincronizar la agenda:', error);
    });
}
