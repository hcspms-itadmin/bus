import styles from './ServiceSection.module.css'
import type { ServiceSnapshot } from '../../../data/normalize'
import { DEPARTURES, ARRIVALS, type ServiceConfig } from '../../../data/services'
import { BusRouteCard } from './BusRouteCard'

export interface ServiceSectionProps {
  snapshots: ServiceSnapshot[]
  now: number
}

function findSnapshot(snapshots: ServiceSnapshot[], service: ServiceConfig) {
  return snapshots.find((s) => s.service.id === service.id)
}

export function ServiceSection({ snapshots, now }: ServiceSectionProps) {
  return (
    <>
      <section className={styles.section} aria-labelledby="departures-heading">
        <h2 className={styles.heading} id="departures-heading">
          離開滿東邨
          <span className={styles.en}>Departures</span>
        </h2>
        <div className={styles.grid}>
          {DEPARTURES.map((service) => (
            <BusRouteCard
              key={service.id}
              snapshot={findSnapshot(snapshots, service)}
              service={service}
              now={now}
            />
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="arrivals-heading">
        <h2 className={styles.heading} id="arrivals-heading">
          返回滿東邨
          <span className={styles.en}>Arrivals</span>
        </h2>
        <div className={styles.grid}>
          {ARRIVALS.map((service) => (
            <BusRouteCard
              key={service.id}
              snapshot={findSnapshot(snapshots, service)}
              service={service}
              now={now}
            />
          ))}
        </div>
      </section>
    </>
  )
}