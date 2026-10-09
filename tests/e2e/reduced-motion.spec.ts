import { expect, test } from './support/test'
import { enterPortfolio } from './support/boot'
import { expectStaticSkillLoops } from './support/skills'

// FR-020, SC-007 (quickstart V5).
test.use({ reducedMotion: 'reduce' })

test.describe('movimento reduzido', () => {
  test('nada se move e tudo aparece no estado final', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)
    const classes = await page.evaluate(() => document.documentElement.className)
    expect(classes).not.toContain('motion')
    expect(classes).not.toContain('booting')
    await expect(page.locator('.access-gate')).toHaveCount(0)
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(page.locator('.hero-terminal')).toContainText('Desenvolvedor Full-Stack')
    await expect(page.getByText('Transformando processos em sistemas escaláveis').first()).toBeVisible()

    // o loader do hero (006) some 3 s depois de a página ser descoberta, sem transição: é troca de
    // estado, não movimento; as capturas comparam depois dela
    await expect(page.locator('#home .hero-boot')).toHaveAttribute('data-loader', 'hidden', { timeout: 5000 })
    await page.waitForTimeout(500)
    const first = await page.screenshot()
    await page.waitForTimeout(2000)
    const second = await page.screenshot()
    expect(Buffer.compare(first, second)).toBe(0)
  })

  test('ativar "reduzir movimento" com a página aberta para tudo na hora (FR-020)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('./')
    await enterPortfolio(page)
    // o fundo CRT (feature 004) é coberto em hero-crt.spec.ts, no projeto com WebGL
    await expect(page.locator('#skills .skill-loop[data-loop-ready]')).toHaveCount(5)

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
    await enterPortfolio(page)
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
    await enterPortfolio(page)
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
    await enterPortfolio(page)
    await page.locator('#skills').scrollIntoViewIfNeeded()
    await expectStaticSkillLoops(page)
    await expect(page.locator('#skills [data-loop-ready]')).toHaveCount(0)
  })

  test('na impressão os loops também ficam parados e completos (V10, FR-025)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('./')
    await enterPortfolio(page)
    await page.locator('#skills').scrollIntoViewIfNeeded()
    await expect(page.locator('#skills .skill-loop[data-loop-ready]')).toHaveCount(5)
    await page.emulateMedia({ media: 'print' })
    await expectStaticSkillLoops(page)
  })

  test('feature 004: header sem transição, terminal e janelas sem animação (V17, FR-008, FR-016, FR-019)', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)
    const duration = await page.locator('.navbar').evaluate((el) => getComputedStyle(el).transitionDuration)
    // o CSS global de movimento reduzido zera as transições (1e-05s)
    expect(duration.split(',').every((d) => parseFloat(d) <= 0.01)).toBe(true)

    await page.locator('.app-dock .dock-btn').click()
    await expect(page.locator('#dock-terminal')).toBeVisible()
    expect(await page.evaluate(() => document.getAnimations().filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition)).length)).toBe(0)
    await page.keyboard.press('Escape')

    await page.locator('#sobre').scrollIntoViewIfNeeded()
    const about = page.locator('#sobre .desktop-window')
    await about.locator('button.t-close').click()
    expect(await page.evaluate(() => document.getAnimations().filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition)).length)).toBe(0)
    await about.locator('button.desktop-icon').click()
    await expect(about.locator('[data-t-anim]')).toHaveCount(0)
    expect(await about.locator('[data-t-state]:not([data-t-state="done"])').count()).toBe(0)
  })

  // Feature 006 (quickstart V16, V19, V5; FR-033, FR-041, FR-015, FR-003)
  test('feature 006: hero sem Letter Glitch, loader pronto; maximizar e trocar de arquivo sem animação', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)
    await expect(page.locator('.hero-glitch, .letter-glitch')).toHaveCount(0)
    await expect(page.locator('#home .hero-boot')).toHaveAttribute('data-loader', /done|hidden/)

    const win = page.locator('.editor-window[data-editor="challenges"]')
    await win.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    // sem movimento, o editor já está completo (sem digitação)
    await expect(win.locator('[data-t-anim]')).toHaveCount(0)
    const reach = win.locator('.bm-reach').first()
    expect(Number.parseFloat(await reach.evaluate((el) => getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(0.001)

    await win.locator('button.t-max').click()
    const frame = page.locator('body > .editor-frame')
    await expect(frame).toHaveAttribute('role', 'dialog')
    expect(await frame.evaluate((el) => el.getAnimations().length)).toBe(0)
    expect(await page.locator('.maximize-backdrop').evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
    await page.keyboard.press('Escape')
    await expect(page.locator('body > .editor-frame')).toHaveCount(0)
    expect(await win.locator('.editor-frame').evaluate((el) => el.getAnimations().length)).toBe(0)
  })
})
