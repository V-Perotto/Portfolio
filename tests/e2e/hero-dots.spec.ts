import { expect, test, type Page } from './support/test'
import { enterPortfolio } from './support/boot'
import { contrastRatio, luminanceOf, maxLuminance } from './support/contrast'

// Feature 005, US3: o Dot Field do Vue Bits no fundo do hero, no lugar do CRT e da chuva Matrix
// (quickstart V15 a V17; FR-028 a FR-033). Canvas 2D: roda no projeto sem WebGL.
test.use({ reducedMotion: 'no-preference' })

const dots = (page: Page) => page.locator('#home .hero-dots canvas')

async function enterHero(page: Page, viewport = { width: 1366, height: 800 }) {
  await page.setViewportSize(viewport)
  await page.goto('./')
  await enterPortfolio(page)
  await expect(dots(page)).toHaveCount(1)
  await page.waitForTimeout(900) // os pontos acendem em 0,6 s
}

/** Cor média dos pixels mais acesos (os pontos) de um quadrante do canvas. */
const quadrantColor = (page: Page, qx: 0 | 1, qy: 0 | 1) =>
  page.locator('#home .hero-dots canvas').evaluate(
    (canvas: HTMLCanvasElement, [qx, qy]) => {
      const ctx = canvas.getContext('2d')!
      const w = Math.floor(canvas.width / 4)
      const h = Math.floor(canvas.height / 4)
      const x = qx === 0 ? 0 : canvas.width - w
      const y = qy === 0 ? 0 : canvas.height - h
      const data = ctx.getImageData(x, y, w, h).data
      let r = 0, g = 0, b = 0, n = 0
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3]! < 40) continue
        r += data[i]!
        g += data[i + 1]!
        b += data[i + 2]!
        n++
      }
      return { r: r / n, g: g / n, b: b / n, n }
    },
    [qx, qy] as const,
  )

test('Dot Field no hero, sem CRT nem chuva Matrix (V15, FR-028, FR-029)', async ({ page }) => {
  await enterHero(page)
  await expect(page.locator('.hero-crt, .crt-warp, .matrix')).toHaveCount(0)
  await expect(page.locator('#home .hero-dots .dot-field')).toHaveAttribute('aria-hidden', 'true')
  const scripts = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => /crt|matrix/i.test(n)))
  expect(scripts).toEqual([])
})

test('degradê do roxo (em cima, à esquerda) ao verde (embaixo, à direita) (V15, FR-030)', async ({ page }) => {
  await enterHero(page)
  const topLeft = await quadrantColor(page, 0, 0)
  const bottomRight = await quadrantColor(page, 1, 1)
  expect(topLeft.n).toBeGreaterThan(50)
  expect(bottomRight.n).toBeGreaterThan(50)
  // roxo: vermelho e azul acima do verde; verde: verde acima do vermelho
  expect(topLeft.b).toBeGreaterThan(topLeft.g)
  expect(topLeft.r).toBeGreaterThan(topLeft.g)
  expect(bottomRight.g).toBeGreaterThan(bottomRight.r)
})

test('o halo segue o mouse em movimento e some parado; os pontos não saem do lugar (V15, FR-031)', async ({ page }) => {
  await enterHero(page)
  const glow = page.locator('#home .dot-field-glow circle')
  const before = await quadrantColor(page, 0, 0)
  for (let i = 0; i < 20; i++) {
    await page.mouse.move(300 + i * 30, 300 + (i % 2) * 20)
    await page.waitForTimeout(20)
  }
  await expect.poll(async () => Number(await glow.evaluate((c) => (c as SVGElement).style.opacity)), { timeout: 2000 }).toBeGreaterThan(0.05)
  expect(Number(await glow.getAttribute('r'))).toBe(80)
  // o halo decai por quadro, como no original: no headless sob carga, os quadros são mais lentos
  await expect.poll(async () => Number(await glow.evaluate((c) => (c as SVGElement).style.opacity)), { timeout: 10_000 }).toBeLessThan(0.05)
  // Cursor Force 0: os pontos ficam onde estavam (mesma quantidade de pixels acesos no quadrante)
  const after = await quadrantColor(page, 0, 0)
  expect(Math.abs(after.n - before.n) / before.n).toBeLessThan(0.1)
})

