import { expect, test } from '@playwright/test'

// Feature 003, US4: ícone de tecnologia em todo chip (quickstart V6, V15; FR-012 a FR-018).
test.use({ reducedMotion: 'reduce' })

test('todo chip tem o ícone antes do nome, do sprite do próprio site, na cor do texto (V6)', async ({ page }) => {
  await page.goto('./')
  const chips = page.locator('.chip')
  expect(await chips.count()).toBeGreaterThan(60)

  // sprite publicado: todo #id usado existe como <symbol>
  const spriteHref = await page.locator('.chip use').first().getAttribute('href')
  const spriteUrl = new URL(spriteHref!.split('#')[0]!, page.url())
  expect(spriteUrl.origin).toBe(new URL(page.url()).origin)
  const sprite = await (await page.request.get(spriteUrl.href)).text()
  const symbols = new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(([, id]) => id))

  const report = await chips.evaluateAll((els) =>
    els.map((el) => {
      const first = el.firstElementChild
      const use = el.querySelector('svg.tech-icon use')
      const svg = el.querySelector('svg.tech-icon')
      return {
        text: el.textContent?.trim(),
        iconFirst: !!first?.matches('svg.tech-icon'),
        hidden: svg?.getAttribute('aria-hidden'),
        href: use?.getAttribute('href') ?? '',
        sameColor: svg ? getComputedStyle(svg).color === getComputedStyle(el).color : false,
        iconHeight: svg?.getBoundingClientRect().height ?? 0,
        fontSize: parseFloat(getComputedStyle(el).fontSize),
      }
    }),
  )
  for (const chip of report) {
    expect(chip.iconFirst, chip.text).toBe(true)
    expect(chip.hidden, chip.text).toBe('true')
    expect(symbols.has(chip.href.split('#')[1]), chip.text).toBe(true)
    expect(new URL(chip.href, page.url()).origin, chip.text).toBe(new URL(page.url()).origin)
    expect(chip.sameColor, chip.text).toBe(true)
    expect(Math.abs(chip.iconHeight - chip.fontSize), chip.text).toBeLessThanOrEqual(1) // FR-018: altura do texto
  }
})

test('no hover do chip o ícone muda de cor junto com o texto (V6, FR-014)', async ({ page }) => {
  await page.goto('./')
  const chip = page.locator('#experiencia .chip').first()
  await chip.scrollIntoViewIfNeeded()
  const colors = () =>
    chip.evaluate((el) => ({ text: getComputedStyle(el).color, icon: getComputedStyle(el.querySelector('svg')!).color }))
  const rest = await colors()
  await chip.hover()
  await expect.poll(async () => (await colors()).text).not.toBe(rest.text)
  const hover = await colors()
  expect(hover.icon).toBe(hover.text)
})

test('chip com ícone tem a mesma altura de antes (V6, FR-018)', async ({ page }) => {
  await page.goto('./')
  const heights = await page.locator('.chip').evaluateAll((els) => [...new Set(els.map((el) => el.getBoundingClientRect().height))])
  // medido antes da feature (2026-10-08): 28,22px (0.75rem × line-height 1.6 + padding + borda)
  for (const h of heights) expect(Math.abs(h - 28.22)).toBeLessThanOrEqual(1)
})

test('ícones sem requisição a terceiros (V15, FR-013)', async ({ page }) => {
  const third: string[] = []
  page.on('request', (request) => {
    if (/devicon|vectorlogo|jsdelivr/.test(request.url())) third.push(request.url())
  })
  await page.goto('./')
  for (const id of ['#experiencia', '#skills', '#projetos']) await page.locator(id).scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  expect(third).toEqual([])
})
