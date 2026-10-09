import { expect, test, type Page } from './support/test'
import { COMMAND, gateState, gotoGate, openGate, uncoveredAt, visibleLineTexts } from './support/gate'

// Feature 005, US1: a porta de acesso `acessar_portfolio.sh` (quickstart V1, V2, V4 a V8; FR-001 a
// FR-012, FR-018, FR-019; contracts/access-gate.md). O Faulty Terminal e o tempo com a CPU lenta estão
// em boot.spec.ts (projeto com WebGL).
test.use({ reducedMotion: 'no-preference' })

/** OPEN_MS + SESSION_MS de src/lib/boot.ts: do clique ao fim da sessão. */
const SESSION_END = 320 + 2720

const icon = (page: Page) => page.locator('.gate-icon')
const win = (page: Page) => page.locator('.gate-window')

test('porta na carga: só o ícone e a dica no centro, foco no ícone, página inerte (V1, FR-001 a FR-003)', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 })
  await gotoGate(page)
  await expect(icon(page)).toBeVisible()
  await expect(icon(page)).toBeFocused()
  await expect(icon(page)).toHaveAttribute('aria-label', 'Abrir acessar_portfolio.sh')
  await expect(page.locator('#gate-hint')).toHaveText('# clique no ícone para conectar')
  await expect(win(page)).toBeHidden()
  await expect(page.locator('.access-gate')).toHaveAttribute('role', 'dialog')

  const box = (await icon(page).boundingBox())!
  expect(Math.abs(box.x + box.width / 2 - 683)).toBeLessThanOrEqual(2)
  expect(Math.abs(box.y + box.height / 2 - 400)).toBeLessThanOrEqual(60)

  const allInert = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('#app > *')].filter((el) => !el.classList.contains('access-gate')).every((el) => el.inert),
  )
  expect(allInert).toBe(true)

  // nem o Tab nem um clique fora levam à página
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Tab')
    const outside = await page.evaluate(() => {
      const el = document.activeElement
      return !!el && el !== document.body && !el.closest('.access-gate')
    })
    expect(outside).toBe(false)
  }
  await page.mouse.click(20, 20)
  await page.waitForTimeout(300)
  await expect(page.locator('html')).toHaveClass(/\bbooting\b/)
  expect(await gateState(page)).toBe('idle')
})

test('abrir: ≤ 400 ms, tamanho fixo, só minimizar e fechar, cursor na linha em curso (V2, FR-004 a FR-006, FR-018)', async ({ page }) => {
  await gotoGate(page)
  await openGate(page)
  await expect(win(page)).toBeVisible()
  const duration = await win(page).evaluate((el) => Math.max(0, ...el.getAnimations().map((a) => Number(a.effect?.getTiming().duration ?? 0))))
  expect(duration).toBeLessThanOrEqual(400)
  await expect(page.locator('.gate-window button.t-min')).toHaveAttribute('aria-label', 'Minimizar acessar_portfolio.sh')
  await expect(page.locator('.gate-window button.t-close')).toHaveAttribute('aria-label', 'Fechar acessar_portfolio.sh')
  await expect(page.locator('.gate-window .t-max')).toHaveCount(0)
  await expect(page.locator('.gate-window button.t-min')).toBeFocused()

  // espera o fim da animação de abrir e amostra a altura e os cursores até o fim da sessão
  await page.waitForTimeout(350)
  const heights = new Set<number>()
  for (let i = 0; i < 26; i++) {
    const sample = await page.evaluate(() => {
      const w = document.querySelector('.gate-window')
      if (!w) return null
      const cursors = [...document.querySelectorAll('.gate-session .cursor')].filter((c) => !c.closest('.boot-pending'))
      return { height: Math.round(w.getBoundingClientRect().height * 2) / 2, cursors: cursors.length, visible: document.querySelectorAll('.gate-session .boot-line:not(.boot-pending)').length }
    })
    if (!sample || !(await page.locator('html').evaluate((el) => el.classList.contains('booting')))) break
    heights.add(sample.height)
    if (sample.visible > 0) expect(sample.cursors).toBe(1)
    await page.waitForTimeout(100)
  }
  expect(heights.size).toBe(1)
})

