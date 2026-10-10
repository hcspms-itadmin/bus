import { describe, expect, it } from 'vitest'
import { normalizeCtb, normalizeNlb } from './normalize'
import type { CtbEtaRecord, NlbEtaRecord } from './schemas'
import { SERVICES } from './services'

const T0 = Date.parse('2026-10-09T09:00:00.000Z') // 17:00 HK

const ctbE11B = SERVICES.find((s) => s.id === 'ctb-e11b-th')!

function ctbRow(partial: Partial<CtbEtaRecord>): CtbEtaRecord {
  return {
    co: 'CTB',
    route: 'E11B',
    dir: 'I',
    seq: 29,
    stop: '001363',
    dest_tc: '天后站',
    eta: '2026-10-09T17:20:00+08:00',
    rmk_tc: '',
    ...partial,
  }
}

function nlbRow(partial: Partial<NlbEtaRecord>): NlbEtaRecord {
  return {
    estimatedArrivalTime: '2026-10-09 17:29',
    routeVariantName: '39M',
    departed: '1',
    noGPS: '0',
    ...partial,
  }
}

describe('normalizeCtb', () => {
  it('按 destFilter 收窄、按到達時間升序、最多 3 筆', () => {
    const rows = [
      ctbRow({ eta: '2026-10-09T18:10:00+08:00', eta_seq: 3 }),
      ctbRow({ eta: '2026-10-09T17:40:00+08:00', eta_seq: 2 }),
      ctbRow({ dest_tc: '東涌(滿東邨)', eta: '2026-10-09T18:01:00+08:00', eta_seq: 4 }),
      ctbRow({ eta: '2026-10-09T17:20:00+08:00', eta_seq: 1 }),
    ]
    const got = normalizeCtb(rows, ctbE11B, T0)
    expect(got.map((e) => e.minutes)).toEqual([20, 40, 70])
    expect(got.every((e) => e.scheduled === false)).toBe(true)
  })

  it('dest_tc 缺失或格式壞全被剔除', () => {
    const rows = [
      ctbRow({ eta: '' }),
      ctbRow({ dest_tc: null, eta: '2026-10-09T17:20:00+08:00' }),
      ctbRow({ eta: '唔係時間' }),
    ]
    expect(normalizeCtb(rows, ctbE11B, T0)).toHaveLength(0)
  })
})

describe('normalizeNlb', () => {
  it('有 GPS 且已離站 = 實時；無 GPS 或未離站 = 預定班次', () => {
    const b6 = SERVICES.find((s) => s.id === 'nlb-b6-hzmb')!
    const rows = [
      nlbRow({ estimatedArrivalTime: '2026-10-09 17:29', noGPS: '0', departed: '1' }),
      nlbRow({ estimatedArrivalTime: '2026-10-09 17:39', noGPS: '1', departed: '1' }),
      nlbRow({ estimatedArrivalTime: '2026-10-09 17:49', noGPS: '0', departed: '0' }),
    ]
    const got = normalizeNlb(rows, b6, T0)
    expect(got.map((e) => e.scheduled)).toEqual([false, true, true])
    expect(got.map((e) => e.minutes)).toEqual([29, 39, 49])
  })

  it('數字型 0/1 旗標同樣識別', () => {
    const rows = [nlbRow({ noGPS: 1, departed: 1 }), nlbRow({ noGPS: 0, departed: 0 })]
    const got = normalizeNlb(rows, SERVICES.find((s) => s.id === 'nlb-39m-tc')!, T0)
    expect(got.map((e) => e.scheduled)).toEqual([true, true])
  })

  it('無時間或格式壞剔除，最多 3 筆', () => {
    const rows = [
      nlbRow({ estimatedArrivalTime: '' }),
      nlbRow({ estimatedArrivalTime: '17:29' }),
      nlbRow({ estimatedArrivalTime: '2026-10-09 17:20' }),
      nlbRow({ estimatedArrivalTime: '2026-10-09 18:20' }),
    ]
    expect(normalizeNlb(rows, SERVICES.find((s) => s.id === 'nlb-b6-hzmb')!, T0)).toHaveLength(2)
  })
})