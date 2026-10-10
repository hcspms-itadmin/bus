import { CTB_ETA_URL, NLB_ETA_URL, REQUEST_TIMEOUT_MS } from './constants'
import { CtbEtaResponseSchema, NlbEtaResponseSchema } from './schemas'
import type { CtbEtaRecord, NlbEtaRecord } from './schemas'

export class ApiException extends Error {}

async function fetchJson(input: string, signal?: AbortSignal): Promise<unknown> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS)
  const onAbort = () => ctrl.abort()
  signal?.addEventListener('abort', onAbort)
  try {
    const res = await fetch(input, { signal: ctrl.signal, headers: { accept: 'application/json' } })
    if (!res.ok) throw new ApiException(`HTTP ${res.status}`)
    return (await res.json()) as unknown
  } catch (err) {
    if (ctrl.signal.aborted) throw new ApiException('請求超時')
    throw err
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

export async function fetchCtbEta(stopId: string, route: string, signal?: AbortSignal): Promise<CtbEtaRecord[]> {
  const raw = await fetchJson(`${CTB_ETA_URL}/${encodeURIComponent(stopId)}/${encodeURIComponent(route)}`, signal)
  const parsed = CtbEtaResponseSchema.safeParse(raw)
  if (!parsed.success) throw new ApiException('CTB ETA 資料格式有誤')
  return parsed.data.data ?? []
}

export async function fetchNlbEta(
  routeId: string,
  stopId: string,
  signal?: AbortSignal,
): Promise<NlbEtaRecord[]> {
  const url = `${NLB_ETA_URL}?action=estimatedArrivals&routeId=${encodeURIComponent(routeId)}&stopId=${encodeURIComponent(stopId)}&language=zh`
  const raw = await fetchJson(url, signal)
  const parsed = NlbEtaResponseSchema.safeParse(raw)
  if (!parsed.success) throw new ApiException('NLB ETA 資料格式有誤')
  return parsed.data.estimatedArrivals ?? []
}