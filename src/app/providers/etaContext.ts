import { createContext, useContext } from 'react'
import type { ServiceSnapshot } from '../../data/normalize'
import type { BoardState } from '../../features/board/hooks/useEtaPolling'

export interface EtaContextValue {
  snapshots: ServiceSnapshot[]
  boardState: BoardState
  lastUpdatedAt: number
  errorCount: number
  now: number
  refresh: () => void
}

export const EtaContext = createContext<EtaContextValue | null>(null)

export function useEta(): EtaContextValue {
  const value = useContext(EtaContext)
  if (!value) throw new Error('useEta 必須在 EtaProvider 內使用')
  return value
}