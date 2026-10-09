import { expect, test, type Page } from './support/test'
import { enterPortfolio } from './support/boot'

// Feature 004, US3: header só depois do hero, com meia tela de espaço antes do Sobre
// (quickstart V5, V6; FR-012 a FR-016).
const navState = (page: Page) =>
  page.locator('.navbar').evaluate((nav) => {
    const style = getComputedStyle(nav)
    const hero = document.getElementById('home')!.getBoundingClientRect()
    return {
      visible: style.opacity === '1' && style.pointerEvents !== 'none',
      heroBottom: hero.bottom,
      navHeight: (nav as HTMLElement).offsetHeight,
      shown: nav.classList.contains('nav-shown'),
    }
  })

test.describe('com movimento', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('escondido no hero; aparece em até 300 ms depois que o hero sai; some ao voltar (V5, SC-003)', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)
    expect((await navState(page)).visible).toBe(false)
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    let appeared = false
    for (let y = 0; y < Math.min(height, 2600); y += 50) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
      await page.waitForTimeout(30)
      const state = await navState(page)
      // nunca sobre o hero
      if (state.heroBottom > state.navHeight + 1) expect(state.shown, `y=${y}`).toBe(false)
      if (state.heroBottom <= state.navHeight - 1 && !appeared) {
        appeared = true
        // a transição começa em até 300 ms e dura no máximo 300 ms (FR-012). O atraso é contado em
        // quadros de renderização, dentro da página: a classe chega em até 3 quadros depois da
        // rolagem (< 300 ms a partir de 10 quadros por segundo); em milissegundos, a medida
        // dependeria da carga da máquina dos testes
        await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y - 50)
        await expect.poll(async () => (await navState(page)).shown).toBe(false)
        const frames = await page.evaluate(
          (top) =>
            new Promise<number>((resolve) => {
              const nav = document.querySelector('.navbar')!
              let count = 0
              const tick = () => {
                if (nav.classList.contains('nav-shown')) return resolve(count)
                count++
                requestAnimationFrame(tick)
              }
              window.scrollTo({ top, behavior: 'instant' })
              requestAnimationFrame(tick)
            }),
          y,
        )
        expect(frames).toBeLessThanOrEqual(3)
        const durations = await page.locator('.navbar').evaluate((nav) => getComputedStyle(nav).transitionDuration.split(',').map(parseFloat))
        expect(Math.max(...durations)).toBeLessThanOrEqual(0.3)
        await expect.poll(async () => (await navState(page)).visible, { timeout: 1000 }).toBe(true)
      }
    }
    expect(appeared).toBe(true)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expect.poll(async () => (await navState(page)).visible, { timeout: 600 }).toBe(false)
  })

  test('o header surge no espaço vazio, com o título do Sobre inteiro abaixo dele (SC-003)', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)
    // a posição exata em que o hero sai de baixo do header
    const y = await page.evaluate(() => {
      const hero = document.getElementById('home')!
      return hero.offsetTop + hero.offsetHeight - (document.querySelector('.navbar') as HTMLElement).offsetHeight + 1
    })
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await expect(page.locator('.navbar')).toHaveClass(/nav-shown/)
    const { titleTop, navBottom } = await page.evaluate(() => ({
      titleTop: document.querySelector('#sobre h2')!.getBoundingClientRect().top,
      navBottom: document.querySelector('.navbar')!.getBoundingClientRect().height,
    }))
    expect(titleTop).toBeGreaterThanOrEqual(navBottom)
  })
})

test('Tab desde o topo leva o foco a ~/sobre e revela o header (FR-013)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  await page.keyboard.press('Tab')
  await expect(page.locator('.nav-links a', { hasText: '~/sobre' })).toBeFocused()
  await expect(page.locator('.navbar')).toHaveCSS('opacity', '1')
})

test('chegar por âncora deixa o header visível e o título abaixo dele (FR-015)', async ({ page }) => {
  // com JS, a página abre no hero mesmo com âncora no endereço (feature 006, Q3): a âncora é usada
  // dentro da página, como num clique no menu
  await page.goto('./')
  await enterPortfolio(page)
  await page.evaluate(() => (location.hash = 'projetos'))
  await expect.poll(async () => (await navState(page)).visible).toBe(true)
  const title = (await page.locator('#projetos h2').boundingBox())!
  const nav = (await page.locator('.navbar').boundingBox())!
  expect(title.y).toBeGreaterThanOrEqual(nav.y + nav.height - 1)
})

for (const vp of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`meia tela entre o hero e o título do Sobre em ${vp.width}×${vp.height} (V6, FR-014)`, async ({ page }) => {
    await page.setViewportSize(vp)
    await page.goto('./')
    await enterPortfolio(page)
    const gap = await page.evaluate(() => {
      const hero = document.getElementById('home')!.getBoundingClientRect()
      const title = document.querySelector('#sobre h2')!.getBoundingClientRect()
      return title.top - hero.bottom
    })
    expect(gap).toBeGreaterThanOrEqual(vp.height * 0.45)
    expect(gap).toBeLessThanOrEqual(vp.height * 0.55)
  })
}

test('no celular, o menu aberto fecha quando o hero volta (edge case)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await enterPortfolio(page)
  await page.locator('#sobre').scrollIntoViewIfNeeded()
  await expect.poll(async () => (await navState(page)).visible).toBe(true)
  await page.locator('.nav-toggle').click()
  await expect(page.locator('.nav-toggle')).toHaveAttribute('aria-expanded', 'true')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(page.locator('.nav-toggle')).toHaveAttribute('aria-expanded', 'false')
})

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('a navegação fica como sempre, visível no topo (FR-016)', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)
    await expect(page.locator('.navbar')).toHaveCSS('opacity', '1')
    await expect(page.locator('.nav-links a')).toHaveCount(6)
  })
})
