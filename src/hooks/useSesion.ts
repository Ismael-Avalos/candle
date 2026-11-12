import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * La sesión actual. `undefined` significa «todavía comprobando»;
 * `null`, que no hay nadie dentro.
 */
export function useSesion(): Session | null | undefined {
  const [sesion, setSesion] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    // Avisa al arrancar (con la sesión guardada, si la hay) y en cada entrada o salida.
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => setSesion(nueva))
    return () => data.subscription.unsubscribe()
  }, [])

  return sesion
}
