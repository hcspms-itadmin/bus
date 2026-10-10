import styles from './ServiceSection.module.css'
import type { ServiceSnapshot } from '../../../data/normalize'
import type { ServiceConfig } from '../../../data/services'
import { buildSectionView, type TabKey } from '../boardUtils'
import { BusRouteCard } from './BusRouteCard'

export interface ServiceSectionProps {
  title: string
  en: string
  headingId: string
  services: readonly ServiceConfig[]
  snapshots: ServiceSnapshot[]
  now: number
  hidden: readonly string[]
  pinned: readonly string[]
  tab: TabKey
  onTogglePin: (id: string) => void
}

export function ServiceSection({
  title,
  en,
  headingId,
  services,
  snapshots,
  now,
  hidden,
  pinned,
  tab,
  onTogglePin,
}: ServiceSectionProps) {
  const view = buildSectionView(services, snapshots, hidden, pinned, tab)
  if (view.pinned.length === 0 && view.active.length === 0 && view.inactive.length === 0) {
    return null
  }

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 className={styles.heading} id={headingId}>
        {title}
        <span className={styles.en}>{en}</span>
      </h2>
      <div className={styles.grid}>
        {view.pinned.map((item) => (
          <BusRouteCard
            key={item.service.id}
            snapshot={item.snapshot}
            service={item.service}
            now={now}
            pinned
            onTogglePin={() => onTogglePin(item.service.id)}
          />
        ))}
        {view.active.map((item) => (
          <BusRouteCard
            key={item.service.id}
            snapshot={item.snapshot}
            service={item.service}
            now={now}
            pinned={false}
            onTogglePin={() => onTogglePin(item.service.id)}
          />
        ))}
      </div>
      {view.inactive.length > 0 && (
        <details className={styles.drawer}>
          <summary className={styles.drawerSummary}>
            暫無班次路線（{view.inactive.length} 條）— 點按展開確認
          </summary>
          <div className={styles.grid}>
            {view.inactive.map((item) => (
              <BusRouteCard
                key={item.service.id}
                snapshot={item.snapshot}
                service={item.service}
                now={now}
                pinned={false}
                onTogglePin={() => onTogglePin(item.service.id)}
              />
            ))}
          </div>
        </details>
      )}
    </section>
  )
}