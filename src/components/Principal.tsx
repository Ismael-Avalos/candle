import { useState } from 'react'
import { useCumpleanos } from '../hooks/useCumpleanos'
import { useHoy } from '../hooks/useHoy'
import { desactivarAvisos } from '../lib/avisos'
import { supabase } from '../lib/supabase'
import type { DatosCumpleanos } from '../lib/tipos'
import { EstadoAvisos } from './EstadoAvisos'
import { Formulario } from './Formulario'
import { Llama, Mas } from './Icono'
import { Instalar } from './Instalar'
import { Lista } from './Lista'

/** Qué muestra el formulario: nada, uno nuevo o el cumpleaños con ese identificador. */
type Edicion = null | 'nuevo' | { id: string }

interface Props {
  usuarioId: string
}

export function Principal({ usuarioId }: Props) {
  const { lista, error, agregar, actualizar, eliminar } = useCumpleanos(usuarioId)
  const [edicion, setEdicion] = useState<Edicion>(null)
  const hoy = useHoy()

  const enEdicion = edicion && edicion !== 'nuevo' ? lista.find((c) => c.id === edicion.id) : undefined

  const guardar = (datos: DatosCumpleanos) => {
    if (enEdicion) void actualizar(enEdicion.id, datos)
    else void agregar(datos)
    setEdicion(null)
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-32">
      <header className="flex items-center gap-2.5">
        <Llama className="size-7 text-llama" />
        <h1 className="font-titulo text-3xl font-semibold tracking-tight">Candle</h1>
        <button
          type="button"
          onClick={() => void desactivarAvisos().then(() => supabase.auth.signOut())}
          className="ml-auto px-2 py-2 text-sm font-medium text-tenue hover:text-texto"
        >
          Salir
        </button>
      </header>

      <EstadoAvisos />
      <Instalar />

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-peligro/40 bg-peligro/10 px-3.5 py-3 text-sm text-peligro">
          {error}
        </p>
      )}

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
            if (enEdicion) void eliminar(enEdicion.id)
            setEdicion(null)
          }}
          onCerrar={() => setEdicion(null)}
        />
      )}
    </div>
  )
}
