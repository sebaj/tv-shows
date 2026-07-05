import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgendaEntry, AgendaStatus, MediaItem, MediaType } from '@/types';

function entryKey(id: number, mediaType: MediaType): string {
  return `${mediaType}-${id}`;
}

interface AgendaState {
  entries: Record<string, AgendaEntry>;
  addEntry: (item: MediaItem, status?: AgendaStatus, scheduledDate?: string | null) => void;
  updateEntry: (id: number, mediaType: MediaType, patch: Partial<Pick<AgendaEntry, 'status' | 'scheduledDate'>>) => void;
  removeEntry: (id: number, mediaType: MediaType) => void;
  getEntry: (id: number, mediaType: MediaType) => AgendaEntry | undefined;
}

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set, get) => ({
      entries: {},

      addEntry: (item, status = 'pendiente', scheduledDate = null) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [entryKey(item.id, item.mediaType)]: {
              id: item.id,
              mediaType: item.mediaType,
              title: item.title,
              posterPath: item.posterPath,
              status,
              scheduledDate,
              addedAt: new Date().toISOString(),
            },
          },
        })),

      updateEntry: (id, mediaType, patch) =>
        set((state) => {
          const key = entryKey(id, mediaType);
          const existing = state.entries[key];
          if (!existing) return state;
          return {
            entries: {
              ...state.entries,
              [key]: { ...existing, ...patch },
            },
          };
        }),

      removeEntry: (id, mediaType) =>
        set((state) => {
          const key = entryKey(id, mediaType);
          const { [key]: _removed, ...rest } = state.entries;
          return { entries: rest };
        }),

      getEntry: (id, mediaType) => get().entries[entryKey(id, mediaType)],
    }),
    { name: 'tv-shows-agenda' },
  ),
);
