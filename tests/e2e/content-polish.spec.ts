import { expect, mockIpService, test } from './support/test'
import { enterPortfolio } from './support/boot'

// Feature 004, US7: rodapé, chip JSON, sublinhados dos badges, logotipo do Valkey e papel do ItaliaMi
// (quickstart V15; FR-040 a FR-043, FR-047).
test.use({ reducedMotion: 'reduce' })

const card = (page: import('@playwright/test').Page, name: string) =>
  page.locator('#projetos .desktop-window').filter({ has: page.locator('.terminal-title', { hasText: new RegExp(`^${name}$`) }) })

test('rodapé com só o echo do copyright (FR-040)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  const footer = page.locator('footer.footer')
  await expect(footer.locator('p')).toHaveCount(1)
  await expect(footer).toHaveText(`$ echo "© ${new Date().getFullYear()} Vittorio Perotto"`)
  await expect(footer).not.toContainText('exit code')
  await expect(footer).not.toContainText('feito com')
})

test('Temas VS Code com o chip JSON (FR-041)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  const stack = card(page, 'Temas VS Code').locator('.project-stack')
  await expect(stack).toContainText('JSON')
  await expect(stack).not.toContainText('JSON de tema')
})

test('sublinhado de cada badge na cor do tema, também no domínio quando o badge falha (FR-042)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  const color = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).borderBottomColor)
  expect(await color('.evidence-grape .badge-box img')).toBe('rgb(133, 47, 252)')
  expect(await color('.evidence-sith .badge-box img')).toBe('rgb(217, 4, 4)')

  await page.route('**/img.shields.io/**', (route) => route.abort())
  await page.reload()
  await enterPortfolio(page)
  await expect(page.locator('.evidence-grape .badge-box .evidence-url')).toBeVisible()
  expect(await color('.evidence-grape .badge-box .evidence-url')).toBe('rgb(133, 47, 252)')
  expect(await color('.evidence-sith .badge-box .evidence-url')).toBe('rgb(217, 4, 4)')
})

test('Valkey com o logotipo do dashboard-icons no chip do SRG e no loop (FR-043)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  const href = (scope: import('@playwright/test').Locator) =>
    scope.locator('li', { hasText: /^\s*Valkey/ }).first().locator('use').getAttribute('href')
  expect(await href(card(page, 'SRG').locator('.project-stack'))).toMatch(/#dashboard-valkey$/)
  expect(await href(page.locator('#skills .skill-loop').nth(4).locator('ul:not([aria-hidden])'))).toMatch(/#dashboard-valkey$/)
})

test('papel no ItaliaMi: Autor e desenvolvedor (FR-047)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  const meta = card(page, 'ItaliaMi').locator('.project-meta')
  await expect(meta.locator('div', { hasText: 'papel' }).locator('dd')).toHaveText('Autor e desenvolvedor')
})

// Feature 007, US4 (quickstart V16; FR-022, FR-023, SC-007): o texto do Sobre na cor padrão de escrita.
for (const javaScriptEnabled of [true, false]) {
  test(`Sobre: texto em --text, como a descrição dos projetos; comandos em Dim Lilac (V16, ${javaScriptEnabled ? 'com' : 'sem'} JS)`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled, reducedMotion: 'reduce' })
    await mockIpService(context)
    const page = await context.newPage()
    await page.goto('http://localhost:4173/Portfolio/')
    if (javaScriptEnabled) await enterPortfolio(page)
    const color = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).color)
    const about = await color('#sobre .about-text')
    expect(about).toBe('rgb(216, 210, 228)')
    expect(about).toBe(await color('#projetos .t-desc'))
    expect(await color('#sobre .about-text .hl-green')).not.toBe(about)
    await expect(page.locator('#sobre .about-text')).toContainText('Analista de Sistemas e Desenvolvedor Fullstack.')
    for (const line of await page.locator('#sobre .t-line').all()) expect(await line.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(138, 129, 158)')
    await context.close()
  })
}

// Feature 007, US5 (quickstart V17; FR-024, FR-025, SC-008): a tagline mais curta.
const TAGLINE = 'Transformando processos em sistemas escaláveis'

test('tagline curta no HTML publicado; SEO sem mudança (V17, FR-024, FR-025)', async () => {
  const { readFileSync } = await import('node:fs')
  const html = readFileSync('dist/index.html', 'utf8')
  // o texto inteiro, terminado ali (depois dele, só o comentário de fragmento do Vue e o fim da tag)
  expect(html).toMatch(new RegExp(`${TAGLINE}(<!--\\]-->)?</`))
  expect(html).not.toContain('de APIs a agentes de IA.')
  // os metadados de SEO não usam a tagline e não mudam (os de profile.seo em src/data/resume.ts)
  expect(html).toContain('<title>Vittorio Perotto — Desenvolvedor Fullstack</title>')
  expect(html).toContain(
    'Portfólio de Vittorio Perotto — Analista de Sistemas e Desenvolvedor Fullstack em Curitiba-PR. Java (Quarkus), Python, TypeScript, arquitetura de sistemas e agentes de IA.',
  )
})

for (const mode of ['motion', 'reduce', 'nojs'] as const) {
  test(`tagline exata no hero, ${mode} (V17, SC-008)`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'nojs', reducedMotion: mode === 'motion' ? 'no-preference' : 'reduce' })
    await mockIpService(context)
    const page = await context.newPage()
    await page.goto('http://localhost:4173/Portfolio/')
    if (mode !== 'nojs') await enterPortfolio(page)
    const sub = page.locator('#home .hero-sub')
    // o texto lido (o .sr-only com movimento, o próprio texto sem) e o que aparece na tela
    await expect(sub.locator('.sr-only')).toHaveCount(mode === 'motion' ? 1 : 0)
    if (mode === 'motion') await expect(sub.locator('.sr-only')).toHaveText(TAGLINE)
    await expect
      .poll(() => sub.evaluate((el) => [...el.querySelectorAll(':scope > :not(.sr-only)')].map((c) => c.textContent).join('').replace(/\s+/g, ' ').trim() || el.textContent!.trim()))
      .toBe(TAGLINE)
    await context.close()
  })
}
