# CineTV Catálogo

Aplicación web para explorar el catálogo de películas y series, ver qué es tendencia y popular en este momento, y armar tu propia agenda de qué ver (con fecha planeada, estado de "por ver / viendo / vista").

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- Zustand (con persistencia en `localStorage` para la agenda)
- [TMDB API](https://www.themoviedb.org/documentation/api) para el catálogo real de películas y series

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

### Catálogo real vs. modo demo

La app funciona sin configuración: si no hay una API key de TMDB, usa un catálogo de demostración local (títulos ficticios) para que toda la navegación, filtros y agenda se puedan probar igual.

Para conectar el catálogo real y actualizado de TMDB:

1. Crea una cuenta gratuita en https://www.themoviedb.org/ y genera una API key en `Configuración > API`.
2. Copia `.env.example` a `.env`.
3. Completa `VITE_TMDB_API_KEY=tu_api_key`.
4. Reinicia `npm run dev`.

## Funcionalidades

- **Inicio**: tendencias del día/semana, novedades (estrenos de cine y series en emisión), populares y mejor valoradas, próximos estrenos.
- **Películas / Series**: catálogo completo navegable con filtro por género y orden (popularidad, valoración, fecha).
- **Buscar**: búsqueda combinada de películas y series por título.
- **Detalle**: sinopsis, género, valoración, fecha de estreno, duración/temporadas.
- **Mi agenda**: agrega cualquier título con un clic, define si está "por ver", "viendo" o "vista", y opcionalmente una fecha planeada para verla. Se guarda en tu navegador (`localStorage`).

## Build de producción

```bash
npm run build
npm run preview
```
