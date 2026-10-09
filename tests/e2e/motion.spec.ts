import { expect, test } from '@playwright/test'
import { waitBootEnd } from './support/boot'

// US4 com movimento (quickstart V6).
test.use({ reducedMotion: 'no-preference' })

test.describe('efeitos com movimento', () => {
  // instante (desde o início da navegação) em que a página fica descoberta: sem capa e sem boot
  const uncoveredAt = (page: import('@playwright/test').Page) =>
    page
      .waitForFunction(
        () =>
          !document.documentElement.classList.contains('booting') &&
          !document.querySelector('.boot-screen') &&
          performance.now(),
        null,
        { polling: 20, timeout: 9000 },
      )
      .then((handle) => handle.jsonValue() as Promise<number>)

  test('boot some sozinho, com o fade, em até 7 s do início da navegação (FR-032 da 004)', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('.boot-screen')).toBeVisible()
    expect(await uncoveredAt(page)).toBeLessThanOrEqual(7000)
  })

  test('com o bundle atrasado, a página fica descoberta em até 7 s (FR-032 da 004)', async ({ page }) => {
    await page.route('**/assets/*.js', async (route) => {
      await new Promise((r) => setTimeout(r, 3000))
      await route.continue()
    })
    await page.goto('./', { waitUntil: 'commit' })
    expect(await uncoveredAt(page)).toBeLessThanOrEqual(7000)
  })

  test('nem tecla nem clique encerram o boot (FR-031 da 004)', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('.boot-screen')).toBeVisible()
    await page.keyboard.press('x')
    await page.mouse.click(200, 200)
    await page.waitForTimeout(300)
    await expect(page.locator('.boot-screen')).not.toHaveClass(/boot-hidden/)
  })

  test('prompt digita, o fundo CRT com a chuva existe e cartões aparecem ao rolar', async ({ page }) => {
    await page.goto('./')
    await waitBootEnd(page)

    const typed = page.locator('.hero-terminal .typed')
    const samples = new Set<string>()
    for (let i = 0; i < 6; i++) {
      samples.add((await typed.textContent()) ?? '')
      await page.waitForTimeout(500)
    }
    expect(samples.size).toBeGreaterThan(1)

    await expect(page.locator('#home .hero-crt canvas')).toHaveCount(1)

    await page.locator('#experiencia').scrollIntoViewIfNeeded()
    const card = page.locator('#experiencia .timeline-item').first()
    await expect(card).toHaveCSS('opacity', '1', { timeout: 3000 })
  })
})
