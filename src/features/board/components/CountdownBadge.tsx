import styles from './CountdownBadge.module.css'
import { formatMinutes } from '../../../data/countdown'

export interface CountdownBadgeProps {
  minutes: number
  scheduled: boolean
}

export function CountdownBadge({ minutes, scheduled }: CountdownBadgeProps) {
  const arriving = minutes <= 0
  return (
    <span
      className={styles.badge}
      data-tier={scheduled ? 'scheduled' : arriving ? 'urgent' : 'normal'}
      role="timer"
    >
      {scheduled && <span className={styles.tag}>預定</span>}
      <span className={styles.num}>{formatMinutes(minutes)}</span>
      {!scheduled && !arriving && <span className={styles.unit}>MIN</span>}
    </span>
  )
}