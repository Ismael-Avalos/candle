import { useEffect, useState } from 'react'

/**
 * La fecha actual como estado. Se renueva al volver a la app, para que
 * «Hoy» y «Mañana» no se queden con el día en que se abrió por última vez.
 */
export function useHoy(): Date {
  const [hoy, setHoy] = useState(() => new Date())

  useEffect(() => {
    const renovar = () => {
      if (document.visibilityState === 'visible') setHoy(new Date())
    }
    document.addEventListener('visibilitychange', renovar)
    return () => document.removeEventListener('visibilitychange', renovar)
  }, [])

  return hoy
}
