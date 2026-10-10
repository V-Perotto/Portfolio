import { expect, mockIpService, test, type Page } from './support/test'
import { enterPortfolio } from './support/boot'
import { contrastRatio, haloContrast, luminanceOf, maxLuminance, textBox, type Box } from './support/contrast'

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
      // o `ping vittorio` fica com o fundo dele (opaco sobre o glitch, feature 007): o rótulo é medido contra ele
      '#home .btn-primary, #home .hero-boot .ll-grid { background: transparent !important; border-color: transparent !important; box-shadow: none !important; } ' +
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
  test(`texto do hero com contraste ≥ 4,5:1 sobre o Letter Glitch, em 10 quadros, ${vp.width}px (V17, FR-032, SC-006; 007 V14, FR-021)`, async ({ page }) => {
    test.setTimeout(90_000)
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
      return [pick('#home h1'), pick('#home .hero-terminal'), pick('#home .btn-primary'), pick('#home .btn-ghost'), pick('#home .hero-scroll')]
    })
    // feature 007 (FR-021, research R7, R8): a tagline tem halo e é medida pela vizinhança dos traços; só
    // ela (e o texto do loader, em hero-loader.spec.ts) tem halo
    const shadows = await page.evaluate(() =>
      Object.fromEntries(
        ['h1', '.hero-terminal', '.hero-sub', '.btn-primary', '.btn-ghost', '.hero-scroll'].map((sel) => [
          sel,
          getComputedStyle(document.querySelector(`#home ${sel}`)!).textShadow,
        ]),
      ),
    )
    expect(shadows['.hero-sub']).not.toBe('none')
    for (const sel of ['.hero-terminal', '.btn-primary', '.btn-ghost', '.hero-scroll']) expect(shadows[sel], sel).toBe('none')
    // o nome com glitch mantém o brilho roxo dele (006), sem o contorno do halo
    expect(shadows['h1']).not.toContain('0px 0px 0px')
    const subColor = await page.locator('#home .hero-sub').evaluate((el) => getComputedStyle(el).color)
    expect(await haloContrast(page, '#home .hero-sub', subColor, 10), '.hero-sub (halo)').toBeGreaterThanOrEqual(4.5)
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

// Feature 007, US3 (quickstart V13–V15; FR-018 a FR-021, SC-005): a vinheta central original do Letter
// Glitch, o halo da tagline (e do loader) e o fundo opaco do `ping vittorio`, só com o fundo animado.
test('vinheta central original: 80% no centro, nada a partir de 60% do raio (V13, FR-018, SC-005)', async ({ page }) => {
  await enterHero(page)
  // só a camada da vinheta central sobre branco: o canvas e a vinheta das bordas escondidos
  await page.addStyleTag({
    content:
      '#home .letter-glitch canvas, #home .letter-glitch-outer { visibility: hidden !important; } ' +
      '#home .letter-glitch { background: #fff !important; } ' +
      '#home .hero-content, #home .hero-scroll, .scanlines, .app-dock-root { visibility: hidden !important; }',
  })
  const rect = (await page.locator('#home .letter-glitch-center').boundingBox())!
  const cx = rect.x + rect.width / 2
  const cy = rect.y + rect.height / 2
  const radius = Math.hypot(rect.width / 2, rect.height / 2) // circle, farthest-corner
  const at = async (share: number) => {
    // na diagonal (dentro da tela em qualquer formato)
    const angle = Math.atan2(rect.height / 2, rect.width / 2)
    const x = cx + Math.cos(angle) * radius * share
    const y = cy + Math.sin(angle) * radius * share
    const [l] = await maxLuminance(page, [{ x: Math.round(x) - 1, y: Math.round(y) - 1, width: 3, height: 3 }])
    return l!
  }
  // luminância de 20% de branco (sRGB 51) = 0,0331; ± 2 p.p. de escurecimento (sRGB 46–56)
  const center = await at(0)
  expect(center).toBeGreaterThanOrEqual(0.0273)
  expect(center).toBeLessThanOrEqual(0.0395)
  expect(await at(0.6)).toBeGreaterThan(0.97)
  expect(await at(0.8)).toBeGreaterThan(0.97)
  // a 30% do raio, metade do escurecimento (40% de preto → sRGB 153)
  const mid = await at(0.3)
  expect(mid).toBeGreaterThan(0.25)
  expect(mid).toBeLessThan(0.4)
})

