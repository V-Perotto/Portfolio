import { expect, test, type Locator } from './support/test'
import { enterPortfolio } from './support/boot'

// Feature 003: limpeza visual (quickstart V1–V5): fundo, comandos, títulos, rótulos e links.
test.use({ reducedMotion: 'reduce' })

const PURPLE_GLOW = 'rgb(160, 106, 224)'

const color = (loc: Locator) => loc.evaluate((el) => getComputedStyle(el).color)

/** Onde fica o sublinhado do link: no próprio <a>, ou no caminho/badge de dentro (links de projeto). */
const underlineOf = async (link: Locator) => {
  if (!(await link.evaluate((el) => el.classList.contains('evidence-link')))) return link
  const badge = link.locator('.badge-box img')
  return (await badge.count()) ? badge : link.locator('.evidence-url')
}

const borderBottom = (loc: Locator) =>
  loc.evaluate((el) => {
    const s = getComputedStyle(el)
    return { style: s.borderBottomStyle, width: s.borderBottomWidth, color: s.borderBottomColor, own: s.color }
  })

const glow = (link: Locator) =>
  link.evaluate((el) => {
    const s = getComputedStyle(el)
    return s.textShadow !== 'none' || s.filter !== 'none'
  })

/** Posição do link dentro do pai: o cartão de challenge desliza no hover (Card Slide), o link não. */
const offset = (link: Locator) =>
  link.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const p = el.parentElement!.getBoundingClientRect()
    return { x: r.x - p.x, y: r.y - p.y, w: r.width, h: r.height, transform: getComputedStyle(el).transform }
  })

/** Quantos elementos do link (ele incluído) desenham um sublinhado tracejado. */
const dashedCount = (link: Locator) =>
  link.evaluate((el) => [el, ...el.querySelectorAll('*')].filter((e) => getComputedStyle(e).borderBottomStyle === 'dashed').length)

test('rótulos dos links de projeto no roxo do ">"; nomes dos temas com o neon (V4, FR-006)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  const labels = page.locator('#projetos .t-theme-name > span:not(.prompt-dollar)')
  expect(await labels.count()).toBeGreaterThan(10)
  for (const label of await labels.all()) {
    const neon = await label.evaluate((el) => el.classList.contains('neon'))
    if (neon) expect(await color(label)).not.toBe(PURPLE_GLOW)
    else expect(await color(label), await label.textContent() ?? '').toBe(PURPLE_GLOW)
  }
  await expect(page.locator('#projetos .t-theme-name .neon')).toHaveCount(2)
})

test('todo link de conteúdo sublinhado em repouso; hover e foco só acendem o brilho (V5, FR-007, FR-008)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  // os links visíveis com JS: os dos cartões dentro das janelas de editor (006) só aparecem maximizados,
  // e o mesmo endereço aparece no arquivo YAML aberto (que entra na conta)
  const links = page.locator('a[target="_blank"]').filter({ visible: true })
  expect(await links.count()).toBeGreaterThanOrEqual(16)

  await page.keyboard.press('Tab') // a partir daqui, focus() conta como foco de teclado (:focus-visible)
  for (const link of await links.all()) {
    const name = (await link.textContent())?.trim() ?? ''
    await link.scrollIntoViewIfNeeded()
    const line = await underlineOf(link)
    const rest = await borderBottom(line)
    expect(rest.style, name).toBe('dashed')
    expect(rest.width, name).toBe('1px')
    // os badges dos temas VS Code sublinham na cor do tema (FR-042 da 004); os demais, na cor do link
    const themed = await link.evaluate((el) =>
      el.classList.contains('evidence-grape') ? 'rgb(133, 47, 252)' : el.classList.contains('evidence-sith') ? 'rgb(217, 4, 4)' : null,
    )
    expect(rest.color, name).toBe(themed ?? rest.own)
    expect(await dashedCount(link), name).toBe(1)
    const box = await offset(link)

    await link.hover()
    expect(await glow(link), `hover: ${name}`).toBe(true)
    expect(await borderBottom(line), `hover: ${name}`).toEqual(rest)
    expect(await offset(link), `hover: ${name}`).toEqual(box)

    await page.mouse.move(0, 0)
    await link.focus()
    expect(await link.evaluate((el) => el.matches(':focus-visible')), name).toBe(true)
    expect(await glow(link), `foco: ${name}`).toBe(true)
    expect(await borderBottom(line), `foco: ${name}`).toEqual(rest)
  }
})

test('badge que não carrega: o domínio no lugar leva um sublinhado só (V5, FR-009)', async ({ page }) => {
  await page.route('**/img.shields.io/**', (route) => route.abort())
  await page.goto('./')
  await enterPortfolio(page)
  const badgeLinks = page.locator('#projetos a.evidence-link:has(.badge-box)')
  await expect(badgeLinks).toHaveCount(2)
  for (const link of await badgeLinks.all()) {
    await expect(link.locator('.badge-box img')).toHaveCount(0)
    expect(await borderBottom(link.locator('.evidence-url'))).toMatchObject({ style: 'dashed', width: '1px' })
    expect(await dashedCount(link)).toBe(1)
  }
})

