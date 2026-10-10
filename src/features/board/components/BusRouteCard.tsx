import styles from './BusRouteCard.module.css'
import type { ServiceSnapshot } from '../../../data/normalize'
import type { ServiceConfig } from '../../../data/services'
import { EtaRow } from './EtaRow'
import { OperatorBadge } from './OperatorBadge'

export interface BusRouteCardProps {
  snapshot: ServiceSnapshot | undefined
  service: ServiceConfig
  now: number
  pinned: boolean
  onTogglePin: () => void
}

export function BusRouteCard({ snapshot, service, now, pinned, onTogglePin }: BusRouteCardProps) {
  const etas = snapshot?.etas ?? []
  const status = snapshot?.status ?? 'loading'

  return (
    <article className={styles.card} aria-busy={status === 'loading'}>
      <header className={styles.header}>
        <div className={styles.routeLine}>
          <OperatorBadge operator={service.operator} />
          <span className={styles.routeNo}>{service.route}</span>
        </div>
        <div className={styles.destBlock}>
          <span className={styles.dest}>{service.displayDest}</span>
          {(service.displayFrom || service.remarkHint) && (
            <div className={styles.metaRow}>
              {service.displayFrom && (
                <span className={styles.from}>由 {service.displayFrom} 開出</span>
              )}
              {service.remarkHint && <span className={styles.hint}>{service.remarkHint}</span>}
            </div>
          )}
        </div>
        <button
          type="button"
          className={styles.pin}
          data-pinned={pinned}
          aria-pressed={pinned}
          aria-label={pinned ? `取消釘選 ${service.route}` : `釘選 ${service.route} 到常用`}
          title={pinned ? '取消釘選' : '釘選到常用'}
          onClick={onTogglePin}
        >
          {pinned ? '★' : '☆'}
        </button>
      </header>

      {status === 'error' && (
        <div className={styles.message} role="status">
          暫時無法取得數據
        </div>
      )}
      {status === 'empty' && (
        <div className={styles.message} role="status">
          現時沒有班次
        </div>
      )}
      {status === 'loading' && (
        <ul className={styles.list}>
          {[0, 1, 2].map((i) => (
            <li key={i} className={styles.skeleton} aria-hidden="true" />
          ))}
        </ul>
      )}
      {status === 'ok' && (
        <ul className={styles.list}>
          {etas.map((eta) => (
            <EtaRow key={eta.etaMs} eta={eta} now={now} />
          ))}
        </ul>
      )}
    </article>
  )
}