import { supabase } from './supabase'

export type EstadoAvisos = 'comprobando' | 'no-disponibles' | 'pendientes' | 'denegados' | 'activados'

/** Clave pública de envío. Identifica a Candle ante el servicio de push; no es secreta. */
const VAPID_PUBLICA = import.meta.env.VITE_VAPID_PUBLICA as string | undefined

const ESPERA_SERVICE_WORKER_MS = 8000

const disponibles = () =>
  Boolean(VAPID_PUBLICA) && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

/** El service worker ya instalado. Si no llega a estarlo, se da por imposible en vez de esperar sin fin. */
function registro(): Promise<ServiceWorkerRegistration | null> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolver) => setTimeout(() => resolver(null), ESPERA_SERVICE_WORKER_MS)),
  ])
}

/** Safari exige la clave como bytes, no como texto. */
function aBytes(base64url: string) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

/** Guarda en la cuenta la «dirección de envío» de este dispositivo y su zona horaria. */
async function guardar(suscripcion: PushSubscription): Promise<boolean> {
  const { endpoint, keys } = suscripcion.toJSON()
  if (!endpoint || !keys?.p256dh || !keys.auth) return false
  const { error } = await supabase.from('suscripciones').upsert({
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  return !error
}

/** Cómo están los avisos en este dispositivo. De paso refresca la zona horaria guardada. */
export async function comprobarAvisos(): Promise<EstadoAvisos> {
  if (!disponibles()) return 'no-disponibles'
  if (Notification.permission === 'denied') return 'denegados'
  if (Notification.permission !== 'granted') return 'pendientes'
  const sw = await registro()
  const suscripcion = await sw?.pushManager.getSubscription()
  if (!suscripcion) return 'pendientes'
  return (await guardar(suscripcion)) ? 'activados' : 'pendientes'
}

/** Pide permiso y suscribe este dispositivo. Tiene que llamarse desde un toque de la persona. */
export async function activarAvisos(): Promise<EstadoAvisos> {
  if (!disponibles()) return 'no-disponibles'
  const permiso = await Notification.requestPermission()
  if (permiso === 'denied') return 'denegados'
  if (permiso !== 'granted') return 'pendientes'
  const sw = await registro()
  if (!sw) return 'no-disponibles'
  const suscripcion =
    (await sw.pushManager.getSubscription()) ??
    (await sw.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(VAPID_PUBLICA!) }))
  return (await guardar(suscripcion)) ? 'activados' : 'pendientes'
}

/** Pide al servidor un aviso de prueba para este dispositivo. */
export async function enviarAvisoDePrueba(): Promise<boolean> {
  const suscripcion = await (await registro())?.pushManager.getSubscription()
  if (!suscripcion) return false
  const { error } = await supabase.functions.invoke('enviar-avisos', { body: { endpoint: suscripcion.endpoint } })
  return !error
}

/** Al salir de la cuenta, este dispositivo deja de recibir sus avisos. */
export async function desactivarAvisos() {
  if (!disponibles()) return
  try {
    const suscripcion = await (await registro())?.pushManager.getSubscription()
    if (!suscripcion) return
    await supabase.from('suscripciones').delete().eq('endpoint', suscripcion.endpoint)
    await suscripcion.unsubscribe()
  } catch {
    // Salir de la cuenta no debe fallar por esto.
  }
}
