import { Route, Routes } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import Details from '@/pages/Details';
import MyAgenda from '@/pages/MyAgenda';
import Search from '@/pages/Search';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-base-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/peliculas" element={<Catalog mediaType="movie" />} />
          <Route path="/series" element={<Catalog mediaType="tv" />} />
          <Route path="/detalle/:mediaType/:id" element={<Details />} />
          <Route path="/agenda" element={<MyAgenda />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
