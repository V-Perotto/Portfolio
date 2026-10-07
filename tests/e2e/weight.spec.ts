import { expect, test } from '@playwright/test'

// SC-012 / research R12: carregamento inicial, sem rolar, ≤ 500 KB (badges externos excluídos).
test('peso do carregamento inicial', async ({ page }) => {
  await page.goto('./', { waitUntil: 'load' })
  await page.waitForLoadState('networkidle')
  const { total, byType } = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const resources = (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).filter(
      (r) => !r.name.includes('img.shields.io'),
    )
    const byType: Record<string, number> = {}
    for (const r of resources) byType[r.initiatorType] = (byType[r.initiatorType] ?? 0) + r.transferSize
    const total = nav.transferSize + resources.reduce((sum, r) => sum + r.transferSize, 0)
    return { total, byType }
  })
  console.log(`peso inicial: ${(total / 1024).toFixed(1)} KB`, byType)
  expect(total).toBeLessThanOrEqual(500 * 1024)
})
