import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// SC-005, SC-006 (quickstart V7).
for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  for (const width of [360, 1280]) {
    test(`a11y: axe sem violações críticas/sérias em ${width}px (${reducedMotion})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion })
      await page.setViewportSize({ width, height: 900 })
      await page.goto('./')
      // sem a tela de boot por cima (com movimento ela some com qualquer tecla)
      await page.keyboard.press('Escape')
      await expect(page.locator('.boot-screen')).toHaveCount(0, { timeout: 2000 })
      // revela tudo o que depende de rolagem antes de auditar
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo({ top: y, behavior: 'instant' })
          await new Promise((r) => setTimeout(r, 50))
        }
      })
      await page.waitForTimeout(800)

      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      const serious = violations
        .filter((v) => v.impact === 'critical' || v.impact === 'serious')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
      expect(serious).toEqual([])
    })
  }
}

test('a11y: foco por teclado sempre visível', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  const total = await page.locator('a[href], button').count()
  const missing: string[] = []
  for (let i = 0; i < total; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body) return null
      const style = getComputedStyle(el)
      const visible = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
      return { visible, label: el.textContent?.trim().slice(0, 30) || el.getAttribute('aria-label') || el.tagName }
    })
    if (info && !info.visible) missing.push(info.label)
  }
  expect(missing).toEqual([])
})

test('a11y: títulos e prompt lidos sem os enfeites de terminal (FR-036)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  const names = await page.getByRole('heading', { level: 2 }).allInnerTexts()
  const accessible = []
  for (const heading of await page.getByRole('heading', { level: 2 }).all()) {
    accessible.push(await heading.evaluate((el) => {
      // nome acessível: texto sem o que está em aria-hidden
      const clone = el.cloneNode(true) as HTMLElement
      clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove())
      return clone.textContent?.trim()
    }))
  }
  expect(names.length).toBeGreaterThan(0)
  expect(accessible).toEqual(['sobre', 'experiencia', 'skills', 'projetos', 'educacao', 'contato'])
  await expect(page.locator('#home')).toMatchAriaSnapshot(`- paragraph: /viper@portfolio:~ Desenvolvedor Full-Stack/`)
})

test('a11y: foco num link do cartão acende o brilho (FR-014)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./#projetos')
  const link = page.locator('#projetos a[href*="open-vsx.org"]').first()
  await link.focus()
  const card = page.locator('#projetos .base-card', { has: page.locator('a[href*="open-vsx.org"]') })
  const layer = card.locator('.spotlight-layer')
  await expect.poll(async () => Number(await layer.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThan(0)
})

test('a11y: alto contraste mantém foco e esconde a decoração (FR-037)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await page.goto('./')
  await expect(page.locator('.scanlines')).toBeHidden()
  await page.keyboard.press('Tab')
  const outline = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement as Element)
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) }
  })
  expect(outline.style).not.toBe('none')
  expect(outline.width).toBeGreaterThan(0)
})
