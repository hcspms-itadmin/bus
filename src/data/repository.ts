import { fetchCtbEta, fetchNlbEta } from './clients'
import { normalizeCtb, normalizeNlb } from './normalize'
import type { ServiceSnapshot } from './normalize'
import type { ServiceConfig } from './services'

export async function fetchServiceEta(service: ServiceConfig, signal?: AbortSignal): Promise<ServiceSnapshot> {
  const nowMs = Date.now()
  try {
    const etas =
      service.operator === 'CTB'
        ? normalizeCtb(await fetchCtbEta(service.stopId, service.route, signal), service, nowMs)
        : normalizeNlb(await fetchNlbEta(service.nlbRouteId ?? '', service.stopId, signal), service, nowMs)
    return { service, status: etas.length > 0 ? 'ok' : 'empty', fetchedAt: nowMs, etas }
  } catch (err) {
    return {
      service,
      status: 'error',
      fetchedAt: nowMs,
      etas: [],
      error: err instanceof Error ? err.message : String(err),
    }
  }
}