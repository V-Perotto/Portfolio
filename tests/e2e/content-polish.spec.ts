import { expect, test } from '@playwright/test'

// Feature 004, US7: rodapé, chip JSON, sublinhados dos badges, logotipo do Valkey e papel do ItaliaMi
// (quickstart V15; FR-040 a FR-043, FR-047).
test.use({ reducedMotion: 'reduce' })

const card = (page: import('@playwright/test').Page, name: string) =>
  page.locator('#projetos .desktop-window').filter({ has: page.locator('.terminal-title', { hasText: new RegExp(`^${name}$`) }) })

test('rodapé com só o echo do copyright (FR-040)', async ({ page }) => {
  await page.goto('./')
  const footer = page.locator('footer.footer')
  await expect(footer.locator('p')).toHaveCount(1)
  await expect(footer).toHaveText(`$ echo "© ${new Date().getFullYear()} Vittorio Perotto"`)
  await expect(footer).not.toContainText('exit code')
  await expect(footer).not.toContainText('feito com')
})

test('Temas VS Code com o chip JSON (FR-041)', async ({ page }) => {
  await page.goto('./')
  const stack = card(page, 'Temas VS Code').locator('.project-stack')
  await expect(stack).toContainText('JSON')
  await expect(stack).not.toContainText('JSON de tema')
})

test('sublinhado de cada badge na cor do tema, também no domínio quando o badge falha (FR-042)', async ({ page }) => {
  await page.goto('./')
  const color = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).borderBottomColor)
  expect(await color('.evidence-grape .badge-box img')).toBe('rgb(133, 47, 252)')
  expect(await color('.evidence-sith .badge-box img')).toBe('rgb(217, 4, 4)')

  await page.route('**/img.shields.io/**', (route) => route.abort())
  await page.reload()
  await expect(page.locator('.evidence-grape .badge-box .evidence-url')).toBeVisible()
  expect(await color('.evidence-grape .badge-box .evidence-url')).toBe('rgb(133, 47, 252)')
  expect(await color('.evidence-sith .badge-box .evidence-url')).toBe('rgb(217, 4, 4)')
})

test('Valkey com o logotipo do dashboard-icons no chip do SRG e no loop (FR-043)', async ({ page }) => {
  await page.goto('./')
  const href = (scope: import('@playwright/test').Locator) =>
    scope.locator('li', { hasText: /^\s*Valkey/ }).first().locator('use').getAttribute('href')
  expect(await href(card(page, 'SRG').locator('.project-stack'))).toMatch(/#dashboard-valkey$/)
  expect(await href(page.locator('#skills .skill-loop').nth(4).locator('ul:not([aria-hidden])'))).toMatch(/#dashboard-valkey$/)
})

test('papel no ItaliaMi: Autor e desenvolvedor (FR-047)', async ({ page }) => {
  await page.goto('./')
  const meta = card(page, 'ItaliaMi').locator('.project-meta')
  await expect(meta.locator('div', { hasText: 'papel' }).locator('dd')).toHaveText('Autor e desenvolvedor')
})
