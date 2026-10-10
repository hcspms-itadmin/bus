import { describe, expect, it } from 'vitest'
import { CtbEtaResponseSchema, KmbEtaResponseSchema, NlbEtaResponseSchema } from './schemas'
import { SERVICES } from './services'

describe('schemas', () => {
  it('CTB 回應結構解析', () => {
    const ok = CtbEtaResponseSchema.parse({
      data: [
        {
          co: 'CTB',
          route: 'E11B',
          dir: 'I',
          seq: 29,
          stop: '001363',
          dest_tc: '天后站',
          eta: '2026-10-09T17:20:00+08:00',
          rmk_tc: '',
        },
      ],
    })
    expect(ok.data?.[0].route).toBe('E11B')
  })

  it('CTB data 為 null 或缺失都可以', () => {
    expect(CtbEtaResponseSchema.parse({ data: null }).data).toBeNull()
    expect(CtbEtaResponseSchema.parse({}).data).toBeUndefined()
  })

  it('NLB 回應結構解析，departed 接受字串與數字', () => {
    const ok = NlbEtaResponseSchema.parse({
      estimatedArrivals: [
        { estimatedArrivalTime: '2026-10-09 17:29', departed: '1', noGPS: '0' },
        { estimatedArrivalTime: '2026-10-09 17:39', departed: 1, noGPS: 0 },
      ],
    })
    expect(ok.estimatedArrivals).toHaveLength(2)
  })

  it('KMB route-eta 結構解析（無 stop 欄、service_type 數字、eta 可 null）', () => {
    const ok = KmbEtaResponseSchema.parse({
      data: [
        {
          co: 'KMB',
          route: 'E31',
          dir: 'O',
          seq: 16,
          service_type: 1,
          dest_tc: '東涌(逸東)',
          eta: '2026-10-10T18:58:03+08:00',
          eta_seq: 1,
          rmk_tc: '',
        },
        {
          co: 'KMB',
          route: 'N31',
          dir: 'O',
          seq: 19,
          service_type: 1,
          dest_tc: '機場(地面運輸中心)',
          eta: null,
          rmk_tc: '',
        },
      ],
    })
    expect(ok.data?.[0].seq).toBe(16)
    expect(ok.data?.[1].eta).toBeNull()
  })

  it('壞結構被拒', () => {
    expect(NlbEtaResponseSchema.safeParse({ estimatedArrivals: [{ noGPS: 'x' }] }).success).toBe(false)
    expect(CtbEtaResponseSchema.safeParse({ data: [{ eta: 42 }] }).success).toBe(false)
  })
})

describe('SERVICES 配置不變量', () => {
  const ids = SERVICES.map((s) => s.id)
  it('id 唯一；CTB 必有 destFilter；NLB 必有 nlbRouteId；KMB 必有 kmbQueries', () => {
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of SERVICES) {
      if (s.operator === 'CTB') expect(s.destFilter.length).toBeGreaterThan(0)
      if (s.operator === 'NLB') expect(s.nlbRouteId).toBeTruthy()
      if (s.operator === 'KMB') expect(s.kmbQueries?.length).toBeGreaterThan(0)
    }
  })
  it('單營辦商到期直接可用', () => {
    expect(SERVICES.length).toBeGreaterThanOrEqual(18)
  })
})