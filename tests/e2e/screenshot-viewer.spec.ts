import { readFileSync } from 'node:fs'
import { expect, test, type Page } from './support/test'
import { enterPortfolio } from './support/boot'

// Feature 009 (quickstart V4–V6, V14; FR-018 a FR-020; SC-003, SC-008, SC-009): a captura do DebianServer
// na janela (carregamento preguiçoso, espaço reservado) e o visualizador na página (clarify).
test.use({ reducedMotion: 'no-preference' })

const server = (page: Page) => page.locator('#projetos .projects-grid > li').filter({ has: page.locator('h3', { hasText: 'DebianServer' }) })
const viewer = (page: Page) => page.locator('dialog.shot-viewer')
const isOpen = (page: Page) => viewer(page).evaluate((d: HTMLDialogElement) => d.open)
/** A maior duração declarada entre as animações em curso do diálogo (FR-018: no máximo 400 ms). */
const longest = (page: Page) =>
  viewer(page).evaluate((el) => Math.max(0, ...el.getAnimations().map((a) => Number((a.effect as KeyframeEffect).getComputedTiming().duration))))

async function openServer(page: Page, width = 1366, height = 900) {
  await page.setViewportSize({ width, height })
  await page.goto('./')
  await enterPortfolio(page)
  await server(page).locator('.project-shot').scrollIntoViewIfNeeded()
  await expect.poll(() => server(page).locator('.project-shot img').evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
}

test('a captura só é baixada perto da tela, e o espaço dela já está reservado (V4, SC-003)', async ({ page }) => {
  const webp: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('.webp')) webp.push(request.url())
  })
  // segura a imagem até a medida do espaço reservado
  let release!: () => void
  const held = new Promise<void>((resolve) => (release = resolve))
  await page.route('**/*.webp', async (route) => {
    await held
    await route.continue()
  })
  await page.setViewportSize({ width: 1366, height: 900 })
  await page.goto('./')
  await enterPortfolio(page)
  await page.waitForTimeout(800)
  expect(webp, 'nenhuma captura pedida no hero').toEqual([])

  const shot = server(page).locator('.project-shot')
  await shot.scrollIntoViewIfNeeded()
  await expect.poll(() => webp.length).toBeGreaterThan(0)
  const before = (await shot.boundingBox())!.height
  release()
  await expect.poll(() => shot.locator('img').evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
  const after = (await shot.boundingBox())!.height
  expect(Math.abs(after - before)).toBeLessThanOrEqual(0.5)
  // uma largura só (a do srcset), e não as duas
  expect(new Set(webp).size).toBe(1)
})

for (const [width, height] of [
  [320, 700],
  [768, 1000],
  [1366, 900],
  [1920, 1080],
] as const) {
  test(`visualizador em ${width}px: abre e fecha em ≤ 400 ms, imagem inteira, foco de volta (V5, FR-018, SC-009)`, async ({ page }) => {
    await openServer(page, width, height)
    const link = server(page).locator('.shot-link')
    // pelo teclado: o clique do Playwright rolaria a página antes (o centro do print pode estar sob a dock);
    // o clique do mouse é o do teste seguinte
    await link.focus()
    const scrollY = await page.evaluate(() => window.scrollY)
    await page.keyboard.press('Enter')
    await expect.poll(() => isOpen(page)).toBe(true)
    expect(await longest(page)).toBeLessThanOrEqual(400)
    await expect(page.locator('html')).toHaveClass(/window-maximized/)
    await expect(viewer(page).locator('.shot-close')).toBeFocused()
    await page.waitForTimeout(450)

    // inteira, sem rolagem: a imagem cabe na janela do navegador, com a legenda
    const full = viewer(page).locator('img.shot-full')
    await expect.poll(() => full.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
    const box = (await full.boundingBox())!
    const size = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }))
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(size.w)
    expect(box.y + box.height).toBeLessThanOrEqual(size.h)
    expect(Math.abs(box.height - (box.width * 809) / 1396)).toBeLessThanOrEqual(2)
    expect(await viewer(page).evaluate((d) => d.scrollHeight <= d.clientHeight && d.scrollWidth <= d.clientWidth)).toBe(true)
    await expect(viewer(page).locator('.shot-caption')).toBeInViewport()

    await page.keyboard.press('Escape')
    expect(await longest(page)).toBeLessThanOrEqual(400)
    await expect.poll(() => isOpen(page)).toBe(false)
    await expect(link).toBeFocused()
    await expect(page.locator('html')).not.toHaveClass(/window-maximized/)
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
  })
}

