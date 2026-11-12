import { describe, expect, it } from 'vitest'
import { diasHasta, edadQueCumple, proximoCumpleanos, textoAviso, textoFalta } from './fechas'

const dia = (anio: number, mes: number, d: number, hora = 0) => new Date(anio, mes - 1, d, hora)

describe('proximoCumpleanos', () => {
  it('devuelve este año si todavía no ha pasado', () => {
    expect(proximoCumpleanos(25, 12, dia(2026, 11, 12))).toEqual(dia(2026, 12, 25))
  })

  it('devuelve el año siguiente si ya pasó', () => {
    expect(proximoCumpleanos(3, 3, dia(2026, 11, 12))).toEqual(dia(2027, 3, 3))
  })

  it('cuenta hoy como el cumpleaños, aunque sea de noche', () => {
    expect(proximoCumpleanos(12, 11, dia(2026, 11, 12, 23))).toEqual(dia(2026, 11, 12))
  })

  it('pasa el 29 de febrero al 28 en años no bisiestos', () => {
    expect(proximoCumpleanos(29, 2, dia(2026, 11, 12))).toEqual(dia(2027, 2, 28))
  })

  it('respeta el 29 de febrero en años bisiestos', () => {
    expect(proximoCumpleanos(29, 2, dia(2027, 11, 12))).toEqual(dia(2028, 2, 29))
  })
})

describe('diasHasta', () => {
  it('da 0 el mismo día', () => {
    expect(diasHasta(dia(2026, 11, 12), dia(2026, 11, 12, 18))).toBe(0)
  })

  it('cuenta días de calendario al cruzar de año', () => {
    expect(diasHasta(dia(2027, 1, 1), dia(2026, 12, 31, 23))).toBe(1)
  })

  it('cuenta un año bisiesto completo', () => {
    expect(diasHasta(dia(2028, 3, 1), dia(2027, 3, 1))).toBe(366)
  })
})

describe('textos', () => {
  it('calcula la edad que se cumple', () => {
    expect(edadQueCumple(1996, dia(2027, 3, 3))).toBe(31)
  })

  it('describe cuánto falta', () => {
    expect([textoFalta(0), textoFalta(1), textoFalta(12)]).toEqual(['Hoy', 'Mañana', 'En 12 días'])
  })

  it('describe los avisos', () => {
    expect([textoAviso(1), textoAviso(3), textoAviso(7), textoAviso(14)]).toEqual([
      '1 día antes',
      '3 días antes',
      '1 semana antes',
      '2 semanas antes',
    ])
  })
})
