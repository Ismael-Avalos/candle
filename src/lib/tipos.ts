/** Un cumpleaños guardado. Se registra una vez y vale para todos los años. */
export interface Cumpleanos {
  id: string
  nombre: string
  /** Día del mes, de 1 a 31. */
  dia: number
  /** Mes, de 1 (enero) a 12 (diciembre). */
  mes: number
  /** Año de nacimiento; opcional, solo sirve para mostrar la edad. */
  anio?: number
  /** Avisos anticipados, en días antes. El aviso del propio día no va aquí: es fijo. */
  avisos: number[]
}

/** Lo que rellena el formulario: un cumpleaños sin identificador. */
export type DatosCumpleanos = Omit<Cumpleanos, 'id'>
