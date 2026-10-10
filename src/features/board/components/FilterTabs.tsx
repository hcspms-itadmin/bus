import styles from './FilterTabs.module.css'
import { TABS, type TabKey } from '../boardUtils'

export interface FilterTabsProps {
  tab: TabKey
  counts: Record<TabKey, number>
  onChange: (tab: TabKey) => void
}

export function FilterTabs({ tab, counts, onChange }: FilterTabsProps) {
  return (
    <nav className={styles.tabs} aria-label="按出行意圖篩選路線">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className={styles.chip}
          data-active={tab === t.key}
          aria-pressed={tab === t.key}
          onClick={() => onChange(t.key)}
        >
          <span className={styles.label}>{t.label}</span>
          <span className={styles.count} aria-label={`${counts[t.key]} 條路線`}>
            {counts[t.key]}
          </span>
        </button>
      ))}
    </nav>
  )
}