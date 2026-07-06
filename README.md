# CineTV Catálogo

Aplicación web para explorar el catálogo de películas y series, ver qué es tendencia y popular en este momento, y armar tu propia agenda de qué ver (con fecha planeada, estado de "por ver / viendo / vista").

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- Zustand para el estado de la agenda
- [TMDB API](https://www.themoviedb.org/documentation/api) para el catálogo real de películas y series
- [Supabase](https://supabase.com) (opcional) para login con Google y agenda sincronizada en la nube; sin configurar, la agenda se guarda en `localStorage`

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

### Login con Google y agenda en la nube (opcional)

Sin configuración, la agenda se guarda solo en el navegador (`localStorage`). Para sincronizarla en la nube y acceder desde cualquier dispositivo con tu cuenta de Google:

1. **Crea un proyecto en [Supabase](https://supabase.com)** (plan gratuito, no pide tarjeta).
2. **Crea la tabla**: en el Dashboard, abre `SQL Editor` y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql). Esto crea la tabla `agenda_entries` con Row Level Security (cada usuario solo accede a sus propios datos).
3. **Habilita Google como proveedor**: en `Authentication > Providers > Google`.
   - Necesitas un OAuth Client de Google: en [Google Cloud Console](https://console.cloud.google.com/apis/credentials) crea unas credenciales `OAuth client ID` de tipo *Web application*, y agrega como *Authorized redirect URI* la que te muestra Supabase en esa misma pantalla (`https://<tu-proyecto>.supabase.co/auth/v1/callback`).
   - Copia el Client ID y Client Secret en Supabase.
4. **Configura el `.env`**: copia `Project Settings > API > URL` y `anon public key` en `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. **Restringe quién puede entrar** con `VITE_ALLOWED_EMAILS` (emails separados por coma). Si otra cuenta inicia sesión, la app la rechaza y cierra la sesión.
6. Reinicia `npm run dev`. Aparecerá el botón **"Entrar con Google"** en la barra superior.

Al iniciar sesión por primera vez, lo que tuvieras en la agenda local se sube automáticamente a tu cuenta.

**Notas sobre el plan gratuito y la seguridad:**

- Los proyectos gratuitos de Supabase se **pausan tras ~1 semana sin uso**; se reactivan con un clic desde el dashboard.
- Las variables `VITE_*` se incluyen en el bundle del navegador: la `anon key` está diseñada para ser pública (la seguridad real la da Row Level Security), pero la lista de `VITE_ALLOWED_EMAILS` es visible y su chequeo ocurre en el cliente. Para reforzar la restricción también en la base de datos, usa la política opcional comentada en `supabase/schema.sql`.

## Funcionalidades

- **Inicio**: tendencias del día/semana, novedades (estrenos de cine y series en emisión), populares y mejor valoradas, próximos estrenos.
- **Películas / Series**: catálogo completo navegable con filtro por género y orden (popularidad, valoración, fecha).
- **Buscar**: búsqueda combinada de películas y series por título.
- **Detalle**: sinopsis, género, valoración, fecha de estreno, duración/temporadas.
- **Mi agenda**: agrega cualquier título con un clic, define si está "por ver", "viendo" o "vista", y opcionalmente una fecha planeada para verla. Se guarda en tu navegador (`localStorage`) o, si configuras Supabase e inicias sesión con Google, en la nube.

## Build de producción

```bash
npm run build
npm run preview
```

## Desplegar en Raspberry Pi con Docker

Las imágenes usadas (`node:20-alpine`, `nginx:alpine`) son multi-arch, así que funcionan en ARM64 (Raspberry Pi 4/5) sin cambios.

**Importante**: las variables `VITE_*` se incrustan en el bundle **durante el build de la imagen**, así que el `.env` debe existir antes de construir. Si cambias el `.env`, hay que reconstruir (`--build`).

En la Raspberry Pi:

```bash
# 1. Docker (si no lo tienes)
curl -fsSL https://get.docker.com | sh

# 2. Clonar el repo y crear el .env
git clone <url-del-repo> tv-shows && cd tv-shows
nano .env   # pegar VITE_TMDB_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ALLOWED_EMAILS

# 3. Construir y levantar
docker compose up -d --build
```

La app queda en `http://<ip-de-la-pi>:8080`.

### Cloudflare Tunnel

En el dashboard de Cloudflare Zero Trust (`Networks > Tunnels > tu túnel > Public Hostname > Add`):

- **Hostname**: el subdominio que quieras (ej. `tvguide.tudominio.com`)
- **Service**: `http://localhost:8080` si `cloudflared` corre como servicio en la Pi.
  Si `cloudflared` corre como contenedor Docker, usa `http://<ip-de-la-pi>:8080` o conecta ambos contenedores a la misma red de Docker y usa `http://tvguide:80`.

### No olvidar: URLs de producción en Supabase

Para que el login con Google funcione desde el dominio público, en el dashboard de Supabase ve a **Authentication → URL Configuration** y:

1. En **Site URL** pon tu URL pública (ej. `https://tvguide.tudominio.com`).
2. En **Redirect URLs** agrega esa misma URL y, si sigues desarrollando en local, también `http://localhost:5173`.

Sin esto, después de autenticarte en Google, Supabase te redirigirá a la URL equivocada.
