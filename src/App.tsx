import { useState } from 'react'
import { Formulario } from './components/Formulario'
import { Llama, Mas } from './components/Icono'
import { Lista } from './components/Lista'
import { useCumpleanos } from './hooks/useCumpleanos'
import { useHoy } from './hooks/useHoy'
import type { DatosCumpleanos } from './lib/tipos'

/** Qué muestra el formulario: nada, uno nuevo o el cumpleaños con ese identificador. */
type Edicion = null | 'nuevo' | { id: string }

export default function App() {
  const { lista, agregar, actualizar, eliminar } = useCumpleanos()
  const [edicion, setEdicion] = useState<Edicion>(null)
  const hoy = useHoy()

  const enEdicion = edicion && edicion !== 'nuevo' ? lista.find((c) => c.id === edicion.id) : undefined

  const guardar = (datos: DatosCumpleanos) => {
    if (enEdicion) actualizar(enEdicion.id, datos)
    else agregar(datos)
    setEdicion(null)
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-32">
      <header className="flex items-center gap-2.5">
        <Llama className="size-7 text-llama" />
        <h1 className="font-titulo text-3xl font-semibold tracking-tight">Candle</h1>
      </header>

      <main>
        <Lista lista={lista} hoy={hoy} onAbrir={(id) => setEdicion({ id })} />
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center bg-linear-to-t from-fondo from-55% to-transparent px-5 pt-10 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setEdicion('nuevo')}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-llama px-6 py-3.5 font-semibold text-tinta shadow-lg shadow-black/40 hover:bg-brasa"
        >
          <Mas className="size-5" />
          Añadir cumpleaños
        </button>
      </div>

      {edicion && (
        <Formulario
          key={enEdicion?.id ?? 'nuevo'}
          inicial={enEdicion}
          hoy={hoy}
          onGuardar={guardar}
          onEliminar={() => {
            if (enEdicion) eliminar(enEdicion.id)
            setEdicion(null)
          }}
          onCerrar={() => setEdicion(null)}
        />
      )}
    </div>
  )
}
