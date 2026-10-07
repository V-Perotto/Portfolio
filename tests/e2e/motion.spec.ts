import { expect, test } from '@playwright/test'

// US4 com movimento (quickstart V6).
test.use({ reducedMotion: 'no-preference' })

test.describe('efeitos com movimento', () => {
  test('boot some sozinho em até 5 s', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('.boot-screen')).toBeVisible()
    await expect(page.locator('.boot-screen')).toHaveCount(0, { timeout: 5500 })
    expect(await page.evaluate(() => document.documentElement.classList.contains('booting'))).toBe(false)
  })

  test('boot é pulado com qualquer tecla', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('.boot-screen')).toBeVisible()
    await page.keyboard.press('x')
    await expect(page.locator('.boot-screen')).toHaveCount(0, { timeout: 1500 })
  })

  test('prompt digita, matrix existe e cartões aparecem ao rolar', async ({ page }) => {
    await page.goto('./')
    await page.keyboard.press('Escape')
    await expect(page.locator('.boot-screen')).toHaveCount(0, { timeout: 1500 })

    const typed = page.locator('.hero-terminal .typed')
    const samples = new Set<string>()
    for (let i = 0; i < 6; i++) {
      samples.add((await typed.textContent()) ?? '')
      await page.waitForTimeout(500)
    }
    expect(samples.size).toBeGreaterThan(1)

    await expect(page.locator('#home canvas')).toHaveCount(1)

    await page.locator('#experiencia').scrollIntoViewIfNeeded()
    const card = page.locator('#experiencia .timeline-item').first()
    await expect(card).toHaveCSS('opacity', '1', { timeout: 3000 })
  })
})
