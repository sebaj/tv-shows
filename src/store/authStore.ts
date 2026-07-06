import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchRemoteEntries, setRemoteEnabled, upsertRemoteEntries } from '@/lib/agendaSync';
import { useAgendaStore } from '@/store/agendaStore';

const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Lista vacía = cualquier cuenta de Google puede entrar.
function isEmailAllowed(email: string): boolean {
  return ALLOWED_EMAILS.length === 0 || ALLOWED_EMAILS.includes(email.toLowerCase());
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'unauthorized';

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: supabase ? 'loading' : 'signedOut',

  signInWithGoogle: () => {
    void supabase?.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  },

  signOut: async () => {
    await supabase?.auth.signOut();
    setRemoteEnabled(false);
    useAgendaStore.getState().clear();
    set({ user: null, status: 'signedOut' });
  },
}));

/**
 * Al iniciar sesión, sube las entradas locales que no existen en la nube
 * y deja el store con la unión de ambas fuentes.
 */
async function mergeAgendaOnSignIn(): Promise<void> {
  const agenda = useAgendaStore.getState();
  const local = Object.values(agenda.entries);
  const remote = await fetchRemoteEntries();
  const remoteKeys = new Set(remote.map((e) => `${e.mediaType}-${e.id}`));
  const toUpload = local.filter((e) => !remoteKeys.has(`${e.mediaType}-${e.id}`));
  await upsertRemoteEntries(toUpload);
  agenda.setEntries([...remote, ...toUpload]);
}

function handleSession(session: Session | null): void {
  const previousStatus = useAuthStore.getState().status;

  if (!session?.user) {
    setRemoteEnabled(false);
    // No pisar 'unauthorized': el signOut forzado de abajo también dispara este evento.
    useAuthStore.setState((s) => ({
      user: null,
      status: s.status === 'unauthorized' ? 'unauthorized' : 'signedOut',
    }));
    return;
  }

  const email = session.user.email ?? '';
  if (!isEmailAllowed(email)) {
    setRemoteEnabled(false);
    useAuthStore.setState({ user: null, status: 'unauthorized' });
    void supabase?.auth.signOut();
    return;
  }

  setRemoteEnabled(true);
  useAuthStore.setState({
    user: {
      id: session.user.id,
      email,
      name: (session.user.user_metadata?.full_name as string | undefined) ?? null,
      avatarUrl: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
    },
    status: 'signedIn',
  });

  // El evento se repite en cada refresh de token: fusionar solo la primera vez.
  if (previousStatus !== 'signedIn') {
    mergeAgendaOnSignIn().catch((err) => console.error('No se pudo cargar la agenda remota:', err));
  }
}

/** Registra el listener de sesión. Llamar una sola vez al arrancar la app. */
export function initAuth(): void {
  if (!supabase) return;
  supabase.auth.onAuthStateChange((_event, session) => handleSession(session));
}
