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
  const serviceDown = useAuthStore((s) => s.serviceDown);

  return (
    <div className="min-h-screen bg-base-950">
      <Navbar />
      {authStatus === 'unauthorized' && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Tu cuenta de Google no está autorizada para usar esta app.
          </div>
        </div>
      )}
      {serviceDown && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            No pudimos conectar con el servicio de cuentas. Puedes seguir usando la app con normalidad: tu agenda se
            guarda en este dispositivo y se sincronizará cuando vuelvas a entrar.
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
