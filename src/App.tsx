import { Acceso } from './components/Acceso'
import { Principal } from './components/Principal'
import { useSesion } from './hooks/useSesion'
import { supabaseConfigurado } from './lib/supabase'

export default function App() {
  const sesion = useSesion()

  if (!supabaseConfigurado) {
    return (
      <p className="mx-auto max-w-sm px-6 py-16 text-tenue">
        Falta configurar Supabase: copia <code>.env.example</code> como <code>.env.local</code>, rellena los dos
        valores y reinicia el servidor.
      </p>
    )
  }

  // Mientras se comprueba la sesión guardada no se pinta nada, para no enseñar
  // la pantalla de acceso durante un instante a quien ya está dentro.
  if (sesion === undefined) return null
  if (sesion === null) return <Acceso />

  // La clave hace que, si cambia la cuenta, la lista empiece de cero con los datos de la nueva.
  return <Principal key={sesion.user.id} usuarioId={sesion.user.id} />
}
