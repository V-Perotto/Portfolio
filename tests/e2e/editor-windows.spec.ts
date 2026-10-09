import { expect, test, type Locator, type Page } from './support/test'
import { enterPortfolio } from './support/boot'

// Feature 006, US1: Experiência, Challenges e Comunitário em janelas de editor (quickstart V1–V9;
// FR-001 a FR-019; contracts/editor-window.md).
test.use({ reducedMotion: 'no-preference' })

const EDITORS = [
  { label: 'carreira', path: '~/carreira', section: '#experiencia', count: 5 },
  { label: 'challenges', path: '~/projetos/challenges', section: '#projetos', count: 7 },
  { label: 'comunitario', path: '~/projetos/comunitario', section: '#projetos', count: 1 },
] as const

const editor = (page: Page, label: string) => page.locator(`.editor-window[data-editor="${label}"]`)
/** O quadro (no lugar ou, maximizado, no <body>). */
const frameOf = (page: Page, path: string) =>
  page.locator('.editor-frame').filter({ has: page.locator('.terminal-title', { hasText: new RegExp(`^${path.replace(/[/~]/g, '\\$&')}$`) }) })

/** Rola até a janela e espera o comando terminar (o editor é a saída dele). */
async function ready(page: Page, label: string) {
  const win = editor(page, label)
  // o topo da janela acima de 80% da tela: é quando ela começa a digitar (002, research R4)
  await win.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(win.locator('.editor')).not.toHaveAttribute('data-t-state', /pending|typing/, { timeout: 5000 })
  return win
}

async function open(page: Page, viewport = { width: 1366, height: 800 }) {
  await page.setViewportSize(viewport)
  await page.goto('./')
  await enterPortfolio(page)
}

const height = (loc: Locator) => loc.evaluate((el) => el.getBoundingClientRect().height)

test('estrutura: comando digitado, aba, árvore na ordem, arquivo 1 e rodapé; altura final já na digitação (V1, FR-001 a FR-009, FR-019)', async ({ page }) => {
  await open(page)
  for (const { label, path, count } of EDITORS) {
    const win = editor(page, label)
    await win.scrollIntoViewIfNeeded()
    const frame = win.locator('.editor-frame')
    // durante a digitação, a janela já tem a altura final
    const during = await height(frame)
    await ready(page, label)
    expect(Math.abs((await height(frame)) - during)).toBeLessThanOrEqual(0.5)

    await expect(win.locator('.terminal-title')).toHaveText(path)
    await expect(win.locator('.t-line').first()).toContainText(`code ${path}`)
    const names = await win.locator('.bm-child').allTextContents()
    expect(names).toHaveLength(count)
    // datas no nome, da mais recente para a mais antiga
    const dates = names.map((n) => n.trim().slice(0, 7))
    expect([...dates].sort().reverse()).toEqual(dates)
    await expect(win.locator('.editor-tab')).toHaveText(names[0]!.trim())
    await expect(win.locator('.editor-file[data-active]')).toHaveCount(1)
    await expect(win.locator('.editor-file[data-active] .editor-ln').first()).toHaveText('1')
    await expect(win.locator('.editor-path')).toHaveText(`${path}/${names[0]!.trim()}`)
    await expect(win.locator('.editor-pos')).toHaveText(`1 / ${count}`)
    await expect(win.locator('.bm-child').first()).toHaveAttribute('aria-current', 'true')
  }
})

test('cada arquivo traz os textos do cartão do item; links em nova aba (V2, FR-006, FR-008, SC-001)', async ({ page }) => {
  await open(page)
  for (const { label } of EDITORS) {
    const win = await ready(page, label)
    const ids = await win.locator('.bm-child').evaluateAll((els) => els.map((el) => el.getAttribute('data-value')!))
    for (const [i, id] of ids.entries()) {
      await win.locator('.bm-child').nth(i).click()
      const file = win.locator(`.editor-file[data-file-id="${id}"]`)
      await expect(file).toHaveAttribute('data-active', '')
      const text = (await file.evaluate((el) => el.textContent ?? '')).replace(/\s+/g, ' ')
      // textos do cartão: cada nó de texto visível (fora de sr-only e de aria-hidden), sem os prefixos
      // decorativos `// ` e `> `; "empresa · local" vira duas partes
      const facts = await win.locator(`.editor-cards [data-card-id="${id}"]`).evaluate((card) => {
        const out: string[] = []
        const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) {
          const node = walker.currentNode
          if (node.parentElement?.closest('.sr-only, [aria-hidden="true"]')) continue
          const t = (node.textContent ?? '').replace(/\s+/g, ' ').trim().replace(/^\/\/\s*/, '').replace(/^>\s*/, '')
          if (!t || t === '=') continue
          out.push(...t.split(' · ').map((p) => p.trim()).filter(Boolean))
        }
        return out
      })
      expect(facts.length).toBeGreaterThan(2)
      for (const fact of facts) expect(text, `${label}/${id}: "${fact}"`).toContain(fact)
      for (const a of await file.locator('a').all()) {
        await expect(a).toHaveAttribute('target', '_blank')
        await expect(a).toHaveAttribute('rel', 'noopener noreferrer')
      }
    }
  }
})

