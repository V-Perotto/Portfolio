import { expect, test, type Page } from './support/test'
import { enterPortfolio } from './support/boot'

// Feature 005, US5: o ícone do Contato à esquerda e os ícones dos projetos lado a lado (quickstart V13
// e V14; FR-025 a FR-027; SC-006, SC-007).
test.use({ reducedMotion: 'reduce' })

const WIDTHS = [320, 768, 1366, 1920]

async function open(page: Page, width: number, hash = '') {
  await page.setViewportSize({ width, height: 900 })
  await page.goto(`./${hash}`)
  await enterPortfolio(page)
}

const left = (page: Page, selector: string) => page.locator(selector).first().evaluate((el) => el.getBoundingClientRect().left)

async function minimizeAllProjects(page: Page) {
  const buttons = page.locator('#projetos .projects-grid button.t-min:visible')
  while ((await buttons.count()) > 0) await buttons.first().click()
}

/** As linhas de ícones (agrupadas pelo topo) com os títulos de cada uma, na ordem da lista. */
const iconRows = (page: Page) =>
  page.locator('#projetos .projects-grid > li').evaluateAll((items) => {
    const rows: { top: number; titles: string[] }[] = []
    for (const li of items) {
      const icon = li.querySelector<HTMLElement>('.desktop-icon')
      if (!icon || icon.offsetParent === null) continue
      const top = Math.round(icon.getBoundingClientRect().top)
      const title = icon.querySelector('.desktop-icon-label')?.textContent?.trim() ?? ''
      const row = rows.find((r) => Math.abs(r.top - top) <= 2)
      if (row) row.titles.push(title)
      else rows.push({ top, titles: [title] })
    }
    return rows
  })

for (const width of WIDTHS) {
  test(`Contato minimizado à esquerda, alinhado ao título e ao Sobre, em ${width}px (V13, FR-025, SC-006)`, async ({ page }) => {
    await open(page, width, '#contato')
    const openBox = await page.locator('#contato .desktop-window').evaluate((el) => {
      const r = el.getBoundingClientRect()
      return { width: r.width, center: r.left + r.width / 2, page: document.documentElement.clientWidth }
    })
    expect(openBox.width).toBeLessThanOrEqual(720)

    await page.locator('#contato button.t-min').click()
    const contact = (await left(page, '#contato .desktop-icon')) - (await left(page, '#contato h2'))
    expect(Math.abs(contact)).toBeLessThanOrEqual(1)

    await page.locator('#sobre button.t-min').click()
    const about = (await left(page, '#sobre .desktop-icon')) - (await left(page, '#sobre h2'))
    expect(Math.abs(contact - about)).toBeLessThanOrEqual(1)

    await page.locator('#contato .desktop-icon').click()
    const reopened = await page.locator('#contato .desktop-window').evaluate((el) => el.getBoundingClientRect().width)
    expect(reopened).toBeLessThanOrEqual(720)
  })
}

for (const [width, rows] of [
  [320, 3],
  [768, 2],
  [1024, 1],
  [1366, 1],
  [1920, 1],
] as const) {
  test(`seis projetos minimizados: ${rows} linha(s) em ${width}px, na ordem, à esquerda (V14, FR-026, SC-007)`, async ({ page }) => {
    await open(page, width, '#projetos')
    const order = await page.locator('#projetos .projects-grid > li .terminal-title').allTextContents()
    await minimizeAllProjects(page)
    await expect.poll(async () => (await iconRows(page)).flatMap((r) => r.titles).length).toBe(6)
    await expect.poll(async () => (await iconRows(page)).length).toBe(rows)
    const found = await iconRows(page)
    expect(found.flatMap((r) => r.titles)).toEqual(order.map((t) => t.trim()))
    const firstIcon = await left(page, '#projetos .projects-grid .desktop-icon')
    expect(Math.abs(firstIcon - (await left(page, '#projetos h2')))).toBeLessThanOrEqual(1)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('janela aberta entre ícones ocupa a própria linha; entre janelas, o espaço de antes (FR-026, FR-027)', async ({ page }) => {
  await open(page, 1366, '#projetos')
  const items = page.locator('#projetos .projects-grid > li')
  const gapBefore = await items.evaluateAll((lis) => lis[1]!.getBoundingClientRect().top - lis[0]!.getBoundingClientRect().bottom)
  expect(Math.abs(gapBefore - 22.4)).toBeLessThanOrEqual(1)

  await minimizeAllProjects(page)
  await items.nth(1).locator('.desktop-icon').click()
  const layout = await items.evaluateAll((lis) =>
    lis.map((li) => {
      const r = li.getBoundingClientRect()
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width) }
    }),
  )
  const full = await page.locator('#projetos .projects-grid').evaluate((el) => Math.round(el.getBoundingClientRect().width))
  // ícone 1 sozinho numa linha, janela 2 na largura toda, ícones 3 a 6 juntos numa linha
  expect(layout[1]!.width).toBe(full)
  expect(layout[1]!.top).toBeGreaterThan(layout[0]!.bottom - 1)
  expect(new Set(layout.slice(2).map((l) => l.top)).size).toBe(1)
  expect(layout[2]!.top).toBeGreaterThan(layout[1]!.bottom - 1)
})

test.describe('com movimento', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('a 320px, minimizar um projeto nunca cria rolagem horizontal, nem durante a animação (FR-026)', async ({ page }) => {
    await open(page, 320, '#projetos')
    await page.locator('#projetos .projects-grid > li').nth(0).locator('button.t-min').click()
    await page.waitForTimeout(400)
    const worst = await page.evaluate(async () => {
      const btn = document.querySelectorAll<HTMLButtonElement>('#projetos .projects-grid > li')[1]!.querySelector<HTMLButtonElement>('button.t-min')!
      let max = -Infinity
      btn.click()
      const t0 = performance.now()
      while (performance.now() - t0 < 500) {
        max = Math.max(max, document.documentElement.scrollWidth - document.documentElement.clientWidth)
        await new Promise((r) => requestAnimationFrame(r))
      }
      return max
    })
    expect(worst).toBeLessThanOrEqual(0)
  })

  test('o Contato encolhe a partir da janela centralizada, não do canto (FR-025, research R10)', async ({ page }) => {
    await open(page, 1366, '#contato')
    const result = await page.evaluate(async () => {
      const slot = document.querySelector<HTMLElement>('#contato .desktop-window')!
      const frame = slot.querySelector<HTMLElement>('.desktop-window-frame')!
      const before = frame.getBoundingClientRect()
      slot.querySelector<HTMLButtonElement>('button.t-min')!.click()
      await new Promise((r) => requestAnimationFrame(r))
      await new Promise((r) => requestAnimationFrame(r))
      const first = frame.getBoundingClientRect()
      return { dx: Math.abs(first.left - before.left), dy: Math.abs(first.top - before.top), w: before.width }
    })
    // no começo da animação, o quadro ainda está (quase) onde a janela estava
    expect(result.dx).toBeLessThanOrEqual(result.w * 0.1)
    expect(result.dy).toBeLessThanOrEqual(40)
  })
})
