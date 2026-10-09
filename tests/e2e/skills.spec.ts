import { expect, test, type Page } from '@playwright/test'
import { waitBootEnd } from './support/boot'

// Feature 003, US1/US5: skills em sub-partes, cada uma com um loop (quickstart V7–V9, V11, V12).
test.use({ reducedMotion: 'no-preference' })

const GROUPS = ['linguagens_frameworks', 'conceitos_web', 'gestao_de_dados', 'desenho_de_processos', 'devops_qualidade']
const COUNTS = [8, 2, 3, 6, 9]

const skipBoot = waitBootEnd

const trackX = async (page: Page, index: number) =>
  (await page.locator('#skills .skill-loop').nth(index).locator('.loop-track').boundingBox())!.x

test('5 sub-partes com título e loop; a trilha anda para a esquerda a ≤ 48 px/s e pausa no hover (V8)', async ({ page }) => {
  await page.goto('./')
  await skipBoot(page)
  const skills = page.locator('#skills')
  await skills.scrollIntoViewIfNeeded()

  const headings = skills.locator('h3')
  await expect(headings).toHaveCount(5)
  for (const [i, id] of GROUPS.entries()) {
    await expect(headings.nth(i)).toHaveAccessibleName(new RegExp(`^${id}/?$`))
    await expect(headings.nth(i).locator('svg.lucide')).toHaveCount(1)
  }
  await expect(skills.locator('.skill-loop')).toHaveCount(5)
  await expect(skills.locator('.skill-loop[data-loop-ready]')).toHaveCount(5)
  expect(await skills.locator('.skill-loop ul:not([aria-hidden]) > li').count()).toBe(28)

  const loop = skills.locator('.skill-loop').first()
  await loop.scrollIntoViewIfNeeded()
  await expect(loop).toHaveAttribute('data-loop-visible', 'true')
  const x1 = await trackX(page, 0)
  await page.waitForTimeout(500)
  expect(await trackX(page, 0)).toBeLessThan(x1) // da direita para a esquerda (FR-021)

  // FR-028: um item leva ≥ 6 s para atravessar 288 px (a menor largura do loop, em 320 px)
  const pxPerSecond = await loop.evaluate((el) => {
    const style = getComputedStyle(el)
    return parseFloat(style.getPropertyValue('--loop-shift')) / parseFloat(style.getPropertyValue('--loop-duration'))
  })
  expect(pxPerSecond).toBeGreaterThan(0)
  expect(pxPerSecond).toBeLessThanOrEqual(48)

  // FR-023: pausa com o ponteiro em cima
  await loop.hover()
  await page.waitForTimeout(100)
  const paused = await trackX(page, 0)
  await page.waitForTimeout(500)
  expect(Math.abs((await trackX(page, 0)) - paused)).toBeLessThan(1)
})

test('loop fora da tela fica parado (V9, FR-024)', async ({ page }) => {
  await page.goto('./')
  await skipBoot(page)
  await expect(page.locator('#skills .skill-loop[data-loop-ready]')).toHaveCount(5)
  const playState = (i: number) =>
    page.locator('#skills .loop-track').nth(i).evaluate((el) => getComputedStyle(el).animationPlayState)
  expect(await playState(0)).toBe('paused')

  await page.locator('#skills .skill-loop').first().scrollIntoViewIfNeeded()
  await expect.poll(() => playState(0)).toBe('running')
})

test('leitor de tela: cada grupo é uma lista com as próprias skills, uma vez (V11, FR-026)', async ({ page }) => {
  await page.goto('./')
  await skipBoot(page)
  await page.locator('#skills').scrollIntoViewIfNeeded()
  await expect(page.locator('#skills [data-loop-copy]').first()).toBeAttached()

  for (const [i, count] of COUNTS.entries()) {
    const loop = page.locator('#skills .skill-loop').nth(i)
    await expect(loop.getByRole('list')).toHaveCount(1)
    await expect(loop.getByRole('listitem')).toHaveCount(count)
  }
  const snapshot = await page.locator('#skills').ariaSnapshot()
  expect(snapshot).not.toContain('✦')
  for (const name of ['TypeScript', 'Programação Web', 'PostgreSQL', 'Singleton', 'Agile/Scrum']) {
    expect(snapshot.split(name).length - 1, name).toBe(1)
  }
})

