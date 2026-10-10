import styles from './Board.module.css'
import { useEta } from '../../app/providers/etaContext'
import { BoardHeader } from './components/BoardHeader'
import { ServiceSection } from './components/ServiceSection'
import { StatusBanner } from './components/StatusBanner'

export function Board() {
  const { snapshots, boardState, errorCount, now, refresh } = useEta()

  return (
    <div className={styles.board}>
      <BoardHeader refresh={refresh} />
      <main className={styles.main}>
        <StatusBanner boardState={boardState} errorCount={errorCount} onRefresh={refresh} />
        <ServiceSection snapshots={snapshots} now={now} />
      </main>
      <footer className={styles.footer}>
        資料來源：香港政府「資料一線通」實時巴士到站（城巴 / 新大嶼山巴士）＋ 九巴 etabus 實時到站 · 每 30 秒自動更新
      </footer>
    </div>
  )
}