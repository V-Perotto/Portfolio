import { expect, test, type Locator, type Page } from './support/test'
import { enterPortfolio } from './support/boot'

// Feature 010, US1: a seção Certificados (quickstart V2 a V8; FR-001 a FR-016; SC-001 a SC-003, SC-006,
// SC-011; contracts/certificates-window.md §1 a §5). Movimento reduzido nos testes de estrutura (a dobra
// troca na hora); o tempo das animações é conferido no teste do visualizador, com movimento.
test.use({ reducedMotion: 'reduce' })

const FOLDERS = [
  { label: 'dio', count: 33, first: '2020-07-29_empregotech-basico.yml' },
  { label: 'prime-academy', count: 20, first: '2020-10-29_scrum.yml' },
  { label: 'udemy', count: 2, first: '2020-11-13_robot-avancado.yml' },
  { label: 'senai', count: 1, first: '2020-12-30_ia.yml' },
  { label: 'promenady', count: 5, first: '2023-02-18_abap-funcionais.yml' },
] as const

const win = (page: Page) => page.locator('.editor-window[data-editor="certificados"]')
/** O quadro (no lugar ou, maximizado, no <body>). */
const frameOf = (page: Page) =>
  page.locator('.editor-frame').filter({ has: page.locator('.terminal-title', { hasText: /^~\/certificados$/ }) })
const heads = (scope: Locator) => scope.locator('.bm-head')
const openFold = (scope: Locator) => scope.locator('.bm-section[data-open] .bm-fold-inner')

async function open(page: Page, viewport = { width: 1366, height: 800 }) {
  await page.setViewportSize(viewport)
  await page.goto('./')
  await enterPortfolio(page)
}

/** Rola até a janela e espera o comando terminar (o editor é a saída dele). */
async function ready(page: Page) {
  const w = win(page)
  await w.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(w.locator('.editor')).not.toHaveAttribute('data-t-state', /pending|typing/, { timeout: 5000 })
  return w
}

const height = (loc: Locator) => loc.evaluate((el) => el.getBoundingClientRect().height)

for (const [width, h] of [
  [320, 700],
  [768, 1000],
  [1366, 800],
  [1920, 1080],
] as const) {
  test(`estrutura em ${width}px: code ~/certificados, 5 pastas, a DIO aberta com 33 e 1 / 33, sem rolagem horizontal (V2, SC-001)`, async ({ page }) => {
    await open(page, { width, height: h })
    const w = await ready(page)
    await expect(w.locator('.terminal-title')).toHaveText('~/certificados')
    await expect(w.locator('.t-line').first()).toContainText('code ~/certificados')
    await expect(heads(w)).toHaveText(FOLDERS.map((f) => `${f.label}/`))
    expect(await heads(w).evaluateAll((els) => els.map((el) => el.getAttribute('aria-expanded')))).toEqual(['true', 'false', 'false', 'false', 'false'])
    await expect(w.locator('.bm-section[data-open] .bm-child')).toHaveCount(33)
    await expect(w.locator('.bm-section:not([data-open]) .bm-fold[inert]')).toHaveCount(4)
    await expect(w.locator('.editor-tab')).toHaveText(FOLDERS[0].first)
    await expect(w.locator('.editor-path')).toHaveText(`~/certificados/dio/${FOLDERS[0].first}`)
    await expect(w.locator('.editor-pos')).toHaveText('1 / 33')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    if (width === 320) {
      // o nome que não cabe termina em reticências, dentro da árvore (008 FR-020)
      const label = w.locator('.bm-child[aria-current="true"] .bm-label')
      expect(await label.evaluate((el) => el.scrollWidth > el.clientWidth && getComputedStyle(el).textOverflow === 'ellipsis')).toBe(true)
    }
  })
}

