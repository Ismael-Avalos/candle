-- Esquema de Candle. Se ejecuta una vez en Supabase: SQL Editor → pegar → Run.

create table public.cumpleanos (
  id uuid primary key default gen_random_uuid(),
  -- A quién pertenece la fila. Si se borra la cuenta, se borran sus cumpleaños.
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null check (char_length(btrim(nombre)) between 1 and 60),
  dia smallint not null check (dia between 1 and 31),
  mes smallint not null check (mes between 1 and 12),
  anio smallint check (anio between 1900 and 2200),
  -- Avisos anticipados, en días antes. El del propio día a las 00:00 es fijo y no se guarda.
  avisos smallint[] not null default '{}',
  creado_en timestamptz not null default now()
);

create index cumpleanos_usuario_idx on public.cumpleanos (usuario_id);

-- Row Level Security: sin una regla que lo permita, nadie lee ni escribe nada.
alter table public.cumpleanos enable row level security;

create policy "Ver los propios" on public.cumpleanos
  for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "Crear los propios" on public.cumpleanos
  for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy "Editar los propios" on public.cumpleanos
  for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

create policy "Borrar los propios" on public.cumpleanos
  for delete to authenticated
  using ((select auth.uid()) = usuario_id);

-- Solo quien ha iniciado sesión puede tocar la tabla; las reglas de arriba deciden qué filas.
revoke all on public.cumpleanos from anon;
grant select, insert, update, delete on public.cumpleanos to authenticated;