test('os loops não deslocam o layout; em 320 px cabem e os nomes têm ≥ 24 px (V12, FR-027, FR-029; 2× na 004)', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as unknown as { __shifts: number[] }).__shifts = []
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Node }[] }[]) {
        const inLoop = entry.sources?.some((s) => s.node instanceof Element && s.node.closest('#skills'))
        if (inLoop && !entry.hadRecentInput) (window as unknown as { __shifts: number[] }).__shifts.push(entry.value)
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('./')
  await skipBoot(page)
  const loop = page.locator('#skills .skill-loop').first()
  const before = (await loop.boundingBox())!.height
  await loop.scrollIntoViewIfNeeded()
  await expect(page.locator('#skills .skill-loop[data-loop-ready]')).toHaveCount(5)
  await page.waitForTimeout(600)
  expect((await loop.boundingBox())!.height).toBe(before)
  const shifts = await page.evaluate(() => (window as unknown as { __shifts: number[] }).__shifts)
  expect(shifts.reduce((a, b) => a + b, 0)).toBe(0)

  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
  const sizes = await page.locator('#skills .loop-name').evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).fontSize)))
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(24)
})

// Feature 004, US6: fitas de borda a borda, texto 2× e direção por grupo (quickstart V14; FR-044 a FR-046)
for (const width of [320, 768, 1440, 1920]) {
  test(`fitas de borda a borda, sem rolagem horizontal, texto de 27,2 px, em ${width}px (V14, FR-044, FR-045)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    await skipBoot(page)
    await page.locator('#skills').scrollIntoViewIfNeeded()
    const { ribbons, client, overflow, titles, container } = await page.evaluate(() => ({
      ribbons: [...document.querySelectorAll('#skills .skill-loop')].map((el) => {
        const r = el.getBoundingClientRect()
        return [r.left, r.right]
      }),
      client: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      titles: [...document.querySelectorAll('#skills h3')].map((el) => el.getBoundingClientRect().left),
      container: document.querySelector('#skills .section-title')!.getBoundingClientRect().left,
    }))
    expect(overflow).toBeLessThanOrEqual(0)
    for (const [left, right] of ribbons) {
      expect(left!).toBeCloseTo(0, 0)
      expect(Math.abs(right! - client)).toBeLessThanOrEqual(1)
    }
    // os títulos das sub-partes continuam alinhados ao conteúdo da página
    for (const left of titles) expect(Math.abs(left - container)).toBeLessThanOrEqual(1)
    const sizes = await page.locator('#skills .loop-item').evaluateAll((els) => [...new Set(els.map((el) => getComputedStyle(el).fontSize))])
    expect(sizes).toEqual(['27.2px'])
  })
}

test('conceitos_web e desenho_de_processos andam para a direita; os outros, para a esquerda (V14, FR-046)', async ({ page }) => {
  await page.goto('./')
  await skipBoot(page)
  await expect(page.locator('#skills .skill-loop[data-loop-ready]')).toHaveCount(5)
  for (const [i, id] of GROUPS.entries()) {
    const loop = page.locator('#skills .skill-loop').nth(i)
    await loop.scrollIntoViewIfNeeded()
    await expect(loop).toHaveAttribute('data-loop-visible', 'true')
    await page.mouse.move(0, 0) // o hover pausa o loop
    const x1 = await trackX(page, i)
    await page.waitForTimeout(1000)
    const x2 = await trackX(page, i)
    if (id === 'conceitos_web' || id === 'desenho_de_processos') expect(x2, id).toBeGreaterThan(x1)
    else expect(x2, id).toBeLessThan(x1)
  }
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`sem a faixa contínua acima das sub-partes, ${reducedMotion} (V7, FR-019)`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    await page.goto('./')
    await expect(page.locator('.tech-marquee, .marquee-static, .marquee-chip')).toHaveCount(0)
    const afterLead = await page.locator('#skills .section-lead').evaluate((el) => el.nextElementSibling?.className ?? '')
    expect(afterLead).toContain('section-subpart')
  })
}
