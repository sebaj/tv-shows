import { Route, Routes } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import Details from '@/pages/Details';
import MyAgenda from '@/pages/MyAgenda';
import Search from '@/pages/Search';
import NotFound from '@/pages/NotFound';
import { useAuthStore } from '@/store/authStore';

export default function App() {
  const authStatus = useAuthStore((s) => s.status);

  return (
    <div className="min-h-screen bg-base-950">
      <Navbar />
      {authStatus === 'unauthorized' && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Tu cuenta de Google no está autorizada para usar esta app. Si es tu app, agrega tu email a{' '}
            <code className="rounded bg-black/30 px-1">VITE_ALLOWED_EMAILS</code> en el archivo <code className="rounded bg-black/30 px-1">.env</code>.
          </div>
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/peliculas" element={<Catalog key="movie" mediaType="movie" />} />
          <Route path="/series" element={<Catalog key="tv" mediaType="tv" />} />
          <Route path="/detalle/:mediaType/:id" element={<Details />} />
          <Route path="/agenda" element={<MyAgenda />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
