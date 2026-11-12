import { useEffect, useState } from 'react'
import type { Cumpleanos, DatosCumpleanos } from '../lib/tipos'

const CLAVE = 'candle:cumpleanos'

function leer(): Cumpleanos[] {
  try {
    const guardado = localStorage.getItem(CLAVE)
    return guardado ? (JSON.parse(guardado) as Cumpleanos[]) : []
  } catch {
    // Almacenamiento bloqueado o datos corruptos: se empieza con la lista vacía.
    return []
  }
}

/**
 * La lista de cumpleaños y sus operaciones. Por ahora vive en el dispositivo;
 * en la fase 2 este archivo pasa a hablar con Supabase y los componentes no cambian.
 */
export function useCumpleanos() {
  const [lista, setLista] = useState<Cumpleanos[]>(leer)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lista))
    } catch {
      // Sin almacenamiento la lista sigue funcionando durante la sesión.
    }
  }, [lista])

  return {
    lista,
    agregar: (datos: DatosCumpleanos) => setLista((actual) => [...actual, { ...datos, id: crypto.randomUUID() }]),
    actualizar: (id: string, datos: DatosCumpleanos) =>
      setLista((actual) => actual.map((c) => (c.id === id ? { ...datos, id } : c))),
    eliminar: (id: string) => setLista((actual) => actual.filter((c) => c.id !== id)),
  }
}
