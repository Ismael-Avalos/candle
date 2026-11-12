// Función de Supabase (corre en Deno, no en el navegador). Tiene dos usos:
//  1. La tarea programada la llama cada 15 minutos y envía los avisos que tocan.
//  2. La app la llama para mandar un aviso de prueba al dispositivo de quien lo pide.
import { buildPushHTTPRequest } from 'npm:@pushforge/builder@2'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { avisosPendientes } from './pendientes.ts'
import type { CumpleanosAviso } from './pendientes.ts'

interface Suscripcion {
  endpoint: string
  usuario_id: string
  p256dh: string
  auth: string
  zona_horaria: string
}

interface Carga {
  titulo: string
  cuerpo: string
  etiqueta: string
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// La clave service_role se salta las reglas de acceso: solo existe aquí, en el servidor.
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const VAPID_PRIVADA = Deno.env.get('VAPID_PRIVADA')!
const CRON_SECRETO = Deno.env.get('CRON_SECRETO')!
// Los servicios de push piden un contacto del remitente; por defecto, la dirección del proyecto.
const CONTACTO = Deno.env.get('CONTACTO_AVISOS') ?? Deno.env.get('SUPABASE_URL')!

const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...CORS, 'Content-Type': 'application/json' } })

/** Cifra y entrega un aviso a un dispositivo. Si la suscripción ya no existe, la borra. */
async function enviar(s: Suscripcion, carga: Carga): Promise<'ok' | 'caducada' | 'error'> {
  try {
    const peticion = await buildPushHTTPRequest({
      privateJWK: VAPID_PRIVADA,
      subscription: { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      // ttl: si el teléfono está apagado, el servicio de push lo sigue intentando 12 horas.
      message: { payload: { ...carga }, adminContact: CONTACTO, options: { ttl: 43_200, urgency: 'high' } },
    })
    const respuesta = await fetch(peticion.endpoint, {
      method: 'POST',
      headers: peticion.headers,
      body: peticion.body,
    })
    if (respuesta.ok) return 'ok'
    if (respuesta.status === 404 || respuesta.status === 410) {
      await db.from('suscripciones').delete().eq('endpoint', s.endpoint)
      return 'caducada'
    }
    console.error('Push rechazado', respuesta.status, await respuesta.text())
    return 'error'
  } catch (fallo) {
    console.error('Push fallido', fallo)
    return 'error'
  }
}

async function enviarPendientes() {
  const [suscripciones, cumpleanos] = await Promise.all([
    db.from('suscripciones').select('endpoint, usuario_id, p256dh, auth, zona_horaria'),
    db.from('cumpleanos').select('id, usuario_id, nombre, dia, mes, anio, avisos'),
  ])
  if (suscripciones.error || cumpleanos.error) throw suscripciones.error ?? cumpleanos.error

  const porUsuario = new Map<string, CumpleanosAviso[]>()
  for (const c of cumpleanos.data) {
    porUsuario.set(c.usuario_id, [...(porUsuario.get(c.usuario_id) ?? []), c])
  }

  const ahora = new Date()
  let enviados = 0
  let fallidos = 0

  for (const s of suscripciones.data as Suscripcion[]) {
    const pendientes = avisosPendientes(porUsuario.get(s.usuario_id) ?? [], ahora, s.zona_horaria)
    if (pendientes.length === 0) continue

    // Se descartan los que este dispositivo ya recibió.
    const { data: hechos, error } = await db
      .from('avisos_enviados')
      .select('cumpleanos_id, fecha, dias_antes')
      .eq('endpoint', s.endpoint)
      .in('fecha', [...new Set(pendientes.map((p) => p.fecha))])
    if (error) throw error
    const yaEnviados = new Set(hechos.map((h) => `${h.cumpleanos_id}|${h.fecha}|${h.dias_antes}`))

    for (const p of pendientes) {
      if (yaEnviados.has(`${p.cumpleanosId}|${p.fecha}|${p.diasAntes}`)) continue
      const resultado = await enviar(s, {
        titulo: p.titulo,
        cuerpo: p.cuerpo,
        etiqueta: `${p.cumpleanosId}-${p.diasAntes}`,
      })
      if (resultado === 'caducada') break
      if (resultado === 'error') {
        // No se anota: la siguiente pasada, en 15 minutos, lo vuelve a intentar.
        fallidos++
        continue
      }
      await db.from('avisos_enviados').insert({
        endpoint: s.endpoint,
        cumpleanos_id: p.cumpleanosId,
        fecha: p.fecha,
        dias_antes: p.diasAntes,
      })
      enviados++
    }
  }
  return { enviados, fallidos }
}

async function enviarPrueba(peticion: Request) {
  const token = peticion.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  const { data } = await db.auth.getUser(token)
  if (!data.user) return responder({ error: 'Sin sesión' }, 401)

  const { endpoint } = (await peticion.json().catch(() => ({}))) as { endpoint?: string }
  const { data: propias } = await db
    .from('suscripciones')
    .select('endpoint, usuario_id, p256dh, auth, zona_horaria')
    .eq('usuario_id', data.user.id)
    .eq('endpoint', endpoint ?? '')
  if (!propias?.length) return responder({ error: 'Este dispositivo no tiene los avisos activados' }, 404)

  const resultado = await enviar(propias[0] as Suscripcion, {
    titulo: 'Aviso de prueba',
    cuerpo: 'Los avisos de Candle funcionan en este dispositivo.',
    etiqueta: 'prueba',
  })
  return responder({ resultado }, resultado === 'ok' ? 200 : 502)
}

Deno.serve(async (peticion) => {
  if (peticion.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    if (peticion.headers.get('x-cron-secreto') === CRON_SECRETO) return responder(await enviarPendientes())
    return await enviarPrueba(peticion)
  } catch (fallo) {
    console.error(fallo)
    return responder({ error: 'Fallo interno' }, 500)
  }
})
