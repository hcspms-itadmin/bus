import styles from './EtaRow.module.css'
import type { EtaEntry } from '../../../data/normalize'
import { minutesUntil } from '../../../data/countdown'
import { formatClockHm } from '../../../data/time'
import { CountdownBadge } from './CountdownBadge'

export interface EtaRowProps {
  eta: EtaEntry
  now: number
}

export function EtaRow({ eta, now }: EtaRowProps) {
  const minutes = minutesUntil(now, eta.etaMs)
  return (
    <li className={styles.row} aria-label={`${formatClockHm(eta.etaMs)} ${eta.dest}`}>
      <CountdownBadge minutes={minutes} scheduled={eta.scheduled} />
      <time className={styles.time} dateTime={new Date(eta.etaMs).toISOString()}>
        {formatClockHm(eta.etaMs)}
      </time>
      <span className={styles.dest}>{eta.dest}</span>
      {eta.remark && <span className={styles.remark}>{eta.remark}</span>}
    </li>
  )
}