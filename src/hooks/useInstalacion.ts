import { useCallback, useEffect, useState } from 'react'

/** Evento de Chrome y Edge; aún no está en los tipos estándar del DOM. */
interface EventoInstalar extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type ModoInstalacion =
  /** El navegador ofrece instalar: basta llamar a `instalar()`. */
  | 'directa'
  /** iPhone o iPad: solo se pueden dar instrucciones. */
  | 'ios'
  /** Ya está instalada, o este navegador no permite instalar. */
  | 'no-disponible'

function yaInstalada(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari en iOS usa su propia propiedad.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function esIos(): boolean {
  const ua = navigator.userAgent
  // Los iPad recientes se identifican como Mac; se distinguen por la pantalla táctil.
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

/**
 * Instalar la app.
 * - Android y escritorio: el navegador dispara `beforeinstallprompt`; se guarda y se usa
 *   cuando la persona pulsa el botón.
 * - iOS: no hay evento ni instalación por código.
 */
export function useInstalacion(): { modo: ModoInstalacion; instalar: () => Promise<void> } {
  const [evento, setEvento] = useState<EventoInstalar | null>(null)
  const [instalada, setInstalada] = useState(yaInstalada)

  useEffect(() => {
    const disponible = (e: Event) => {
      // Evita la barrita propia del navegador: se ofrece con nuestro botón.
      e.preventDefault()
      setEvento(e as EventoInstalar)
    }
    const hecha = () => {
      setInstalada(true)
      setEvento(null)
    }
    window.addEventListener('beforeinstallprompt', disponible)
    window.addEventListener('appinstalled', hecha)
    return () => {
      window.removeEventListener('beforeinstallprompt', disponible)
      window.removeEventListener('appinstalled', hecha)
    }
  }, [])

  const instalar = useCallback(async () => {
    if (!evento) return
    await evento.prompt()
    // El evento solo sirve una vez, se acepte o no.
    await evento.userChoice
    setEvento(null)
  }, [evento])

  const modo: ModoInstalacion = instalada ? 'no-disponible' : evento ? 'directa' : esIos() ? 'ios' : 'no-disponible'
  return { modo, instalar }
}
