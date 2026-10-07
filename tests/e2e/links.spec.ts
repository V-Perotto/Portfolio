import { expect, test } from '@playwright/test'

// SC-010, FR-009 (quickstart V9).
test.use({ reducedMotion: 'reduce' })

test.describe('links', () => {
  for (const id of ['home', 'sobre', 'experiencia', 'skills', 'projetos', 'educacao', 'contato']) {
    test(`âncora #${id} leva à seção`, async ({ page }) => {
      await page.goto(`./#${id}`)
      await expect(page.locator(`#${id}`)).toBeInViewport()
    })
  }

  test('menu mobile abre por teclado e fecha ao escolher um link', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('./')
    const toggle = page.locator('.nav-toggle')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.focus()
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await page.locator('.nav-links a', { hasText: '~/sobre' }).click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#sobre')).toBeInViewport()
  })

  test('links externos abrem em nova aba isolada', async ({ page }) => {
    await page.goto('./')
    const external = page.locator('a[href^="http"]')
    expect(await external.count()).toBeGreaterThan(0)
    for (const link of await external.all()) {
      await expect(link).toHaveAttribute('target', '_blank')
      const rel = (await link.getAttribute('rel')) ?? ''
      expect(rel).toContain('noopener')
      expect(rel).toContain('noreferrer')
    }
  })
})
