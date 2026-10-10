export type EtaTier = 'urgent' | 'normal' | 'scheduled'

export function minutesUntil(nowMs: number, etaMs: number): number {
  return Math.floor((etaMs - nowMs) / 60_000)
}

export function tierFor(minutes: number, scheduled: boolean): EtaTier {
  if (scheduled) return 'scheduled'
  return minutes <= 2 ? 'urgent' : 'normal'
}

/** 顯示用：<=0 = 到站；否則純分鐘數字。 */
export function formatMinutes(minutes: number): string {
  return minutes <= 0 ? '到站' : String(minutes)
}