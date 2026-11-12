// Decide qué avisos tocan en un momento dado. Es código puro (sin red ni base de datos)
// para poder probarlo con Vitest; la función de Supabase solo lo llama y envía el resultado.

export interface CumpleanosAviso {
  id: string
  nombre: string
  dia: number
  mes: number
  anio: number | null
  /** Avisos anticipados, en días antes. */
  avisos: number[]
}

export interface AvisoPendiente {
  cumpleanosId: string
  /** Fecha del cumpleaños al que se refiere el aviso, como AAAA-MM-DD. */
  fecha: string
  /** 0 es el aviso del propio día. */
  diasAntes: number
  titulo: string
  cuerpo: string
}

/** Los avisos anticipados salen a partir de esta hora local; el del propio día, desde las 00:00. */
export const HORA_ANTICIPADOS = 9

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const esBisiesto = (anio: number) => (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0

/** Fecha y hora que marca el reloj de alguien en esa zona horaria. */
export function momentoLocal(ahora: Date, zonaHoraria: string) {
  const formato = (zona: string) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: zona,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      hourCycle: 'h23',
    })
  let partes: Intl.DateTimeFormatPart[]
  try {
    partes = formato(zonaHoraria).formatToParts(ahora)
  } catch {
    // Zona desconocida: mejor avisar con la hora universal que no avisar.
    partes = formato('UTC').formatToParts(ahora)
  }
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value)
  return { anio: valor('year'), mes: valor('month'), dia: valor('day'), hora: valor('hour') }
}

/** ¿Cae el cumpleaños en esa fecha? Quien nació un 29 de febrero celebra el 28 en años no bisiestos. */
function caeEn(c: CumpleanosAviso, anio: number, mes: number, dia: number): boolean {
  if (c.mes === 2 && c.dia === 29 && !esBisiesto(anio)) return mes === 2 && dia === 28
  return c.mes === mes && c.dia === dia
}

function redactar(c: CumpleanosAviso, diasAntes: number, anio: number, mes: number, dia: number) {
  const edad = c.anio ? anio - c.anio : 0
  if (diasAntes === 0) {
    return {
      titulo: `Hoy es el cumpleaños de ${c.nombre}`,
      cuerpo: edad > 0 ? `Cumple ${edad} años. ¡Felicítale!` : '¡No olvides felicitarle!',
    }
  }
  return {
    titulo:
      diasAntes === 1
        ? `Mañana es el cumpleaños de ${c.nombre}`
        : `Faltan ${diasAntes} días para el cumpleaños de ${c.nombre}`,
    cuerpo: `Es el ${dia} de ${MESES[mes - 1]}${edad > 0 ? ` y cumple ${edad} años` : ''}.`,
  }
}

/**
 * Los avisos que corresponden ahora mismo a alguien en esa zona horaria.
 * No recuerda cuáles se enviaron ya: de eso se encarga la tabla avisos_enviados.
 * Por eso un aviso sigue «pendiente» todo el día, y si un envío falla se reintenta.
 */
export function avisosPendientes(cumpleanos: CumpleanosAviso[], ahora: Date, zonaHoraria: string): AvisoPendiente[] {
  const local = momentoLocal(ahora, zonaHoraria)
  const pendientes: AvisoPendiente[] = []

  for (const c of cumpleanos) {
    const antelaciones = new Set([0, ...c.avisos.filter((d) => Number.isInteger(d) && d > 0 && d <= 365)])
    for (const diasAntes of antelaciones) {
      if (diasAntes > 0 && local.hora < HORA_ANTICIPADOS) continue
      // Date.UTC normaliza solo el desbordamiento (31 + 7 pasa al mes siguiente).
      const objetivo = new Date(Date.UTC(local.anio, local.mes - 1, local.dia + diasAntes))
      const anio = objetivo.getUTCFullYear()
      const mes = objetivo.getUTCMonth() + 1
      const dia = objetivo.getUTCDate()
      if (!caeEn(c, anio, mes, dia)) continue
      pendientes.push({
        cumpleanosId: c.id,
        fecha: objetivo.toISOString().slice(0, 10),
        diasAntes,
        ...redactar(c, diasAntes, anio, mes, dia),
      })
    }
  }
  return pendientes
}
