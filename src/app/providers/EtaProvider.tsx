import { useMemo, type ReactNode } from 'react'
import { useBoardClock } from '../../features/board/hooks/useBoardClock'
import { useEtaPolling } from '../../features/board/hooks/useEtaPolling'
import { EtaContext } from './etaContext'
import type { EtaContextValue } from './etaContext'

export function EtaProvider({ children }: { children: ReactNode }) {
  const polling = useEtaPolling()
  const now = useBoardClock()

  const value = useMemo<EtaContextValue>(
    () => ({
      snapshots: polling.snapshots,
      boardState: polling.boardState,
      lastUpdatedAt: polling.lastUpdatedAt,
      errorCount: polling.errorCount,
      now,
      refresh: polling.refresh,
    }),
    [polling, now],
  )

  return <EtaContext.Provider value={value}>{children}</EtaContext.Provider>
}