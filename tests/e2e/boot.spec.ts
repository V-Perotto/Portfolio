import { expect, test } from './support/test'
import { contrastRatio, luminanceOf, maxLuminance } from './support/contrast'
import { COMMAND, enterAndMeasure, gotoGate } from './support/gate'
import { noWebGL } from './support/webgl'

// Feature 005, US1 com WebGL: a porta de acesso sobre o Faulty Terminal (quickstart V3 e V11;
// FR-001, FR-009, FR-011, FR-019; constituição v3.0.0: página descoberta em até 4 s depois do clique).
test.use({ reducedMotion: 'no-preference' })

const AFTER_CLICK = 4000
const RUNS = Number(process.env.BOOT_RUNS ?? 10)

for (const vp of [
  { name: 'desktop', width: 1366, height: 800, cpu: 1 },
  { name: 'celular com CPU 4× mais lenta', width: 390, height: 844, cpu: 4 },
]) {
  test(`do clique à página descoberta em até 4 s, sessão inteira, ${vp.name} (V3, SC-002, FR-019)`, async ({ page }) => {
    test.setTimeout(30_000 + RUNS * 10_000)
    await page.setViewportSize({ width: vp.width, height: vp.height })
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: vp.cpu })
    let worst = 0
    for (let i = 0; i < RUNS; i++) {
      await gotoGate(page)
      const { ms, lastAtExit, count } = await enterAndMeasure(page)
      worst = Math.max(worst, ms)
      expect(ms, `carga ${i + 1}`).toBeLessThanOrEqual(AFTER_CLICK)
      expect(count, `carga ${i + 1}`).toBe(6)
      expect(lastAtExit, `carga ${i + 1}`).toBe(COMMAND)
    }
    console.log(`${vp.name}: pior caso do clique à página descoberta em ${Math.round(worst)} ms (${RUNS} cargas)`)
  })
}

test('com WebGL: o Faulty Terminal fica atrás do ícone (FR-001)', async ({ page }) => {
  await gotoGate(page)
  await expect(page.locator('.gate-icon')).toBeVisible()
  await expect(page.locator('.access-gate .gate-bg canvas')).toHaveCount(1)
  await expect(page.locator('.access-gate .gate-bg')).toHaveAttribute('aria-hidden', 'true')
})

test('sem WebGL: porta de fundo liso, sessão inteira e console sem erro (FR-011)', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.addInitScript(noWebGL)
  await gotoGate(page)
  await expect(page.locator('.gate-icon')).toBeVisible()
  await expect(page.locator('.access-gate canvas')).toHaveCount(0)
  const { lastAtExit } = await enterAndMeasure(page)
  expect(lastAtExit).toBe(COMMAND)
  expect(errors).toEqual([])
})

test('nome do ícone e dica com contraste ≥ 4,5:1 sobre o Faulty Terminal, em 10 quadros (V11, FR-001)', async ({ page }) => {
  await gotoGate(page)
  await expect(page.locator('.gate-icon')).toBeVisible()
  // tira o foco do ícone (o realce do foco é outro fundo, também medido abaixo no estado normal)
  await page.waitForTimeout(2200) // a animação de carregamento do Faulty Terminal acende as células em 2 s
  const colors = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement)
    return { text: css.getPropertyValue('--text').trim(), dim: css.getPropertyValue('--text-dim').trim() }
  })
  await page.addStyleTag({ content: '.gate-icon .desktop-icon-label, .gate-hint { color: transparent !important; }' })
  const label = page.locator('.gate-icon .desktop-icon-label')
  const hint = page.locator('.gate-hint')
  for (let i = 0; i < 10; i++) {
    const boxes = [(await label.boundingBox())!, (await hint.boundingBox())!]
    const [labelMax, hintMax] = await maxLuminance(page, boxes)
    expect(contrastRatio(luminanceOf(colors.text), labelMax!), `quadro ${i + 1}, nome`).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(luminanceOf(colors.dim), hintMax!), `quadro ${i + 1}, dica`).toBeGreaterThanOrEqual(4.5)
    await page.waitForTimeout(150)
  }
})
