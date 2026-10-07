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
