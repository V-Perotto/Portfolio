import { expect, test, type Page } from '@playwright/test'
import { contrastRatio, luminanceOf, maxLuminance } from './support/contrast'
import { noWebGL } from './support/webgl'

// Feature 004, US1: boot inteiro, sem pulo, sobre o Faulty Terminal, com teto de 7 s
// (quickstart V1–V4, V17; FR-028 a FR-033; constituição v2.3.0).
test.use({ reducedMotion: 'no-preference' })

const DEADLINE = 7000
const LATEST_START = 2055
const COMMAND = 'viper@portfolio:~$ ./iniciar_portfolio.sh'
const RUNS = Number(process.env.BOOT_RUNS ?? 3)

/** Instante (desde o início da navegação) em que a página fica descoberta: sem capa e sem boot. */
const uncoveredAt = (page: Page) =>
  page
    .waitForFunction(
      () => !document.documentElement.classList.contains('booting') && !document.querySelector('.boot-screen') && performance.now(),
      null,
      { polling: 20, timeout: 9000 },
    )
    .then((handle) => handle.jsonValue() as Promise<number>)

/** Texto da última linha no instante em que o fade começa (ou `null` se não houve boot). */
const lastLineAtFade = (page: Page) =>
  page
    .waitForFunction(
      () => {
        if (!document.documentElement.classList.contains('booting') && !document.querySelector('.boot-screen')) return { boot: false }
        const screen = document.querySelector('.boot-screen.boot-hidden')
        if (!screen) return null
        const lines = [...screen.querySelectorAll('.boot-line')].map((p) => p.textContent?.replace('▊', '').trim())
        return { boot: true, last: lines.at(-1) ?? '', count: lines.length }
      },
      null,
      { polling: 10, timeout: 9000 },
    )
    .then((handle) => handle.jsonValue() as Promise<{ boot: boolean; last?: string; count?: number }>)


for (const vp of [
  { name: 'desktop', width: 1440, height: 900, cpu: 1 },
  { name: 'celular com CPU 4× mais lenta', width: 390, height: 844, cpu: 4 },
]) {
  test(`sessão inteira e página descoberta em até 7 s, ${vp.name} (V1, FR-030, FR-032, SC-001)`, async ({ page }) => {
    test.setTimeout(30_000 + RUNS * 12_000)
    await page.setViewportSize({ width: vp.width, height: vp.height })
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: vp.cpu })
    let withBoot = 0
    let worst = 0
    for (let i = 0; i < RUNS; i++) {
      await page.goto('./')
      const fade = await lastLineAtFade(page)
      const uncovered = await uncoveredAt(page)
      worst = Math.max(worst, uncovered)
      expect(uncovered, `recarga ${i + 1}`).toBeLessThanOrEqual(DEADLINE)
      if (fade.boot) {
        withBoot++
        expect(fade.count, `recarga ${i + 1}`).toBe(6)
        expect(fade.last, `recarga ${i + 1}`).toBe(COMMAND)
      }
    }
    console.log(`${vp.name}: ${withBoot}/${RUNS} recargas com boot; descoberta mais tardia em ${Math.round(worst)} ms`)
  })
}

test('nem clique, nem toque, nem tecla encerram o boot; sem dica de pulo (V2, FR-031)', async ({ page }) => {
  await page.goto('./')
  const screen = page.locator('.boot-screen')
  await expect(screen).toBeVisible()
  await expect(page.locator('.boot-skip')).toHaveCount(0)
  await expect(screen).not.toContainText('pular')
  await page.mouse.click(400, 300)
  for (const key of ['Escape', 'Enter', ' ', 'x']) await page.keyboard.press(key)
  await page.waitForTimeout(300)
  await expect(screen).toBeVisible()
  await expect(screen).not.toHaveClass(/boot-hidden/)
  // e termina inteiro, sozinho
  const fade = await lastLineAtFade(page)
  expect(fade.last).toBe(COMMAND)
})

test('o toque também não encerra o boot (V2, FR-031)', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  await page.goto('http://localhost:4173/Portfolio/')
  await expect(page.locator('.boot-screen')).toBeVisible()
  await page.touchscreen.tap(195, 400)
  await page.waitForTimeout(300)
  await expect(page.locator('.boot-screen')).not.toHaveClass(/boot-hidden/)
  await context.close()
})

test('bundle atrasado 2,5 s: sem boot e página descoberta antes do teto (V3, FR-032)', async ({ page }) => {
  await page.route('**/assets/*.js', async (route) => {
    await new Promise((r) => setTimeout(r, 2500))
    await route.continue()
  })
  await page.goto('./', { waitUntil: 'commit' })
  expect(await uncoveredAt(page)).toBeLessThan(DEADLINE)
  await page.waitForFunction(() => document.documentElement.classList.contains('app-loaded'), null, { timeout: 9000 })
  await page.waitForTimeout(300)
  await expect(page.locator('.boot-screen')).toHaveCount(0)
})

test('bundle bloqueado: a capa sai assim que o boot já não cabe (~2,1 s) (V3, FR-032)', async ({ page }) => {
  await page.route('**/assets/*.js', (route) => route.abort())
  await page.goto('./', { waitUntil: 'commit' })
  const at = await page
    .waitForFunction(() => !document.documentElement.classList.contains('booting') && performance.now(), null, { polling: 10, timeout: 5000 })
    .then((h) => h.jsonValue() as Promise<number>)
  expect(at).toBeGreaterThanOrEqual(LATEST_START)
  expect(at).toBeLessThan(LATEST_START + 300)
})

test('com WebGL: o Faulty Terminal fica atrás do painel (V4, FR-028)', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('.boot-screen .boot-bg canvas')).toHaveCount(1)
  await expect(page.locator('.boot-screen .boot-bg')).toHaveAttribute('aria-hidden', 'true')
})

test('sem WebGL: boot de fundo liso e console sem erro (V17, FR-033)', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.addInitScript(noWebGL)
  await page.goto('./')
  await expect(page.locator('.boot-screen')).toBeVisible()
  await expect(page.locator('.boot-screen canvas')).toHaveCount(0)
  const fade = await lastLineAtFade(page)
  expect(fade.last).toBe(COMMAND)
  expect(errors).toEqual([])
})

test('texto do boot com contraste ≥ 4,5:1 sobre o painel, em qualquer quadro (V4, FR-029)', async ({ page }) => {
  await page.goto('./')
  const body = page.locator('.boot-screen .boot-body')
  await expect(body).toBeVisible()
  const dim = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--text-dim').trim())
  await page.addStyleTag({ content: '.boot-body, .boot-body * { color: transparent !important; }' })
  let samples = 0
  for (let i = 0; i < 5; i++) {
    if (await page.locator('.boot-screen.boot-hidden').count()) break
    // a área de cada linha de texto, de ponta a ponta do painel (os cantos arredondados ficam de fora)
    const panel = await body.boundingBox({ timeout: 500 }).catch(() => null)
    if (!panel) break
    const lines = await page.locator('.boot-screen .boot-line').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect()
        return { y: r.y, height: r.height }
      }),
    )
    const boxes = lines.map((l) => ({ x: panel.x + 12, y: l.y, width: panel.width - 24, height: l.height }))
    const maxes = await maxLuminance(page, boxes)
    // amostra tirada durante o fade de saída não conta: o hero já aparece por trás do painel
    if (await page.locator('.boot-screen.boot-hidden').count()) break
    for (const max of maxes) expect(contrastRatio(luminanceOf(dim), max)).toBeGreaterThanOrEqual(4.5)
    samples++
  }
  expect(samples).toBeGreaterThan(0)
})
