import { useInstalacion } from '../hooks/useInstalacion'

/**
 * Invita a instalar Candle. En iPhone es imprescindible: Safari solo entrega
 * avisos a las apps que están en la pantalla de inicio. Si ya está instalada
 * o el navegador no lo permite, no muestra nada.
 */
export function Instalar() {
  const { modo, instalar } = useInstalacion()

  if (modo === 'no-disponible') return null

  return (
    <section aria-labelledby="instalar-titulo" className="mt-5 rounded-xl border border-borde px-4 py-3.5 text-sm">
      <h2 id="instalar-titulo" className="font-semibold">
        {modo === 'ios' ? 'En iPhone, instala Candle primero' : 'Instala Candle'}
      </h2>

      {modo === 'directa' ? (
        <>
          <p className="mt-1 text-tenue">Se abre desde tu pantalla de inicio, como cualquier otra app.</p>
          <button
            type="button"
            onClick={() => void instalar()}
            className="mt-3 rounded-full border border-llama px-5 py-2.5 font-semibold text-llama hover:bg-llama/10"
          >
            Instalar app
          </button>
        </>
      ) : (
        <>
          {/* En iPhone no se puede instalar por código: solo indicar el camino. */}
          <p className="mt-1 text-tenue">Sin instalarla no pueden llegarte los avisos. Entra a tu cuenta después, ya desde la app.</p>
          <ol className="mt-2 grid list-decimal gap-1 pl-5">
            <li>
              En Safari, toca <strong>Compartir</strong>.
            </li>
            <li>
              Elige <strong>Agregar a pantalla de inicio</strong>.
            </li>
            <li>
              Toca <strong>Agregar</strong> y abre Candle desde el ícono nuevo.
            </li>
          </ol>
        </>
      )}
    </section>
  )
}
