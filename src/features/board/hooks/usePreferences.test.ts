import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buildShareSearch,
  parsePrefsFromSearch,
  usePreferences,
} from './usePreferences'

const KEY = 'mun-tung-eta-prefs-v1'

afterEach(() => {
  localStorage.clear()
})

describe('parsePrefsFromSearch', () => {
  it('解析 tab/pins/hide；無效 id 同 tab 丟棄', () => {
    expect(parsePrefsFromSearch('?tab=mrt&pins=nlb-39m-tc,ctb-e21a-hm&hide=ctb-e22s-pl')).toEqual({
      tab: 'mrt',
      pinned: ['nlb-39m-tc', 'ctb-e21a-hm'],
      hidden: ['ctb-e22s-pl'],
    })
    expect(parsePrefsFromSearch('?tab=bogus&pins=nope&hide=ctb-e22s-pl')).toEqual({
      hidden: ['ctb-e22s-pl'],
    })
    expect(parsePrefsFromSearch('')).toEqual({})
  })
})

describe('buildShareSearch', () => {
  it('round-trip 還原', () => {
    const prefs = { tab: 'city' as const, pinned: ['nlb-39m-tc'], hidden: ['ctb-e11s-th'] }
    const search = buildShareSearch(prefs)
    expect(parsePrefsFromSearch(search)).toEqual(prefs)
  })
})

describe('usePreferences', () => {
  it('URL 優先於 localStorage；操作即時持久化', () => {
    localStorage.setItem(KEY, JSON.stringify({ tab: 'city', pinned: [], hidden: ['ctb-e22s-pl'] }))
    const { result } = renderHook(() => usePreferences('?tab=mrt&pins=nlb-39m-tc'))
    expect(result.current.tab).toBe('mrt')
    expect(result.current.pinned).toEqual(['nlb-39m-tc'])
    expect(result.current.hidden).toEqual(['ctb-e22s-pl'])

    act(() => result.current.toggleHide('ctb-e11s-th'))
    expect(result.current.hidden).toContain('ctb-e11s-th')
    const stored = JSON.parse(localStorage.getItem(KEY) as string)
    expect(stored.hidden).toContain('ctb-e11s-th')

    act(() => result.current.reset())
    expect(result.current).toMatchObject({ tab: 'all', pinned: [], hidden: [] })
  })

  it('無效 toggle id 被拒', () => {
    const { result } = renderHook(() => usePreferences(''))
    act(() => result.current.togglePin('nope'))
    act(() => result.current.toggleHide('nope'))
    expect(result.current.pinned).toEqual([])
    expect(result.current.hidden).toEqual([])
  })
})
