import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HAS_AUTH } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-accent-400' : 'text-slate-300 hover:text-white'}`;

function AuthControls() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signOut = useAuthStore((s) => s.signOut);

  if (!HAS_AUTH) return null;

  if (status === 'signedIn' && user) {
    return (
      <div className="flex items-center gap-2">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name ?? user.email} title={user.email} className="h-7 w-7 rounded-full" />
        ) : (
          <span className="hidden text-sm text-slate-400 sm:inline" title={user.email}>
            {user.name ?? user.email}
          </span>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-lg border border-base-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:border-accent-500 hover:text-accent-400"
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={status === 'loading'}
      className="shrink-0 rounded-lg bg-accent-500 px-3 py-1.5 text-sm font-semibold text-base-950 hover:bg-accent-400 disabled:opacity-50"
    >
      Entrar<span className="hidden sm:inline"> con Google</span>
    </button>
  );
}

export default function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/buscar?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-base-800 bg-base-950/95 backdrop-blur">
      {/* En móvil: fila 1 = logo + buscador + sesión; fila 2 = navegación (el <nav>
          pasa al final con order-last y ocupa todo el ancho). En sm+ es una sola fila. */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-x-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-lg font-bold text-white">
          <span>🎬</span>
          <span className="hidden min-[400px]:inline">CineTV</span>
        </Link>

        <nav className="order-last flex w-full items-center gap-4 overflow-x-auto sm:order-none sm:w-auto">
          <NavLink to="/" end className={linkClass}>
            Inicio
          </NavLink>
          <NavLink to="/peliculas" className={linkClass}>
            Películas
          </NavLink>
          <NavLink to="/series" className={linkClass}>
            Series
          </NavLink>
          <NavLink to="/agenda" className={linkClass}>
            Mi agenda
          </NavLink>
        </nav>

        <form onSubmit={handleSubmit} className="ml-auto flex min-w-0 max-w-xs flex-1 items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar títulos..."
            className="w-full rounded-lg border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-500 focus:outline-none"
          />
        </form>

        <AuthControls />
      </div>
    </header>
  );
}
