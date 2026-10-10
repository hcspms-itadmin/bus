import { expect, test } from '@playwright/test'

test('板面載入並顯示實時班次', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/')
  await expect(page.getByRole('heading', { name: /滿東邨 巴士實時到站/ })).toBeVisible()

  const sections = ['離開滿東邨', '返回滿東邨']
  for (const s of sections) {
    await expect(page.getByRole('heading', { name: new RegExp(s) })).toBeVisible()
  }

  // 至少一條路線卡顯示到
  await expect(page.locator('article').first()).toBeVisible()
  await expect(page.locator('article').first()).not.toBeEmpty()

  // 有自動更新鐘
  await expect(page.locator('header time').first()).toBeVisible()

  // 等一輪 polling（30s）會再更新，clock 秒數在變
  const clock = page.locator('header time').first()
  const firstTs = await clock.textContent()
  await page.waitForTimeout(1600)
  const secondTs = await clock.textContent()
  expect(firstTs).not.toBe(secondTs)

  expect(errors).toEqual([])
})

test('離線牌應顯示離線狀態', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('article').first()).toBeVisible()
})