# Candle

Guarda un cumpleaños una sola vez y recibe el aviso cada año: con la antelación que elijas
y, siempre, el mismo día a las 00:00.

PWA hecha con React, TypeScript, Vite y Tailwind v4. Las cuentas, los datos y el envío de
avisos viven en Supabase.

## Cómo funciona

- **App** (`src/`): lista de próximos cumpleaños y un formulario con nombre, fecha y avisos.
- **Service worker** (`src/sw.ts`): recibe los avisos push y los muestra aunque la app esté cerrada.
- **Base de datos** (`supabase/*.sql`): tablas `cumpleanos`, `suscripciones` y `avisos_enviados`,
  con Row Level Security para que cada persona solo vea lo suyo.
- **Función de envío** (`supabase/functions/enviar-avisos`): una tarea programada la llama cada
  15 minutos. Envía el aviso del propio día desde las 00:00 de la zona horaria de cada
  dispositivo y los anticipados desde las 9:00; si un envío falla, lo reintenta.

## Desarrollo

```bash
npm install
npm run dev
```

Copia `.env.example` como `.env.local` y rellena la URL del proyecto, la clave publishable
y la clave pública VAPID.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Pruebas de la lógica de fechas y de avisos |
| `npm run build` | Comprueba tipos y genera `dist/` |
| `npm run lint` | Revisa el código con oxlint |
| `npm run iconos` | Regenera los íconos desde `public/logo.svg` |

## Puesta en marcha de Supabase

1. Ejecutar `supabase/esquema.sql` en el SQL Editor.
2. Guardar la contraseña de la tarea programada: `select vault.create_secret('<valor>', 'cron_secreto');`
3. Ejecutar `supabase/avisos.sql`.
4. Desplegar la función y sus secretos (`VAPID_PRIVADA` y `CRON_SECRETO`):

```bash
npx supabase functions deploy enviar-avisos --remote=<ref> --no-verify-jwt
npx supabase secrets set --env-file supabase/secretos.env.local --remote=<ref>
```

Las claves privadas nunca van al repositorio: viven en archivos `*.local`, ignorados por git.

## Publicación

En Vercel, con las tres variables de `.env.example` definidas en el proyecto. En Supabase,
**Authentication → URL Configuration** debe apuntar a la dirección publicada.
