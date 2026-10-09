import { expect, test, type Page } from './support/test'
import { enterPortfolio } from './support/boot'
import { contrastRatio, luminanceOf, maxLuminance, type Box } from './support/contrast'

// Feature 006, US4: o Letter Glitch do Vue Bits no fundo do hero, no lugar do Dot Field (quickstart
// V16 a V18; FR-029 a FR-034). Canvas 2D (num worker quando dá): roda no projeto sem WebGL. O canvas
// pode estar transferido ao worker, então os pixels são lidos de capturas de tela.
test.use({ reducedMotion: 'no-preference' })

const glitch = (page: Page) => page.locator('#home .hero-glitch')

async function enterHero(page: Page, viewport = { width: 1366, height: 800 }) {
  await page.setViewportSize(viewport)
  await page.goto('./')
  await enterPortfolio(page)
  await expect(glitch(page).locator('canvas')).toHaveCount(1)
  await page.waitForTimeout(900) // as letras acendem em 0,6 s
}

/** Luminância média de uma região da tela (captura). */
async function meanLuminance(page: Page, box: Box): Promise<number> {
  const png = (await page.screenshot({ clip: box })).toString('base64')
  return page.evaluate(async (data) => {
    const img = new Image()
    img.src = `data:image/png;base64,${data}`
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(img, 0, 0)
    const px = ctx.getImageData(0, 0, img.width, img.height).data
    const f = (v: number) => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
    let sum = 0
    for (let i = 0; i < px.length; i += 4) sum += 0.2126 * f(px[i]!) + 0.7152 * f(px[i + 1]!) + 0.0722 * f(px[i + 2]!)
    return sum / (px.length / 4)
  }, png)
}

/** Esconde o texto do hero (para medir só o fundo). */
const hideText = (page: Page) =>
  page.addStyleTag({
    content:
      '#home .hero-content, #home .hero-content *, #home .hero-scroll { color: transparent !important; text-shadow: none !important; transition: none !important; } ' +
      '#home .hero-content .cursor, #home .hero-content *::before, #home .hero-content *::after { visibility: hidden !important; } ' +
      '#home .btn, #home .hero-boot .ll-grid { background: transparent !important; border-color: transparent !important; box-shadow: none !important; } ' +
      '.app-dock-root { display: none !important; }',
  })

test('Letter Glitch no hero, sem Dot Field; as letras trocam (V16, FR-029, FR-030)', async ({ page }) => {
  await enterHero(page)
  await expect(page.locator('.hero-dots, .dot-field')).toHaveCount(0)
  await expect(glitch(page).locator('.letter-glitch')).toHaveAttribute('aria-hidden', 'true')
  await expect(glitch(page).locator('.letter-glitch-outer')).toHaveCount(1)
  await expect(glitch(page).locator('.letter-glitch-center')).toHaveCount(1)
  // a penumbra antiga sob o texto saiu (FR-032)
  const scrim = await page.locator('#home .hero-content').evaluate((el) => getComputedStyle(el, '::before').content)
  expect(scrim === 'none' || scrim === 'normal').toBe(true)
  const region = { x: 40, y: 40, width: 300, height: 200 }
  const a = (await page.screenshot({ clip: region })).toString('base64')
  await page.waitForTimeout(250)
  const b = (await page.screenshot({ clip: region })).toString('base64')
  expect(a).not.toBe(b)
})

test('vinhetas: cantos e centro mais escuros que o anel entre eles (V16, FR-030)', async ({ page }) => {
  await enterHero(page)
  await hideText(page)
  const { width, height } = page.viewportSize()!
  const s = 80
  const corner = await meanLuminance(page, { x: 0, y: 0, width: s, height: s })
  const center = await meanLuminance(page, { x: width / 2 - s / 2, y: height / 2 - s / 2, width: s, height: s })
  // o anel: meio caminho entre o centro e o canto, na diagonal
  const ring = await meanLuminance(page, { x: width * 0.22 - s / 2, y: height * 0.22 - s / 2, width: s, height: s })
  expect(corner).toBeLessThan(ring)
  expect(center).toBeLessThan(ring)
})

for (const vp of [
  { width: 1366, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`texto do hero com contraste ≥ 4,5:1 sobre o Letter Glitch, em 10 quadros, ${vp.width}px (V17, FR-032, SC-006)`, async ({ page }) => {
    test.setTimeout(60_000)
    await enterHero(page, vp)
    const targets = await page.evaluate(() => {
      const pick = (sel: string) => {
        const el = document.querySelector<HTMLElement>(sel)!
        const rects: DOMRect[] = []
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) {
          const node = walker.currentNode
          if (!node.textContent?.trim() || node.parentElement?.closest('.sr-only')) continue
          const range = document.createRange()
          range.selectNodeContents(node)
          rects.push(...[...range.getClientRects()].filter((c) => c.width > 0 && c.height > 0))
        }
        const left = Math.min(...rects.map((c) => c.left))
        const top = Math.min(...rects.map((c) => c.top))
        const r = new DOMRect(left, top, Math.max(...rects.map((c) => c.right)) - left, Math.max(...rects.map((c) => c.bottom)) - top)
        return { sel, box: { x: r.x, y: r.y, width: r.width, height: r.height }, color: getComputedStyle(el).color }
      }
      return [
        pick('#home h1'),
        pick('#home .hero-terminal'),
        pick('#home .hero-sub'),
        pick('#home .btn-primary'),
        pick('#home .btn-ghost'),
        pick('#home .hero-scroll'),
      ]
    })
    await hideText(page)
    for (let frame = 0; frame < 10; frame++) {
      const lums = await maxLuminance(page, targets.map((t) => t.box))
      targets.forEach((t, i) => {
        expect(contrastRatio(luminanceOf(t.color), lums[i]!), `${t.sel}, quadro ${frame}`).toBeGreaterThanOrEqual(4.5)
      })
      await page.waitForTimeout(150)
    }
  })
}

test('fora da tela e com a aba oculta, para; movimento reduzido ao vivo remove o fundo (V18, FR-033, FR-034)', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await enterHero(page)
  const root = glitch(page).locator('.letter-glitch')
  await expect(root).not.toHaveAttribute('data-paused', /.*/)

  await page.locator('#contato').scrollIntoViewIfNeeded()
  await expect(root).toHaveAttribute('data-paused', 'true')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(root).not.toHaveAttribute('data-paused', /.*/)

  // aba oculta (simulada)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.waitForTimeout(200)
  const region = { x: 40, y: 40, width: 300, height: 200 }
  const a = (await page.screenshot({ clip: region })).toString('base64')
  await page.waitForTimeout(300)
  const b = (await page.screenshot({ clip: region })).toString('base64')
  expect(a).toBe(b)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })

  // redimensionar não quebra nada
  await page.setViewportSize({ width: 900, height: 700 })
  await page.waitForTimeout(300)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(glitch(page)).toHaveCount(0)
  await expect(page.locator('.letter-glitch-canvas')).toHaveCount(0)
  expect(errors).toEqual([])
})
