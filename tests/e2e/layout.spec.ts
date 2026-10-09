import { expect, test } from './support/test'
import { enterPortfolio } from './support/boot'

// FR-025, FR-026, SC-008, SC-009 (quickstart V8); FR-014 em telas de toque.
const widths = [320, 360, 768, 1280, 1920]

test.describe('layout', () => {
  for (const width of widths) {
    test(`sem rolagem horizontal e console limpo em ${width}px`, async ({ page }) => {
      const messages: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') messages.push(`${msg.type()}: ${msg.text()}`)
      })
      page.on('pageerror', (err) => messages.push(`pageerror: ${err.message}`))

      await page.setViewportSize({ width, height: 900 })
      // os badges do shields.io (terceiro) não importam ao layout e podem segurar o networkidle: um
      // SVG do mesmo tamanho responde no lugar (abortar geraria erro no console)
      await page.route('**/img.shields.io/**', (route) =>
        route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="174" height="28"/>' }),
      )
      await page.goto('./')
      await enterPortfolio(page)
      await page.waitForLoadState('networkidle')

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
      expect(messages).toEqual([])

      // o body tem overflow-x: hidden, então algo cortado na navegação não gera rolagem: confere
      // que cada item visível da navegação cabe inteiro na tela
      const outside = await page.evaluate((w) =>
        [...document.querySelectorAll('.navbar a, .navbar button')]
          .filter((el) => (el as HTMLElement).offsetParent !== null && getComputedStyle(el).visibility !== 'hidden')
          .filter((el) => el.getBoundingClientRect().right > w || el.getBoundingClientRect().left < 0)
          .map((el) => el.textContent?.trim()),
      width)
      expect(outside).toEqual([])
    })
  }
})

// nenhum cartão, janela ou chip com conteúdo cortado na horizontal
const clipped = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('.base-card, .terminal-window, .terminal-body, .chip, h1, h2, h3, p')]
      .filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'visible')
      .map((el) => `${el.className || el.tagName}: ${el.textContent?.trim().slice(0, 30)}`),
  )

const noHorizontalScroll = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

test.describe('layout ampliado (FR-025)', () => {
  test.use({ reducedMotion: 'reduce' })

  test('acima de 1920px o conteúdo fica centralizado na largura do container', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1200 })
    await page.goto('./')
    await enterPortfolio(page)
    const box = await page.locator('#experiencia').boundingBox()
    expect(box!.width).toBeLessThanOrEqual(1100)
    expect(Math.abs(box!.x + box!.width / 2 - 1280)).toBeLessThanOrEqual(2)
    expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0)
  })

  test('texto em 200% sem rolagem horizontal nem corte', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('./')
    await enterPortfolio(page)
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
    expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0)
    expect(await clipped(page)).toEqual([])
  })

  test('espaçamento de texto do WCAG 1.4.12 sem corte', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 })
    await page.goto('./')
    await enterPortfolio(page)
    await page.addStyleTag({
      content:
        '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }',
    })
    expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0)
    expect(await clipped(page)).toEqual([])
  })
})

test.describe('toque', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })

  test('tocar num cartão não acende o brilho (FR-014)', async ({ page }) => {
    await page.goto('./#experiencia')
    await enterPortfolio(page)
    const card = page.locator('#experiencia .base-card').first()
    await card.tap()
    const layer = card.locator('.spotlight-layer')
    expect(await layer.evaluate((el) => getComputedStyle(el).display)).toBe('none')
  })
})