test('trocar de arquivo não muda a altura nem move a página; teclado e aria-current (V3, FR-004, FR-010, SC-002)', async ({ page }) => {
  await open(page)
  const win = await ready(page, 'challenges')
  const frame = win.locator('.editor-frame')
  const skillsTop = () => page.locator('#educacao').evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
  const h0 = await height(frame)
  const top0 = await skillsTop()
  const items = win.locator('.bm-child')
  for (let i = 0; i < 7; i++) {
    await items.nth(i).click()
    expect(Math.abs((await height(frame)) - h0)).toBeLessThanOrEqual(0.5)
  }
  expect(Math.abs((await skillsTop()) - top0)).toBeLessThanOrEqual(0.5)

  // teclado: foco no 1º arquivo, Tab até o 2º, Enter; Tab até o 3º, Espaço
  await items.nth(0).focus()
  await page.keyboard.press('Tab')
  await expect(items.nth(1)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(items.nth(1)).toHaveAttribute('aria-current', 'true')
  await expect(items.nth(1)).toBeFocused()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Space')
  await expect(items.nth(2)).toHaveAttribute('aria-current', 'true')
  await expect(win.locator('.bm-child[aria-current]')).toHaveCount(1)
  await expect(win.locator('.editor-pos')).toHaveText('3 / 7')
})

test('celular: árvore acima do arquivo; nenhuma largura com rolagem horizontal (V4, FR-011, SC-001)', async ({ page }) => {
  test.setTimeout(120_000)
  for (const width of [320, 390]) {
    await open(page, { width, height: 844 })
    for (const { label } of EDITORS) {
      const win = await ready(page, label)
      const tree = await win.locator('.editor-tree').boundingBox()
      const pane = await win.locator('.editor-pane').boundingBox()
      expect(tree!.y + tree!.height).toBeLessThanOrEqual(pane!.y + 0.5)
    }
  }
  for (const width of [320, 390, 768, 1366, 1920]) {
    await open(page, { width, height: 900 })
    for (const { label } of EDITORS) await ready(page, label)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${width}px`).toBe(true)
  }
})

for (const viewport of [
  { width: 1366, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`maximizar: diálogo sobre a página desfocada; foco preso; Esc, fundo e botão restauram (V5, FR-013, FR-015 a FR-017, SC-003), ${viewport.width}px`, async ({ page }) => {
    await open(page, viewport)
    await ready(page, 'carreira')
    const frame = frameOf(page, '~/carreira')
    const max = frame.locator('button.t-max')
    const restoreWays = [
      async () => page.keyboard.press('Escape'),
      async () => page.mouse.click(3, 3),
      async () => frame.locator('button.t-max').click(),
    ]
    for (const restore of restoreWays) {
      await max.click()
      await expect(page.locator('html')).toHaveClass(/window-maximized/)
      // a rolagem de quando a janela maximizou (o próprio clique do Playwright pode rolar para alcançar o
      // □ sob o header); restaurar volta exatamente a ela
      const scrollY = await page.evaluate(() => window.scrollY)
      expect(await page.evaluate(() => document.getElementById('app')!.inert)).toBe(true)
      await expect(page.locator('body > .maximize-backdrop')).toHaveCount(1)
      await expect(frame).toHaveAttribute('role', 'dialog')
      await expect(frame).toHaveAttribute('data-editor-view', 'cards')
      await expect(frame.locator('.editor-cards')).toBeVisible()
      await expect(frame.locator('.editor-files')).toBeHidden()
      await expect(frame.locator('.editor-tree')).toBeVisible()
      await expect(max).toBeFocused()
      await expect(max).toHaveAttribute('aria-label', 'Restaurar ~/carreira')
      const duration = await frame.evaluate((el) => Math.max(0, ...el.getAnimations().map((a) => Number((a.effect as KeyframeEffect).getComputedTiming().duration))))
      expect(duration).toBeLessThanOrEqual(400)
      await page.waitForTimeout(450)
      const box = (await frame.boundingBox())!
      // a área do fundo (o mesmo bloco de contenção do quadro: a tela sem a faixa reservada da barra de
      // rolagem, que só existe no Chromium de desktop)
      const backdrop = (await page.locator('.maximize-backdrop').boundingBox())!
      const area = { w: backdrop.width, h: backdrop.height }
      const min = viewport.width < 760 ? 0.95 : 0.9
      expect(box.width / area.w).toBeGreaterThanOrEqual(min)
      expect(box.height / area.h).toBeGreaterThanOrEqual(min)
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab')
        expect(await frame.evaluate((el) => el.contains(document.activeElement))).toBe(true)
      }
      await restore()
      await expect(page.locator('html')).not.toHaveClass(/window-maximized/)
      expect(await page.evaluate(() => document.getElementById('app')!.inert)).toBe(false)
      await expect(page.locator('.maximize-backdrop')).toHaveCount(0)
      await expect(frame).not.toHaveAttribute('role', 'dialog')
      await expect(max).toBeFocused()
      await expect(max).toHaveAttribute('aria-label', 'Maximizar ~/carreira')
      await page.waitForTimeout(450)
      expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
    }
  })
}

test('maximizada, escolher o 6º challenge rola os cartões até ele; restaurar abre o arquivo 6 (V6, FR-016)', async ({ page }) => {
  await open(page)
  await ready(page, 'challenges')
  const frame = frameOf(page, '~/projetos/challenges')
  await frame.locator('button.t-max').click()
  await page.waitForTimeout(450)
  const sixth = frame.locator('.bm-child').nth(5)
  const id = await sixth.getAttribute('data-value')
  expect(await frame.locator('.editor-cards').evaluate((el) => el.scrollTop)).toBe(0)
  await sixth.click()
  // a lista rola até o cartão: o título dele fica inteiro à vista (perto do fim da lista, o cartão não
  // chega ao topo)
  await expect
    .poll(() =>
      frame.evaluate((el, cardId) => {
        const list = el.querySelector('.editor-cards')!
        const box = list.getBoundingClientRect()
        const title = el.querySelector(`[data-card-id="${cardId}"] h4`)!.getBoundingClientRect()
        return list.scrollTop > 0 && title.top >= box.top && title.bottom <= box.bottom
      }, id),
    )
    .toBe(true)
  await frame.locator('button.t-max').click()
  await expect(frame.locator('.editor-file[data-active]')).toHaveAttribute('data-file-id', id!)
  await expect(frame.locator('.editor-pos')).toHaveText('6 / 7')
})

test('minimizar e fechar maximizada voltam ao ícone, sem desfoque nem página inerte (V7, FR-018)', async ({ page }) => {
  await open(page)
  await ready(page, 'carreira')
  for (const [button, state] of [
    ['button.t-min', 'minimized'],
    ['button.t-close', 'closed'],
  ] as const) {
    const frame = frameOf(page, '~/carreira')
    await frame.locator('button.t-max').click()
    await expect(page.locator('html')).toHaveClass(/window-maximized/)
    await frame.locator(button).click()
    const win = editor(page, 'carreira')
    await expect(win).toHaveAttribute('data-window-state', state)
    await expect(page.locator('html')).not.toHaveClass(/window-maximized/)
    expect(await page.evaluate(() => document.getElementById('app')!.inert)).toBe(false)
    await expect(page.locator('.maximize-backdrop')).toHaveCount(0)
    await win.locator('button.desktop-icon').click()
    await expect(win).toHaveAttribute('data-window-state', 'open')
    await ready(page, 'carreira')
  }
})

test('Ctrl+Alt+T não abre o terminal da dock com a janela maximizada (V8)', async ({ page }) => {
  await open(page)
  await ready(page, 'comunitario')
  await frameOf(page, '~/projetos/comunitario').locator('button.t-max').click()
  await expect(page.locator('html')).toHaveClass(/window-maximized/)
  await page.keyboard.press('Control+Alt+KeyT')
  await page.waitForTimeout(300)
  await expect(page.locator('#dock-terminal')).toHaveCount(0)
})

test('sem JavaScript: as três seções mostram os cartões, sem árvore nem YAML (V9, FR-012)', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('./')
  for (const { label, count } of EDITORS) {
    const win = editor(page, label)
    await expect(win.locator('.editor-cards [data-card-id]')).toHaveCount(count)
    await expect(win.locator('.editor-cards [data-card-id]').first()).toBeVisible()
    await expect(win.locator('.editor-tree')).toBeHidden()
    await expect(win.locator('.editor-files')).toBeHidden()
    await expect(win.locator('.editor-tabs')).toBeHidden()
    await expect(win.locator('.editor-footer')).toBeHidden()
  }
  await context.close()
})

test('impressão: as três seções saem com os cartões (V9, FR-012)', async ({ page }) => {
  await open(page)
  await page.emulateMedia({ media: 'print' })
  for (const { label, count } of EDITORS) {
    const win = editor(page, label)
    await expect(win.locator('.editor-cards [data-card-id]')).toHaveCount(count)
    await expect(win.locator('.editor-cards [data-card-id]').first()).toBeVisible()
    await expect(win.locator('.editor-tree')).toBeHidden()
    await expect(win.locator('.editor-files')).toBeHidden()
  }
})