test('acordeão: clique, Enter e Espaço abrem a pasta e o 1º arquivo dela; a aberta não fecha (V3, FR-004, SC-002)', async ({ page }) => {
  await open(page)
  const w = await ready(page)
  const expanded = () => heads(w).evaluateAll((els) => els.map((el) => el.getAttribute('aria-expanded')))
  for (const [i, folder] of FOLDERS.entries()) {
    const how = i % 3
    if (how === 0) await heads(w).nth(i).click()
    else {
      await heads(w).nth(i).focus()
      await page.keyboard.press(how === 1 ? 'Enter' : 'Space')
    }
    expect(await expanded()).toEqual(FOLDERS.map((_, k) => String(k === i)))
    await expect(w.locator('.editor-tab')).toHaveText(folder.first)
    await expect(w.locator('.editor-pos')).toHaveText(`1 / ${folder.count}`)
    await expect(w.locator('.bm-section[data-open] .bm-child').first()).toHaveAttribute('aria-current', 'true')
  }
  // a aberta (Promenady) não fecha
  await heads(w).nth(4).click()
  expect(await expanded()).toEqual(['false', 'false', 'false', 'false', 'true'])
})

test('acordeão pelo toque no celular (V3, SC-002)', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('./')
  await enterPortfolio(page)
  const w = await ready(page)
  await heads(w).nth(1).tap()
  await expect(heads(w).nth(1)).toHaveAttribute('aria-expanded', 'true')
  await expect(heads(w).nth(0)).toHaveAttribute('aria-expanded', 'false')
  await expect(w.locator('.editor-pos')).toHaveText('1 / 20')
  await w.locator('.bm-section[data-open] .bm-child').nth(2).tap()
  await expect(w.locator('.editor-pos')).toHaveText('3 / 20')
  await context.close()
})

for (const [viewport, rows] of [
  [{ width: 1366, height: 800 }, 8],
  [{ width: 390, height: 844 }, 4],
] as const) {
  test(`rolagem só dentro da pasta em ${viewport.width}px: ${rows} linhas à vista, a página parada (V4, FR-005, SC-002)`, async ({ page }) => {
    await open(page, viewport)
    const w = await ready(page)
    const fold = openFold(w)
    const box = await fold.evaluate((el) => ({ client: el.clientHeight, scroll: el.scrollHeight }))
    expect(box.client).toBe(rows * 36 + 12)
    expect(box.scroll).toBeGreaterThan(box.client)

    // a roda do mouse sobre a lista rola a lista até o fim, e a página não sai do lugar
    const scrollY = await page.evaluate(() => window.scrollY)
    const rect = (await fold.boundingBox())!
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
    for (let i = 0; i < 20; i++) await page.mouse.wheel(0, 200)
    await expect.poll(() => fold.evaluate((el) => Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight)).toBe(true)
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)

    // pelo teclado: o 33º focado fica à vista dentro da lista
    await fold.evaluate((el) => el.scrollTo({ top: 0 }))
    await w.locator('.bm-section[data-open] .bm-child').first().focus()
    for (let i = 0; i < 32; i++) await page.keyboard.press('Tab')
    const last = w.locator('.bm-section[data-open] .bm-child').last()
    await expect(last).toBeFocused()
    const inView = await last.evaluate((el) => {
      const list = el.closest('.bm-fold-inner')!.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      return r.top >= list.top - 1 && r.bottom <= list.bottom + 1
    })
    expect(inView).toBe(true)
  })
}

test('pastas pequenas não rolam (Udemy, SENAI, Promenady)', async ({ page }) => {
  await open(page)
  const w = await ready(page)
  for (const i of [2, 3, 4]) {
    await heads(w).nth(i).click()
    expect(await openFold(w).evaluate((el) => el.scrollHeight <= el.clientHeight)).toBe(true)
  }
})

