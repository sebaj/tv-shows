import { supabase } from '@/lib/supabase';
import type { AgendaEntry, AgendaStatus, MediaType, ShareGiven, SharePermission, ShareReceived } from '@/types';

/**
 * Sincronización de la agenda con Supabase. Todas las operaciones son no-op
 * mientras no haya un usuario autenticado, así el store de la agenda no
 * necesita conocer el estado de sesión.
 */
interface RemoteUser {
  id: string;
  email: string;
}

let remoteUser: RemoteUser | null = null;

export function setRemoteUser(user: RemoteUser | null): void {
  remoteUser = user;
}

interface AgendaRow {
  media_id: number;
  media_type: MediaType;
  title: string;
  original_title?: string | null;
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
    original_title: entry.originalTitle ?? null,
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
    originalTitle: row.original_title ?? null,
    posterPath: row.poster_path,
    status: row.status,
    scheduledDate: row.scheduled_date,
    addedAt: row.added_at,
  };
}

/** Postgres rechaza columnas que no existen: código 42703. */
function isUnknownColumn(error: { code?: string } | null): boolean {
  return error?.code === '42703';
}

/**
 * Guarda filas tolerando que la base no tenga todavía la columna
 * `original_title` (bases creadas con una versión anterior del esquema).
 */
async function upsertRows(rows: AgendaRow[]): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('agenda_entries').upsert(rows);
  if (!error) return;
  if (!isUnknownColumn(error)) throw error;

  const legacy = rows.map(({ original_title: _omitted, ...rest }) => rest);
  const { error: retryError } = await supabase.from('agenda_entries').upsert(legacy);
  if (retryError) throw retryError;
}

export async function fetchRemoteEntries(): Promise<AgendaEntry[]> {
  if (!supabase || !remoteUser) return [];
  // Filtrado explícito por dueño: las políticas RLS también dejan leer las
  // agendas que me compartieron, y esas no deben mezclarse con la mía.
  const { data, error } = await supabase.from('agenda_entries').select().eq('user_id', remoteUser.id);
  if (error) throw error;
  return (data as AgendaRow[]).map(toEntry);
}

export async function upsertRemoteEntries(entries: AgendaEntry[]): Promise<void> {
  if (!supabase || !remoteUser || entries.length === 0) return;
  await upsertRows(entries.map(toRow));
}

/** Versión fire-and-forget para usar desde las acciones del store. */
export function pushEntry(entry: AgendaEntry): void {
  upsertRemoteEntries([entry]).catch((err) => console.error('No se pudo sincronizar la agenda:', err));
}

export function pushRemoval(id: number, mediaType: MediaType): void {
  if (!supabase || !remoteUser) return;
  supabase
    .from('agenda_entries')
    .delete()
    .eq('media_id', id)
    .eq('media_type', mediaType)
    .eq('user_id', remoteUser.id)
    .then(({ error }) => {
      if (error) console.error('No se pudo sincronizar la agenda:', error);
    });
}

// --- Agendas compartidas ---

interface ShareRow {
  owner_id: string;
  owner_email: string;
  shared_with_email: string;
  permission: SharePermission;
}

/** Permisos que yo otorgué sobre mi agenda. */
export async function fetchSharesGiven(): Promise<ShareGiven[]> {
  if (!supabase || !remoteUser) return [];
  const { data, error } = await supabase
    .from('agenda_shares')
    .select()
    .eq('owner_id', remoteUser.id)
    .order('shared_with_email');
  if (error) throw error;
  return (data as ShareRow[]).map((r) => ({ sharedWithEmail: r.shared_with_email, permission: r.permission }));
}

/** Agendas ajenas a las que me dieron acceso. */
export async function fetchSharesReceived(): Promise<ShareReceived[]> {
  if (!supabase || !remoteUser) return [];
  const { data, error } = await supabase
    .from('agenda_shares')
    .select()
    .eq('shared_with_email', remoteUser.email.toLowerCase())
    .order('owner_email');
  if (error) throw error;
  return (data as ShareRow[]).map((r) => ({
    ownerId: r.owner_id,
    ownerEmail: r.owner_email,
    permission: r.permission,
  }));
}

/** Crea o actualiza (si ya existía, cambia el permiso) un share de mi agenda. */
export async function saveShare(email: string, permission: SharePermission): Promise<void> {
  if (!supabase || !remoteUser) return;
  const { error } = await supabase.from('agenda_shares').upsert({
    owner_email: remoteUser.email.toLowerCase(),
    shared_with_email: email.trim().toLowerCase(),
    permission,
  });
  if (error) throw error;
}

export async function removeShare(email: string): Promise<void> {
  if (!supabase || !remoteUser) return;
  const { error } = await supabase
    .from('agenda_shares')
    .delete()
    .eq('owner_id', remoteUser.id)
    .eq('shared_with_email', email.toLowerCase());
  if (error) throw error;
}

// --- Operaciones sobre una agenda ajena (requieren permiso de escritura en RLS) ---

export async function fetchEntriesOf(ownerId: string): Promise<AgendaEntry[]> {
  if (!supabase || !remoteUser) return [];
  const { data, error } = await supabase.from('agenda_entries').select().eq('user_id', ownerId);
  if (error) throw error;
  return (data as AgendaRow[]).map(toEntry);
}

export async function upsertEntryFor(ownerId: string, entry: AgendaEntry): Promise<void> {
  if (!supabase || !remoteUser) return;
  await upsertRows([{ ...toRow(entry), user_id: ownerId } as AgendaRow]);
}

export async function deleteEntryFor(ownerId: string, id: number, mediaType: MediaType): Promise<void> {
  if (!supabase || !remoteUser) return;
  const { error } = await supabase
    .from('agenda_entries')
    .delete()
    .eq('user_id', ownerId)
    .eq('media_id', id)
    .eq('media_type', mediaType);
  if (error) throw error;
}
