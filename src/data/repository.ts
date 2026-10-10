import { fetchCtbEta, fetchKmbEta, fetchNlbEta } from './clients'
import { normalizeCtb, normalizeKmb, normalizeNlb } from './normalize'
import type { ServiceSnapshot } from './normalize'
import type { KmbEtaRecord } from './schemas'
import type { ServiceConfig } from './services'

async function fetchKmbRecords(service: ServiceConfig, signal?: AbortSignal): Promise<KmbEtaRecord[]> {
  const serviceTypes = [...new Set((service.kmbQueries ?? []).map((q) => q.serviceType))]
  const batches = await Promise.all(
    serviceTypes.map((st) => fetchKmbEta(service.route, st, signal)),
  )
  return batches.flat()
}

export async function fetchServiceEta(service: ServiceConfig, signal?: AbortSignal): Promise<ServiceSnapshot> {
  const nowMs = Date.now()
  try {
    const etas =
      service.operator === 'CTB'
        ? normalizeCtb(await fetchCtbEta(service.stopId, service.route, signal), service, nowMs)
        : service.operator === 'KMB'
          ? normalizeKmb(await fetchKmbRecords(service, signal), service, nowMs)
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