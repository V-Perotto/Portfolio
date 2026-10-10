import { expect, mockIpService, test, type Locator, type Page } from './support/test'
import { enterPortfolio } from './support/boot'

// Feature 007, US1: o comando `open <OPTIONS>` do terminal da dock (quickstart V1–V7; FR-001 a FR-009;
// contracts/terminal-open.md). Projetos abrem a janela deles; experiencia, challenges e comunitario
// abrem a janela de editor maximizada; depois de um `open` válido, o terminal minimiza sozinho.
test.use({ reducedMotion: 'no-preference' })

const PROJECTS = [
  ['srg', 'SRG'],
  ['temas-vs-code', 'Temas VS Code'],
  ['italiami', 'ItaliaMi'],
  ['ocr-de-prontuarios', 'OCR de Prontuários'],
  ['qclass-bot', 'QClass-BOT'],
  ['monitor-de-curso', 'Monitor de Curso'],
] as const
const EDITORS = [
  ['experiencia', 'carreira', '~/carreira'],
  ['challenges', 'challenges', '~/projetos/challenges'],
  ['comunitario', 'comunitario', '~/projetos/comunitario'],
] as const
const OPEN_OPTIONS =
  'OPTIONS: experiencia | srg | temas-vs-code | italiami | ocr-de-prontuarios | qclass-bot | monitor-de-curso | challenges | comunitario'

const dock = (page: Page) => page.locator('.app-dock .dock-btn')
const input = (page: Page) => page.locator('#dock-terminal-input')
const log = (page: Page) => page.locator('#dock-terminal [role="log"]')
const projectWindow = (page: Page, title: string) =>
  page.locator('.desktop-window', { has: page.locator('.terminal-title', { hasText: new RegExp(`^${title}$`) }) }).first()
const editorWindow = (page: Page, label: string) => page.locator(`.editor-window[data-editor="${label}"]`)
const maximized = (page: Page) => page.locator('.editor-frame.is-maximized')

/** Erros do site no console (SC-010), coletados em cada teste do arquivo. */
let errors: string[] = []
test.beforeEach(({ page }) => {
  errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
})
test.afterEach(() => {
  expect(errors).toEqual([])
})

async function enter(page: Page, viewport = { width: 1366, height: 768 }) {
  await page.setViewportSize(viewport)
  await page.goto('./')
  await enterPortfolio(page)
}

/** Abre ou restaura o terminal da dock, com o foco no prompt (aberto, o foco pode estar numa janela). */
async function terminal(page: Page) {
  if ((await dock(page).getAttribute('data-terminal')) !== 'open') await dock(page).click()
  else await input(page).focus()
  await expect(input(page)).toBeFocused()
}

async function run(page: Page, line: string) {
  await terminal(page)
  await input(page).fill(line)
  await input(page).press('Enter')
}

/** Reabre a janela (se preciso) e a deixa no estado pedido, com cliques de DOM (a dock não atrapalha). */
async function setState(win: Locator, state: 'open' | 'minimized' | 'closed') {
  if ((await win.getAttribute('data-window-state')) !== 'open') await win.evaluate((el) => el.querySelector<HTMLElement>('button.desktop-icon')!.click())
  await expect(win).toHaveAttribute('data-window-state', 'open')
  if (state === 'open') return
  await win.evaluate((el, s) => el.querySelector<HTMLElement>(s === 'minimized' ? 'button.t-min' : 'button.t-close')!.click(), state)
  await expect(win).toHaveAttribute('data-window-state', state)
}

/**
 * Roda o `open` dentro da página e mede, a cada quadro, quando a janela chega ao estado final: projeto
 * aberto, com o topo da barra de título entre a base do header e a metade da tela e o foco no `−` dela;
 * editor maximizado, cobrindo a tela, com o foco no `□` dele. Devolve o tempo em ms (ou -1).
 */