test('com o canvas, há letras acesas a menos de 60% do raio (V13, SC-005)', async ({ page }) => {
  await enterHero(page)
  await hideText(page)
  const { width, height } = page.viewportSize()!
  const s = 60
  const center = await meanLuminance(page, { x: width / 2 - s / 2, y: height / 2 - s / 2, width: s, height: s })
  // ~45% do raio, na diagonal (o raio é a meia-diagonal da tela)
  const ring = await meanLuminance(page, { x: width / 2 - width * 0.225 - s / 2, y: height / 2 - height * 0.225 - s / 2, width: s, height: s })
  expect(ring).toBeGreaterThan(center)
  expect(ring).toBeGreaterThan(0.004)
})

test('o halo vai no máximo ~10 px além dos traços: a 12 px da tagline, o fundo é o mesmo com e sem halo (SC-005)', async ({ page }) => {
  await enterHero(page)
  // o canvas parado (aba oculta simulada), para comparar as duas capturas
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.waitForTimeout(300)
  await page.addStyleTag({ content: '#home .hero-terminal { min-height: 3.6em !important; } .app-dock-root { display: none !important; }' })
  const box = await textBox(page, '#home .hero-sub')
  // faixas de 12 a 20 px acima, abaixo, à esquerda e à direita da caixa do texto
  const bands: Box[] = [
    { x: box.x, y: box.y - 20, width: box.width, height: 8 },
    { x: box.x, y: box.y + box.height + 12, width: box.width, height: 8 },
    { x: box.x - 20, y: box.y, width: 8, height: box.height },
    { x: box.x + box.width + 12, y: box.y, width: 8, height: box.height },
  ]
  const withHalo = await Promise.all(bands.map((b) => meanLuminance(page, b)))
  const off = await page.addStyleTag({ content: '#home .hero-sub, #home .hero-sub * { text-shadow: none !important; }' })
  const without = await Promise.all(bands.map((b) => meanLuminance(page, b)))
  await off.evaluate((n) => (n as Element).remove())
  withHalo.forEach((l, i) => expect(Math.abs(l - without[i]!), `faixa ${i}`).toBeLessThanOrEqual(0.002))
})

test('sem fundo animado, sem halo e com o fundo de antes no ping vittorio (V15, FR-021)', async ({ browser }) => {
  for (const mode of ['reduce', 'nojs', 'print'] as const) {
    const context = await browser.newContext({
      viewport: { width: 1366, height: 800 },
      reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference',
      javaScriptEnabled: mode !== 'nojs',
    })
    await mockIpService(context)
    const page = await context.newPage()
    await page.goto('http://localhost:4173/Portfolio/')
    if (mode !== 'nojs') await enterPortfolio(page)
    if (mode === 'print') {
      await expect(glitch(page)).toHaveCount(1)
      await page.emulateMedia({ media: 'print' })
    }
    const state = await page.evaluate(() => ({
      glitch: document.getElementById('home')!.hasAttribute('data-glitch'),
      shadow: getComputedStyle(document.querySelector('#home .hero-sub')!).textShadow,
      ghost: getComputedStyle(document.querySelector('#home .btn-ghost')!).backgroundColor,
    }))
    if (mode === 'print') {
      // impressão: o atributo continua, mas o token do halo é `none` e o tema claro vale
      expect(state.shadow, mode).toBe('none')
    } else {
      expect(state.glitch, mode).toBe(false)
      expect(state.shadow, mode).toBe('none')
      // o verde translúcido de hoje (12% de --green sobre transparente)
      expect(state.ghost, mode).toMatch(/^(rgba|color)\(.*(0\.12|12%)/)
    }
    await context.close()
  }
})

test('com o fundo animado, o ping vittorio tem fundo opaco (FR-021)', async ({ page }) => {
  await enterHero(page)
  const bg = await page.locator('#home .btn-ghost').evaluate((el) => getComputedStyle(el).backgroundColor)
  // opaco: sem canal alfa (ou alfa 1)
  expect(bg).not.toMatch(/rgba\(.*,\s*0?\.\d+\)|\/\s*0?\.\d+/)
})
