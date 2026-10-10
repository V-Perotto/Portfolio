import { expect, test, type Page } from './support/test'
import { enterPortfolio } from './support/boot'
import { haloContrast } from './support/contrast'

// Feature 006, US5: o Lattice Loader na primeira linha do hero (quickstart V19; FR-036 a FR-044,
// SC-007; contracts/hero-and-gate.md §2).
const PURPLE_GLOW = 'rgb(160, 106, 224)'
const GREEN_BRIGHT = 'rgb(74, 222, 155)'
const WORKING = 'Inicializando portfolio.service'
const DONE = 'portfolio.service carregado com sucesso!'

interface Entry {
  phase: string
  t: number
}

/** Registra o instante em que a página é descoberta e cada troca de fase do loader. */
async function record(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __revealedAt: number | null; __loader: { phase: string; t: number }[] }
    w.__revealedAt = null
    w.__loader = []
    const watch = () => {
      const root = document.documentElement
      new MutationObserver(() => {
        if (w.__revealedAt === null && !root.classList.contains('booting')) w.__revealedAt = performance.now()
      }).observe(root, { attributes: true, attributeFilter: ['class'] })
      new MutationObserver(() => {
        const phase = document.querySelector('#home .hero-boot')?.getAttribute('data-loader')
        if (phase && w.__loader.at(-1)?.phase !== phase) w.__loader.push({ phase, t: performance.now() })
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-loader'], childList: true })
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch)
    else watch()
  })
}

const log = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __revealedAt: number; __loader: Entry[] }
    return { revealedAt: w.__revealedAt, entries: w.__loader }
  })

/** Instante da fase, depois de `from` (o HTML pré-renderizado já começa em "done"). */
const at = (entries: Entry[], phase: string, from = 'working') => {
  const start = entries.findIndex((e) => e.phase === from)
  return entries.slice(Math.max(0, start)).find((e) => e.phase === phase)?.t
}

const line = (page: Page) => page.locator('#home .hero-boot')