async function timedOpen(page: Page, option: string, mode: 'open' | 'maximize', title: string, share = 0.9): Promise<number> {
  await terminal(page)
  return page.evaluate(
    async ({ option, mode, title, share }) => {
      const input = document.getElementById('dock-terminal-input') as HTMLInputElement
      input.value = `open ${option}`
      input.dispatchEvent(new Event('input'))
      const start = performance.now()
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      const header = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
      const ready = () => {
        if (mode === 'maximize') {
          const frame = document.querySelector<HTMLElement>('.editor-frame.is-maximized')
          if (!frame || frame.querySelector('.terminal-title')?.textContent !== title) return false
          // a área do fundo (o mesmo bloco de contenção do quadro: a tela sem a faixa reservada da barra de
          // rolagem, que só existe no Chromium de desktop), como no e2e da 006
          const area = document.querySelector('.maximize-backdrop')?.getBoundingClientRect()
          const r = frame.getBoundingClientRect()
          if (!area) return false
          return r.width >= area.width * share && r.height >= area.height * share && frame.contains(document.activeElement) && document.activeElement?.classList.contains('t-max')
        }
        const win = [...document.querySelectorAll<HTMLElement>('.desktop-window')].find((w) => w.querySelector('.terminal-title')?.textContent === title)
        if (!win || win.dataset.windowState !== 'open') return false
        const top = win.getBoundingClientRect().top
        return top >= header - 1 && top <= innerHeight / 2 && document.activeElement === win.querySelector('button.t-min')
      }
      return new Promise<number>((resolve) => {
        const tick = () => {
          if (ready()) resolve(performance.now() - start)
          else if (performance.now() - start > 3000) resolve(-1)
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
    },
    { option, mode, title, share },
  )
}

test('open de um projeto aberto: saída, terminal minimizado, janela abaixo do header e foco nela (V1, FR-004)', async ({ page }) => {
  await enter(page)
  const ms = await timedOpen(page, 'italiami', 'open', 'ItaliaMi')
  expect(ms).toBeGreaterThan(0)
  expect(ms).toBeLessThanOrEqual(1000)
  await expect(dock(page)).toHaveAttribute('data-terminal', 'minimized')
  const win = projectWindow(page, 'ItaliaMi')
  await expect(win.locator('button.t-min')).toBeFocused()
  const header = (await page.locator('.navbar').boundingBox())!
  const top = (await win.boundingBox())!.y
  expect(top).toBeGreaterThanOrEqual(header.y + header.height - 1)
  expect(top).toBeLessThanOrEqual(768 / 2)
  // a sessão foi guardada: o comando e a saída estão no terminal restaurado
  await terminal(page)
  await expect(log(page)).toContainText('open italiami')
  await expect(log(page)).toContainText('→ ~/projetos/italiami')
})

test('open de projeto minimizado reabre completo; fechado digita de novo sem piscar (V2, FR-004)', async ({ page }) => {
  await enter(page)
  const srg = projectWindow(page, 'SRG')
  await setState(srg, 'minimized')
  await run(page, 'open srg')
  await expect(srg).toHaveAttribute('data-window-state', 'open')
  await expect(srg.locator('[data-t-state="pending"], [data-t-state="typing"]')).toHaveCount(0)
  await expect(srg.locator('button.t-min')).toBeFocused()

  const qclass = projectWindow(page, 'QClass-BOT')
  await setState(qclass, 'closed')
  await terminal(page)
  // do Enter até o fim da digitação, a cada quadro: nenhuma saída visível antes de o comando dela
  // terminar de ser digitado nesta reabertura (006 FR-023)
  const report = await qclass.evaluate(async (el) => {
    const body = el.querySelector('.terminal-body')!
    const steps: { cmd: Element; outputs: Element[] }[] = []
    for (const child of body.children) {
      if (child.hasAttribute('data-t-cmd')) steps.push({ cmd: child, outputs: [] })
      else steps.at(-1)?.outputs.push(child)
    }
    const seen = new Map(steps.map((s) => [s.cmd, { typing: false, typed: false }]))
    const violations: string[] = []
    const input = document.getElementById('dock-terminal-input') as HTMLInputElement
    input.value = 'open qclass-bot'
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    const start = performance.now()
    await new Promise<void>((resolve) => {
      const sample = () => {
        for (const { cmd, outputs } of steps) {
          const mark = seen.get(cmd)!
          const state = cmd.getAttribute('data-t-state')
          if (state === 'pending' || state === 'typing') mark.typing = true
          if (mark.typing && state === 'done') mark.typed = true
          for (const out of outputs) if (!mark.typed && Number(getComputedStyle(out).opacity) > 0.01) violations.push((out.textContent ?? '').trim().slice(0, 30))
        }
        if (steps.every(({ cmd }) => seen.get(cmd)!.typed) || performance.now() - start > 4000) resolve()
        else requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    })
    return { violations, typed: steps.every(({ cmd }) => seen.get(cmd)!.typed) }
  })
  expect(report.violations).toEqual([])
  expect(report.typed).toBe(true)
  await expect(qclass).toHaveAttribute('data-window-state', 'open')
})

test('open das janelas de editor: maximizada, restaurar volta à seção e o terminal fica minimizado (V3, FR-005)', async ({ page }) => {
  await enter(page)
  await run(page, 'open experiencia')
  await expect(maximized(page)).toHaveCount(1)
  await expect(maximized(page).locator('.terminal-title')).toHaveText('~/carreira')
  await expect(page.locator('#app')).toHaveAttribute('inert', '')
  await expect(maximized(page).locator('button.t-max')).toBeFocused()
  await expect(dock(page)).toHaveAttribute('data-terminal', 'minimized')
  await page.keyboard.press('Escape')
  await expect(maximized(page)).toHaveCount(0)
  const exp = editorWindow(page, 'carreira')
  const box = (await exp.boundingBox())!
  expect(box.y).toBeLessThan(768)
  expect(box.y + box.height).toBeGreaterThan(0)
  await expect(exp.locator('button.t-max')).toBeFocused()
  await expect(dock(page)).toHaveAttribute('data-terminal', 'minimized')
  await terminal(page)
  await expect(log(page)).toContainText('open experiencia')
  await expect(log(page)).toContainText('→ ~/carreira')

  // fechada: reabre já completa e maximiza
  const challenges = editorWindow(page, 'challenges')
  await setState(challenges, 'closed')
  await run(page, 'open challenges')
  await expect(maximized(page).locator('.terminal-title')).toHaveText('~/projetos/challenges')
  await expect(maximized(page).locator('[data-t-state="pending"], [data-t-state="typing"]')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(maximized(page)).toHaveCount(0)

  // minimizada, pelo apelido do caminho
  const community = editorWindow(page, 'comunitario')
  await setState(community, 'minimized')
  await run(page, 'open ~/projetos/comunitario')
  await expect(maximized(page).locator('.terminal-title')).toHaveText('~/projetos/comunitario')
  await page.keyboard.press('Escape')
  await expect(community).toHaveAttribute('data-window-state', 'open')
})

for (const viewport of [
  { width: 1366, height: 768 },
  { width: 390, height: 844 },
]) {
  // SC-001: ≤ 1 s. Medido com um navegador só (2026-10-09): mediana 283 ms, pior 517 ms. Com a suíte
  // rodando 4 navegadores, picos isolados passam de 1 s (a página com o Letter Glitch e as janelas de
  // editor é pesada); como no teste da dica da dock (006), cada tentativa tem folga (≤ 1,5 s) e a
  // mediana das 27 tem de ficar ≤ 1 s. O teto de 1 s sem folga fica no V1.
  test(`as 9 opções, com a janela aberta, minimizada e fechada, em ≤ 1 s, ${viewport.width}px (V4, SC-001)`, async ({ page }) => {
    test.setTimeout(240_000)
    await enter(page, viewport)
    const share = viewport.width < 760 ? 0.95 : 0.9
    const times: number[] = []
    for (const state of ['open', 'minimized', 'closed'] as const) {
      for (const [option, title] of PROJECTS) {
        await setState(projectWindow(page, title), state)
        const ms = await timedOpen(page, option, 'open', title)
        expect(ms, `${option} (${state})`).toBeGreaterThan(0)
        expect(ms, `${option} (${state})`).toBeLessThanOrEqual(1500)
        times.push(ms)
        await expect(dock(page)).toHaveAttribute('data-terminal', 'minimized')
      }
      for (const [option, label, path] of EDITORS) {
        await setState(editorWindow(page, label), state)
        const ms = await timedOpen(page, option, 'maximize', path, share)
        expect(ms, `${option} (${state})`).toBeGreaterThan(0)
        expect(ms, `${option} (${state})`).toBeLessThanOrEqual(1500)
        times.push(ms)
        const r = (await maximized(page).boundingBox())!
        const area = (await page.locator('.maximize-backdrop').boundingBox())!
        expect(r.width / area.width, option).toBeGreaterThanOrEqual(share)
        expect(r.height / area.height, option).toBeGreaterThanOrEqual(share)
        await page.keyboard.press('Escape')
        await expect(maximized(page)).toHaveCount(0)
      }
    }
    const sorted = [...times].sort((a, b) => a - b)
    expect(sorted[Math.floor(sorted.length / 2)]).toBeLessThanOrEqual(1000)
  })
}

test('open no meio da animação de minimizar a janela termina com ela aberta (edge case)', async ({ page }) => {
  await enter(page)
  const srg = projectWindow(page, 'SRG')
  await terminal(page)
  await srg.evaluate((el) => {
    el.querySelector<HTMLElement>('button.t-min')!.click()
    const input = document.getElementById('dock-terminal-input') as HTMLInputElement
    input.value = 'open srg'
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  })
  await expect(srg).toHaveAttribute('data-window-state', 'open')
  await expect(srg.locator('button.t-min')).toBeFocused()
})

test('erros: nada abre nem rola, e o terminal continua aberto (V5, FR-006, SC-002)', async ({ page }) => {
  await enter(page)
  await terminal(page)
  const states = () => page.locator('.desktop-window').evaluateAll((els) => els.map((el) => el.getAttribute('data-window-state')).join(','))
  const before = { y: await page.evaluate(() => scrollY), states: await states() }
  const cases: [string, string[]][] = [
    ['open', ['uso: open <OPTIONS>', OPEN_OPTIONS]],
    ['open xyz', [`open: 'xyz': não encontrado`, OPEN_OPTIONS, 'Digite help para ver os comandos.']],
    ['open sobre', [`open: 'sobre': essa seção não abre com o open. Use: find sobre`]],
    ['open skills', [`open: 'skills': essa seção não abre com o open. Use: find skills`]],
    ['open projetos', [`open: 'projetos': essa seção não abre com o open. Use: find projetos`]],
    ['open educacao', [`open: 'educacao': essa seção não abre com o open. Use: find educacao`]],
    ['open Contato', [`open: 'Contato': essa seção não abre com o open. Use: find contato`]],
  ]
  for (const [line, output] of cases) {
    await run(page, line)
    for (const text of output) await expect(log(page)).toContainText(text)
    await expect(dock(page)).toHaveAttribute('data-terminal', 'open')
    await expect(input(page)).toBeFocused()
  }
  expect(await page.evaluate(() => scrollY)).toBe(before.y)
  expect(await states()).toBe(before.states)
})

test('help e Tab do open (V6, FR-007, FR-008)', async ({ page }) => {
  await enter(page)
  await run(page, 'help')
  await expect(log(page)).toContainText('open <OPTIONS>   abre uma janela e leva a página até ela')
  await expect(log(page)).toContainText('projetos abrem; experiencia, challenges e comunitario abrem maximizados')
  await expect(log(page)).toContainText(OPEN_OPTIONS)
  await expect(log(page)).toContainText('exemplo: open srg')
  await input(page).fill('o')
  await input(page).press('Tab')
  await expect(input(page)).toHaveValue('open ')
  await input(page).fill('open it')
  await input(page).press('Tab')
  await expect(input(page)).toHaveValue('open italiami')
  await input(page).fill('open c')
  await input(page).press('Tab')
  await expect(log(page)).toContainText('challenges  comunitario')
})

test('sugestões tocáveis do open no celular (V6, FR-008)', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' })
  await mockIpService(context)
  const page = await context.newPage()
  await page.goto('http://localhost:4173/Portfolio/')
  await enterPortfolio(page)
  await page.locator('.app-dock .dock-btn').tap()
  await page.locator('#dock-terminal-input').fill('open c')
  await expect(page.locator('#dock-terminal .dt-chip')).toHaveText(['challenges', 'comunitario'])
  await page.locator('#dock-terminal .dt-chip', { hasText: 'comunitario' }).tap()
  await expect(page.locator('#dock-terminal-input')).toHaveValue('open comunitario')
  await context.close()
})

test('movimento reduzido: open sem animação e com a rolagem já no lugar (V7, FR-009)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await enter(page)
  // as animações de movimento (WAAPI); transições de cor e os loops das skills não contam
  const moving = () =>
    page.evaluate(() => document.getAnimations().filter((a) => !(a instanceof CSSTransition) && !(a instanceof CSSAnimation)).length)
  await run(page, 'open italiami')
  expect(await moving()).toBe(0)
  const win = projectWindow(page, 'ItaliaMi')
  const header = Number.parseFloat(await page.evaluate(() => getComputedStyle(document.documentElement).scrollPaddingTop))
  expect(Math.abs((await win.boundingBox())!.y - header)).toBeLessThanOrEqual(2)
  await run(page, 'open experiencia')
  expect(await moving()).toBe(0)
  await expect(maximized(page)).toHaveCount(1)
  await page.keyboard.press('Escape')
})