for (const viewport of [
  { width: 1366, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`altura fixa em ${viewport.width}px: a mesma em todas as pastas e arquivos (V5, FR-015, SC-003)`, async ({ page }) => {
    await open(page, viewport)
    const w = await ready(page)
    const frame = w.locator('.editor-frame')
    const heights: number[] = []
    for (const [i, folder] of FOLDERS.entries()) {
      await heads(w).nth(i).click()
      for (const k of [0, Math.floor(folder.count / 2), folder.count - 1]) {
        await w.locator('.bm-section[data-open] .bm-child').nth(k).click()
        heights.push(await height(frame))
      }
    }
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(0.5)
  })
}

test('fatos de um arquivo de cada plataforma; links em nova aba (V6, FR-006 a FR-008)', async ({ page }) => {
  await open(page)
  const w = await ready(page)
  const file = w.locator('.editor-file[data-active]')
  const pick = async (folder: number, name: string) => {
    await heads(w).nth(folder).click()
    await w.locator('.bm-section[data-open] .bm-child', { hasText: name }).click()
    await expect(w.locator('.editor-tab')).toHaveText(name)
  }
  const verify = (href: string) => file.locator(`a.tok-link[href="${href}"]`)

  await pick(0, '2020-04-13_logica-programacao.yml')
  await expect(file).toContainText('curso: Lógica de programação essencial')
  await expect(file).toContainText('plataforma: DIO')
  await expect(file).toContainText('emitido: 13 ABR 2020')
  await expect(file).toContainText('carga_horaria: 4 h')
  await expect(verify('https://hermes.dio.me/certificates/F4F49CF0.pdf')).toHaveAttribute('target', '_blank')
  await expect(verify('https://hermes.dio.me/certificates/F4F49CF0.pdf')).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(file).not.toContainText('tipo:')

  await pick(1, '2020-10-27_apis.yml')
  await expect(file).toContainText('curso: APIs')
  await expect(file).toContainText('codigo: 666923b8ee6805a1a5040c2ddcb47d02')
  await expect(file.locator('a.tok-link')).toHaveCount(0)

  await pick(2, '2020-11-11_robot-basico.yml')
  await expect(file).toContainText('curso: Automação de Testes com Robot Framework - Básico')
  await expect(verify('https://ude.my/UC-6d75d1fc-c72a-4df4-8cf1-9b572b69e489')).toHaveCount(1)

  await pick(3, '2020-12-30_ia.yml')
  await expect(file).toContainText('ementa: [Inteligência Artificial, Aprendizagem de máquina')
  await expect(file).toContainText('# código omitido por privacidade')
  await expect(file).not.toContainText('codigo:')

  await pick(4, '2023-01-16_formacao-consultores.yml')
  await expect(file).toContainText('carga_horaria: 80 h')
  await expect(verify('https://e-certificado.com/login/autenticar?c=1641756A81BF361B10825550')).toContainText(
    'e-certificado.com · 1641756A81BF361B10825550',
  )
})

test('miniatura: no máximo 1 ao entrar na seção; trocar de arquivo baixa só a nova (V7, FR-009, SC-011)', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (r) => {
    if (/\/certificados\/.+\.webp$/.test(r.url())) requested.push(r.url())
  })
  await open(page)
  const w = await ready(page)
  await expect.poll(() => requested.length).toBeGreaterThanOrEqual(1)
  await page.waitForTimeout(300)
  expect(requested).toHaveLength(1)
  expect(requested[0]).toContain('/certificados/dio/2020-07-29_empregotech-basico-640.webp')
  const img = w.locator('.editor-file[data-active] .editor-figure img')
  await expect(img).toHaveAttribute('alt', 'Certificado da DIO: Programa EmpregoTech Curitiba - Básico, 39 h, 29/07/2020')

  await w.locator('.bm-child', { hasText: '2020-07-03_postgresql.yml' }).click()
  await expect.poll(() => requested.length).toBe(2)
  expect(requested[1]).toContain('/certificados/dio/2020-07-03_postgresql-640.webp')
  // a imagem chega sem deslocar nada: a caixa já tinha a proporção
  const ratio = await w.locator('.editor-file[data-active] .shot-link').evaluate((el) => {
    const r = el.getBoundingClientRect()
    return r.width / r.height
  })
  expect(Math.abs(ratio - 1200 / 849)).toBeLessThan(0.02)
})

