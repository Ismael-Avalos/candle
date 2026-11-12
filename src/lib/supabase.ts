import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const clave = import.meta.env.VITE_SUPABASE_CLAVE as string | undefined

/** Falso mientras falte rellenar .env.local; la app lo avisa en pantalla en lugar de romperse. */
export const supabaseConfigurado = Boolean(url && clave)

/**
 * Si el enlace del correo falla (caducó o ya se usó), Supabase devuelve el motivo en la URL.
 * Se lee aquí, antes de crear el cliente, porque este limpia la URL al arrancar.
 */
function leerErrorDeEnlace(): string {
  const parametros = new URLSearchParams(`${window.location.hash.slice(1)}&${window.location.search.slice(1)}`)
  const codigo = parametros.get('error_code') ?? parametros.get('error')
  if (!codigo) return ''
  if (codigo === 'otp_expired') return 'Ese enlace ya caducó o ya se había usado. Pide un correo nuevo.'
  return `No se pudo entrar con ese enlace (${parametros.get('error_description') ?? codigo}).`
}

export const errorDeEnlace = leerErrorDeEnlace()

/**
 * El cliente guarda la sesión en el dispositivo y la renueva solo.
 * La clave es pública a propósito: lo que protege los datos son las reglas
 * de la base de datos (ver supabase/esquema.sql), no esconder esta clave.
 */
export const supabase = createClient(url || 'http://sin-configurar.invalid', clave || 'sin-configurar')
