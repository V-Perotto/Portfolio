import { expect, test, type Locator, type Page } from './support/test'
import { enterPortfolio } from './support/boot'

// Feature 006, US1: Experiência, Challenges e Comunitário em janelas de editor (quickstart V1–V9;
// FR-001 a FR-019; contracts/editor-window.md). Feature 008: a Educação também (`~/formacao`, quickstart
// V1–V7; contracts/education-window.md), e os nomes da árvore que não cabem terminam em reticências (FR-020).
test.use({ reducedMotion: 'no-preference' })

const EDITORS = [
  { label: 'carreira', path: '~/carreira', section: '#experiencia', count: 5 },
  // 8 desde a feature 009 (o Bom Jesus (FAE), o mais recente)
  { label: 'challenges', path: '~/projetos/challenges', section: '#projetos', count: 8 },
  { label: 'comunitario', path: '~/projetos/comunitario', section: '#projetos', count: 1 },
  { label: 'formacao', path: '~/formacao', section: '#educacao', count: 4 },
] as const

/** As janelas que viram cartões sem JS e na impressão: as de cima e, desde a feature 010, a de Certificados. */
const CARD_WINDOWS = [...EDITORS, { label: 'certificados', count: 61 }] as const

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
    // datas no nome, da mais recente para a mais antiga (AAAA-MM, ou AAAA na formação, antes do `_`)
    const dates = names.map((n) => n.trim().split('_')[0]!)
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
  await expect(win.locator('.editor-pos')).toHaveText('3 / 8')
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
      // nenhum nome cortado no meio da letra: o que não cabe termina em reticências, dentro da árvore
      // (feature 008, FR-020, SC-001)
      const labels = await win.locator('.editor-tree').evaluate((el) => {
        const right = el.getBoundingClientRect().right
        return [...el.querySelectorAll<HTMLElement>('.bm-child .bm-label')].map((label) => ({
          name: label.textContent ?? '',
          ellipsis: getComputedStyle(label).textOverflow === 'ellipsis',
          inside: label.getBoundingClientRect().right <= right + 0.5,
          truncated: label.scrollWidth > label.clientWidth,
        }))
      })
      for (const l of labels) {
        expect(l.ellipsis, `${width}px ${l.name}`).toBe(true)
        expect(l.inside, `${width}px ${l.name}`).toBe(true)
      }
      if (label === 'formacao') {
        // o rótulo tem 130 px em 320 px (~18 caracteres) e 200 px em 390 px (~28; research R13): em 320,
        // os 4 nomes terminam em reticências; em 390, só o de Sistemas de Informação (31 caracteres)
        const byName = Object.fromEntries(labels.map((l) => [l.name.trim(), l.truncated]))
        expect(byName['2020_sistemas-de-informacao.yml']).toBe(true)
        expect(byName['2018_tecnico-ads.yml']).toBe(width === 320)
        // aberto, o rodapé mostra o caminho inteiro
        await win.locator('.bm-child', { hasText: 'sistemas-de-informacao' }).click()
        await expect(win.locator('.editor-path')).toHaveText('~/formacao/2020_sistemas-de-informacao.yml')
        const path = await win.locator('.editor-path').evaluate((el) => el.scrollWidth <= el.clientWidth + 0.5)
        expect(path).toBe(true)
      }
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
  await expect(frame.locator('.editor-pos')).toHaveText('6 / 8')
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

