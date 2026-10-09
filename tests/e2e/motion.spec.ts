import { expect, test } from './support/test'
import { enterPortfolio } from './support/boot'

// US4 com movimento (quickstart V6).
test.use({ reducedMotion: 'no-preference' })

test.describe('efeitos com movimento', () => {
  // a porta de acesso (feature 005) tem os próprios testes: access-gate.spec.ts e boot.spec.ts
  test('prompt digita, o fundo Letter Glitch existe e cartões aparecem ao rolar', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)

    const typed = page.locator('.hero-terminal .typed')
    const samples = new Set<string>()
    for (let i = 0; i < 6; i++) {
      samples.add((await typed.textContent()) ?? '')
      await page.waitForTimeout(500)
    }
    expect(samples.size).toBeGreaterThan(1)

    await expect(page.locator('#home .hero-glitch canvas')).toHaveCount(1)

    // a janela de editor da experiência (006) aparece ao rolar, como os cartões antes dela
    await page.locator('#experiencia').scrollIntoViewIfNeeded()
    const card = page.locator('#experiencia .editor-window')
    await expect(card).toHaveCSS('opacity', '1', { timeout: 3000 })
  })
})
