import { describe, expect, it } from 'vitest'
import { buildSectionView, countByTab, soonestEtaMs, type TabKey } from './boardUtils'
import type { ServiceSnapshot } from '../../data/normalize'
import { DEPARTURES, SERVICES } from '../../data/services'

function snap(id: string, status: ServiceSnapshot['status'], offsetsMin: number[] = []): ServiceSnapshot {
  const service = SERVICES.find((s) => s.id === id)!
  const now = Date.now()
  return {
    service,
    status,
    fetchedAt: now,
    etas: offsetsMin.map((m) => ({
      etaMs: now + m * 60_000,
      minutes: m,
      dest: service.displayDest,
      remark: '',
      scheduled: false,
    })),
  }
}

describe('buildSectionView', () => {
  const all: TabKey = 'all'

  it('hidden 剔除、tab 過濾', () => {
    const v = buildSectionView(DEPARTURES, [], ['nlb-39m-tc'], [], all)
    expect(v.pinned).toHaveLength(0)
    expect(v.active.map((i) => i.service.id)).not.toContain('nlb-39m-tc')
    expect(v.active).toHaveLength(DEPARTURES.length - 1)

    const mrt = buildSectionView(DEPARTURES, [], [], [], 'mrt')
    expect(mrt.active.map((i) => i.service.id)).toEqual(['nlb-39m-tc'])
  })

  it('釘選置頂（按釘選次序），即使無班次都不沉底', () => {
    const snapshots = [snap('nlb-39m-tc', 'ok', [9]), snap('ctb-e21a-hm', 'ok', [2])]
    const v = buildSectionView(DEPARTURES, snapshots, [], ['nlb-39m-tc'], all)
    expect(v.pinned.map((i) => i.service.id)).toEqual(['nlb-39m-tc'])
    expect(v.active[0].service.id).not.toBe('nlb-39m-tc')

    const emptyPinned = buildSectionView(
      DEPARTURES,
      [snap('ctb-e11s-th', 'empty')],
      [],
      ['ctb-e11s-th'],
      all,
    )
    expect(emptyPinned.pinned.map((i) => i.service.id)).toEqual(['ctb-e11s-th'])
    expect(emptyPinned.inactive).toHaveLength(0)
  })

  it('有班次按最快到站升序；loading/error 留在 active 唔跳動', () => {
    const snapshots = [
      snap('nlb-39m-tc', 'ok', [12]),
      snap('ctb-e21a-hm', 'ok', [3]),
      snap('kmb-e31-yt', 'ok', [7]),
    ]
    const v = buildSectionView(DEPARTURES, snapshots, [], [], all)
    const head = v.active.slice(0, 3).map((i) => i.service.id)
    expect(head).toEqual(['ctb-e21a-hm', 'kmb-e31-yt', 'nlb-39m-tc'])
    // 未載入（無 snapshot）同 error 都係 active
    expect(v.active.length).toBe(DEPARTURES.length)
    expect(v.inactive).toHaveLength(0)
  })

  it('無班次沉底進 inactive（不刪除）', () => {
    const snapshots = [snap('ctb-e11s-th', 'empty'), snap('nlb-39m-tc', 'ok', [5])]
    const v = buildSectionView(DEPARTURES, snapshots, [], [], all)
    expect(v.inactive.map((i) => i.service.id)).toEqual(['ctb-e11s-th'])
    expect(v.active.map((i) => i.service.id)).not.toContain('ctb-e11s-th')
  })
})

describe('soonestEtaMs', () => {
  it('無 snapshot 或無班次回 null', () => {
    expect(soonestEtaMs(undefined)).toBeNull()
    expect(soonestEtaMs(snap('nlb-39m-tc', 'empty'))).toBeNull()
  })
})

describe('countByTab', () => {
  it('mrt 1 / city 13 / special 6 / 全部 20（扣掉隱藏）', () => {
    expect(countByTab([])).toEqual({ all: 20, mrt: 1, city: 13, special: 6 })
    expect(countByTab(['nlb-39m-tc'])).toEqual({ all: 19, mrt: 0, city: 13, special: 6 })
  })
})
