import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  POLL_INTERVAL_MS,
  POLL_JITTER_MS,
  POLL_RETRY_MS,
  STALE_AFTER_MS,
} from '../../../data/constants'
import { fetchServiceEta } from '../../../data/repository'
import type { ServiceSnapshot } from '../../../data/normalize'
import { SERVICES } from '../../../data/services'

export type BoardState = 'loading' | 'live' | 'degraded' | 'error' | 'offline' | 'stale'

export interface EtaPollingResult {
  snapshots: ServiceSnapshot[]
  boardState: BoardState
  lastUpdatedAt: number
  errorCount: number
  now: number
  refresh: () => void
}

export function useEtaPolling(): EtaPollingResult {
  const [snapshots, setSnapshots] = useState<Record<string, ServiceSnapshot>>({})
  const [lastUpdatedAt, setLastUpdatedAt] = useState(0)
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const inflightRef = useRef(false)
  const nextPollAtRef = useRef(0)
  const services = SERVICES

  const runPoll = useCallback(
    async (manual = false) => {
      if (inflightRef.current) return
      if (typeof navigator !== 'undefined' && !navigator.onLine) return
      inflightRef.current = true
      try {
        const settled = await Promise.allSettled(services.map((s) => fetchServiceEta(s)))
        const next: Record<string, ServiceSnapshot> = {}
        let errCount = 0
        for (const r of settled) {
          if (r.status === 'fulfilled') {
            next[r.value.service.id] = r.value
            if (r.value.status === 'error') errCount += 1
          }
        }
        setSnapshots((prev) => ({ ...prev, ...next }))
        setLastUpdatedAt(Date.now())
        const delay = manual
          ? POLL_INTERVAL_MS + Math.round((Math.random() - 0.5) * 2 * POLL_JITTER_MS)
          : errCount > 0
            ? POLL_RETRY_MS
            : POLL_INTERVAL_MS + Math.round((Math.random() - 0.5) * 2 * POLL_JITTER_MS)
        nextPollAtRef.current = Date.now() + delay
      } finally {
        inflightRef.current = false
      }
    },
    [services],
  )

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) void runPoll(true)
    }
    const handleOnline = () => {
      setOnline(true)
      void runPoll(true)
    }
    const handleOffline = () => {
      setOnline(false)
      nextPollAtRef.current = 0
    }
    const heartbeat = () => {
      const t = Date.now()
      setNow(t)
      if (!document.hidden && online && t >= nextPollAtRef.current) void runPoll(false)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    void runPoll(true)
    const id = setInterval(heartbeat, 1_000)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(id)
    }
  }, [online, runPoll])

  const entries = useMemo(
    () => services.map((s) => snapshots[s.id]).filter(Boolean) as ServiceSnapshot[],
    [services, snapshots],
  )

  const { boardState, errorCount } = useMemo(() => {
    const errCount = entries.filter((e) => e.status === 'error').length
    let state: BoardState
    if (!online) state = 'offline'
    else if (entries.length === 0 || entries.length < services.length) state = 'loading'
    else if (now - lastUpdatedAt > STALE_AFTER_MS) state = 'stale'
    else if (errCount === entries.length) state = 'error'
    else if (errCount > 0) state = 'degraded'
    else state = 'live'
    return { boardState: state, errorCount: errCount }
  }, [entries, online, services.length, now, lastUpdatedAt])

  const refresh = useCallback(() => void runPoll(true), [runPoll])

  return { snapshots: entries, boardState, lastUpdatedAt, errorCount, now, refresh }
}