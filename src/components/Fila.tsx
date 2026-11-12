import { diasHasta, edadQueCumple, proximoCumpleanos, textoFalta, textoFecha } from '../lib/fechas'
import type { Cumpleanos } from '../lib/tipos'
import { Llama } from './Icono'

interface Props {
  cumpleanos: Cumpleanos
  hoy: Date
  onAbrir: () => void
}

export function Fila({ cumpleanos, hoy, onAbrir }: Props) {
  const proximo = proximoCumpleanos(cumpleanos.dia, cumpleanos.mes, hoy)
  const dias = diasHasta(proximo, hoy)
  const esHoy = dias === 0
  const edad = cumpleanos.anio ? edadQueCumple(cumpleanos.anio, proximo) : 0

  return (
    <li>
      <button
        type="button"
        onClick={onAbrir}
        className="flex w-full items-center gap-4 border-b border-borde py-4 text-left transition-colors hover:bg-superficie/60"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate font-titulo text-xl">{cumpleanos.nombre}</span>
          <span className="mt-0.5 block text-sm text-tenue">
            {textoFecha(cumpleanos.dia, cumpleanos.mes)}
            {edad > 0 && ` · cumple ${edad}`}
          </span>
        </span>
        <span
          className={`flex shrink-0 items-center gap-1.5 text-sm font-semibold ${esHoy ? 'text-llama' : 'text-tenue'}`}
        >
          {esHoy && <Llama className="size-4" />}
          {textoFalta(dias)}
        </span>
      </button>
    </li>
  )
}
