import { describe, expect, it } from 'vitest'
import { fetchServiceEta } from './repository'
import { SERVICES } from './services'

/**
 * 聯網整合冒煙測試（唔喺預設 include 內，需顯式執行）：
 *   npx vitest run src/data/live.spec.ts
 */
describe('live data.gov.hk 冒煙', () => {
  it(
    '全部服務可取得並解析',
    async () => {
      const results = await Promise.all(SERVICES.map((s) => fetchServiceEta(s)))
      for (const r of results) {
        expect(r.status !== 'error', `${r.service.id}: ${r.error ?? ''}`).toBe(true)
      }
      const flat = results.flatMap((r) => r.etas)
      console.log(
        `各服務班次數：\n${results
          .map(
            (r) =>
              `  ${r.service.id.padEnd(16)} ${r.status.padEnd(6)} ${r.etas.map((e) => `${e.minutes}min${e.scheduled ? '*預定' : ''}`).join(' ') || '—'}`,
          )
          .join('\n')}`,
      )
      expect(flat.length).toBeGreaterThan(0)
    },
    60_000,
  )
})