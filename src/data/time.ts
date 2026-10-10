export const HK_TZ = 'Asia/Hong_Kong'

export function parseIsoWithOffset(iso: string): number {
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) throw new Error(`無法解析時間：${iso}`)
  return ms
}

/** NLB v2 時間格式 `YYYY-MM-DD HH:MM[:SS]`，無時區指示，視為 Asia/Hong_Kong。 */
export function parseNlbTime(s: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::\d{2})?$/.exec(s)
  if (!m) throw new Error(`無法解析 NLB 時間：${s}`)
  const [, y, mo, d, h, mi] = m
  return parseIsoWithOffset(`${y}-${mo}-${d}T${h}:${mi}:00+08:00`)
}

const timeFmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('zh-Hant', { timeZone: HK_TZ, hourCycle: 'h23', ...opts })

export function formatClock(date: Date): string {
  return timeFmt({ hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date)
}

export function formatClockHm(ms: number): string {
  return timeFmt({ hour: '2-digit', minute: '2-digit' }).format(new Date(ms))
}