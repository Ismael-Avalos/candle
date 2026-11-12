export const MESES = [
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
] as const

const MS_POR_DIA = 86_400_000

export function esBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0
}

/** Días que puede tener un mes en un cumpleaños. Febrero admite 29. */
export function diasDelMes(mes: number): number {
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mes - 1]
}

/** El cumpleaños en un año concreto. Quien nació un 29 de febrero celebra el 28 en años no bisiestos. */
function fechaEnAnio(dia: number, mes: number, anio: number): Date {
  if (mes === 2 && dia === 29 && !esBisiesto(anio)) return new Date(anio, 1, 28)
  return new Date(anio, mes - 1, dia)
}

/** La próxima vez que cae el cumpleaños, contando hoy mismo. */
export function proximoCumpleanos(dia: number, mes: number, hoy: Date): Date {
  const inicioDeHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const esteAnio = fechaEnAnio(dia, mes, inicioDeHoy.getFullYear())
  if (esteAnio >= inicioDeHoy) return esteAnio
  return fechaEnAnio(dia, mes, inicioDeHoy.getFullYear() + 1)
}

/**
 * Días de calendario entre hoy y una fecha. Se compara en UTC para que
 * un cambio de hora (días de 23 o 25 horas) no descuadre la cuenta.
 */
export function diasHasta(fecha: Date, hoy: Date): number {
  const destino = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  const origen = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return Math.round((destino - origen) / MS_POR_DIA)
}

/** La edad que se cumple en la fecha dada. */
export function edadQueCumple(anioNacimiento: number, cumpleanos: Date): number {
  return cumpleanos.getFullYear() - anioNacimiento
}

export function textoFecha(dia: number, mes: number): string {
  return `${dia} de ${MESES[mes - 1]}`
}

export function textoFalta(dias: number): string {
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  return `En ${dias} días`
}

export function textoAviso(diasAntes: number): string {
  if (diasAntes === 1) return '1 día antes'
  if (diasAntes === 7) return '1 semana antes'
  if (diasAntes % 7 === 0) return `${diasAntes / 7} semanas antes`
  return `${diasAntes} días antes`
}
