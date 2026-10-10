import { useMemo, useState } from 'react'
import styles from './Board.module.css'
import { useEta } from '../../app/providers/etaContext'
import { ARRIVALS, DEPARTURES } from '../../data/services'
import { countByTab } from './boardUtils'
import { usePreferences } from './hooks/usePreferences'
import { BoardHeader } from './components/BoardHeader'
import { FilterTabs } from './components/FilterTabs'
import { ServiceSection } from './components/ServiceSection'
import { SettingsDrawer } from './components/SettingsDrawer'
import { StatusBanner } from './components/StatusBanner'

export function Board() {
  const { snapshots, boardState, errorCount, now, refresh } = useEta()
  const prefs = usePreferences()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const counts = useMemo(() => countByTab(prefs.hidden), [prefs.hidden])

  const sectionProps = {
    snapshots,
    now,
    hidden: prefs.hidden,
    pinned: prefs.pinned,
    tab: prefs.tab,
    onTogglePin: prefs.togglePin,
  }

  const showDepartures = DEPARTURES.some(
    (s) => !prefs.hidden.includes(s.id) && (prefs.tab === 'all' || s.intent === prefs.tab),
  )
  const showArrivals = ARRIVALS.some(
    (s) => !prefs.hidden.includes(s.id) && (prefs.tab === 'all' || s.intent === prefs.tab),
  )

  return (
    <div className={styles.board}>
      <div className={styles.stickyTop}>
        <BoardHeader refresh={refresh} onOpenSettings={() => setDrawerOpen(true)} />
        <FilterTabs tab={prefs.tab} counts={counts} onChange={prefs.setTab} />
      </div>
      <main className={styles.main}>
        <StatusBanner boardState={boardState} errorCount={errorCount} onRefresh={refresh} />
        {showDepartures && (
          <ServiceSection
            title="離開滿東邨"
            en="Departures"
            headingId="departures-heading"
            services={DEPARTURES}
            {...sectionProps}
          />
        )}
        {showArrivals && (
          <ServiceSection
            title="返回滿東邨"
            en="Arrivals"
            headingId="arrivals-heading"
            services={ARRIVALS}
            {...sectionProps}
          />
        )}
      </main>
      <footer className={styles.footer}>
        資料來源：香港政府「資料一線通」實時巴士到站（城巴 / 新大嶼山巴士）＋ 九巴 etabus 實時到站 · 每 30
        秒自動更新
      </footer>
      {drawerOpen && (
        <SettingsDrawer
          tab={prefs.tab}
          pinned={prefs.pinned}
          hidden={prefs.hidden}
          shareUrl={prefs.shareUrl}
          onSetTab={prefs.setTab}
          onToggleHide={prefs.toggleHide}
          onUnpin={prefs.togglePin}
          onReset={prefs.reset}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  )
}