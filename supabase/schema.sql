-- Esquema de la agenda personal. Ejecutar una sola vez en el
-- SQL Editor del proyecto de Supabase (Dashboard > SQL Editor).

create table if not exists public.agenda_entries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  media_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  status text not null check (status in ('pendiente', 'viendo', 'vista')),
  scheduled_date date,
  added_at timestamptz not null default now(),
  primary key (user_id, media_type, media_id)
);

alter table public.agenda_entries enable row level security;

-- Cada usuario solo puede leer y modificar sus propias entradas.
create policy "own_entries" on public.agenda_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- OPCIONAL (recomendado): además de la lista de emails del .env (que solo
-- se valida en el navegador), puedes reforzar la restricción en la base.
-- Reemplaza los emails y ejecuta esto en lugar de la política anterior:
--
-- drop policy if exists "own_entries" on public.agenda_entries;
-- create policy "own_entries_allowlist" on public.agenda_entries
--   for all
--   using (
--     auth.uid() = user_id
--     and (auth.jwt() ->> 'email') in ('sebaj80@gmail.com')
--   )
--   with check (
--     auth.uid() = user_id
--     and (auth.jwt() ->> 'email') in ('sebaj80@gmail.com')
--   );
