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

// Feature 004 (FR-050, SC-006): uma visita completa (boot, rolagem até o fim, terminal aberto) só pede
// arquivos do próprio site; a exceção são os badges do shields.io (Princípio III).
test('nenhuma requisição a terceiros durante a visita', async ({ page }) => {
  const outside: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol === 'data:' || url.protocol === 'blob:') return
    if (url.host === 'localhost:4173' || url.host === 'img.shields.io') return
    outside.push(request.url())
  })
  await page.goto('./')
  await page.waitForFunction(() => !document.querySelector('.boot-screen') && !document.documentElement.classList.contains('booting'), null, {
    timeout: 9000,
  })
  for (let y = 0; y < 30; y++) {
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(80)
  }
  await page.locator('.app-dock .dock-btn').click()
  await page.locator('#dock-terminal-input').fill('find sobre')
  await page.locator('#dock-terminal-input').press('Enter')
  await page.waitForLoadState('networkidle')
  expect(outside).toEqual([])
})