test('Enter e Espaço também abrem; cliques repetidos não abrem outra janela nem reiniciam (FR-004)', async ({ page }) => {
  await gotoGate(page)
  await expect(icon(page)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(win(page)).toBeVisible()

  await gotoGate(page)
  await expect(icon(page)).toBeFocused()
  await page.keyboard.press(' ')
  await expect(win(page)).toBeVisible()

  await gotoGate(page)
  await expect(icon(page)).toBeVisible()
  await page.evaluate(() => {
    const el = document.querySelector<HTMLButtonElement>('.gate-icon')!
    el.click()
    el.click()
    el.click()
  })
  await expect(win(page)).toHaveCount(1)
  await page.waitForTimeout(320 + 1100)
  const lines = await visibleLineTexts(page)
  expect(lines[0]).toBe('anon@203.0.113.7:~$ ssh viper@portfolio')
  expect(lines.length).toBeGreaterThanOrEqual(3)
})

test('teclas e cliques durante a sessão não pulam nem aceleram (FR-019)', async ({ page }) => {
  await gotoGate(page)
  const t0 = await openGate(page)
  await page.waitForTimeout(500)
  for (const key of ['Escape', 'Enter', ' ', 'x']) await page.keyboard.press(key)
  const body = (await page.locator('.gate-session').boundingBox())!
  await page.mouse.click(body.x + 20, body.y + 10)
  await page.mouse.click(10, 10)
  const at = await uncoveredAt(page)
  expect(at - t0).toBeGreaterThanOrEqual(SESSION_END - 40)
  expect(at - t0).toBeLessThanOrEqual(4000)
})

test('minimizar: a sessão continua; reabrir mostra o ponto atual; minimizada até o fim, a página abre (V4, FR-007)', async ({ page }) => {
  await gotoGate(page)
  const t0 = await openGate(page)
  await page.waitForTimeout(320 + 300)
  const before = await visibleLineTexts(page)
  await page.locator('.gate-window button.t-min').click()
  expect(await gateState(page)).toBe('minimized')
  await expect(icon(page)).toBeFocused()
  await expect(page.locator('#gate-hint')).toBeVisible()
  await expect(page.locator('html')).toHaveClass(/\bbooting\b/)

  await page.waitForTimeout(600)
  await icon(page).click()
  await expect(win(page)).toBeVisible()
  const after = await visibleLineTexts(page)
  expect(after.length).toBeGreaterThanOrEqual(before.length)
  expect(after.length).toBeGreaterThanOrEqual(2)
  expect(after[0]).toBe('anon@203.0.113.7:~$ ssh viper@portfolio')

  await page.locator('.gate-window button.t-min').click()
  const at = await uncoveredAt(page)
  expect(at - t0).toBeLessThanOrEqual(4000)
  await expect(page.locator('.access-gate')).toHaveCount(0)
})

test('minimizar durante a animação de abrir também funciona (edge case)', async ({ page }) => {
  await gotoGate(page)
  await openGate(page)
  await page.locator('.gate-window button.t-min').click()
  expect(await gateState(page)).toBe('minimized')
  await expect(icon(page)).toBeVisible()
})

test('fechar encerra a tentativa, mesmo no último instante; o ícone abre uma nova desde a linha 1 (V5, FR-008)', async ({ page }) => {
  await gotoGate(page)
  await openGate(page)
  await page.waitForTimeout(320 + 1000)
  await page.locator('.gate-window button.t-close').click()
  expect(await gateState(page)).toBe('idle')
  await expect(icon(page)).toBeFocused()
  await expect(page.locator('#gate-hint')).toBeVisible()
  await expect(page.locator('.access-gate [role="status"]')).toHaveText('Conexão encerrada')
  await page.waitForTimeout(4000)
  await expect(page.locator('html')).toHaveClass(/\bbooting\b/)

  // de novo, fechando depois do último caractere do comando, antes da pausa final acabar
  await icon(page).click()
  await page.waitForFunction(
    (command) =>
      [...document.querySelectorAll('.gate-session .boot-line:not(.boot-pending)')].some((el) => {
        const clone = el.cloneNode(true) as HTMLElement
        clone.querySelectorAll('.text-type-ghost, .cursor').forEach((n) => n.remove())
        return clone.textContent?.trim() === command
      }),
    COMMAND,
    { polling: 10, timeout: 5000 },
  )
  await page.locator('.gate-window button.t-close').click()
  await page.waitForTimeout(1000)
  await expect(page.locator('html')).toHaveClass(/\bbooting\b/)
  expect(await gateState(page)).toBe('idle')

  // a nova tentativa começa do zero
  await icon(page).click()
  await page.waitForTimeout(150)
  expect(await visibleLineTexts(page)).toEqual([])
  await page.waitForTimeout(320 + 100)
  const lines = await visibleLineTexts(page)
  expect(lines).toHaveLength(1)
  expect(lines[0]!.length).toBeLessThan('anon@203.0.113.7:~$ ssh viper@portfolio'.length)
})

// Feature 006, US2 (quickstart V10; FR-020, FR-021, SC-004, clarify Q3): no fim da porta, a página
// aparece sempre no topo, no hero, sem âncora no endereço (substitui o V8 da 005, que ia à seção)
test('recarregar depois de rolar: no fim, a página no topo (V10, FR-020, SC-004)', async ({ page }) => {
  await gotoGate(page)
  await openGate(page)
  await uncoveredAt(page)
  await page.evaluate(() => window.scrollTo({ top: 2500, behavior: 'instant' }))
  await page.waitForTimeout(200)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('.gate-icon')).toBeVisible({ timeout: 7500 })
  expect(await page.evaluate(() => history.scrollRestoration)).toBe('manual')
  await openGate(page)
  await uncoveredAt(page)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await expect(page.locator('#home h1')).toBeInViewport()
})