test('Enter abre; o ✕ (≥ 44 px) e o clique no fundo fecham; a página fica inerte (V5, FR-018)', async ({ page }) => {
  await openServer(page)
  const link = server(page).locator('.shot-link')
  await link.focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => isOpen(page)).toBe(true)
  await page.waitForTimeout(450) // fim da animação de abrir (scale 0,96 → 1)
  // a página por trás não recebe foco nem clique: o Tab fica no diálogo
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Tab')
    expect(await viewer(page).evaluate((d) => d.contains(document.activeElement) || document.activeElement === document.body)).toBe(true)
  }
  const close = viewer(page).locator('.shot-close')
  const closeBox = (await close.boundingBox())!
  expect(closeBox.width).toBeGreaterThanOrEqual(44)
  expect(closeBox.height).toBeGreaterThanOrEqual(44)
  await close.click()
  await expect.poll(() => isOpen(page)).toBe(false)
  await expect(link).toBeFocused()

  await link.click()
  await expect.poll(() => isOpen(page)).toBe(true)
  await page.waitForTimeout(450)
  // canto de cima, à esquerda: fora da imagem, da legenda e do ✕
  await page.mouse.click(4, 4)
  await expect.poll(() => isOpen(page)).toBe(false)
  await expect(link).toBeFocused()
})

test('com o visualizador aberto, Ctrl+Alt+T não abre o terminal da dock (V5)', async ({ page }) => {
  await openServer(page)
  await server(page).locator('.shot-link').click()
  await expect.poll(() => isOpen(page)).toBe(true)
  await page.keyboard.press('Control+Alt+t')
  await page.waitForTimeout(300)
  await expect(page.locator('#dock-terminal')).toHaveCount(0)
  expect(await isOpen(page)).toBe(true)
})

test('Ctrl+clique não abre o visualizador: a imagem abre numa aba nova (V6)', async ({ page, context }) => {
  await openServer(page)
  const popup = context.waitForEvent('page')
  await server(page).locator('.shot-link').click({ modifiers: ['Control'] })
  const tab = await popup
  expect(tab.url()).toContain('/projetos/debianserver/painel-2026-10-20-1396.webp')
  await tab.close()
  expect(await isOpen(page)).toBe(false)
})

test('captura que não carrega: o texto alternativo fica no espaço reservado, sem erro do site (Edge Cases, analyze E1)', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.route('**/*.webp', (route) => route.abort())
  await page.setViewportSize({ width: 1366, height: 900 })
  await page.goto('./')
  await enterPortfolio(page)
  const shot = server(page).locator('.project-shot')
  await shot.scrollIntoViewIfNeeded()
  const img = shot.locator('img')
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete)).toBe(true)
  expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(0)
  await expect(img).toHaveAttribute('alt', /Painel do CasaOS do DebianServer em 20\/10\/2026/)
  // o espaço da proporção continua reservado (a largura da coluna × 809 / 1396)
  const box = (await img.boundingBox())!
  expect(Math.abs(box.height - (box.width * 809) / 1396)).toBeLessThanOrEqual(2)
  // o visualizador continua abrindo e fechando
  const link = shot.locator('.shot-link')
  await link.click()
  await expect.poll(() => isOpen(page)).toBe(true)
  await page.keyboard.press('Escape')
  await expect.poll(() => isOpen(page)).toBe(false)
  await expect(link).toBeFocused()
  expect(errors).toEqual([])
})

// SC-008, research R11: nada no HTML publicado localiza ou dá acesso ao servidor
test('privacidade: o HTML publicado não tem IP privado ou de CGNAT, .ts.net nem endereço do Tailscale (V14, SC-008)', () => {
  const html = readFileSync('dist/index.html', 'utf8')
  expect(html).not.toMatch(/\b(10\.\d+|172\.(1[6-9]|2\d|3[01])|192\.168|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7]))\.\d+\.\d+\b/)
  expect(html).not.toMatch(/\.ts\.net/)
  expect(html).not.toMatch(/tailscale\.com\//)
})
