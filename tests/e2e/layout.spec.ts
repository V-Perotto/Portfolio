import { expect, test } from '@playwright/test'

// FR-025, FR-026, SC-008, SC-009 (quickstart V8).
const widths = [360, 768, 1280, 1920]

test.describe('layout', () => {
  for (const width of widths) {
    test(`sem rolagem horizontal e console limpo em ${width}px`, async ({ page }) => {
      const messages: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') messages.push(`${msg.type()}: ${msg.text()}`)
      })
      page.on('pageerror', (err) => messages.push(`pageerror: ${err.message}`))

      await page.setViewportSize({ width, height: 900 })
      await page.goto('./')
      await page.waitForLoadState('networkidle')

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
      expect(messages).toEqual([])
    })
  }
})
