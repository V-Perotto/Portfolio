import { expect, test, type Locator, type Page } from './support/test'
import { enterPortfolio } from './support/boot'
import { gotoGate, openGate } from './support/gate'

// Feature 005, US4: os controles das janelas com os ícones minus, maximize-2 e x do Lucide, centrados
// nos círculos (quickstart V12; FR-022 a FR-024; SC-005).
test.use({ reducedMotion: 'reduce' })

const ICON = { 't-min': 'lucide-minus', 't-max': 'lucide-maximize-2', 't-close': 'lucide-x' } as const

/** Para cada controle da barra: a classe do ícone, o tamanho e a distância entre os centros. */
async function measure(bar: Locator) {
  return bar.locator('.t-btn').evaluateAll((buttons) =>
    buttons.map((btn) => {
      const kind = ['t-min', 't-max', 't-close'].find((c) => btn.classList.contains(c))!
      const svg = btn.querySelector('svg')!
      const b = btn.getBoundingClientRect()
      const s = svg.getBoundingClientRect()
      return {
        kind,
        svgClass: svg.getAttribute('class') ?? '',
        width: s.width,
        height: s.height,
        dx: Math.abs(b.left + b.width / 2 - (s.left + s.width / 2)),
        dy: Math.abs(b.top + b.height / 2 - (s.top + s.height / 2)),
        text: btn.textContent?.trim() ?? '',
      }
    }),
  )
}

async function expectCentered(bar: Locator, kinds: string[]) {
  const controls = await measure(bar)
  expect(controls.map((c) => c.kind)).toEqual(kinds)
  for (const c of controls) {
    expect(c.svgClass, c.kind).toContain(ICON[c.kind as keyof typeof ICON])
    expect(c.width, c.kind).toBe(12)
    expect(c.height, c.kind).toBe(12)
    expect(c.dx, `${c.kind}: centro em x`).toBeLessThanOrEqual(0.5)
    expect(c.dy, `${c.kind}: centro em y`).toBeLessThanOrEqual(0.5)
    expect(c.text, `${c.kind}: sem o caractere antigo`).toBe('')
  }
}

const bar = (page: Page, title: string) => page.locator('.terminal-window', { has: page.locator('.terminal-title', { hasText: title }) }).first().locator('.terminal-bar')

test('janelas da página: sobre.txt, SRG e contato.sh (V12, FR-022, FR-023)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  for (const title of ['sobre.txt', 'SRG', 'contato.sh']) await expectCentered(bar(page, title), ['t-min', 't-max', 't-close'])
  // nomes acessíveis inalterados (FR-024)
  await expect(bar(page, 'SRG').locator('button.t-min')).toHaveAttribute('aria-label', 'Minimizar SRG')
  await expect(bar(page, 'SRG').locator('button.t-close')).toHaveAttribute('aria-label', 'Fechar SRG')
  await expect(bar(page, 'SRG').locator('.t-max')).toHaveAttribute('aria-hidden', 'true')
})

test('terminal da dock (FR-022)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  await page.locator('.app-dock .dock-btn').click()
  await expectCentered(page.locator('#dock-terminal .terminal-bar'), ['t-min', 't-max', 't-close'])
})

test('janela da porta de acesso: só minimizar e fechar (FR-006, FR-022)', async ({ page }) => {
  await gotoGate(page)
  await openGate(page)
  await expectCentered(page.locator('.gate-window .terminal-bar'), ['t-min', 't-close'])
})

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('os mesmos ícones, decorativos (FR-024)', async ({ page }) => {
    await page.goto('./')
    const controls = page.locator('.t-controls').first()
    await expect(controls).toHaveAttribute('aria-hidden', 'true')
    await expectCentered(page.locator('.terminal-bar').first(), ['t-min', 't-max', 't-close'])
    await expect(page.locator('.t-controls button')).toHaveCount(0)
  })
})

// Feature 006, US7 (quickstart V13; FR-025, SC-008): o □ das janelas que não maximizam fica com aparência
// de desativado e não reage ao hover; nas janelas de editor, ele é um botão.
test.describe('□ desativado (006)', () => {
  test.use({ reducedMotion: 'reduce' })

  async function expectDisabled(page: Page, max: Locator, label: string) {
    await max.scrollIntoViewIfNeeded()
    const style = await max.evaluate((el) => ({ opacity: Number(getComputedStyle(el).opacity), cursor: getComputedStyle(el).cursor, tag: el.tagName }))
    expect(style.tag, label).toBe('SPAN')
    expect(style.opacity, label).toBeLessThanOrEqual(0.4)
    expect(style.cursor, label).toBe('default')
    await page.mouse.move(0, 0)
    const rest = await max.screenshot()
    await max.hover({ force: true })
    await page.waitForTimeout(250) // as transições de 0,15 s terminariam aqui
    const hover = await max.screenshot()
    expect(hover.equals(rest), `${label}: o mesmo desenho com o ponteiro em cima`).toBe(true)
  }

  test('sobre.txt, um projeto, contato.sh e o terminal da dock (V13)', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)
    for (const title of ['sobre.txt', 'SRG', 'contato.sh']) await expectDisabled(page, bar(page, title).locator('.t-max'), title)
    await page.locator('.app-dock .dock-btn').click()
    await expectDisabled(page, page.locator('#dock-terminal .t-max'), 'terminal da dock')
  })

  test('nas janelas de editor, o □ é um botão que maximiza (FR-013)', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)
    for (const title of ['~/carreira', '~/projetos/challenges', '~/projetos/comunitario']) {
      const max = bar(page, title).locator('.t-max')
      await expect(max).toHaveJSProperty('tagName', 'BUTTON')
      await expect(max).toHaveAttribute('aria-label', `Maximizar ${title}`)
      expect(await max.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1)
    }
  })
})