test.describe('com movimento', () => {
  test.use({ reducedMotion: 'no-preference' })

  for (const viewport of [
    { width: 1366, height: 800 },
    { width: 390, height: 844 },
  ]) {
    test(`trabalhando (roxo) → pronto (verde) entre 3 e 3,5 s → some 3 s depois, sem mover nada; ${viewport.width}px (V19, FR-036 a FR-039, SC-007)`, async ({ page }) => {
      test.setTimeout(45_000)
      await page.setViewportSize(viewport)
      await record(page)
      await page.goto('./')
      await enterPortfolio(page)
      const loader = page.locator('#home .lattice-loader')

      await expect(line(page)).toHaveAttribute('data-loader', 'working')
      await expect(loader.locator('.ll-text[data-active]')).toHaveText(WORKING)
      await expect(loader).toHaveCSS('color', PURPLE_GLOW)
      await expect(loader).toHaveAttribute('data-shape', 'square')
      await expect(loader).toHaveAttribute('data-glow', '')
      await expect(loader.locator('.ll-run .ll-cell')).toHaveCount(9)
      await expect(page.locator('#home [role="status"]')).toHaveCount(0)
      const rects = () =>
        page.evaluate(() =>
          ['#home h1', '#home .hero-terminal', '#home .hero-sub', '#home .hero-actions'].map((s) => {
            const r = document.querySelector(s)!.getBoundingClientRect()
            return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 10) / 10)
          }),
        )
      const before = await rects()
      const boxBefore = await line(page).boundingBox()

      await expect(line(page)).toHaveAttribute('data-loader', 'done', { timeout: 6000 })
      await expect(loader.locator('.ll-text[data-active]')).toHaveText(DONE)
      await expect(loader).toHaveCSS('color', GREEN_BRIGHT)
      expect((await line(page).boundingBox())!.height).toBeCloseTo(boxBefore!.height, 1)

      await expect(line(page)).toHaveAttribute('data-loader', 'hidden', { timeout: 6000 })
      await expect(line(page)).toHaveCSS('visibility', 'hidden', { timeout: 1000 })
      expect(await rects()).toEqual(before)

      const { revealedAt, entries } = await log(page)
      expect(entries.map((e) => e.phase)).toContain('working')
      // a volta a "trabalhando" acontece na montagem, antes de a página ser descoberta
      expect(at(entries, 'working')!).toBeLessThanOrEqual(revealedAt)
      const done = at(entries, 'done')! - revealedAt
      const hidden = at(entries, 'hidden')! - at(entries, 'done')!
      expect(done).toBeGreaterThanOrEqual(2950)
      expect(done).toBeLessThanOrEqual(3500)
      expect(hidden).toBeGreaterThanOrEqual(2950)
      expect(hidden).toBeLessThanOrEqual(3300)
    })
  }

  // Feature 007 (FR-021, research R7, R8): com a vinheta central original, o texto do loader reprovava
  // (2,9 e 1,9:1 trabalhando; 3,8:1 em "done" no celular) e ganhou o halo; é medido pela vizinhança dos
  // traços, 5 quadros por fase (cada fase dura ~3 s), em desktop e celular
  for (const viewport of [
    { width: 1366, height: 800 },
    { width: 390, height: 844 },
  ]) {
    for (const phase of ['working', 'done']) {
      test(`texto do loader com contraste ≥ 4,5:1, ${phase}, ${viewport.width}px (FR-037; 007 FR-021)`, async ({ page }) => {
        await page.setViewportSize(viewport)
        await page.goto('./')
        await enterPortfolio(page)
        await expect(line(page)).toHaveAttribute('data-loader', phase, { timeout: 6000 })
        await expect(page.locator('#home .hero-glitch canvas')).toHaveCount(1)
        // o rótulo da fase pelo próprio elemento (1º: trabalhando; 2º: done): a fase segue o relógio e pode
        // trocar no meio da medição (a de "trabalhando" dura 3 s, e a linha some 3 s depois do "done");
        // durante a medição, o rótulo medido fica fixo como na fase dele, e os outros saem
        const text = `#home .hero-boot .ll-label > .ll-text:nth-child(${phase === 'working' ? 1 : 2})`
        expect(await page.locator(text).evaluate((el) => el.hasAttribute('data-active'))).toBe(true)
        expect(await page.locator(text).evaluate((el) => getComputedStyle(el).textShadow)).not.toBe('none')
        const color = await page.locator('#home .lattice-loader').evaluate((el) => getComputedStyle(el).color)
        await page.addStyleTag({
          content:
            '#home .hero-boot { opacity: 1 !important; visibility: visible !important; transition: none !important; } ' +
            `${text} { position: static !important; opacity: 1 !important; filter: blur(0) !important; transition: none !important; } ` +
            `#home .hero-boot .ll-label > .ll-text:not(${text.split(' ').pop()}) { display: none !important; }`,
        })
        const ratio = await haloContrast(page, text, color, 5, '#home .hero-boot .ll-grid')
        expect(ratio, `${phase}, ${viewport.width}px`).toBeGreaterThanOrEqual(4.5)
      })
    }
  }

  test('fora da tela, a onda pausa e o tempo continua (FR-044)', async ({ page }) => {
    await record(page)
    await page.goto('./')
    await enterPortfolio(page)
    await expect(line(page)).toHaveAttribute('data-loader', 'working')
    await page.evaluate(() => document.getElementById('contato')!.scrollIntoView({ behavior: 'instant' }))
    await expect(page.locator('#home .lattice-loader')).toHaveAttribute('data-paused', '')
    await page.waitForTimeout(1500)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expect(page.locator('#home .lattice-loader')).not.toHaveAttribute('data-paused', /.*/)
    await expect(line(page)).toHaveAttribute('data-loader', 'done', { timeout: 6000 })
    const { revealedAt, entries } = await log(page)
    expect(at(entries, 'done')! - revealedAt).toBeLessThanOrEqual(3500)
  })
})

test('"reduzir movimento": pronto desde o início, some em 3 s sem transição (FR-041)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await record(page)
  await page.goto('./')
  await enterPortfolio(page)
  await expect(line(page)).toHaveAttribute('data-loader', 'done')
  await expect(page.locator('#home .ll-text[data-active]')).toHaveText(DONE)
  await expect(line(page)).toHaveAttribute('data-loader', 'hidden', { timeout: 5000 })
  await expect(line(page)).toHaveCSS('visibility', 'hidden')
  // sem transição (o "reduzir movimento" do site zera as durações: 0s ou 0,01 ms)
  expect(Number.parseFloat(await line(page).evaluate((el) => getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(0.001)
  const { revealedAt, entries } = await log(page)
  expect(entries.map((e) => e.phase)).not.toContain('working')
  const hidden = at(entries, 'hidden', 'done')! - revealedAt
  expect(hidden).toBeGreaterThanOrEqual(2950)
  expect(hidden).toBeLessThanOrEqual(3400)
})

test('sem JavaScript: estado final estático, que não some (FR-042)', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('./')
  await expect(line(page)).toHaveAttribute('data-loader', 'done')
  await expect(page.locator('#home .ll-text[data-active]')).toHaveText(DONE)
  await expect(page.locator('#home .lattice-loader')).toHaveAttribute('data-status', 'done')
  await expect(line(page)).toBeVisible()
  await page.waitForTimeout(3500)
  await expect(line(page)).toBeVisible()
  await context.close()
})
