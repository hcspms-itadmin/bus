import { minutesUntil } from './countdown'
import type { CtbEtaRecord, KmbEtaRecord, NlbEtaRecord } from './schemas'
import type { ServiceConfig } from './services'
import { parseIsoWithOffset, parseNlbTime } from './time'

export interface EtaEntry {
  etaMs: number
  minutes: number
  dest: string
  remark: string
  scheduled: boolean
}

export type ServiceStatus = 'ok' | 'empty' | 'error'

export interface ServiceSnapshot {
  service: ServiceConfig
  status: ServiceStatus
  fetchedAt: number
  etas: EtaEntry[]
  error?: string
}

const MAX_ETAS = 3

function sortByArrival(entries: EtaEntry[]): EtaEntry[] {
  return entries.sort((a, b) => a.etaMs - b.etaMs).slice(0, MAX_ETAS)
}

export function normalizeCtb(records: CtbEtaRecord[], service: ServiceConfig, nowMs: number): EtaEntry[] {
  const out: EtaEntry[] = []
  for (const r of records) {
    const dest = r.dest_tc ?? ''
    if (service.destFilter.length > 0 && !service.destFilter.some((f) => dest.includes(f))) continue
    if (!r.eta) continue
    let etaMs: number
    try {
      etaMs = parseIsoWithOffset(r.eta)
    } catch {
      continue
    }
    out.push({
      etaMs,
      minutes: minutesUntil(nowMs, etaMs),
      dest,
      remark: r.rmk_tc ?? '',
      scheduled: false,
    })
  }
  return sortByArrival(out)
}

export function toFlag(value: string | number | null | undefined): boolean {
  if (value === undefined || value === null) return false
  const s = typeof value === 'number' ? String(value) : value
  return s === '1'
}

export function normalizeNlb(records: NlbEtaRecord[], service: ServiceConfig, nowMs: number): EtaEntry[] {
  const out: EtaEntry[] = []
  for (const r of records) {
    if (!r.estimatedArrivalTime) continue
    let etaMs: number
    try {
      etaMs = parseNlbTime(r.estimatedArrivalTime)
    } catch {
      continue
    }
    const noGPS = toFlag(r.noGPS)
    const departed = toFlag(r.departed)
    out.push({
      etaMs,
      minutes: minutesUntil(nowMs, etaMs),
      dest: r.routeVariantName ?? service.displayDest,
      remark: '',
      scheduled: noGPS || !departed,
    })
  }
  return sortByArrival(out)
}

/**
 * 九巴（etabus route-eta）：以 (serviceType, dir, seq) 對 route-stop 序號精確定位。
 * `rmk_tc === '原定班次'` 視為預定班次；st1/st3 特別班次重複時間要去重。
 */
export function normalizeKmb(
  records: KmbEtaRecord[],
  service: ServiceConfig,
  nowMs: number,
): EtaEntry[] {
  const queries = service.kmbQueries ?? []
  const out: EtaEntry[] = []
  for (const r of records) {
    const hit = queries.some(
      (q) => String(r.service_type) === q.serviceType && r.dir === q.dir && r.seq === q.seq,
    )
    if (!hit) continue
    const dest = r.dest_tc ?? ''
    if (service.destFilter.length > 0 && !service.destFilter.some((f) => dest.includes(f))) continue
    if (!r.eta) continue
    let etaMs: number
    try {
      etaMs = parseIsoWithOffset(r.eta)
    } catch {
      continue
    }
    out.push({
      etaMs,
      minutes: minutesUntil(nowMs, etaMs),
      dest: service.rowDestOverride ?? dest,
      remark: r.rmk_tc ?? '',
      scheduled: (r.rmk_tc ?? '') === '原定班次',
    })
  }
  const DEDUPE_WINDOW_MS = 120_000
  const sorted = [...out].sort((a, b) => a.etaMs - b.etaMs)
  const deduped: EtaEntry[] = []
  for (const e of sorted) {
    if (deduped.length > 0 && e.etaMs - deduped[deduped.length - 1].etaMs < DEDUPE_WINDOW_MS) continue
    deduped.push(e)
  }
  return deduped.slice(0, 3)
}