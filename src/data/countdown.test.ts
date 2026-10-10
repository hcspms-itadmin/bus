import { describe, expect, it } from 'vitest'
import { formatMinutes, minutesUntil, tierFor } from './countdown'

const T0 = Date.UTC(2026, 9, 9, 10, 0, 0)

describe('minutesUntil', () => {
  it('向下取整至整分鐘', () => {
    expect(minutesUntil(T0, T0 + 179_000)).toBe(2)
    expect(minutesUntil(T0, T0 + 180_000)).toBe(3)
    expect(minutesUntil(T0, T0 + 30_000)).toBe(0)
  })
  it('已過班次為負數', () => {
    expect(minutesUntil(T0, T0 - 60_000)).toBe(-1)
  })
})

describe('tierFor', () => {
  it('scheduled 優先於時間分級', () => {
    expect(tierFor(1, true)).toBe('scheduled')
    expect(tierFor(20, true)).toBe('scheduled')
  })
  it('<= 2 分鐘為 urgent，其餘 normal', () => {
    expect(tierFor(0, false)).toBe('urgent')
    expect(tierFor(2, false)).toBe('urgent')
    expect(tierFor(3, false)).toBe('normal')
  })
})

describe('formatMinutes', () => {
  it('<=0 顯示到站', () => {
    expect(formatMinutes(0)).toBe('到站')
    expect(formatMinutes(-3)).toBe('到站')
  })
  it('正數純數字', () => {
    expect(formatMinutes(17)).toBe('17')
  })
})