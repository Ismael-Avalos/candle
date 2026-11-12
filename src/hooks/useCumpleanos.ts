import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Cumpleanos, DatosCumpleanos } from '../lib/tipos'

/** Lista de la fase 1, guardada solo en el dispositivo. Se sube a la cuenta la primera vez. */
const CLAVE_ANTIGUA = 'candle:cumpleanos'
const COLUMNAS = 'id, nombre, dia, mes, anio, avisos'

const claveCopia = (usuarioId: string) => `candle:copia:${usuarioId}`

interface Fila {
  id: string
  nombre: string
  dia: number
  mes: number
  anio: number | null
  avisos: number[]
}

const desdeFila = (f: Fila): Cumpleanos => ({ ...f, anio: f.anio ?? undefined })
const haciaFila = (c: Cumpleanos): Fila => ({ ...c, anio: c.anio ?? null })

function leerJson(clave: string): Cumpleanos[] {
  try {
    const guardado = localStorage.getItem(clave)
    return guardado ? (JSON.parse(guardado) as Cumpleanos[]) : []
  } catch {
    return []
  }
}

function guardarJson(clave: string, lista: Cumpleanos[]) {
  try {
    localStorage.setItem(clave, JSON.stringify(lista))
  } catch {
    // Sin almacenamiento solo se pierde la copia local; los datos están en la cuenta.
  }
}

/** Sube a la cuenta lo que hubiera guardado en el dispositivo antes de existir las cuentas. */
async function subirListaAntigua() {
  const antigua = leerJson(CLAVE_ANTIGUA)
  if (antigua.length === 0) return
  // Se retira antes de subir para que dos cargas seguidas no la dupliquen.
  localStorage.removeItem(CLAVE_ANTIGUA)
  const { error } = await supabase.from('cumpleanos').upsert(antigua.map(haciaFila))
  if (error) guardarJson(CLAVE_ANTIGUA, antigua)
}

/**
 * La lista de cumpleaños de una cuenta. Los datos viven en Supabase; en el dispositivo
 * se guarda una copia para pintar la lista al instante mientras llega la de verdad.
 */
export function useCumpleanos(usuarioId: string) {
  const [lista, setLista] = useState<Cumpleanos[]>(() => leerJson(claveCopia(usuarioId)))
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    const { data, error: fallo } = await supabase.from('cumpleanos').select(COLUMNAS)
    if (fallo) {
      setError('No se pudo conectar. Se muestra lo último guardado en este dispositivo.')
      return
    }
    const nueva = (data as Fila[]).map(desdeFila)
    setLista(nueva)
    guardarJson(claveCopia(usuarioId), nueva)
    setError('')
  }, [usuarioId])

  useEffect(() => {
    void subirListaAntigua().then(cargar)
  }, [cargar])

  /**
   * Cada cambio se pinta al momento y después se envía. Si el envío falla,
   * se vuelve a cargar la lista real para no mostrar algo que no se guardó.
   */
  const enviar = async (siguiente: Cumpleanos[], operacion: PromiseLike<{ error: unknown }>) => {
    setLista(siguiente)
    const { error: fallo } = await operacion
    if (fallo) {
      await cargar()
      setError('No se pudo guardar el cambio. Revisa tu conexión e inténtalo de nuevo.')
      return
    }
    guardarJson(claveCopia(usuarioId), siguiente)
    setError('')
  }

  return {
    lista,
    error,
    agregar: (datos: DatosCumpleanos) => {
      const nuevo: Cumpleanos = { ...datos, id: crypto.randomUUID() }
      return enviar([...lista, nuevo], supabase.from('cumpleanos').insert(haciaFila(nuevo)))
    },
    actualizar: (id: string, datos: DatosCumpleanos) => {
      const cambiado: Cumpleanos = { ...datos, id }
      return enviar(
        lista.map((c) => (c.id === id ? cambiado : c)),
        supabase.from('cumpleanos').update(haciaFila(cambiado)).eq('id', id),
      )
    },
    eliminar: (id: string) =>
      enviar(
        lista.filter((c) => c.id !== id),
        supabase.from('cumpleanos').delete().eq('id', id),
      ),
  }
}
