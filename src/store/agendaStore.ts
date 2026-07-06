import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgendaEntry, AgendaStatus, MediaItem, MediaType } from '@/types';
import { pushEntry, pushRemoval } from '@/lib/agendaSync';

function entryKey(id: number, mediaType: MediaType): string {
  return `${mediaType}-${id}`;
}

interface AgendaState {
  entries: Record<string, AgendaEntry>;
  addEntry: (item: MediaItem, status?: AgendaStatus, scheduledDate?: string | null) => void;
  updateEntry: (id: number, mediaType: MediaType, patch: Partial<Pick<AgendaEntry, 'status' | 'scheduledDate'>>) => void;
  removeEntry: (id: number, mediaType: MediaType) => void;
  getEntry: (id: number, mediaType: MediaType) => AgendaEntry | undefined;
  setEntries: (entries: AgendaEntry[]) => void;
  clear: () => void;
}

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set, get) => ({
      entries: {},

      addEntry: (item, status = 'pendiente', scheduledDate = null) => {
        const entry: AgendaEntry = {
          id: item.id,
          mediaType: item.mediaType,
          title: item.title,
          posterPath: item.posterPath,
          status,
          scheduledDate,
          addedAt: new Date().toISOString(),
        };
        set((state) => ({
          entries: { ...state.entries, [entryKey(item.id, item.mediaType)]: entry },
        }));
        pushEntry(entry);
      },

      updateEntry: (id, mediaType, patch) => {
        const key = entryKey(id, mediaType);
        const existing = get().entries[key];
        if (!existing) return;
        const updated = { ...existing, ...patch };
        set((state) => ({
          entries: { ...state.entries, [key]: updated },
        }));
        pushEntry(updated);
      },

      removeEntry: (id, mediaType) => {
        set((state) => {
          const { [entryKey(id, mediaType)]: _removed, ...rest } = state.entries;
          return { entries: rest };
        });
        pushRemoval(id, mediaType);
      },

      getEntry: (id, mediaType) => get().entries[entryKey(id, mediaType)],

      setEntries: (entries) =>
        set({
          entries: Object.fromEntries(entries.map((e) => [entryKey(e.id, e.mediaType), e])),
        }),

      clear: () => set({ entries: {} }),
    }),
    { name: 'tv-shows-agenda' },
  ),
);
