import { useEffect, useState } from 'react'
import styles from './SettingsDrawer.module.css'
import { ARRIVALS, DEPARTURES } from '../../../data/services'
import { TABS, type TabKey } from '../boardUtils'

export interface SettingsDrawerProps {
  tab: TabKey
  pinned: readonly string[]
  hidden: readonly string[]
  shareUrl: string
  onSetTab: (tab: TabKey) => void
  onToggleHide: (id: string) => void
  onUnpin: (id: string) => void
  onReset: () => void
  onClose: () => void
}

export function SettingsDrawer({
  tab,
  pinned,
  hidden,
  shareUrl,
  onSetTab,
  onToggleHide,
  onUnpin,
  onReset,
  onClose,
}: SettingsDrawerProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = shareUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pinnedServices = pinned
    .map((id) => [...DEPARTURES, ...ARRIVALS].find((s) => s.id === id))
    .filter((s): s is (typeof DEPARTURES)[number] => Boolean(s))

  const renderHideGroup = (title: string, list: typeof DEPARTURES) => (
    <div className={styles.group}>
      <h4 className={styles.groupTitle}>{title}</h4>
      <ul className={styles.hideList}>
        {list.map((s) => {
          const isHidden = hidden.includes(s.id)
          return (
            <li key={s.id}>
              <label className={styles.hideRow} data-hidden={isHidden}>
                <input
                  type="checkbox"
                  checked={!isHidden}
                  onChange={() => onToggleHide(s.id)}
                  aria-label={`${isHidden ? '顯示' : '隱藏'} ${s.route} 往 ${s.displayDest}`}
                />
                <span className={styles.hideRoute}>{s.route}</span>
                <span className={styles.hideDest}>往 {s.displayDest}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )

  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="自訂看板"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.sheetHeader}>
          <h2 className={styles.sheetTitle}>自訂看板</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="關閉自訂看板">
            ✕
          </button>
        </header>

        <div className={styles.body}>
          <h3 className={styles.sectionTitle}>預設分頁</h3>
          <div className={styles.tabRow} role="radiogroup" aria-label="預設分頁">
            {TABS.map((t) => (
              <label key={t.key} className={styles.radio} data-active={tab === t.key}>
                <input
                  type="radio"
                  name="default-tab"
                  checked={tab === t.key}
                  onChange={() => onSetTab(t.key)}
                />
                {t.label}
              </label>
            ))}
          </div>

          <h3 className={styles.sectionTitle}>顯示路線（剔除即隱藏）</h3>
          {renderHideGroup('離開滿東邨', DEPARTURES)}
          {renderHideGroup('返回滿東邨', ARRIVALS)}

          <h3 className={styles.sectionTitle}>我的釘選</h3>
          {pinnedServices.length === 0 ? (
            <p className={styles.emptyPins}>未釘選任何路線 — 在路線卡右上角按 ☆ 即可釘選到頂。</p>
          ) : (
            <ul className={styles.pinList}>
              {pinnedServices.map((s) => (
                <li key={s.id} className={styles.pinRow}>
                  <span className={styles.hideRoute}>{s.route}</span>
                  <span className={styles.hideDest}>往 {s.displayDest}</span>
                  <button
                    type="button"
                    className={styles.unpin}
                    onClick={() => onUnpin(s.id)}
                    aria-label={`取消釘選 ${s.route}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.share} onClick={copyLink}>
              {copied ? '已複製連結 ✓' : '複製分享連結'}
            </button>
            <button type="button" className={styles.reset} onClick={onReset}>
              恢復預設
            </button>
          </div>
          <p className={styles.note}>設定自動保存在此裝置；分享連結可將你的版面原樣傳給家人。</p>
        </div>
      </section>
    </div>
  )
}