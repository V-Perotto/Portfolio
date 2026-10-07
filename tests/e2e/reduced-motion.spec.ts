import { expect, test } from '@playwright/test'

// FR-020, SC-007 (quickstart V5).
test.use({ reducedMotion: 'reduce' })

test.describe('movimento reduzido', () => {
  test('nada se move e tudo aparece no estado final', async ({ page }) => {
    await page.goto('./')
    const classes = await page.evaluate(() => document.documentElement.className)
    expect(classes).not.toContain('motion')
    expect(classes).not.toContain('booting')
    await expect(page.locator('.boot-screen')).toHaveCount(0)
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(page.locator('.hero-terminal')).toContainText('Desenvolvedor Full-Stack')
    await expect(page.getByText('Transformando processos em sistemas escaláveis').first()).toBeVisible()

    await page.waitForTimeout(500)
    const first = await page.screenshot()
    await page.waitForTimeout(2000)
    const second = await page.screenshot()
    expect(Buffer.compare(first, second)).toBe(0)
  })
})
