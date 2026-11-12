import { diasHasta, proximoCumpleanos } from '../lib/fechas'
import type { Cumpleanos } from '../lib/tipos'
import { Fila } from './Fila'
import { Llama } from './Icono'

interface Props {
  lista: Cumpleanos[]
  hoy: Date
  onAbrir: (id: string) => void
}

export function Lista({ lista, hoy, onAbrir }: Props) {
  if (lista.length === 0) {
    return (
      <div className="mt-24 flex flex-col items-center text-center">
        <Llama className="size-12 text-llama" />
        <p className="mt-5 font-titulo text-2xl">Aún no hay cumpleaños</p>
        <p className="mt-2 max-w-64 text-tenue">Guarda el primero una sola vez y Candle te avisará cada año.</p>
      </div>
    )
  }

  const falta = (c: Cumpleanos) => diasHasta(proximoCumpleanos(c.dia, c.mes, hoy), hoy)
  const ordenada = [...lista].sort((a, b) => falta(a) - falta(b) || a.nombre.localeCompare(b.nombre, 'es'))

  return (
    <ul className="mt-4">
      {ordenada.map((c) => (
        <Fila key={c.id} cumpleanos={c} hoy={hoy} onAbrir={() => onAbrir(c.id)} />
      ))}
    </ul>
  )
}
