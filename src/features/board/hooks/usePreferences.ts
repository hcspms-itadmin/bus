import { useCallback, useEffect, useMemo, useState } from 'react'
import { SERVICES } from '../../../data/services'
import { TABS, type TabKey } from '../boardUtils'

export interface BoardPrefs {
  tab: TabKey
  pinned: string[]
  hidden: string[]
}

export interface BoardPrefsApi extends BoardPrefs {
  togglePin: (id: string) => void
  toggleHide: (id: string) => void
  setTab: (tab: TabKey) => void
  reset: () => void
  shareUrl: string
}

const STORAGE_KEY = 'mun-tung-eta-prefs-v1'
const VALID_IDS = new Set(SERVICES.map((s) => s.id))
const VALID_TABS = new Set<string>(TABS.map((t) => t.key))

function cleanIds(ids: readonly string[] | undefined): string[] | undefined {
  if (!Array.isArray(ids)) return undefined
  const out = ids.filter((id) => VALID_IDS.has(id))
  return out
}

/** 解析 `?tab=mrt&pins=a,b&hide=c`；有寫的 key 才覆蓋，無寫的沿用已存設定。 */
export function parsePrefsFromSearch(search: string): Partial<BoardPrefs> {
  const out: Partial<BoardPrefs> = {}
  const raw = search.startsWith('?') ? search.slice(1) : search
  if (!raw) return out
  const q = new URLSearchParams(raw)
  const tab = q.get('tab')
  if (tab && VALID_TABS.has(tab)) out.tab = tab as TabKey
  const pins = q.get('pins')
  if (pins !== null && (pins === '' || pins.split(',').some((id) => VALID_IDS.has(id.trim())))) {
    out.pinned = pins === '' ? [] : pins.split(',').map((s) => s.trim()).filter((id) => VALID_IDS.has(id))
  }
  const hide = q.get('hide')
  if (hide !== null && (hide === '' || hide.split(',').some((id) => VALID_IDS.has(id.trim())))) {
    out.hidden = hide === '' ? [] : hide.split(',').map((s) => s.trim()).filter((id) => VALID_IDS.has(id))
  }
  return out
}

export function buildShareSearch(prefs: BoardPrefs): string {
  const q = new URLSearchParams()
  q.set('tab', prefs.tab)
  q.set('pins', prefs.pinned.join(','))
  q.set('hide', prefs.hidden.join(','))
  return `?${q.toString()}`
}

const DEFAULTS: BoardPrefs = { tab: 'all', pinned: [], hidden: [] }

function loadInitial(search: string): BoardPrefs {
  let stored: Partial<BoardPrefs> = {}
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BoardPrefs>
      stored = {
        tab: parsed.tab && VALID_TABS.has(parsed.tab) ? parsed.tab : undefined,
        pinned: cleanIds(parsed.pinned),
        hidden: cleanIds(parsed.hidden),
      }
    }
  } catch {
    stored = {}
  }
  return { ...DEFAULTS, ...stored, ...parsePrefsFromSearch(search) }
}

export function usePreferences(search?: string): BoardPrefsApi {
  const [prefs, setPrefs] = useState<BoardPrefs>(() =>
    loadInitial(search ?? (typeof window !== 'undefined' ? window.location.search : '')),
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      /* 私隱模式等寫入失敗時靜默略過 */
    }
  }, [prefs])

  const togglePin = useCallback((id: string) => {
    if (!VALID_IDS.has(id)) return
    setPrefs((p) => ({
      ...p,
      pinned: p.pinned.includes(id) ? p.pinned.filter((x) => x !== id) : [...p.pinned, id],
    }))
  }, [])

  const toggleHide = useCallback((id: string) => {
    if (!VALID_IDS.has(id)) return
    setPrefs((p) => ({
      ...p,
      hidden: p.hidden.includes(id) ? p.hidden.filter((x) => x !== id) : [...p.hidden, id],
    }))
  }, [])

  const setTab = useCallback((tab: TabKey) => {
    setPrefs((p) => ({ ...p, tab }))
  }, [])

  const reset = useCallback(() => {
    setPrefs({ ...DEFAULTS })
  }, [])

  const shareUrl = useMemo(() => {
    const base =
      typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : ''
    return `${base}${buildShareSearch(prefs)}`
  }, [prefs])

  return { ...prefs, togglePin, toggleHide, setTab, reset, shareUrl }
}
