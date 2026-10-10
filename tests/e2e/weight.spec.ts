import { expect, test } from './support/test'
import { enterPortfolio } from './support/boot'

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

// Feature 004 (FR-050, SC-006) e 005 (SC-009): uma visita completa (porta de acesso, rolagem até o fim,
// terminal aberto) só pede arquivos do próprio site; as exceções são os badges do shields.io e a consulta
// do IP no ipify (Princípio III; nos testes, respondida dentro da página, support/test.ts).
test('nenhuma requisição a terceiros durante a visita', async ({ page }) => {
  const outside: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol === 'data:' || url.protocol === 'blob:') return
    if (url.host === 'localhost:4173' || url.host === 'img.shields.io' || url.host === 'api.ipify.org') return
    outside.push(request.url())
  })
  await page.goto('./')
  await enterPortfolio(page)
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

// HTML + CSS + JS iniciais comprimidos (gzip 9), sem os workers das cenas. Histórico: 005 = 91.642 B
// (commit 8f54bbb); a 006 subiu para 107.695 B (+16 KB, research R17 da 006); a 007 para 109.532 B
// (+1,8 KB: o `open`, o registro de janelas, minimizar o terminal da dock e o CSS do halo). Feature 008
// (SC-007, research R9): linha de base 109.532 B (commit 894c8be), teto +2 KB (estimado +0,6–0,9 KB: a
// janela de editor da Educação pré-renderizada, `educationFolder` e o alvo `educacao` do `open`).
test('HTML + CSS + JS iniciais ≤ linha de base + 2 KB, comprimidos', async () => {
  const { readFileSync } = await import('node:fs')
  const { gzipSync } = await import('node:zlib')
  const html = readFileSync('dist/index.html')
  const refs = [...new Set([...html.toString().matchAll(/(?:src|href)="\/Portfolio\/([^"]+\.(?:js|css))"/g)].map((m) => m[1]!))]
  const sizes = refs.filter((r) => !r.includes('worker')).map((r) => gzipSync(readFileSync(`dist/${r}`), { level: 9 }).length)
  const total = gzipSync(html, { level: 9 }).length + sizes.reduce((a, b) => a + b, 0)
  console.log(`HTML + CSS + JS iniciais: ${total} B gzip (+${total - 109532} B sobre a 007)`)
  expect(total).toBeLessThanOrEqual(109532 + 2 * 1024)
})
