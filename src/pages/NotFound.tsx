import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="text-5xl">🧭</span>
      <h1 className="text-xl font-semibold text-slate-100">Página no encontrada</h1>
      <Link to="/" className="text-accent-400 hover:text-accent-500">
        Volver al inicio
      </Link>
    </div>
  );
}
