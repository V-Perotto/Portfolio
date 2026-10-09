import { expect, test, type Locator, type Page } from '@playwright/test'
import { waitBootEnd } from './support/boot'

// Feature 004, US4: janelas que minimizam e fecham como ícones de área de trabalho
// (quickstart V9–V11; FR-001 a FR-011).
const win = (page: Page, title: string) =>
  page.locator('.desktop-window').filter({ has: page.locator('.terminal-title', { hasText: new RegExp(`^${title}$`) }) })

const states = (scope: Locator) =>
  scope.evaluate((el) => [...el.querySelectorAll('[data-t-state]')].map((n) => n.getAttribute('data-t-state')![0]).join(''))

/** Duração da animação mais longa em curso na janela (ms), sem contar o blink do cursor (infinita). */
const longestAnimation = (scope: Locator) =>
  scope.evaluate((el) =>
    Math.max(
      0,
      ...el
        .getAnimations({ subtree: true })
        .filter((a) => !(a instanceof CSSAnimation))
        .map((a) => Number((a.effect as KeyframeEffect | null)?.getComputedTiming().duration ?? 0)),
    ),
  )

test.describe('com movimento', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('minimizar o SRG durante a digitação: ícone no lugar, animação ≤ 400 ms, reabre completo (V9, FR-002 a FR-006)', async ({ page }) => {
    await page.goto('./')
    await waitBootEnd(page)
    const srg = win(page, 'SRG')
    await srg.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => document.querySelector('#projetos [data-t-state="typing"]'), null, { polling: 20 })
    const next = win(page, 'Temas VS Code')
    // posição no documento (o foco no ícone pode rolar a página)
    const docTop = () => next.evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
    const before = await docTop()

    await srg.locator('button.t-min').click()
    const duration = await longestAnimation(srg)
    expect(duration).toBeGreaterThan(0)
    expect(duration).toBeLessThanOrEqual(400)
    const icon = srg.locator('button.desktop-icon')
    await expect(icon).toBeVisible()
    await expect(icon).toHaveAttribute('aria-label', 'Abrir SRG')
    await expect(icon).toHaveText('SRG')
    await expect(icon.locator('svg')).toHaveClass(/lucide-folder-code/)
    await expect(srg).toHaveAttribute('data-window-state', 'minimized')
    // o cartão seguinte sobe
    await expect.poll(docTop).toBeLessThan(before - 100)

    await icon.click()
    await expect(srg).toHaveAttribute('data-window-state', 'open')
    expect(await states(srg)).toMatch(/^d+$/)
    await expect(srg.locator('.t-typed')).toHaveCount(0)
  })

  test('fechar o sobre.txt e abrir: digita de novo e termina em até 2,5 s (V10, FR-005, SC-004)', async ({ page }) => {
    await page.goto('./#sobre')
    await waitBootEnd(page)
    const about = win(page, 'sobre.txt')
    await page.waitForFunction(() => !document.querySelector('#sobre [data-t-state]:not([data-t-state="done"])'), null, { timeout: 6000 })

    await about.locator('button.t-close').click()
    await expect(about.locator('button.desktop-icon svg')).toHaveClass(/lucide-file-text/)
    await about.locator('button.desktop-icon').click()
    await page.waitForFunction(() => document.querySelector('#sobre [data-t-state="typing"], #sobre [data-t-state="pending"]'), null, { polling: 10, timeout: 2000 })
    const start = Date.now()
    await page.waitForFunction(() => !document.querySelector('#sobre [data-t-state]:not([data-t-state="done"])'), null, { polling: 20, timeout: 4000 })
    expect(Date.now() - start).toBeLessThanOrEqual(2500)
  })

  test('cliques rápidos terminam num estado coerente (edge case)', async ({ page }) => {
    await page.goto('./#contato')
    await waitBootEnd(page)
    const contact = win(page, 'contato.sh')
    await contact.locator('button.t-min').click()
    await contact.locator('button.desktop-icon').click()
    await contact.locator('button.t-close').click()
    await contact.locator('button.desktop-icon').click()
    await expect(contact).toHaveAttribute('data-window-state', 'open')
    await expect(contact.locator('.desktop-window-frame')).toBeVisible()
    await expect(contact.locator('button.desktop-icon')).toBeHidden()
    await page.waitForTimeout(500)
    const frame = (await contact.locator('.desktop-window-frame').boundingBox())!
    const box = (await contact.boundingBox())!
    expect(Math.abs(frame.height - box.height)).toBeLessThanOrEqual(1)
  })
})

test('teclado: Tab até "Minimizar contato.sh", Enter, ícone, Enter (V11, FR-007)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./#contato')
  const minimize = page.getByRole('button', { name: 'Minimizar contato.sh' })
  await minimize.focus()
  await page.keyboard.press('Enter')
  const icon = page.getByRole('button', { name: 'Abrir contato.sh' })
  await expect(icon).toBeFocused()
  await expect(icon.locator('svg')).toHaveClass(/lucide-file-terminal/)
  await page.keyboard.press('Enter')
  await expect(minimize).toBeFocused()
})

test('com "reduzir movimento", troca sem animação e janela fechada reabre completa (FR-008)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./#sobre')
  const about = win(page, 'sobre.txt')
  await about.locator('button.t-close').click()
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  await about.locator('button.desktop-icon').click()
  await expect(about).toHaveAttribute('data-window-state', 'open')
  expect(await states(about)).not.toMatch(/[pt]/)
  await expect(about.locator('[data-t-anim]')).toHaveCount(0)
})

test('impressão: janela minimizada sai aberta e completa (FR-011)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./#projetos')
  const srg = win(page, 'SRG')
  await srg.locator('button.t-min').click()
  await expect(srg.locator('.desktop-window-frame')).toBeHidden()
  await page.emulateMedia({ media: 'print' })
  await expect(srg.locator('.desktop-window-frame')).toBeVisible()
  await expect(srg.locator('button.desktop-icon')).toBeHidden()
})
