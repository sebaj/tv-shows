import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-accent-400' : 'text-slate-300 hover:text-white'}`;

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
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span>🎬</span>
          <span>CineTV</span>
        </Link>

        <nav className="flex items-center gap-4">
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

        <form onSubmit={handleSubmit} className="ml-auto flex min-w-[160px] max-w-xs flex-1 items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar títulos..."
            className="w-full rounded-lg border border-base-700 bg-base-850 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-500 focus:outline-none"
          />
        </form>
      </div>
    </header>
  );
}