for (const hash of ['#projetos', '#contato']) {
  test(`âncora ${hash} no endereço, aberta e recarregada: no fim, o hero no topo e o endereço sem âncora (V10, FR-021)`, async ({ page }) => {
    await gotoGate(page, `./${hash}`)
    const before = await page.evaluate(() => history.length)
    await openGate(page)
    await uncoveredAt(page)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    expect(await page.evaluate(() => location.hash)).toBe('')
    expect(await page.evaluate(() => history.length)).toBe(before)
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true)

    // recarregar com a âncora de novo no endereço (como depois de um clique no menu)
    await page.evaluate((h) => history.replaceState(null, '', h), hash)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('.gate-icon')).toBeVisible({ timeout: 7500 })
    await openGate(page)
    await uncoveredAt(page)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    expect(await page.evaluate(() => location.hash)).toBe('')
  })
}

test('sem âncora: no fim, o foco volta ao início do documento, e o Tab chega à navegação (FR-009)', async ({ page }) => {
  await gotoGate(page)
  await openGate(page)
  await uncoveredAt(page)
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true)
  await expect(page.locator('.access-gate')).toHaveCount(0, { timeout: 2000 })
  const inert = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#app > *')].some((el) => el.inert))
  expect(inert).toBe(false)
})

test('320 px: a janela cabe inteira, sem rolagem horizontal (FR-005, FR-021)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await gotoGate(page)
  await openGate(page)
  await page.waitForTimeout(400)
  const { box, scroll } = await page.evaluate(() => {
    const r = document.querySelector('.gate-window')!.getBoundingClientRect()
    return { box: { left: r.left, right: r.right, top: r.top, bottom: r.bottom }, scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth }
  })
  expect(box.left).toBeGreaterThanOrEqual(0)
  expect(box.right).toBeLessThanOrEqual(320)
  expect(box.top).toBeGreaterThanOrEqual(0)
  expect(box.bottom).toBeLessThanOrEqual(640)
  expect(scroll).toBeLessThanOrEqual(0)
})

test.describe('movimento reduzido (V6, FR-012)', () => {
  test.use({ reducedMotion: 'reduce' })

  test('porta de fundo liso; sessão inteira na hora; página em até 1,2 s, sem fade', async ({ page }) => {
    await gotoGate(page)
    await expect(icon(page)).toBeVisible()
    await expect(page.locator('.access-gate canvas')).toHaveCount(0)
    const t0 = await openGate(page)
    await expect(win(page)).toBeVisible()
    expect(await page.locator('.gate-session .boot-pending').count()).toBe(0)
    expect(await visibleLineTexts(page)).toHaveLength(6)
    const at = await uncoveredAt(page)
    expect(at - t0).toBeLessThanOrEqual(1200)
    await expect(page.locator('.access-gate')).toHaveCount(0)
  })
})

test.describe('tela de toque', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  test('a dica fala em tocar (FR-001)', async ({ page }) => {
    await gotoGate(page)
    await expect(page.locator('#gate-hint')).toHaveText('# toque no ícone para conectar')
  })
})

test.describe('JavaScript atrasado (V7, FR-011)', () => {
  test('bundle atrasado 2,5 s: sem porta, e a página aparece direto', async ({ page }) => {
    await page.route('**/assets/*.js', async (route) => {
      await new Promise((r) => setTimeout(r, 2500))
      await route.continue()
    })
    await page.goto('./', { waitUntil: 'commit' })
    await page.waitForFunction(() => document.documentElement.classList.contains('app-loaded'), null, { timeout: 9000 })
    await page.waitForTimeout(300)
    await expect(page.locator('.access-gate')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveClass(/\bbooting\b/)
  })

  test('bundle atrasado com âncora: sem porta, a página fica na âncora (V11, FR-022)', async ({ page }) => {
    await page.route('**/assets/*.js', async (route) => {
      await new Promise((r) => setTimeout(r, 2500))
      await route.continue()
    })
    await page.goto('./#projetos', { waitUntil: 'commit' })
    await page.waitForFunction(() => document.documentElement.classList.contains('app-loaded'), null, { timeout: 9000 })
    await page.waitForTimeout(600)
    await expect(page.locator('.access-gate')).toHaveCount(0)
    expect(await page.evaluate(() => location.hash)).toBe('#projetos')
    const top = await page.locator('#projetos').evaluate((el) => el.getBoundingClientRect().top)
    expect(Math.abs(top)).toBeLessThanOrEqual(120)
  })

  test('bundle bloqueado: a capa sai em ~2,1 s', async ({ page }) => {
    await page.route('**/assets/*.js', (route) => route.abort())
    await page.goto('./', { waitUntil: 'commit' })
    const at = await uncoveredAt(page, 5000)
    expect(at).toBeGreaterThanOrEqual(2055)
    expect(at).toBeLessThan(2055 + 300)
  })
})