for (const vp of [
  { width: 1366, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`texto do hero com contraste ≥ 4,5:1 sobre o Dot Field, em 10 quadros, ${vp.width}px (V16, FR-032, SC-008)`, async ({ page }) => {
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
      return [pick('#home h1'), pick('#home .hero-terminal'), pick('#home .hero-sub'), pick('#home .hero-boot'), pick('#home .btn-ghost')]
    })
    // sem transição: o `.btn` anima a cor em 0,25 s, e o primeiro quadro mediria o próprio texto
    await page.addStyleTag({ content: '#home .hero-content, #home .hero-content * { color: transparent !important; text-shadow: none !important; transition: none !important; }' })
    await page.addStyleTag({ content: '#home .hero-content .cursor, #home .hero-content *::before, #home .hero-content *::after { visibility: hidden !important; }' })
    for (let frame = 0; frame < 10; frame++) {
      const lums = await maxLuminance(page, targets.map((t) => t.box))
      targets.forEach((t, i) => {
        expect(contrastRatio(luminanceOf(t.color), lums[i]!), `${t.sel}, quadro ${frame}`).toBeGreaterThanOrEqual(4.5)
      })
      await page.waitForTimeout(150)
    }
  })
}

test('fora da tela, o canvas não é redesenhado; ouvintes saem quando o fundo sai (V17, FR-033)', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  await page.addInitScript(() => {
    const w = window as unknown as { __fills: number; __dotListeners: Map<unknown, string> }
    w.__fills = 0
    // só os ouvintes que o pedaço do HeroDots (onde está o DotField) põe na window
    w.__dotListeners = new Map()
    const fill = CanvasRenderingContext2D.prototype.fill
    CanvasRenderingContext2D.prototype.fill = function (this: CanvasRenderingContext2D, ...args: never[]) {
      w.__fills++
      return (fill as (...a: unknown[]) => void).apply(this, args)
    }
    const add = window.addEventListener.bind(window)
    const remove = window.removeEventListener.bind(window)
    window.addEventListener = ((type: string, fn: unknown, ...rest: unknown[]) => {
      if ((type === 'mousemove' || type === 'resize') && /HeroDots/.test(new Error().stack ?? '')) w.__dotListeners.set(fn, type)
      return (add as (...a: unknown[]) => void)(type, fn, ...rest)
    }) as typeof window.addEventListener
    window.removeEventListener = ((type: string, fn: unknown, ...rest: unknown[]) => {
      if (w.__dotListeners.get(fn) === type) w.__dotListeners.delete(fn)
      return (remove as (...a: unknown[]) => void)(type, fn, ...rest)
    }) as typeof window.removeEventListener
  })
  await enterHero(page)
  const counts = () => page.evaluate(() => (window as unknown as { __fills: number }).__fills)
  const listeners = () =>
    page.evaluate(() => [...(window as unknown as { __dotListeners: Map<unknown, string> }).__dotListeners.values()].sort())

  // na tela, redesenha (o Sparkle troca a cada 8 quadros; no headless sob carga, os quadros são lentos)
  const a = await counts()
  await expect.poll(async () => (await counts()) - a, { timeout: 5000 }).toBeGreaterThan(0)

  // fora da tela, para
  await page.evaluate(() => document.getElementById('projetos')!.scrollIntoView({ behavior: 'instant' }))
  await page.waitForTimeout(300)
  const b = await counts()
  await page.waitForTimeout(1000)
  expect((await counts()) - b).toBe(0)

  // "reduzir movimento" ligado no meio: o fundo sai, e os ouvintes da window com ele
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  expect(await listeners()).toEqual(['mousemove', 'resize'])
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#home .hero-dots')).toHaveCount(0)
  expect(await listeners()).toEqual([])
  expect(errors).toEqual([])
})

test('com "reduzir movimento", o hero fica com os degradês estáticos (FR-033)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await enterPortfolio(page)
  await page.waitForTimeout(500)
  await expect(page.locator('#home canvas')).toHaveCount(0)
})
