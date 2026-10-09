import { expect, test } from '@playwright/test'
import { expectStaticSkillLoops } from './support/skills'

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

  test('ativar "reduzir movimento" com a página aberta para tudo na hora (FR-020)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('./')
    await page.keyboard.press('Escape') // pula o boot
    await expect(page.locator('#home canvas')).toHaveCount(1)

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(page.locator('html')).not.toHaveClass(/\bmotion\b/)
    await expect(page.locator('#home canvas')).toHaveCount(0)
    await expect(page.locator('.hero-terminal .typed')).toHaveText('Desenvolvedor Full-Stack')
    // os loops de skills voltam à lista parada e sem cópias (FR-025 da 003)
    await expect(page.locator('#skills [data-loop-copy]')).toHaveCount(0)
    await expect(page.locator('#skills .skill-loop[data-loop-ready]')).toHaveCount(0)
  })

  test('janelas de terminal aparecem completas, sem digitar (FR-029, SC-006)', async ({ page }) => {
    await page.goto('./')
    for (const id of ['#sobre', '#projetos', '#contato']) {
      await page.locator(id).scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
    }
    await expect(page.locator('[data-t-anim], .t-typed')).toHaveCount(0)
    expect(await page.locator('[data-t-state]:not([data-t-state="done"])').count()).toBe(0)
    await expect(page.locator('#contato .contact-list')).toHaveCSS('opacity', '1')
  })

  test('ativar "reduzir movimento" no meio da digitação completa a janela na hora (FR-029)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('./')
    await page.keyboard.press('Escape')
    await expect(page.locator('.boot-screen')).toHaveCount(0, { timeout: 1500 })
    await page.locator('#sobre').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => document.querySelector('#sobre [data-t-state="typing"]'), null, { polling: 20 })

    await page.emulateMedia({ reducedMotion: 'reduce' })
    // o CSS só esconde sob html.motion: a saída aparece assim que a classe sai
    await expect(page.locator('html')).not.toHaveClass(/\bmotion\b/)
    await expect(page.locator('#sobre .terminal-body > [data-t-state]:not([data-t-cmd])').first()).toHaveCSS('opacity', '1')
    // e o JS completa a janela bem antes do fim natural da digitação (~1,9 s)
    await expect(page.locator('#sobre [data-t-state]:not([data-t-state="done"])')).toHaveCount(0, { timeout: 1000 })
    await expect(page.locator('#sobre .t-typed')).toHaveCount(0)
  })

  test('loops de skills parados, com todas as skills dentro da fita (V10, FR-025)', async ({ page }) => {
    await page.goto('./')
    await page.locator('#skills').scrollIntoViewIfNeeded()
    await expectStaticSkillLoops(page)
    await expect(page.locator('#skills [data-loop-ready]')).toHaveCount(0)
  })

  test('na impressão os loops também ficam parados e completos (V10, FR-025)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('./')
    await page.keyboard.press('Escape')
    await page.locator('#skills').scrollIntoViewIfNeeded()
    await expect(page.locator('#skills .skill-loop[data-loop-ready]')).toHaveCount(5)
    await page.emulateMedia({ media: 'print' })
    await expectStaticSkillLoops(page)
  })
})
