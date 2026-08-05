-- Esquema de la agenda personal + agendas compartidas.
-- Es idempotente: puedes ejecutarlo completo en el SQL Editor de Supabase
-- (Dashboard > SQL Editor) tanto en una base nueva como para actualizar
-- una que ya tenía la versión anterior.

-- ============ Tablas ============

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

-- Título original (en su idioma nativo): permite buscar en la agenda por el
-- nombre en inglés además del traducido. Se añade aparte para que las bases
-- creadas con la versión anterior del esquema también lo incorporen.
alter table public.agenda_entries add column if not exists original_title text;

alter table public.agenda_entries enable row level security;

-- Permisos otorgados sobre una agenda. Se comparte por email para que
-- funcione aunque la otra persona todavía no haya iniciado sesión nunca.
create table if not exists public.agenda_shares (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  owner_email text not null,
  shared_with_email text not null,
  permission text not null check (permission in ('read', 'write')),
  created_at timestamptz not null default now(),
  primary key (owner_id, shared_with_email)
);

alter table public.agenda_shares enable row level security;

-- ============ Funciones de acceso ============
-- SECURITY DEFINER: consultan agenda_shares sin pasar por sus políticas RLS,
-- para poder usarlas dentro de las políticas de agenda_entries.

create or replace function public.can_read_agenda(owner uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select owner = auth.uid()
    or exists (
      select 1 from public.agenda_shares s
      where s.owner_id = owner
        and lower(s.shared_with_email) = lower(auth.jwt() ->> 'email')
    );
$$;

create or replace function public.can_write_agenda(owner uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select owner = auth.uid()
    or exists (
      select 1 from public.agenda_shares s
      where s.owner_id = owner
        and lower(s.shared_with_email) = lower(auth.jwt() ->> 'email')
        and s.permission = 'write'
    );
$$;

-- ============ Políticas de agenda_shares ============

drop policy if exists "shares_owner" on public.agenda_shares;
create policy "shares_owner" on public.agenda_shares
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id and lower(owner_email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "shares_recipient_read" on public.agenda_shares;
create policy "shares_recipient_read" on public.agenda_shares
  for select
  using (lower(shared_with_email) = lower(auth.jwt() ->> 'email'));

-- ============ Políticas de agenda_entries ============
-- Reemplazan a la antigua "own_entries": ahora también permiten leer agendas
-- compartidas conmigo, y escribirlas si me dieron permiso 'write'.

drop policy if exists "own_entries" on public.agenda_entries;
drop policy if exists "own_entries_allowlist" on public.agenda_entries;

drop policy if exists "entries_select" on public.agenda_entries;
create policy "entries_select" on public.agenda_entries
  for select using (public.can_read_agenda(user_id));

drop policy if exists "entries_insert" on public.agenda_entries;
create policy "entries_insert" on public.agenda_entries
  for insert with check (public.can_write_agenda(user_id));

drop policy if exists "entries_update" on public.agenda_entries;
create policy "entries_update" on public.agenda_entries
  for update using (public.can_write_agenda(user_id)) with check (public.can_write_agenda(user_id));

drop policy if exists "entries_delete" on public.agenda_entries;
create policy "entries_delete" on public.agenda_entries
  for delete using (public.can_write_agenda(user_id));
