import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { isAuthServiceReachable, supabase } from '@/lib/supabase';
import { fetchRemoteEntries, setRemoteUser, upsertRemoteEntries } from '@/lib/agendaSync';
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
  /** El servicio de cuentas no respondió: la app sigue funcionando solo en este dispositivo. */
  serviceDown: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: supabase ? 'loading' : 'signedOut',
  serviceDown: false,

  signInWithGoogle: async () => {
    if (!supabase) return;
    set({ status: 'loading' });
    try {
      if (!(await isAuthServiceReachable())) {
        throw new Error('El servicio de cuentas no responde');
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      console.error('No se pudo iniciar el login con Google:', err);
      set({ serviceDown: true, status: 'signedOut' });
    }
  },

  signOut: async () => {
    try {
      await supabase?.auth.signOut();
    } catch (err) {
      console.error('No se pudo cerrar la sesión limpiamente:', err);
    }
    setRemoteUser(null);
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
    setRemoteUser(null);
    // No pisar 'unauthorized': el signOut forzado de abajo también dispara este evento.
    useAuthStore.setState((s) => ({
      user: null,
      status: s.status === 'unauthorized' ? 'unauthorized' : 'signedOut',
      serviceDown: false,
    }));
    return;
  }

  const email = session.user.email ?? '';
  if (!isEmailAllowed(email)) {
    setRemoteUser(null);
    useAuthStore.setState({ user: null, status: 'unauthorized' });
    void supabase?.auth.signOut();
    return;
  }

  setRemoteUser({ id: session.user.id, email });
  useAuthStore.setState({
    user: {
      id: session.user.id,
      email,
      name: (session.user.user_metadata?.full_name as string | undefined) ?? null,
      avatarUrl: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
    },
    status: 'signedIn',
    serviceDown: false,
  });

  // El evento se repite en cada refresh de token: fusionar solo la primera vez.
  if (previousStatus !== 'signedIn') {
    mergeAgendaOnSignIn().catch((err) => console.error('No se pudo cargar la agenda remota:', err));
  }
}

const SESSION_TIMEOUT_MS = 8000;

/**
 * Registra el listener de sesión. Llamar una sola vez al arrancar la app.
 *
 * Si el servicio de cuentas no responde (proyecto caído, sin conexión, DNS),
 * `onAuthStateChange` puede no emitir nunca: sin este respaldo la app se
 * quedaría con el botón de sesión deshabilitado para siempre.
 */
export function initAuth(): void {
  if (!supabase) return;

  supabase.auth.onAuthStateChange((_event, session) => handleSession(session));

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), SESSION_TIMEOUT_MS),
  );

  Promise.race([supabase.auth.getSession(), timeout]).catch((err) => {
    console.error('No se pudo contactar el servicio de cuentas:', err);
    if (useAuthStore.getState().status === 'loading') {
      useAuthStore.setState({ status: 'signedOut', serviceDown: true });
    }
  });
}
