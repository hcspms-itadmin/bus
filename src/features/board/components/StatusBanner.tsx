import styles from './StatusBanner.module.css'
import type { BoardState } from '../hooks/useEtaPolling'

export interface StatusBannerProps {
  boardState: BoardState
  errorCount: number
  onRefresh: () => void
}

export function StatusBanner({ boardState, errorCount, onRefresh }: StatusBannerProps) {
  if (boardState === 'live' || boardState === 'loading') return null

  const copy: Record<Exclude<BoardState, 'live' | 'loading'>, string> = {
    offline: '離線 — 顯示上次取得嘅數據',
    stale: '數據過時 — 仍顯示上次取得嘅數據',
    error: '暫時無法取得實時數據',
    degraded: `${errorCount} 條路線暫時冇數據`,
  }

  return (
    <div className={styles.banner} data-state={boardState} role="status">
      <span className={styles.copy}>{copy[boardState]}</span>
      <button type="button" className={styles.retry} onClick={onRefresh}>
        重試
      </button>
    </div>
  )
}