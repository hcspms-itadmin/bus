import styles from './OperatorBadge.module.css'
import type { Operator } from '../../../data/services'

export interface OperatorBadgeProps {
  operator: Operator
}

export function OperatorBadge({ operator }: OperatorBadgeProps) {
  return (
    <span
      className={styles.badge}
      data-op={operator}
      aria-label={operator === 'CTB' ? '城巴' : '新大嶼山巴士'}
    >
      {operator}
    </span>
  )
}