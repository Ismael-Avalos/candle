import { useState } from 'react'
import { textoAviso } from '../lib/fechas'
import { Candado } from './Icono'

const HABITUALES = [7, 3, 1]
const MAXIMO_DIAS = 365

interface Props {
  valor: number[]
  onCambio: (avisos: number[]) => void
}

const base = 'rounded-full border px-3.5 py-2 text-sm font-medium transition-colors'
const activo = `${base} border-llama bg-llama text-tinta`
const inactivo = `${base} border-borde text-tenue hover:border-tenue hover:text-texto`

export function SelectorAvisos({ valor, onCambio }: Props) {
  const [otro, setOtro] = useState('')

  // Los habituales siempre se ofrecen; los personalizados aparecen mientras estén elegidos.
  const opciones = [...new Set([...HABITUALES, ...valor])].sort((a, b) => b - a)

  const alternar = (dias: number) =>
    onCambio(valor.includes(dias) ? valor.filter((d) => d !== dias) : [...valor, dias])

  const diasOtro = Number(otro)
  const otroValido = Number.isInteger(diasOtro) && diasOtro >= 1 && diasOtro <= MAXIMO_DIAS

  const agregarOtro = () => {
    if (!otroValido) return
    if (!valor.includes(diasOtro)) onCambio([...valor, diasOtro])
    setOtro('')
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium text-tenue">Cuándo avisar</legend>

      <div className="mt-2 flex flex-wrap gap-2">
        {opciones.map((dias) => (
          <button
            key={dias}
            type="button"
            aria-pressed={valor.includes(dias)}
            onClick={() => alternar(dias)}
            className={valor.includes(dias) ? activo : inactivo}
          >
            {textoAviso(dias)}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-tenue">
        <label htmlFor="otro-aviso">Otro:</label>
        <input
          id="otro-aviso"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAXIMO_DIAS}
          value={otro}
          onChange={(e) => setOtro(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              agregarOtro()
            }
          }}
          className="w-16 rounded-lg border border-borde bg-fondo px-2 py-1.5 text-center text-texto"
        />
        <span>días antes</span>
        <button
          type="button"
          onClick={agregarOtro}
          disabled={!otroValido}
          className="ml-auto rounded-lg px-3 py-1.5 font-semibold text-llama disabled:text-borde"
        >
          Añadir
        </button>
      </div>

      <p className="mt-4 flex items-center gap-2 rounded-xl border border-llama/40 bg-llama/10 px-3.5 py-3 text-sm text-llama">
        <Candado className="size-4 shrink-0" />
        <span>
          <strong className="font-semibold">El mismo día a las 00:00.</strong> Este aviso llega siempre.
        </span>
      </p>
    </fieldset>
  )
}
