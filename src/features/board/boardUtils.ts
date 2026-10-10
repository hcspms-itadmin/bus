import type { ServiceSnapshot } from '../../data/normalize'
import { SERVICES, type ServiceConfig } from '../../data/services'

export type TabKey = 'all' | 'mrt' | 'city' | 'special'

export const TABS: readonly { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'mrt', label: '🚇 東涌站' },
  { key: 'city', label: '🏙️ 市區' },
  { key: 'special', label: '🌉 口岸·特別' },
]

export interface ViewItem {
  service: ServiceConfig
  snapshot: ServiceSnapshot | undefined
  pinned: boolean
  soonestMs: number | null
}

export interface SectionView {
  pinned: ViewItem[]
  active: ViewItem[]
  inactive: ViewItem[]
}

export function soonestEtaMs(snapshot: ServiceSnapshot | undefined): number | null {
  if (!snapshot || snapshot.etas.length === 0) return null
  return Math.min(...snapshot.etas.map((e) => e.etaMs))
}

/**
 * 方案 B 分流：隱藏剔除 → tab 過濾 → 釘選置頂（永不沉底）→
 * 有班次按最快到站升序 → 無班次沉底（不刪除，交由 drawer 收合）。
 * loading/error 視為 active（唔好因為未載入就沉底造成跳動）。
 */
export function buildSectionView(
  services: readonly ServiceConfig[],
  snapshots: ServiceSnapshot[],
  hidden: readonly string[],
  pinned: readonly string[],
  tab: TabKey,
): SectionView {
  const byId = new Map(snapshots.map((s) => [s.service.id, s]))
  const pinRank = new Map(pinned.map((id, i) => [id, i]))
  const items: ViewItem[] = services
    .filter((s) => !hidden.includes(s.id) && (tab === 'all' || s.intent === tab))
    .map((service) => {
      const snapshot = byId.get(service.id)
      return { service, snapshot, pinned: pinRank.has(service.id), soonestMs: soonestEtaMs(snapshot) }
    })

  const pinnedItems = items
    .filter((i) => i.pinned)
    .sort((a, b) => pinRank.get(a.service.id)! - pinRank.get(b.service.id)!)

  const rest = items.filter((i) => !i.pinned)
  const active = rest
    .filter((i) => i.snapshot?.status !== 'empty')
    .sort((a, b) => {
      if (a.soonestMs === null && b.soonestMs === null) return 0
      if (a.soonestMs === null) return 1
      if (b.soonestMs === null) return -1
      return a.soonestMs - b.soonestMs
    })
  const inactive = rest.filter((i) => i.snapshot?.status === 'empty')
  return { pinned: pinnedItems, active, inactive }
}

export function countByTab(hidden: readonly string[]): Record<TabKey, number> {
  const visible = SERVICES.filter((s) => !hidden.includes(s.id))
  return {
    all: visible.length,
    mrt: visible.filter((s) => s.intent === 'mrt').length,
    city: visible.filter((s) => s.intent === 'city').length,
    special: visible.filter((s) => s.intent === 'special').length,
  }
}
