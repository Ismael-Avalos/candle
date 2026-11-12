import { useState } from 'react'
import type { FormEvent } from 'react'
import { errorDeEnlace, supabase } from '../lib/supabase'
import { Llama } from './Icono'
import { Instalar } from './Instalar'

const campo = 'w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-texto placeholder:text-tenue/60'
const boton = 'w-full rounded-full bg-llama px-6 py-3.5 font-semibold text-tinta hover:bg-brasa disabled:opacity-60'

/**
 * Entrada sin contraseña en dos pasos: se pide el correo y luego el código que llega.
 * Se usa código y no solo enlace porque en iPhone el enlace abre Safari,
 * que no comparte la sesión con la app instalada.
 */
export function Acceso() {
  const [paso, setPaso] = useState<'correo' | 'codigo'>('correo')
  const [correo, setCorreo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(errorDeEnlace)

  const pedirCodigo = async (evento: FormEvent) => {
    evento.preventDefault()
    setOcupado(true)
    setError('')
    const { error: fallo } = await supabase.auth.signInWithOtp({
      email: correo.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setOcupado(false)
    if (fallo) setError('No se pudo enviar el correo. Espera un minuto y vuelve a intentarlo.')
    else setPaso('codigo')
  }

  const comprobarCodigo = async (evento: FormEvent) => {
    evento.preventDefault()
    setOcupado(true)
    setError('')
    const { error: fallo } = await supabase.auth.verifyOtp({
      email: correo.trim(),
      token: codigo.trim(),
      type: 'email',
    })
    setOcupado(false)
    // Si sale bien no hay nada más que hacer: useSesion detecta la entrada y App cambia de pantalla.
    if (fallo) setError('El código no es correcto o ya caducó.')
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <Llama className="size-12 text-llama" />
      <h1 className="mt-4 font-titulo text-4xl font-semibold tracking-tight">Candle</h1>
      <p className="mt-2 text-tenue">Guarda un cumpleaños una vez. Te avisamos cada año.</p>

      {paso === 'correo' ? (
        <form onSubmit={pedirCodigo} className="mt-8 flex flex-col gap-3">
          <label htmlFor="correo" className="text-sm font-medium text-tenue">
            Tu correo
          </label>
          <input
            id="correo"
            type="email"
            required
            autoComplete="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="nombre@ejemplo.com"
            className={campo}
          />
          <button type="submit" disabled={ocupado} className={boton}>
            {ocupado ? 'Enviando…' : 'Enviarme un código'}
          </button>
          <p className="text-sm text-tenue">Sin contraseñas: te llega un código para entrar.</p>
        </form>
      ) : (
        <form onSubmit={comprobarCodigo} className="mt-8 flex flex-col gap-3">
          <label htmlFor="codigo" className="text-sm font-medium text-tenue">
            Código enviado a {correo.trim()}
          </label>
          <input
            id="codigo"
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6,10}"
            title="El código numérico del correo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className={`${campo} text-center text-2xl tracking-[0.3em]`}
          />
          <button type="submit" disabled={ocupado} className={boton}>
            {ocupado ? 'Comprobando…' : 'Entrar'}
          </button>
          <p className="text-sm text-tenue">
            Si el correo trae un enlace en lugar de un código, ábrelo en este mismo navegador.
          </p>
          <button
            type="button"
            onClick={() => {
              setPaso('correo')
              setCodigo('')
              setError('')
            }}
            className="py-2 text-sm font-medium text-tenue hover:text-texto"
          >
            Usar otro correo
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-peligro">
          {error}
        </p>
      )}

      <Instalar />
    </main>
  )
}
