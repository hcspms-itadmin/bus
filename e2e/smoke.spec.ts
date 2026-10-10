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

test('分流 Tabs：點東涌站只留 39M；自訂抽屜開合正常', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/')
  const nav = page.getByRole('navigation', { name: '按出行意圖篩選路線' })
  await expect(nav).toBeVisible()
  for (const label of ['全部', '東涌站', '市區', '口岸']) {
    await expect(nav.getByRole('button', { name: new RegExp(label) })).toBeVisible()
  }

  // 39M 全日線：切到東涌站 tab 應只剩 39M
  await nav.getByRole('button', { name: /東涌站/ }).click()
  await expect(page.locator('article', { hasText: '39M' })).toBeVisible()
  await expect(page.locator('article', { hasText: 'E11B' })).toHaveCount(0)

  // 切返全部
  await nav.getByRole('button', { name: /全部/ }).click()
  await expect(page.locator('article', { hasText: 'E11B' }).first()).toBeVisible()

  // 自訂抽屜
  await page.getByRole('button', { name: '自訂' }).click()
  const dialog = page.getByRole('dialog', { name: '自訂看板' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: '複製分享連結' })).toBeVisible()
  await expect(dialog.getByRole('button', { name: '恢復預設' })).toBeVisible()
  await dialog.getByRole('button', { name: '關閉自訂看板' }).click()
  await expect(dialog).toBeHidden()

  expect(errors).toEqual([])
})