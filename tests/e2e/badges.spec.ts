import { expect, test } from '@playwright/test'

// SC-011 (quickstart V10): sem o serviço de badges, o cartão continua legível e com os links.
test.use({ reducedMotion: 'reduce' })

const card = (page: import('@playwright/test').Page) => page.locator('#projetos li', { hasText: 'Temas VS Code' })

test('cartão de temas sem badges', async ({ page }) => {
  await page.goto('./#projetos')
  await page.waitForLoadState('networkidle')
  const withBadges = (await card(page).boundingBox())?.height

  await page.route('**/img.shields.io/**', (route) => route.abort())
  await page.reload()
  await page.waitForLoadState('networkidle')

  await expect(card(page).getByText('Grape Glass Theme')).toBeVisible()
  await expect(card(page).getByText('Shadow Lord - Son of Dathomir Theme')).toBeVisible()
  const links = card(page).locator('a[href*="open-vsx.org"]')
  await expect(links).toHaveCount(2)
  expect((await card(page).boundingBox())?.height).toBe(withBadges)
})
