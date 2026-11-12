-- Fase 3: avisos. Se ejecuta una vez en Supabase (SQL Editor → pegar → Run),
-- DESPUÉS de haber ejecutado secreto-cron.sql.local.

-- Un dispositivo que aceptó recibir avisos. El navegador entrega el endpoint y las dos claves.
create table public.suscripciones (
  endpoint text primary key,
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  -- Zona horaria del dispositivo, para que las 00:00 sean las de su dueño.
  zona_horaria text not null,
  creado_en timestamptz not null default now()
);

create index suscripciones_usuario_idx on public.suscripciones (usuario_id);

alter table public.suscripciones enable row level security;

create policy "Ver las propias" on public.suscripciones
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Crear las propias" on public.suscripciones
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Editar las propias" on public.suscripciones
  for update to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Borrar las propias" on public.suscripciones
  for delete to authenticated using ((select auth.uid()) = usuario_id);

revoke all on public.suscripciones from anon;
grant select, insert, update, delete on public.suscripciones to authenticated;

-- Registro de avisos ya entregados, para no repetirlos. Si un cumpleaños o un dispositivo
-- se borra, su historial se va con él.
create table public.avisos_enviados (
  endpoint text not null references public.suscripciones (endpoint) on delete cascade,
  cumpleanos_id uuid not null references public.cumpleanos (id) on delete cascade,
  fecha date not null,
  dias_antes smallint not null,
  enviado_en timestamptz not null default now(),
  primary key (endpoint, cumpleanos_id, fecha, dias_antes)
);

-- Sin reglas: nadie desde la app puede leerla ni escribirla. Solo la función de envío.
alter table public.avisos_enviados enable row level security;
revoke all on public.avisos_enviados from anon, authenticated;

-- Tarea programada: cada 15 minutos la base de datos llama a la función de envío.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'candle-enviar-avisos',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://byqnovenhxpxryxgfikc.supabase.co/functions/v1/enviar-avisos',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secreto', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secreto')
    ),
    body := '{}'::jsonb
  );
  $$
);
