import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { MESES, diasDelMes } from '../lib/fechas'
import type { Cumpleanos, DatosCumpleanos } from '../lib/tipos'
import { SelectorAvisos } from './SelectorAvisos'

const AVISOS_INICIALES = [7, 1]
const ANIO_MINIMO = 1900

interface Props {
  /** Si llega, el formulario edita ese cumpleaños; si no, crea uno nuevo. */
  inicial?: Cumpleanos
  hoy: Date
  onGuardar: (datos: DatosCumpleanos) => void
  onEliminar: () => void
  onCerrar: () => void
}

const campo = 'w-full rounded-xl border border-borde bg-fondo px-3.5 py-3 text-texto placeholder:text-tenue/60'
const etiqueta = 'mb-1.5 block text-sm font-medium text-tenue'

export function Formulario({ inicial, hoy, onGuardar, onEliminar, onCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [dia, setDia] = useState(inicial?.dia ?? hoy.getDate())
  const [mes, setMes] = useState(inicial?.mes ?? hoy.getMonth() + 1)
  const [anio, setAnio] = useState(inicial?.anio ? String(inicial.anio) : '')
  const [avisos, setAvisos] = useState(inicial?.avisos ?? AVISOS_INICIALES)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)

  // <dialog> con showModal() da gratis el foco atrapado, la tecla Esc y el fondo oscurecido.
  useEffect(() => {
    if (dialogo.current && !dialogo.current.open) dialogo.current.showModal()
  }, [])

  const cambiarMes = (nuevo: number) => {
    setMes(nuevo)
    setDia((actual) => Math.min(actual, diasDelMes(nuevo)))
  }

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    onGuardar({
      nombre: nombre.trim(),
      dia,
      mes,
      anio: anio ? Number(anio) : undefined,
      avisos: [...avisos].sort((a, b) => b - a),
    })
  }

  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      onClick={(e) => {
        // Un toque fuera de la hoja cae sobre el propio <dialog>.
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
      className="m-0 mx-auto mt-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-b-0 border-borde bg-superficie text-texto sm:my-auto sm:rounded-3xl sm:border-b"
    >
      <form onSubmit={enviar} className="flex flex-col gap-5 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <h2 className="font-titulo text-2xl">{inicial ? 'Editar cumpleaños' : 'Nuevo cumpleaños'}</h2>

        <div>
          <label htmlFor="nombre" className={etiqueta}>
            Nombre
          </label>
          <input
            id="nombre"
            required
            autoFocus={!inicial}
            autoComplete="off"
            maxLength={60}
            pattern=".*\S.*"
            title="Escribe un nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="¿De quién es?"
            className={campo}
          />
        </div>

        <div className="grid grid-cols-[5rem_1fr_6.5rem] gap-2">
          <div>
            <label htmlFor="dia" className={etiqueta}>
              Día
            </label>
            <select id="dia" value={dia} onChange={(e) => setDia(Number(e.target.value))} className={campo}>
              {Array.from({ length: diasDelMes(mes) }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="mes" className={etiqueta}>
              Mes
            </label>
            <select id="mes" value={mes} onChange={(e) => cambiarMes(Number(e.target.value))} className={campo}>
              {MESES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="anio" className={etiqueta}>
              Año
            </label>
            <input
              id="anio"
              type="number"
              inputMode="numeric"
              min={ANIO_MINIMO}
              max={hoy.getFullYear()}
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="Opcional"
              className={campo}
            />
          </div>
        </div>

        <SelectorAvisos valor={avisos} onCambio={setAvisos} />

        <div className="mt-1 flex items-center gap-3">
          {inicial &&
            (confirmarBorrado ? (
              <button type="button" onClick={onEliminar} className="px-2 py-3 font-semibold text-peligro">
                Sí, eliminar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmarBorrado(true)}
                className="px-2 py-3 font-medium text-tenue hover:text-peligro"
              >
                Eliminar
              </button>
            ))}
          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            className="ml-auto px-4 py-3 font-medium text-tenue hover:text-texto"
          >
            Cancelar
          </button>
          <button type="submit" className="rounded-full bg-llama px-6 py-3 font-semibold text-tinta hover:bg-brasa">
            Guardar
          </button>
        </div>
      </form>
    </dialog>
  )
}
