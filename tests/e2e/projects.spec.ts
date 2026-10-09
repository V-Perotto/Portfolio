import { expect, test, type Page } from '@playwright/test'

// Feature 002, seção de projetos e educação (quickstart V1–V7). Sem movimento: o conteúdo final.
test.use({ reducedMotion: 'reduce' })

const cards = (page: Page) => page.locator('#projetos .projects-grid > li')
const card = (page: Page, name: string) => cards(page).filter({ has: page.locator('h3', { hasText: name }) })

test.describe('projetos um por linha (US1)', () => {
  for (const width of [1440, 768, 320]) {
    test(`nenhum par de cartões lado a lado em ${width}px (V1, SC-001)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('./#projetos')
      const tops = await cards(page).evaluateAll((items) => items.map((li) => Math.round(li.getBoundingClientRect().top)))
      expect(tops.length).toBeGreaterThan(1)
      expect(new Set(tops).size).toBe(tops.length)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('todo projeto, exceto o acadêmico, tem link isolado no próprio cartão (V2, SC-002)', async ({ page }) => {
    await page.goto('./#projetos')
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
  await expectPrivateLinks(page, 'ItaliaMi', [
    'https://github.com/V-Perotto/ItaliaMi-Back',
    'https://github.com/V-Perotto/ItaliaMi-Front',
    'https://github.com/V-Perotto/ItaliaMi-BOT',
  ])
  await expect(card(page, 'ItaliaMi')).not.toContainText('sem link público')
})

test('projetos privados ligados à Quadritech (US3, FR-009)', async ({ page }) => {
  await page.goto('./#projetos')
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
  const names = await cards(page).locator('h3 .hl-purple').allTextContents()
  expect(names).toEqual(['SRG', 'Temas VS Code', 'ItaliaMi', 'OCR de Prontuários', 'QClass-BOT', 'Monitor de Curso'])

  await expect(page.locator('#projetos .tag-now')).toHaveCount(1)
  await expect(card(page, 'SRG').locator('.tag-now')).toHaveText('EM DESENVOLVIMENTO')
  await expect(card(page, 'SRG')).not.toContainText('PRESENTE')
  await expectPrivateLinks(
    page,
    'SRG',
    ['SRG-Vue', 'SRG-Admin', 'SRG-Node', 'SRG-Core', 'SRG-DEVOPS'].map((r) => `https://github.com/V-Perotto/${r}`),
  )
})

test.describe('challenges (US5)', () => {
  const challenges = (page: Page) => page.locator('#projetos .project-subpart', { has: page.locator('h3', { hasText: 'challenges' }) })

  test('7 challenges públicos, do mais recente ao mais antigo (V5, SC-004)', async ({ page }) => {
    await page.goto('./#projetos')
    const items = challenges(page).locator('li')
    await expect(items.locator('h4')).toHaveText(['CIEE-PR', 'Mobiis', 'Econet', 'Executiva Service', 'PandaVideo', 'NY Times (RPA)', 'Axya'])
    await expect(items.locator('.card-date')).toHaveText([
      '// SET 2026', '// FEV 2026', '// JAN 2026', '// OUT 2025', '// OUT 2024', '// JAN 2024', '// JUL 2023',
    ])
    const links = challenges(page).locator('a[target="_blank"][rel="noopener noreferrer"]')
    await expect(links).toHaveCount(7)
    await expect(challenges(page)).not.toContainText('privado')
  })

  test('a lista é compacta: no máximo a altura de 3 cartões de projeto em desktop (FR-017)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('./#projetos')
    const heights = await cards(page).evaluateAll((items) => items.map((li) => li.getBoundingClientRect().height))
    const average = heights.reduce((a, b) => a + b, 0) / heights.length
    const list = await challenges(page).locator('ol').boundingBox()
    expect(list!.height).toBeLessThanOrEqual(3 * average)
  })
})

test('projeto comunitário da PUC-PR (US6, V6)', async ({ page }) => {
  await page.goto('./#projetos')
  const subpart = page.locator('#projetos .project-subpart', { has: page.locator('h3', { hasText: 'comunitario' }) })
  await expect(subpart.locator('h4')).toHaveText(['Gincana Junina'])
  await expect(subpart).toContainText('// JUN 2023')
  await expect(subpart).toContainText('Um dos estudantes organizadores (Sistemas de Informação)')
  await expect(subpart.locator('a')).toHaveAttribute(
    'href',
    'https://www.pucpr.br/noticias/estudantes-da-pucpr-promovem-gincana-junina-em-escola-municipal-de-curitiba/',
  )
  // vem depois dos challenges
  const order = await page.locator('#projetos .project-subpart h3').allTextContents()
  expect(order.map((t) => t.replace(/[#/]/g, '').trim())).toEqual(['challenges', 'comunitario'])
})

test('1º Empregotech entre o Bacharelado e o Técnico, com observação e fontes (US7, V7)', async ({ page }) => {
  await page.goto('./#educacao')
  const items = page.locator('#educacao ol > li')
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
