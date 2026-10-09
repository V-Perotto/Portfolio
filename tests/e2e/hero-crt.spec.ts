import { expect, test, type Page } from '@playwright/test'
import { waitBootEnd } from './support/boot'
import { contrastRatio, luminanceOf, maxLuminance } from './support/contrast'
import { noWebGL } from './support/webgl'

// Feature 004, US5: fundo CRT com a chuva Matrix no hero (quickstart V12, V13, V17; FR-034 a FR-039).
const crt = (page: Page) => page.locator('#home .hero-crt canvas')

test('sem a grade de quadrados em nenhum modo (FR-034)', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('.hero-grid')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await expect(page.locator('.hero-grid')).toHaveCount(0)
})

test.describe('com movimento', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('depois do boot, o tubo CRT fica atrás do conteúdo do hero (V12, FR-035)', async ({ page }) => {
    await page.goto('./')
    await waitBootEnd(page)
    await expect(crt(page)).toHaveCount(1)
    await expect(page.locator('#home .hero-crt')).toHaveAttribute('aria-hidden', 'true')
    const [crtZ, contentZ] = await page.evaluate(() => [
      getComputedStyle(document.querySelector('#home .hero-crt')!).zIndex,
      getComputedStyle(document.querySelector('#home .hero-content')!).zIndex,
    ])
    expect(Number(contentZ)).toBeGreaterThan(Number(crtZ === 'auto' ? 0 : crtZ))
  })

  for (const vp of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`texto ≥ 4,5:1 e contorno dos botões tão visível quanto no fundo estático, em 10 quadros, ${vp.width}px (V13, FR-038, SC-005)`, async ({ page }) => {
      test.setTimeout(60_000)
      await page.setViewportSize(vp)
      await page.goto('./')
      await waitBootEnd(page)
      await expect(crt(page)).toHaveCount(1)
      await page.waitForTimeout(1200) // o tubo liga em 0,6 s
      const targets = await page.evaluate(() => {
        const pick = (sel: string) => {
          const el = document.querySelector<HTMLElement>(sel)!
          // o retângulo do texto visível, não o da caixa (os parágrafos ocupam a largura toda do
          // conteúdo), sem o texto só para leitor de tela (.sr-only, cortado por `clip`)
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
        return [pick('#home h1'), pick('#home .hero-terminal'), pick('#home .hero-sub'), pick('#home .hero-boot')]
      })
      const buttons = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('#home .btn')].map((el) => {
          const r = el.getBoundingClientRect()
          // o fundo dos dois lados do botão, fora do brilho dele (box-shadow de até 18px)
          return { box: { x: r.x - 48, y: r.y, width: 20, height: r.height }, border: getComputedStyle(el).borderTopColor }
        }),
      )
      // referência: o mesmo hero com o fundo estático (degradês), nas mesmas caixas
      const still = await page.context().newPage()
      await still.setViewportSize(vp)
      await still.emulateMedia({ reducedMotion: 'reduce' })
      await still.goto('./')
      await still.waitForTimeout(300)
      await still.addStyleTag({ content: '#home .hero-content, #home .hero-content * { visibility: hidden !important; }' })
      const staticLums = await maxLuminance(still, buttons.map((b) => b.box), 0.9)
      await still.close()

      await page.addStyleTag({ content: '#home .hero-content, #home .hero-content * { color: transparent !important; text-shadow: none !important; }' })
      await page.addStyleTag({ content: '#home .hero-content .cursor { visibility: hidden !important; }' })
      // as camadas do glitch do título são pseudo-elementos com cor própria (a penumbra, no próprio
      // .hero-content, fica)
      await page.addStyleTag({ content: '#home .hero-content *::before, #home .hero-content *::after { visibility: hidden !important; }' })
      for (let frame = 0; frame < 10; frame++) {
        // texto: o pixel mais claro atrás dele; contorno dos botões: o fundo típico ao lado (quantil 90,
        // o grão de ruído do tubo é parte do efeito pedido)
        const lums = [...(await maxLuminance(page, targets.map((t) => t.box))), ...(await maxLuminance(page, buttons.map((b) => b.box), 0.9))]
        targets.forEach((t, i) => {
          expect(contrastRatio(luminanceOf(t.color), lums[i]!), `${t.sel}, quadro ${frame}`).toBeGreaterThanOrEqual(4.5)
        })
        buttons.forEach((b, i) => {
          // o fundo CRT não pode deixar o contorno menos visível do que no fundo estático (5% de margem)
          const onStatic = contrastRatio(luminanceOf(b.border), staticLums[i]!)
          expect(contrastRatio(luminanceOf(b.border), lums[targets.length + i]!), `botão ${i}, quadro ${frame}`).toBeGreaterThanOrEqual(onStatic * 0.95)
        })
        await page.waitForTimeout(150)
      }
    })
  }

  test('o mouse deforma o tubo (V12, FR-035)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('./')
    await waitBootEnd(page)
    await expect(crt(page)).toHaveCount(1)
    await page.addStyleTag({ content: '#home .hero-content { visibility: hidden !important; }' })
    // compara o canto de cima à esquerda com o ponteiro no centro e no canto
    const corner = { x: 0, y: 0, width: 200, height: 200 }
    await page.mouse.move(720, 450)
    await page.waitForTimeout(1500)
    const center = await page.screenshot({ clip: corner })
    await page.mouse.move(1430, 10)
    await page.waitForTimeout(1500)
    const moved = await page.screenshot({ clip: corner })
    expect(Buffer.compare(center, moved)).not.toBe(0)
  })

  test('fora da tela, o tubo para de desenhar (FR-039)', async ({ page }) => {
    await page.goto('./')
    await waitBootEnd(page)
    await expect(page.locator('#home .crt-warp')).toHaveAttribute('data-running', 'true')
    await page.locator('#projetos').scrollIntoViewIfNeeded()
    await expect(page.locator('#home .crt-warp')).toHaveAttribute('data-running', 'false')
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expect(page.locator('#home .crt-warp')).toHaveAttribute('data-running', 'true')
  })

  test('"reduzir movimento" ligado no meio: o tubo sai sem erro (FR-039)', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await page.goto('./')
    await waitBootEnd(page)
    await expect(crt(page)).toHaveCount(1)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(page.locator('#home .hero-crt')).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test('sem WebGL: fundo estático, sem canvas e console limpo (V17, FR-039)', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await page.addInitScript(noWebGL)
    await page.goto('./')
    await waitBootEnd(page)
    await page.waitForTimeout(500)
    await expect(page.locator('#home canvas')).toHaveCount(0)
    expect(errors).toEqual([])
  })
})

test('com "reduzir movimento", sem canvas no hero (FR-039)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await page.waitForTimeout(500)
  await expect(page.locator('#home canvas')).toHaveCount(0)
})
