import { describe, expect, it } from 'vitest'
import { avisosPendientes, momentoLocal } from './pendientes'
import type { CumpleanosAviso } from './pendientes'

const SV = 'America/El_Salvador' // UTC-6, sin cambio de hora
const ana: CumpleanosAviso = { id: 'ana', nombre: 'Ana', dia: 12, mes: 11, anio: 1996, avisos: [7, 1] }

/** Un instante a partir de la hora que marca el reloj en El Salvador. */
const enSV = (anio: number, mes: number, dia: number, hora: number, minuto = 0) =>
  new Date(Date.UTC(anio, mes - 1, dia, hora + 6, minuto))

const resumen = (lista: ReturnType<typeof avisosPendientes>) => lista.map((a) => `${a.fecha}/${a.diasAntes}`)

describe('momentoLocal', () => {
  it('convierte a la hora de la zona', () => {
    // 05:30 UTC del día 12 todavía son las 23:30 del 11 en El Salvador.
    expect(momentoLocal(new Date(Date.UTC(2026, 10, 12, 5, 30)), SV)).toEqual({ anio: 2026, mes: 11, dia: 11, hora: 23 })
  })

  it('usa la hora universal si la zona no existe', () => {
    expect(momentoLocal(new Date(Date.UTC(2026, 10, 12, 5, 30)), 'Marte/Olimpo').hora).toBe(5)
  })
})

describe('aviso del propio día', () => {
  it('sale a las 00:00 locales', () => {
    expect(resumen(avisosPendientes([ana], enSV(2026, 11, 12, 0), SV))).toEqual(['2026-11-12/0'])
  })

  it('no sale un minuto antes de medianoche', () => {
    expect(avisosPendientes([ana], enSV(2026, 11, 11, 23, 59), SV).filter((a) => a.diasAntes === 0)).toEqual([])
  })

  it('sigue pendiente el resto del día, por si un envío falló', () => {
    expect(resumen(avisosPendientes([ana], enSV(2026, 11, 12, 22), SV))).toEqual(['2026-11-12/0'])
  })

  it('dice la edad cuando se conoce el año', () => {
    const [aviso] = avisosPendientes([ana], enSV(2026, 11, 12, 0), SV)
    expect(aviso.titulo).toBe('Hoy es el cumpleaños de Ana')
    expect(aviso.cuerpo).toBe('Cumple 30 años. ¡Felicítale!')
  })

  it('se manda aunque no haya avisos anticipados', () => {
    const sinAvisos = { ...ana, avisos: [] }
    expect(resumen(avisosPendientes([sinAvisos], enSV(2026, 11, 12, 0), SV))).toEqual(['2026-11-12/0'])
  })
})

describe('avisos anticipados', () => {
  it('esperan a las 9:00', () => {
    expect(avisosPendientes([ana], enSV(2026, 11, 11, 8, 45), SV)).toEqual([])
    expect(resumen(avisosPendientes([ana], enSV(2026, 11, 11, 9), SV))).toEqual(['2026-11-12/1'])
  })

  it('cuentan los días aunque cambie el mes', () => {
    const luis: CumpleanosAviso = { id: 'luis', nombre: 'Luis', dia: 3, mes: 12, anio: null, avisos: [7] }
    const [aviso] = avisosPendientes([luis], enSV(2026, 11, 26, 9), SV)
    expect(aviso.titulo).toBe('Faltan 7 días para el cumpleaños de Luis')
    expect(aviso.cuerpo).toBe('Es el 3 de diciembre.')
  })

  it('cruzan el fin de año con la edad correcta', () => {
    const eva: CumpleanosAviso = { id: 'eva', nombre: 'Eva', dia: 1, mes: 1, anio: 2000, avisos: [1] }
    const [aviso] = avisosPendientes([eva], enSV(2026, 12, 31, 10), SV)
    expect(aviso.fecha).toBe('2027-01-01')
    expect(aviso.cuerpo).toBe('Es el 1 de enero y cumple 27 años.')
  })

  it('no salen en días que no tocan', () => {
    expect(avisosPendientes([ana], enSV(2026, 11, 8, 12), SV)).toEqual([])
  })
})

describe('29 de febrero', () => {
  const bisiesto: CumpleanosAviso = { id: 'b', nombre: 'Bea', dia: 29, mes: 2, anio: null, avisos: [] }

  it('avisa el 28 en años no bisiestos', () => {
    expect(resumen(avisosPendientes([bisiesto], enSV(2027, 2, 28, 0), SV))).toEqual(['2027-02-28/0'])
  })

  it('avisa el 29, y no el 28, en años bisiestos', () => {
    expect(avisosPendientes([bisiesto], enSV(2028, 2, 28, 0), SV)).toEqual([])
    expect(resumen(avisosPendientes([bisiesto], enSV(2028, 2, 29, 0), SV))).toEqual(['2028-02-29/0'])
  })
})