test('menu, botões do hero e "▼ scroll" não recebem o sublinhado (V5, FR-010; o logotipo saiu do header na 004)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  const controls = page.locator('.navbar a, #home a')
  expect(await controls.count()).toBeGreaterThanOrEqual(9)
  const noDashes = async () =>
    controls.evaluateAll((els) =>
      els.filter((el) => [el, ...el.querySelectorAll('*')].some((e) => getComputedStyle(e).borderBottomStyle === 'dashed')).map((el) => el.textContent?.trim()),
    )
  expect(await noDashes()).toEqual([])
  const hover = async (scope: Locator) => {
    for (const control of await scope.all()) {
      if (!(await control.isVisible())) continue
      await control.hover()
      expect(await dashedCount(control), (await control.textContent()) ?? '').toBe(0)
    }
  }
  await hover(page.locator('#home a'))
  // o header só aparece depois do hero (feature 004)
  await page.locator('#sobre').scrollIntoViewIfNeeded()
  await expect(page.locator('.navbar')).toHaveClass(/nav-shown/)
  await hover(page.locator('.navbar a'))
})

test('sem imagens de fundo nas seções (V1, FR-001, SC-001)', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (request) => {
    if (/image\d-bg/.test(request.url())) requested.push(request.url())
  })
  await page.route('**/img.shields.io/**', (route) => route.abort()) // badges externos não importam aqui
  await page.goto('./')
  await enterPortfolio(page)
  await expect(page.locator('.section-decor')).toHaveCount(0)
  for (const id of ['#sobre', '#skills', '#projetos']) {
    // imagens dentro das seções só nos cartões (badges), nunca atrás delas
    const decorative = await page.locator(`${id} img`).evaluateAll((imgs) => imgs.filter((img) => !img.closest('.base-card')).length)
    expect(decorative, id).toBe(0)
  }
  // as imagens antigas eram lazy: rola a página toda antes de conferir as requisições
  for (const id of ['#sobre', '#skills', '#projetos', '#contato']) await page.locator(id).scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  expect(requested).toEqual([])
})

const TEXT_DIM = 'rgb(138, 129, 158)'

test('comandos sem ./run, em Dim Lilac, com o $ roxo, em todas as janelas (V2, FR-003, FR-004)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  expect(await page.locator('body').innerText()).not.toContain('./run')
  const lines = page.locator('#sobre [data-t-cmd], #projetos .projects-grid [data-t-cmd], #contato [data-t-cmd]')
  expect(await lines.count()).toBe(2 + 6 + 2)
  for (const line of await lines.all()) {
    const text = (await line.textContent())?.trim() ?? ''
    expect(await color(line), text).toBe(TEXT_DIM)
    expect(await color(line.locator('.prompt-dollar')), text).toBe(PURPLE_GLOW)
  }
  // destaque próprio dentro de uma linha continua (a mensagem verde do Contato)
  expect(await color(page.locator('#contato [data-t-cmd] .hl-green'))).toBe('rgb(74, 222, 155)')
})

test.describe('com movimento', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('a parte digitada já sai na cor final do comando (V2, FR-005)', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)
    await page.locator('#sobre').scrollIntoViewIfNeeded()
    const typed = page.locator('#sobre .t-typed').first()
    await expect(typed).toBeAttached({ timeout: 1500 })
    expect(await color(typed)).toBe(TEXT_DIM)
  })
})

test('títulos das janelas só com o assunto, sem "bash —" (V3, FR-011)', async ({ page }) => {
  await page.goto('./')
  await enterPortfolio(page)
  await expect(page.locator('.terminal-title')).toHaveText([
    'sobre.txt',
    '~/carreira',
    'SRG',
    'Temas VS Code',
    'ItaliaMi',
    'OCR de Prontuários',
    'QClass-BOT',
    'Monitor de Curso',
    '~/projetos/challenges',
    '~/projetos/comunitario',
    'contato.sh',
  ])
})

// Feature 006, US7 (quickstart V15; FR-028): o favicon é o ícone de terminal da dock, verde, com brilho
// roxo, servido pelo próprio site.
test('favicon: SVG verde com brilho roxo e as versões PNG (V15, FR-028)', async ({ page, request }) => {
  await page.goto('./')
  const links = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((els) =>
    els.map((el) => ({ rel: el.getAttribute('rel'), href: (el as HTMLLinkElement).href, type: el.getAttribute('type') })),
  )
  expect(links.map((l) => new URL(l.href).pathname)).toEqual(['/Portfolio/favicon-32.png', '/Portfolio/favicon.svg', '/Portfolio/apple-touch-icon.png'])
  for (const link of links) {
    const response = await request.get(link.href)
    expect(response.status(), link.href).toBe(200)
    expect(response.headers()['content-type'], link.href).toMatch(link.href.endsWith('.svg') ? /image\/svg\+xml/ : /image\/png/)
  }
  const svg = await (await request.get(links[1]!.href)).text()
  expect(svg).toContain('stroke="#4ade9b"') // --green-bright
  expect(svg).toContain('fill="#0a0612"') // --bg
  expect(svg).toContain('fill="#7b3fb3"') // --purple-light, o brilho
  expect(svg).toContain('feGaussianBlur')
})
