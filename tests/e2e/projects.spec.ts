import { expect, test, type Page } from './support/test'
import { enterPortfolio } from './support/boot'

// Feature 002, seção de projetos e educação (quickstart V1–V7). Sem movimento: o conteúdo final.
test.use({ reducedMotion: 'reduce' })

const cards = (page: Page) => page.locator('#projetos .projects-grid > li')
const card = (page: Page, name: string) => cards(page).filter({ has: page.locator('h3', { hasText: name }) })

test.describe('projetos um por linha (US1)', () => {
  for (const width of [1440, 768, 320]) {
    test(`nenhum par de cartões lado a lado em ${width}px (V1, SC-001)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('./#projetos')
      await enterPortfolio(page)
      const tops = await cards(page).evaluateAll((items) => items.map((li) => Math.round(li.getBoundingClientRect().top)))
      expect(tops.length).toBeGreaterThan(1)
      expect(new Set(tops).size).toBe(tops.length)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('todo projeto, exceto o acadêmico, tem link isolado no próprio cartão (V2, SC-002)', async ({ page }) => {
    await page.goto('./#projetos')
    await enterPortfolio(page)
    const count = await cards(page).count()
    for (let i = 0; i < count; i++) {
      const item = cards(page).nth(i)
      const name = (await item.locator('h3').textContent()) ?? ''
      if (name.includes('Monitor de Curso')) {
        await expect(item.locator('a')).toHaveCount(0)
        continue
      }
      const links = item.locator('a[target="_blank"][rel="noopener noreferrer"]')
      expect(await links.count(), name).toBeGreaterThan(0)
    }
  })
})

// links privados: "privado" visível e o aviso no nome acessível (FR-005, FR-006)
async function expectPrivateLinks(page: Page, name: string, hrefs: string[]) {
  const item = card(page, name)
  const links = item.locator('a')
  await expect(links).toHaveCount(hrefs.length)
  for (const [i, href] of hrefs.entries()) {
    const link = links.nth(i)
    await expect(link).toHaveAttribute('href', href)
    await expect(link.locator('.private-tag')).toHaveText('privado')
    await expect(link).toHaveAccessibleName(/repositório privado, pode não abrir/)
  }
  const note = hrefs.length > 1 ? '# repositórios privados: podem abrir' : '# repositório privado: pode abrir'
  await expect(item.locator('.no-evidence', { hasText: note })).toBeVisible()
}

test('ItaliaMi com os 3 repositórios privados (US2, V3)', async ({ page }) => {
  await page.goto('./#projetos')
  await enterPortfolio(page)
  await expectPrivateLinks(page, 'ItaliaMi', [
    'https://github.com/V-Perotto/ItaliaMi-Back',
    'https://github.com/V-Perotto/ItaliaMi-Front',
    'https://github.com/V-Perotto/ItaliaMi-BOT',
  ])
  await expect(card(page, 'ItaliaMi')).not.toContainText('sem link público')
})

test('projetos privados ligados à Quadritech (US3, FR-009)', async ({ page }) => {
  await page.goto('./#projetos')
  await enterPortfolio(page)
  for (const [name, href] of [
    ['OCR de Prontuários', 'https://github.com/V-Perotto/OCR_Para_BR'],
    ['QClass-BOT', 'https://github.com/V-Perotto/QClass-BOT'],
  ] as const) {
    await expect(card(page, name).locator('.project-meta')).toContainText('Quadritech Tecnologia')
    await expectPrivateLinks(page, name, [href])
  }
})

test('SRG primeiro, em desenvolvimento, e ordem de relevância da lista (US4, FR-004, FR-013)', async ({ page }) => {
  await page.goto('./#projetos')
  await enterPortfolio(page)
  const names = await cards(page).locator('h3 .hl-purple').allTextContents()
  // feature 009 (Q2): o DebianServer em 2º, com o selo EM PRODUÇÃO
  expect(names).toEqual(['SRG', 'DebianServer', 'Temas VS Code', 'ItaliaMi', 'OCR de Prontuários', 'QClass-BOT', 'Monitor de Curso'])

  await expect(page.locator('#projetos .tag-now')).toHaveCount(2)
  await expect(card(page, 'DebianServer').locator('.tag-now')).toHaveText('EM PRODUÇÃO')
  await expect(card(page, 'SRG').locator('.tag-now')).toHaveText('EM DESENVOLVIMENTO')
  await expect(card(page, 'SRG')).not.toContainText('PRESENTE')
  await expectPrivateLinks(
    page,
    'SRG',
    ['SRG-Vue', 'SRG-Admin', 'SRG-Node', 'SRG-Core', 'SRG-DEVOPS'].map((r) => `https://github.com/V-Perotto/${r}`),
  )
})

// Feature 009 (quickstart V2, V3; FR-007 a FR-017; SC-001): a janela do DebianServer, completa, em 4 larguras
// os fatos do data-model §2 da 009 (as respostas do autor), como o visitante os lê
const SERVER = {
  purpose:
    'Servidor caseiro self-hosted num notebook reaproveitado: guarda as fotos do celular, dá acesso à IA local, a uma Wikipedia offline e à sincronização de notas, sem depender de nuvem de terceiros.',
  meta: [
    'Autor: instalação, configuração e manutenção',
    'side-project',
    '01 OUT 2026',
    'Notebook reaproveitado: Lenovo ideapad 330-15IKB, Intel Core i5-8250U',
    'CasaOS sobre Debian 13, com os apps em containers Docker',
    'Tailscale (VPN) de fora de casa, sem porta aberta na internet; no celular, os arquivos por SMB',
  ],
  stack: ['Debian', 'CasaOS', 'Docker', 'Tailscale', 'Ollama', 'Samba'],
  apps: [
    ['Ente Photos', 'simpleicons-ente', 'Backup automático das fotos e vídeos do celular, criptografados de ponta a ponta e guardados no próprio servidor, no lugar de uma nuvem de terceiros.'],
    ['OpenWebUI', 'dashboard-open-webui', 'Interface de chat com IA: serve de ponte para os modelos locais (Ollama) que rodam no desktop, numa RTX 3060 de 12 GB, e pesquisa na web pelo SearXNG.'],
    ['Kiwix', 'simpleicons-kiwix', 'Cópia offline da Wikipedia em português.'],
    ['Syncthing', 'simpleicons-syncthing', 'Mantém o cofre do Obsidian sincronizado entre o desktop, o celular e o servidor.'],
    ['SearXNG', 'simpleicons-searxng', 'Metabuscador próprio, usado como fonte de busca na web do OpenWebUI.'],
    ['Watchtower', 'simpleicons-watchtower', 'Atualiza sozinho os containers dos outros apps quando sai uma versão nova.'],
  ],
  alt: 'Painel do CasaOS do DebianServer em 20/10/2026: CPU a 3%, RAM a 26% de 11,6 GB, disco com 122 GB usados de 460 GB e os apps App Store, Files, OpenWebUI, Syncthing, Watchtower, SearXNG, Kiwix Server e Ente Photos.',
} as const

test.describe('DebianServer (feature 009, US1)', () => {  for (const width of [320, 768, 1366, 1920]) {
    test(`fatos, apps, captura e nenhuma rolagem horizontal em ${width}px (V2, V3, SC-001)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('./#projetos')
      await enterPortfolio(page)
      const item = card(page, 'DebianServer')
      await item.scrollIntoViewIfNeeded()
      await expect(item.locator('h3')).toContainText('DebianServer — Meu homeserver')
      await expect(item.locator('.tag-now')).toHaveText('EM PRODUÇÃO')
      await expect(item.locator('.t-desc')).toHaveText(SERVER.purpose)
      await expect(item.locator('.project-meta dt')).toHaveText(['papel', 'tipo', 'desde', 'hardware', 'sistema', 'acesso'])
      await expect(item.locator('.project-meta dd')).toHaveText([...SERVER.meta])
      await expect(item.locator('.project-stack li')).toHaveText([...SERVER.stack])
      const apps = item.locator('.project-apps li')
      await expect(apps.locator('.app-name')).toHaveText(SERVER.apps.map(([name]) => name))
      await expect(apps.locator('.app-desc')).toHaveText(SERVER.apps.map(([, , summary]) => summary))
      const hrefs = await apps.locator('use').evaluateAll((uses) => uses.map((u) => u.getAttribute('href') ?? ''))
      expect(hrefs.map((href) => href.split('#')[1])).toEqual(SERVER.apps.map(([, icon]) => icon))
      await expect(item.locator('.project-links .no-evidence')).toHaveText('# sem acesso público: a evidência é a captura do painel')
      await expect(item.locator('figcaption')).toHaveText('# painel do CasaOS do DebianServer · OUT 2026')
      const img = item.locator('.project-shot img')
      await expect(img).toHaveAttribute('alt', SERVER.alt)
      await expect(item.locator('.project-footer')).toContainText('[side-project]')

      // a captura inteira, sem corte: carregou e cabe na coluna de evidências
      await img.scrollIntoViewIfNeeded()
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
      const [shot, links, info] = await Promise.all([img.boundingBox(), item.locator('.project-links').boundingBox(), item.locator('.project-info').boundingBox()])
      expect(shot!.x).toBeGreaterThanOrEqual(links!.x - 0.5)
      expect(shot!.x + shot!.width).toBeLessThanOrEqual(links!.x + links!.width + 0.5)
      expect(Math.abs(shot!.height - (shot!.width * 809) / 1396)).toBeLessThanOrEqual(2)
      // a partir de 900px, a coluna das evidências fica à direita das informações; abaixo, depois delas
      if (width >= 900) expect(links!.x).toBeGreaterThan(info!.x + info!.width - 1)
      else expect(links!.y).toBeGreaterThanOrEqual(info!.y + info!.height - 1)

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
})

test.describe('challenges (US5)', () => {
  const challenges = (page: Page) => page.locator('#projetos .section-subpart', { has: page.locator('h3', { hasText: 'challenges' }) })

  test('8 challenges públicos, do mais recente ao mais antigo (V5, SC-004; o Bom Jesus (FAE) da 009)', async ({ page }) => {
    await page.goto('./#projetos')
    await enterPortfolio(page)
    // os cartões ficam na janela de editor (006): visíveis só maximizada, sem JS e na impressão; o
    // texto continua no DOM, na mesma ordem
    const items = challenges(page).locator('.editor-cards li')
    await expect(items.locator('h4')).toHaveText(['Bom Jesus (FAE)', 'CIEE-PR', 'Mobiis', 'Econet', 'Executiva Service', 'PandaVideo', 'NY Times (RPA)', 'Axya'])
    await expect(items.locator('.card-date')).toHaveText([
      '// OUT 2026', '// SET 2026', '// FEV 2026', '// JAN 2026', '// OUT 2025', '// OUT 2024', '// JAN 2024', '// JUL 2023',
    ])
    const links = challenges(page).locator('.editor-cards a[target="_blank"][rel="noopener noreferrer"]')
    await expect(links).toHaveCount(8)
    await expect(challenges(page).locator('.editor-files a[target="_blank"][rel="noopener noreferrer"]')).toHaveCount(8)
    await expect(challenges(page)).not.toContainText('privado')
  })

  test('a lista é compacta: no máximo a altura de 3 cartões de projeto em desktop (FR-017)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('./#projetos')
    await enterPortfolio(page)
    const heights = await cards(page).evaluateAll((items) => items.map((li) => li.getBoundingClientRect().height))
    const average = heights.reduce((a, b) => a + b, 0) / heights.length
    // a lista virou a janela de editor (006): ela continua compacta
    const list = await challenges(page).locator('.editor-window').boundingBox()
    expect(list!.height).toBeLessThanOrEqual(3 * average)
  })
})

test('projeto comunitário da PUC-PR (US6, V6)', async ({ page }) => {
  await page.goto('./#projetos')
  await enterPortfolio(page)
  const subpart = page.locator('#projetos .section-subpart', { has: page.locator('h3', { hasText: 'comunitario' }) })
  await expect(subpart.locator('.editor-cards h4')).toHaveText(['Gincana Junina'])
  await expect(subpart).toContainText('// JUN 2023')
  await expect(subpart).toContainText('Um dos estudantes organizadores (Sistemas de Informação)')
  await expect(subpart.locator('.editor-cards a')).toHaveAttribute(
    'href',
    'https://www.pucpr.br/noticias/estudantes-da-pucpr-promovem-gincana-junina-em-escola-municipal-de-curitiba/',
  )
  // vem depois dos challenges
  const order = await page.locator('#projetos .section-subpart h3').allTextContents()
  expect(order.map((t) => t.replace(/[#/]/g, '').trim())).toEqual(['challenges', 'comunitario'])
})

// Feature 008: com JS, os cartões de formação ficam na janela `~/formacao` e só aparecem maximizada (a lista
// `#educacao ol` também pegaria as linhas do editor)
test('1º Empregotech entre o Bacharelado e o Técnico, com observação e fontes (US7, V7)', async ({ page }) => {
  await page.goto('./#educacao')
  await enterPortfolio(page)
  const win = page.locator('.editor-window[data-editor="formacao"]')
  await win.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await win.locator('button.t-max').click()
  const items = page.locator('.editor-frame.is-maximized .editor-cards .edu-list > li')
  await expect(items.locator('h3')).toHaveText([
    'Pós-Graduação em Cibersegurança',
    'Bacharelado em Sistemas de Informação',
    '1º Empregotech',
    'Técnico em Análise e Desenvolvimento de Sistemas',
  ])
  const empregotech = items.nth(2)
  await expect(empregotech).toContainText('2020 — 2020')
  await expect(empregotech).toContainText('Prime Control')
  await expect(empregotech.getByRole('list', { name: 'Fontes' }).locator('a[target="_blank"]')).toHaveCount(2)
})
