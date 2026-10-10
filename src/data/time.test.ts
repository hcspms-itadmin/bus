import { describe, expect, it } from 'vitest'
import { formatClock, formatClockHm, parseIsoWithOffset, parseNlbTime, HK_TZ } from './time'

describe('parseNlbTime', () => {
  it('解析 "YYYY-MM-DD HH:MM" 為 HK 時區毫秒', () => {
    const ms = parseNlbTime('2026-10-09 17:29')
    // 17:29 +08:00 == 09:29 UTC
    expect(new Date(ms).toISOString()).toBe('2026-10-09T09:29:00.000Z')
  })
  it('接受含秒格式（真實 API 回傳 19:30:00）', () => {
    expect(parseNlbTime('2026-10-09 19:30:00')).toBe(Date.UTC(2026, 9, 9, 11, 30, 0))
  })
  it('壞格式拋錯', () => {
    expect(() => parseNlbTime('17:29')).toThrow()
    expect(() => parseNlbTime('')).toThrow()
  })
})

describe('parseIsoWithOffset', () => {
  it('解析 CTB ISO 8601 含時區', () => {
    const ms = parseIsoWithOffset('2026-10-09T17:30:00+08:00')
    expect(new Date(ms).toISOString()).toBe('2026-10-09T09:30:00.000Z')
  })
})

describe('formatClock / formatClockHm', () => {
  it('以 HK 時區格式化', () => {
    const d = new Date('2026-10-09T09:15:37.000Z')
    expect(formatClockHm(d.getTime())).toBe('17:15')
    expect(formatClock(d)).toBe('17:15:37')
  })
  it('HK_TZ 常數正確', () => {
    expect(HK_TZ).toBe('Asia/Hong_Kong')
  })
})