test('sem JavaScript: as cinco janelas mostram os cartões, sem árvore nem YAML (V9, FR-012; 008 FR-012; 010 FR-014)', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('./')
  for (const { label, count } of CARD_WINDOWS) {
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

test('impressão: as cinco janelas saem com os cartões (V9, FR-012; 008 FR-012; 010 FR-014)', async ({ page }) => {
  await open(page)
  await page.emulateMedia({ media: 'print' })
  for (const { label, count } of CARD_WINDOWS) {
    const win = editor(page, label)
    await expect(win.locator('.editor-cards [data-card-id]')).toHaveCount(count)
    await expect(win.locator('.editor-cards [data-card-id]').first()).toBeVisible()
    await expect(win.locator('.editor-tree')).toBeHidden()
    await expect(win.locator('.editor-files')).toBeHidden()
  }
})

// Feature 008 (quickstart V2–V5; FR-005, FR-007, FR-009 a FR-011; SC-002, SC-003)
test('Educação: EM CURSO só na Pós; fontes do Empregotech como links; trocar de arquivo sem mudar a altura (008 V2, V3)', async ({ page }) => {
  await open(page)
  const win = await ready(page, 'formacao')
  const fileOf = (id: string) => win.locator(`.editor-file[data-file-id="${id}"]`)
  const text = (id: string) => fileOf(id).evaluate((el) => el.textContent ?? '')
  expect(await text('ciberseguranca')).toContain('em_curso: true  # EM CURSO')
  for (const id of ['sistemas-de-informacao', 'empregotech', 'tecnico-ads']) expect(await text(id)).not.toContain('em_curso')

  const frame = win.locator('.editor-frame')
  const h0 = await height(frame)
  const empregotech = win.locator('.bm-child', { hasText: '2020_empregotech.yml' })
  await empregotech.focus()
  await page.keyboard.press('Enter')
  await expect(fileOf('empregotech')).toHaveAttribute('data-active', '')
  await expect(win.locator('.editor-path')).toHaveText('~/formacao/2020_empregotech.yml')
  await expect(win.locator('.editor-pos')).toHaveText('3 / 4')
  // 0 px, com a tolerância de subpixel dos testes da 006
  expect(Math.abs((await height(frame)) - h0)).toBeLessThanOrEqual(0.5)
  expect(await text('empregotech')).toContain('fontes:')
  const links = fileOf('empregotech').locator('a')
  // o texto do link inclui o "(abre em nova aba)" escondido do ExternalLink
  await expect(links).toHaveText([/^overbr\.com\.br/, /^curitiba\.pr\.gov\.br/])
  for (const a of await links.all()) {
    await expect(a).toHaveAttribute('target', '_blank')
    await expect(a).toHaveAttribute('rel', 'noopener noreferrer')
  }
})

for (const viewport of [
  { width: 1366, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`Educação maximizada: ≤ 400 ms, cobre a tela, 4 cartões, rola até o escolhido; restaurar abre o arquivo dele (008 V4, SC-003), ${viewport.width}px`, async ({ page }) => {
    await open(page, viewport)
    await ready(page, 'formacao')
    const frame = frameOf(page, '~/formacao')
    const max = frame.locator('button.t-max')
    const longest = () => frame.evaluate((el) => Math.max(0, ...el.getAnimations().map((a) => Number((a.effect as KeyframeEffect).getComputedTiming().duration))))

    await max.click()
    await expect(frame).toHaveAttribute('role', 'dialog')
    await expect(frame).toHaveAttribute('aria-label', '~/formacao (maximizada)')
    expect(await longest()).toBeLessThanOrEqual(400)
    await page.waitForTimeout(450)
    const box = (await frame.boundingBox())!
    const backdrop = (await page.locator('.maximize-backdrop').boundingBox())!
    const min = viewport.width < 760 ? 0.95 : 0.9
    expect(box.width / backdrop.width).toBeGreaterThanOrEqual(min)
    expect(box.height / backdrop.height).toBeGreaterThanOrEqual(min)
    await expect(frame.locator('.editor-cards .edu-list > li h3')).toHaveText([
      'Pós-Graduação em Cibersegurança',
      'Bacharelado em Sistemas de Informação',
      '1º Empregotech',
      'Técnico em Análise e Desenvolvimento de Sistemas',
    ])

    await frame.locator('.bm-child', { hasText: '2018_tecnico-ads.yml' }).click()
    await expect
      .poll(() =>
        frame.evaluate((el) => {
          const list = el.querySelector('.editor-cards')!.getBoundingClientRect()
          const title = el.querySelector('[data-card-id="tecnico-ads"] h3')!.getBoundingClientRect()
          return title.top >= list.top && title.bottom <= list.bottom
        }),
      )
      .toBe(true)

    await page.keyboard.press('Escape')
    await expect(frame).not.toHaveAttribute('role', 'dialog')
    expect(await longest()).toBeLessThanOrEqual(400)
    await expect(max).toBeFocused()
    await expect(frame.locator('.editor-file[data-active]')).toHaveAttribute('data-file-id', 'tecnico-ads')
    await expect(frame.locator('.editor-pos')).toHaveText('4 / 4')
  })
}

test('Educação: minimizar e fechar até o ícone ~/formacao; fechada, digita o comando de novo (008 V5, FR-010, FR-011)', async ({ page }) => {
  await open(page)
  const win = await ready(page, 'formacao')
  await win.locator('button.t-min').click()
  await expect(win).toHaveAttribute('data-window-state', 'minimized')
  const icon = win.locator('button.desktop-icon')
  await expect(icon).toHaveAttribute('aria-label', 'Abrir ~/formacao')
  await icon.click()
  await expect(win).toHaveAttribute('data-window-state', 'open')
  // minimizada reabre completa
  await expect(win.locator('.editor')).not.toHaveAttribute('data-t-state', /pending|typing/)

  await win.locator('button.t-close').click()
  await expect(win).toHaveAttribute('data-window-state', 'closed')
  await win.locator('button.desktop-icon').click()
  await expect(win).toHaveAttribute('data-window-state', 'open')
  await expect(win.locator('.t-line').first()).toContainText('code ~/formacao')
  await expect(win.locator('.editor')).toHaveAttribute('data-t-state', /pending|typing/)
  await expect(win.locator('.editor')).not.toHaveAttribute('data-t-state', /pending|typing/, { timeout: 5000 })
})

// Feature 009 (quickstart V10; FR-001 a FR-005; SC-002): o challenge Bom Jesus (FAE), o 1º de 8
test('challenge Bom Jesus (FAE): 1º arquivo, fatos, link e reticências no celular (V10, SC-002)', async ({ page }) => {
  await open(page)
  const win = await ready(page, 'challenges')
  await expect(win.locator('.editor-tab')).toHaveText('2026-10_bom-jesus-fae.yml')
  await expect(win.locator('.editor-path')).toHaveText('~/projetos/challenges/2026-10_bom-jesus-fae.yml')
  await expect(win.locator('.editor-pos')).toHaveText('1 / 8')
  const file = win.locator('.editor-file[data-active]')
  for (const fact of [
    'Bom Jesus (FAE)',
    'OUT 2026',
    'Gestão acadêmica: API REST e interface web para cadastrar, consultar, atualizar e excluir alunos e professores de uma instituição de ensino.',
    'Java',
    'Spring Boot',
    'Vue 3',
    'TypeScript',
    'H2',
    'Docker',
  ])
    await expect(file).toContainText(fact)
  const repo = file.locator('a', { hasText: 'github.com/V-Perotto/bomjesus-challenge' })
  await expect(repo).toHaveAttribute('href', 'https://github.com/V-Perotto/bomjesus-challenge')
  await expect(repo).toHaveAttribute('target', '_blank')
  await expect(repo).toHaveAttribute('rel', 'noopener noreferrer')

  // maximizada: o 1º cartão é o dele, com os 6 chips e os ícones
  await win.locator('button.t-max').click()
  const frame = frameOf(page, '~/projetos/challenges')
  const card = frame.locator('[data-card-id="bomjesus-challenge"]')
  await expect(frame.locator('.editor-cards li').first()).toHaveAttribute('data-card-id', 'bomjesus-challenge')
  await expect(card.locator('.chips li')).toHaveCount(6)
  await expect(card.locator('.chips li svg.tech-icon')).toHaveCount(6)
  await page.keyboard.press('Escape')

  // celular de 320px: o nome não cabe na árvore e termina em reticências; o rodapé mostra o nome inteiro
  await open(page, { width: 320, height: 844 })
  const small = await ready(page, 'challenges')
  const label = small.locator('.bm-child .bm-label', { hasText: '2026-10_bom-jesus-fae.yml' })
  expect(await label.evaluate((el) => el.scrollWidth > el.clientWidth && getComputedStyle(el).textOverflow === 'ellipsis')).toBe(true)
  await expect(small.locator('.editor-path')).toHaveText('~/projetos/challenges/2026-10_bom-jesus-fae.yml')
})

// Feature 010 (quickstart V11, V17; FR-017 a FR-021; SC-006): a foto do 1º dia na Prime Control
test.describe('foto do 1º dia na Prime Control', () => {
  for (const viewport of [
    { width: 1366, height: 800 },
    { width: 1920, height: 1080 },
  ]) {
    test(`${viewport.width}px: à direita das linhas, com a legenda datada; a janela cresce no máximo 2 linhas e fica igual nos 5 arquivos`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await open(page, viewport)
      const win = await ready(page, 'carreira')
      const frame = win.locator('.editor-frame')
      const heights: number[] = []
      for (const file of await win.locator('.bm-child').all()) {
        await file.click()
        heights.push(await height(frame))
      }
      expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(0.5)
      // 453 px na 009 (research R8), mais 2 linhas do editor (23 px cada)
      expect(Math.max(...heights)).toBeLessThanOrEqual(453 + 46 + 0.5)

      await win.locator('.bm-child', { hasText: '2020-10_prime-control.yml' }).click()
      const file = win.locator('.editor-file[data-active]')
      await expect(file).toContainText('periodo: OUT 2020 — OUT 2022')
      const figure = file.locator('.editor-figure')
      await expect(figure.locator('figcaption')).toHaveText('# 1º dia na Prime Control · 15 OUT 2020')
      const lines = (await file.locator('.editor-lines').boundingBox())!
      const fig = (await figure.boundingBox())!
      expect(fig.x).toBeGreaterThanOrEqual(lines.x + lines.width - 0.5)
      await expect(figure.locator('img')).toHaveAttribute('alt', /^Integração dos novos funcionários na Prime Control em 15\/10\/2020/)
      // só a Prime Control tem foto
      await expect(win.locator('.editor-file .editor-figure')).toHaveCount(1)
    })
  }

  for (const viewport of [
    { width: 768, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    test(`${viewport.width}px: a foto fica embaixo das linhas`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await open(page, viewport)
      const win = await ready(page, 'carreira')
      await win.locator('.bm-child', { hasText: '2020-10_prime-control.yml' }).click()
      const file = win.locator('.editor-file[data-active]')
      const lines = (await file.locator('.editor-lines').boundingBox())!
      const fig = (await file.locator('.editor-figure').boundingBox())!
      expect(fig.y).toBeGreaterThanOrEqual(lines.y + lines.height - 0.5)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    })
  }

  test('a foto abre no visualizador; maximizada, o cartão da Prime Control tem a foto', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page)
    const win = await ready(page, 'carreira')
    await win.locator('.bm-child', { hasText: '2020-10_prime-control.yml' }).click()
    const link = win.locator('.editor-file[data-active] .shot-link')
    await link.click()
    const dialog = page.locator('body > dialog.shot-viewer')
    await expect.poll(() => dialog.evaluate((d: HTMLDialogElement) => d.open)).toBe(true)
    await expect(dialog.locator('.shot-caption')).toHaveText('# 1º dia na Prime Control · 15 OUT 2020')
    await expect(dialog.locator('img.shot-full')).toHaveAttribute('src', /\/carreira\/prime-control\/integracao-2020-10-15-1024\.webp$/)
    await page.keyboard.press('Escape')
    await expect.poll(() => dialog.evaluate((d: HTMLDialogElement) => d.open)).toBe(false)
    await expect(link).toBeFocused()

    const frame = frameOf(page, '~/carreira')
    await frame.locator('button.t-max').click()
    const card = frame.locator('[data-card-id="prime-control"]')
    await expect(card.locator('figure.exp-photo figcaption')).toHaveText('# 1º dia na Prime Control · 15 OUT 2020')
    await expect(frame.locator('.editor-cards figure')).toHaveCount(1)
    await page.keyboard.press('Escape')
  })
})

