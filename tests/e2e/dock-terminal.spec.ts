import { expect, test, type Page } from '@playwright/test'
import { waitBootEnd } from './support/boot'

// Feature 004, US2: dock com o terminal do site (quickstart V7, V8; FR-017 a FR-027).
const dock = (page: Page) => page.locator('.app-dock .dock-btn')
const input = (page: Page) => page.locator('#dock-terminal-input')
const log = (page: Page) => page.locator('#dock-terminal [role="log"]')

async function open(page: Page) {
  await page.goto('./')
  await waitBootEnd(page)
  await dock(page).click()
  await expect(input(page)).toBeFocused()
}

async function run(page: Page, line: string) {
  await input(page).fill(line)
  await input(page).press('Enter')
}

test('a dock fica no centro de baixo, e o header não tem mais o prompt (V8, FR-017, FR-018)', async ({ page }) => {
  await page.goto('./')
  await waitBootEnd(page)
  const box = (await page.locator('.app-dock').boundingBox())!
  const width = page.viewportSize()!.width
  expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThanOrEqual(2)
  expect(box.y + box.height).toBeGreaterThan(page.viewportSize()!.height - 40)
  await expect(page.locator('.navbar')).not.toContainText('viper@portfolio')
  await expect(dock(page)).toHaveAttribute('aria-label', 'Abrir terminal (Ctrl+Alt+T)')
  await expect(dock(page)).toHaveAttribute('aria-expanded', 'false')
})

test('help, find com Tab, erros, histórico, clear e exit (V7, SC-002)', async ({ page }) => {
  await open(page)
  await expect(dock(page)).toHaveAttribute('aria-expanded', 'true')

  await run(page, 'help')
  await expect(log(page)).toContainText('find <OPTIONS>')
  await expect(log(page)).toContainText('OPTIONS: sobre | experiencia | skills | projetos | educacao | contato')

  // 3 ações depois de abrir: o começo da seção, Tab, Enter (SC-002)
  await input(page).fill('find pro')
  await input(page).press('Tab')
  await expect(input(page)).toHaveValue('find projetos')
  await input(page).press('Enter')
  await expect(log(page)).toContainText('→ ~/projetos')
  await page.waitForFunction(() => Math.abs(document.getElementById('projetos')!.getBoundingClientRect().top) < 120)
  // título da seção entre o header e o terminal; o terminal continua aberto, com o foco no prompt
  const title = (await page.locator('#projetos h2').boundingBox())!
  const header = (await page.locator('.navbar').boundingBox())!
  const terminal = (await page.locator('#dock-terminal').boundingBox())!
  expect(title.y).toBeGreaterThanOrEqual(header.y + header.height - 1)
  expect(title.y + title.height).toBeLessThanOrEqual(terminal.y)
  await expect(input(page)).toBeFocused()
  expect(await page.evaluate(() => location.hash)).toBe('#projetos')

  await run(page, 'find Experiência')
  await expect(log(page)).toContainText('→ ~/experiencia')
  await run(page, 'foo')
  await expect(log(page)).toContainText('foo: comando não encontrado. Digite help para ver os comandos.')
  await run(page, 'find xyz')
  await expect(log(page)).toContainText(`find: 'xyz': seção não encontrada`)

  await input(page).press('ArrowUp')
  await expect(input(page)).toHaveValue('find xyz')
  await run(page, 'clear')
  await expect(page.locator('#dock-terminal .dt-line')).toHaveCount(0)

  await run(page, 'exit')
  await expect(page.locator('#dock-terminal')).toHaveCount(0)
  await expect(dock(page)).toBeFocused()
})

test('Ctrl+Alt+T abre e fecha; ✕ e Esc fecham, com o foco de volta na dock (V7, FR-019)', async ({ page }) => {
  await page.goto('./')
  await waitBootEnd(page)
  await page.keyboard.press('Control+Alt+KeyT')
  await expect(input(page)).toBeFocused()
  await page.keyboard.press('Control+Alt+KeyT')
  await expect(page.locator('#dock-terminal')).toHaveCount(0)
  await expect(dock(page)).toBeFocused()

  await dock(page).click()
  await page.locator('#dock-terminal button.t-close').click()
  await expect(page.locator('#dock-terminal')).toHaveCount(0)
  await expect(dock(page)).toBeFocused()

  await dock(page).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('#dock-terminal')).toHaveCount(0)
  await expect(dock(page)).toBeFocused()
})

test('sugestões tocáveis no celular e sem rolagem horizontal em 320px (V7, FR-024)', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 640 }, hasTouch: true, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('http://localhost:4173/Portfolio/')
  await page.locator('.app-dock .dock-btn').tap()
  await page.locator('#dock-terminal-input').fill('find e')
  await expect(page.locator('#dock-terminal .dt-chip')).toHaveText(['experiencia', 'educacao'])
  await page.locator('#dock-terminal .dt-chip', { hasText: 'educacao' }).tap()
  await expect(page.locator('#dock-terminal-input')).toHaveValue('find educacao')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await context.close()
})

test('o rodapé fica inteiro acima da dock no fim da página (FR-027)', async ({ page }) => {
  await page.goto('./')
  await waitBootEnd(page)
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  const text = (await page.locator('.footer p').last().boundingBox())!
  const dockBox = (await page.locator('.app-dock').boundingBox())!
  expect(text.y + text.height).toBeLessThanOrEqual(dockBox.y)
})

for (const width of [1440, 390]) {
  test(`header centralizado em ${width}px (V8, FR-017)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    await waitBootEnd(page)
    // a partir da US3 o header fica escondido no hero: mede depois de sair dele
    await page.locator('#sobre').scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    const target = width > 840 ? page.locator('.nav-links') : page.locator('.nav-toggle')
    const box = (await target.boundingBox())!
    expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThanOrEqual(2)
  })
}
