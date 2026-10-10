import styles from './BoardHeader.module.css'
import { useEta } from '../../../app/providers/etaContext'
import { formatClock } from '../../../data/time'

export interface BoardHeaderProps {
  refresh: () => void
}

export function BoardHeader({ refresh }: BoardHeaderProps) {
  const { now, lastUpdatedAt } = useEta()
  return (
    <header className={styles.header}>
      <div className={styles.station}>
        <span className={styles.kicker}>東涌</span>
        <h1 className={styles.title}>滿東邨 巴士實時到站</h1>
      </div>
      <div className={styles.clockBlock}>
        <time className={styles.clock} dateTime={new Date(now).toISOString()}>
          {formatClock(new Date(now))}
        </time>
        <div className={styles.meta}>
          <span className={styles.updated}>
            最後更新 {lastUpdatedAt > 0 ? formatClock(new Date(lastUpdatedAt)) : '—'}
          </span>
          <button type="button" className={styles.refresh} onClick={refresh}>
            更新
          </button>
        </div>
      </div>
    </header>
  )
}