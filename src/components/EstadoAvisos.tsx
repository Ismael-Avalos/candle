import { useEffect, useState } from 'react'
import { activarAvisos, comprobarAvisos, enviarAvisoDePrueba } from '../lib/avisos'
import type { EstadoAvisos as Estado } from '../lib/avisos'

const caja = 'mt-5 rounded-xl border px-4 py-3.5 text-sm'

/** Dice si este dispositivo recibirá avisos y, si no, qué hacer para que los reciba. */
export function EstadoAvisos() {
  const [estado, setEstado] = useState<Estado>('comprobando')
  const [ocupado, setOcupado] = useState(false)
  const [prueba, setPrueba] = useState('')

  useEffect(() => {
    let vigente = true
    void comprobarAvisos().then((nuevo) => {
      if (vigente) setEstado(nuevo)
    })
    return () => {
      vigente = false
    }
  }, [])

  const activar = async () => {
    setOcupado(true)
    setEstado(await activarAvisos())
    setOcupado(false)
  }

  const probar = async () => {
    setOcupado(true)
    setPrueba((await enviarAvisoDePrueba()) ? 'Enviado. Debería llegar en unos segundos.' : 'No se pudo enviar la prueba.')
    setOcupado(false)
  }

  if (estado === 'comprobando') return null

  if (estado === 'activados') {
    return (
      <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-tenue" aria-live="polite">
        <span>Avisos activos en este dispositivo.</span>
        {prueba || (
          <button type="button" onClick={probar} disabled={ocupado} className="font-semibold text-llama">
            Enviar uno de prueba
          </button>
        )}
      </p>
    )
  }

  if (estado === 'pendientes') {
    return (
      <div className={`${caja} border-llama/40 bg-llama/10`}>
        <p className="font-semibold text-llama">Faltan los avisos en este dispositivo</p>
        <p className="mt-1 text-texto/80">Sin tu permiso, Candle no puede recordarte ningún cumpleaños aquí.</p>
        <button
          type="button"
          onClick={activar}
          disabled={ocupado}
          className="mt-3 rounded-full bg-llama px-5 py-2.5 font-semibold text-tinta hover:bg-brasa disabled:opacity-60"
        >
          {ocupado ? 'Activando…' : 'Activar avisos'}
        </button>
      </div>
    )
  }

  return (
    <div role="alert" className={`${caja} border-peligro/40 bg-peligro/10 text-texto/90`}>
      <p className="font-semibold text-peligro">
        {estado === 'denegados' ? 'Los avisos están bloqueados' : 'Este navegador no puede recibir avisos'}
      </p>
      <p className="mt-1">
        {estado === 'denegados'
          ? 'Permite las notificaciones de este sitio en los ajustes del navegador y vuelve a abrir Candle.'
          : 'En iPhone, añade Candle a la pantalla de inicio y ábrela desde ahí. En otros dispositivos, prueba con Chrome, Edge o Firefox.'}
      </p>
    </div>
  )
}