test.describe('com movimento', () => {
  test.use({ reducedMotion: 'no-preference' })

  for (const [width, h] of [
    [320, 700],
    [768, 1000],
    [1366, 900],
    [1920, 1080],
  ] as const) {
    test(`visualizador em ${width}px: a miniatura abre o certificado inteiro em ≤ 400 ms; Esc fecha e devolve o foco (V7)`, async ({ page }) => {
      await open(page, { width, height: h })
      const w = await ready(page)
      const link = w.locator('.editor-file[data-active] .shot-link')
      await link.focus()
      await page.keyboard.press('Enter')
      const dialog = page.locator('body > dialog.shot-viewer')
      await expect.poll(() => dialog.evaluate((d: HTMLDialogElement) => d.open)).toBe(true)
      const longest = () =>
        dialog.evaluate((el) => Math.max(0, ...el.getAnimations().map((a) => Number((a.effect as KeyframeEffect).getComputedTiming().duration))))
      expect(await longest()).toBeLessThanOrEqual(400)
      await expect(dialog.locator('.shot-caption')).toHaveText('# DIO · Programa EmpregoTech Curitiba - Básico · 29 JUL 2020')
      await page.waitForTimeout(450)
      const full = dialog.locator('img.shot-full')
      await expect.poll(() => full.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
      const box = (await full.boundingBox())!
      const size = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }))
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.y).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(size.w)
      expect(box.y + box.height).toBeLessThanOrEqual(size.h)
      await page.keyboard.press('Escape')
      await expect.poll(() => dialog.evaluate((d: HTMLDialogElement) => d.open)).toBe(false)
      await expect(link).toBeFocused()
    })
  }
})

test('maximizada: só a pasta aberta; outra pasta troca os cartões; ver certificado abre por cima e o Esc fecha só ele (V8, FR-012)', async ({ page }) => {
  await open(page)
  await ready(page)
  const frame = frameOf(page)
  await frame.locator('button.t-max').click()
  await expect(frame).toHaveAttribute('role', 'dialog')
  const visibleGroups = () => frame.locator('.cert-group:not([hidden])')
  await expect(visibleGroups()).toHaveCount(1)
  await expect(visibleGroups()).toHaveAttribute('data-card-group', 'dio')
  await expect(visibleGroups().locator('h3')).toHaveText('DIO · 33 certificados')
  await expect(visibleGroups().locator('li')).toHaveCount(33)

  await heads(frame).nth(1).click()
  await expect(visibleGroups()).toHaveAttribute('data-card-group', 'prime-academy')
  await expect(visibleGroups().locator('li')).toHaveCount(20)
  expect(await frame.locator('.editor-cards').evaluate((el) => el.scrollTop)).toBe(0)

  await frame.locator('.bm-section[data-open] .bm-child').nth(15).click()
  await expect
    .poll(() =>
      frame.evaluate((el) => {
        const list = el.querySelector('.editor-cards')!.getBoundingClientRect()
        const title = el.querySelector('[data-card-id="prime-academy/casos-de-teste"] h4')!.getBoundingClientRect()
        return title.top >= list.top && title.bottom <= list.bottom
      }),
    )
    .toBe(true)

  const view = frame.locator('[data-card-id="prime-academy/casos-de-teste"] a.cert-view')
  await view.click()
  const dialog = page.locator('body > dialog.shot-viewer')
  await expect.poll(() => dialog.evaluate((d: HTMLDialogElement) => d.open)).toBe(true)
  await page.keyboard.press('Escape')
  await expect.poll(() => dialog.evaluate((d: HTMLDialogElement) => d.open)).toBe(false)
  await expect(frame).toHaveAttribute('role', 'dialog')
  await expect(page.locator('html')).toHaveClass(/window-maximized/)
  await expect(view).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(frame).not.toHaveAttribute('role', 'dialog')
  await expect(page.locator('html')).not.toHaveClass(/window-maximized/)
})

test('minimizar e fechar até o ícone ~/certificados; fechada, digita o comando de novo (FR-016, analyze C1)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await open(page)
  const w = await ready(page)
  await w.locator('button.t-min').click()
  await expect(w).toHaveAttribute('data-window-state', 'minimized')
  const icon = w.locator('button.desktop-icon')
  await expect(icon).toHaveAttribute('aria-label', 'Abrir ~/certificados')
  await icon.click()
  await expect(w).toHaveAttribute('data-window-state', 'open')
  await expect(w.locator('.editor')).not.toHaveAttribute('data-t-state', /pending|typing/)

  await w.locator('button.t-close').click()
  await expect(w).toHaveAttribute('data-window-state', 'closed')
  await w.locator('button.desktop-icon').click()
  await expect(w).toHaveAttribute('data-window-state', 'open')
  await expect(w.locator('.t-line').first()).toContainText('code ~/certificados')
  await expect(w.locator('.editor')).toHaveAttribute('data-t-state', /pending|typing/)
  await expect(w.locator('.editor')).not.toHaveAttribute('data-t-state', /pending|typing/, { timeout: 5000 })
})
