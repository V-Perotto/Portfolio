import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './support/test'
import { enterPortfolio } from './support/boot'
import { gotoGate, openGate, uncoveredAt } from './support/gate'

// SC-005, SC-006 (quickstart V7).
// o axe na página inteira demora mais desde as janelas de editor (006: o DOM cresceu), e a suíte roda
// muitos navegadores em paralelo
test.describe.configure({ timeout: 60_000 })
for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  for (const width of [360, 1280]) {
    test(`a11y: axe sem violações críticas/sérias em ${width}px (${reducedMotion})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion })
      await page.setViewportSize({ width, height: 900 })
      await page.goto('./')
      // sem a porta de acesso por cima (feature 005: entra pelo ícone)
      await enterPortfolio(page)
      // revela tudo o que depende de rolagem antes de auditar
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo({ top: y, behavior: 'instant' })
          await new Promise((r) => setTimeout(r, 50))
        }
      })
      await page.waitForTimeout(800)
      // janelas que ainda digitam têm texto transparente de propósito (FR-030): audita o estado final
      await page.waitForFunction(() => !document.querySelector('[data-t-state]:not([data-t-state="done"])'), null, {
        polling: 50,
        timeout: 5000,
      })

      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      const serious = violations
        .filter((v) => v.impact === 'critical' || v.impact === 'serious')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
      expect(serious).toEqual([])
    })
  }
}

test('a11y: foco por teclado sempre visível', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await enterPortfolio(page)
  const total = await page.locator('a[href], button').count()
  const missing: string[] = []
  for (let i = 0; i < total; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body) return null
      const style = getComputedStyle(el)
      const visible = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
      return { visible, label: el.textContent?.trim().slice(0, 30) || el.getAttribute('aria-label') || el.tagName }
    })
    if (info && !info.visible) missing.push(info.label)
  }
  expect(missing).toEqual([])
})

test('a11y: títulos e prompt lidos sem os enfeites de terminal (FR-036)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await enterPortfolio(page)
  const names = await page.getByRole('heading', { level: 2 }).allInnerTexts()
  const accessible = []
  for (const heading of await page.getByRole('heading', { level: 2 }).all()) {
    accessible.push(await heading.evaluate((el) => {
      // nome acessível: texto sem o que está em aria-hidden
      const clone = el.cloneNode(true) as HTMLElement
      clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove())
      return clone.textContent?.trim()
    }))
  }
  expect(names.length).toBeGreaterThan(0)
  expect(accessible).toEqual(['sobre', 'experiencia', 'skills', 'projetos', 'educacao', 'contato'])
  await expect(page.locator('#home')).toMatchAriaSnapshot(`- paragraph: /viper@portfolio:~ Desenvolvedor Full-Stack/`)
})

test('a11y: foco num link do cartão acende o brilho (FR-014)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./#projetos')
  await enterPortfolio(page)
  const link = page.locator('#projetos a[href*="open-vsx.org"]').first()
  await link.focus()
  const card = page.locator('#projetos .base-card', { has: page.locator('a[href*="open-vsx.org"]') })
  const layer = card.locator('.spotlight-layer')
  await expect.poll(async () => Number(await layer.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThan(0)
})

test('a11y: alto contraste mantém foco e esconde a decoração (FR-037)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await page.goto('./')
  await enterPortfolio(page)
  await expect(page.locator('.scanlines')).toBeHidden()
  await page.keyboard.press('Tab')
  const outline = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement as Element)
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) }
  })
  expect(outline.style).not.toBe('none')
  expect(outline.width).toBeGreaterThan(0)
})

test('a11y: alto contraste mantém ícones, sublinhados e a fita dos loops (FR-034 da 003)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await page.goto('./')
  await enterPortfolio(page)
  const report = await page.evaluate(() => {
    const bg = (el: Element | null): string => {
      for (let cur = el; cur; cur = cur.parentElement) {
        const c = getComputedStyle(cur).backgroundColor
        if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c
      }
      return getComputedStyle(document.body).backgroundColor
    }
    const icons = [...document.querySelectorAll('svg.tech-icon')].filter((svg) => getComputedStyle(svg).color === bg(svg.parentElement))
    const links = [...document.querySelectorAll('a.ext-link')].filter((a) => {
      const line = a.classList.contains('evidence-link') ? a.querySelector('.badge-box img, .evidence-url') : a
      return !line || getComputedStyle(line).borderBottomStyle !== 'dashed'
    })
    const loops = [...document.querySelectorAll('.skill-loop')].filter((el) => {
      const s = getComputedStyle(el)
      return s.borderTopStyle === 'none' || parseFloat(s.borderTopWidth) === 0
    })
    return { icons: icons.length, links: links.map((a) => a.textContent?.trim()), loops: loops.length, total: document.querySelectorAll('svg.tech-icon').length }
  })
  expect(report.total).toBeGreaterThan(60)
  expect(report.icons).toBe(0)
  expect(report.links).toEqual([])
  expect(report.loops).toBe(0)
})

test('a11y: ícones Lucide das skills decorativos e sem requisição externa (FR-034, FR-035, SC-008)', async ({ page }) => {
  const external: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.hostname !== 'localhost' && url.hostname !== 'img.shields.io') external.push(url.href)
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./#skills', { waitUntil: 'load' })
  await enterPortfolio(page)
  await page.waitForTimeout(1500) // janela para requisições tardias (lazy, fontes)

  const icons = page.locator('#skills h3 svg.lucide')
  await expect(icons).toHaveCount(5)
  for (const icon of await icons.all()) await expect(icon).toHaveAttribute('aria-hidden', 'true')
  const ids = ['linguagens_frameworks', 'conceitos_web', 'gestao_de_dados', 'desenho_de_processos', 'devops_qualidade']
  const headings = page.locator('#skills h3')
  for (const [i, id] of ids.entries()) await expect(headings.nth(i)).toHaveAccessibleName(new RegExp(`^${id}/?$`))
  expect(external).toEqual([])
})

// Feature 004 (V18, SC-008): axe com o terminal aberto, janelas minimizada e fechada, e no topo com o
// header escondido.
for (const width of [390, 1440]) {
  test(`a11y: axe com terminal aberto, janelas minimizadas e header escondido em ${width}px (feature 004)`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    await enterPortfolio(page)
    const audit = async (label: string) => {
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      const serious = violations
        .filter((v) => v.impact === 'critical' || v.impact === 'serious')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
      expect(serious, label).toEqual([])
    }
    // topo: header escondido
    await audit('topo')

    await page.locator('#sobre .desktop-window button.t-min').click()
    await page.locator('#contato .desktop-window button.t-close').click()
    await page.locator('.app-dock .dock-btn').click()
    await page.locator('#dock-terminal-input').fill('help')
    await page.locator('#dock-terminal-input').press('Enter')
    await page.locator('#dock-terminal-input').fill('find e')
    await audit('terminal aberto, janelas minimizada e fechada')
  })
}

// Feature 007 (T033, SC-010): axe e console sem erros com o terminal da dock minimizado (com sessão) e
// com a janela de editor maximizada pelo `open`.
for (const width of [390, 1366]) {
  test(`a11y: axe com o terminal minimizado e o editor maximizado pelo open em ${width}px (feature 007)`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    await enterPortfolio(page)
    const audit = async (label: string) => {
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      const serious = violations
        .filter((v) => v.impact === 'critical' || v.impact === 'serious')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
      expect(serious, label).toEqual([])
    }
    const input = page.locator('#dock-terminal-input')
    await page.locator('.app-dock .dock-btn').click()
    await input.fill('help')
    await input.press('Enter')
    await input.fill('fi')
    await page.locator('#dock-terminal button.t-min').click()
    await expect(page.locator('.app-dock .dock-btn')).toHaveAttribute('data-terminal', 'minimized')
    await audit('terminal minimizado')

    await page.locator('.app-dock .dock-btn').click()
    await input.fill('open experiencia')
    await input.press('Enter')
    await expect(page.locator('.editor-frame.is-maximized')).toHaveCount(1)
    await audit('editor maximizado pelo open')
    await page.keyboard.press('Escape')
    expect(errors).toEqual([])
  })
}

// Feature 005 (T038, SC-010): axe e console sem erros na porta de acesso, com a janela aberta e
// minimizada, depois do acesso e na porta sem movimento.
for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`a11y: porta de acesso em todos os estados, ${reducedMotion} (feature 005)`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await page.emulateMedia({ reducedMotion })
    // com a porta na tela, o resto da página é inerte: a auditoria da porta cabe na sessão (~2,7 s), que
    // não espera (as janelas de editor da 006 deixaram a página inteira lenta de auditar)
    const audit = async (label: string, include?: string) => {
      const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      if (include) builder.include(include)
      const { violations } = await builder.analyze()
      const serious = violations
        .filter((v) => v.impact === 'critical' || v.impact === 'serious')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
      expect(serious, label).toEqual([])
    }
    await gotoGate(page)
    await audit('porta (ícone)')
    if (reducedMotion === 'no-preference') {
      await page.locator('.gate-icon').click()
      await expect(page.locator('.gate-window')).toBeVisible()
      await audit('janela aberta', '.access-gate')
      await page.locator('.gate-window button.t-min').click()
      // depois da animação de encolher (a janela semitransparente reprovaria o contraste no meio dela);
      // minimizada, a sessão segue e termina sozinha (~2,7 s do clique): sob carga, pode acabar antes
      await expect(page.locator('.gate-window')).toBeHidden()
      if (await page.locator('.access-gate[data-gate-state="minimized"]').count()) await audit('janela minimizada', '.access-gate')
      await uncoveredAt(page)
    } else {
      await openGate(page)
      await audit('janela aberta, sem movimento')
      await uncoveredAt(page)
    }
    await expect(page.locator('.access-gate')).toHaveCount(0, { timeout: 2000 })
    await audit('depois do acesso')
    expect(errors).toEqual([])
  })
}

// Feature 006 (quickstart V23; SC-012): janelas de editor (normal, maximizada, minimizada), o loader do
// hero nos dois estados e a dica da dock.
test.describe('a11y da 006', () => {
  test.use({ reducedMotion: 'no-preference' })

  const audit = async (page: import('@playwright/test').Page, include?: string) => {
    const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    if (include) builder.include(include)
    const { violations } = await builder.analyze()
    return violations
      .filter((v) => v.impact === 'critical' || v.impact === 'serious')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
  }

  test('janelas de editor: normal (arquivo do meio), Challenges maximizada e Experiência minimizada', async ({ page }) => {
    test.setTimeout(60_000)
    await page.goto('./')
    await enterPortfolio(page)
    for (const label of ['carreira', 'challenges', 'comunitario']) {
      const win = page.locator(`.editor-window[data-editor="${label}"]`)
      await win.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await expect(win.locator('.editor')).not.toHaveAttribute('data-t-state', /pending|typing/, { timeout: 5000 })
      const files = win.locator('.bm-child')
      await files.nth(Math.floor((await files.count()) / 2)).click()
      expect(await audit(page, `.editor-window[data-editor="${label}"]`), label).toEqual([])
    }

    await page.locator('.editor-window[data-editor="challenges"] button.t-max').click()
    await page.waitForTimeout(500)
    expect(await audit(page), 'maximizada').toEqual([])
    await page.keyboard.press('Escape')

    const exp = page.locator('.editor-window[data-editor="carreira"]')
    await exp.locator('button.t-min').click()
    await expect(exp).toHaveAttribute('data-window-state', 'minimized')
    // depois da animação de encolher (o quadro semitransparente reprovaria o contraste no meio dela)
    await expect(exp.locator('.desktop-window-frame')).toBeHidden()
    expect(await audit(page, '#experiencia'), 'minimizada').toEqual([])
  })

  for (const phase of ['working', 'done']) {
    test(`hero com o loader ${phase}`, async ({ page }) => {
      await page.goto('./')
      await enterPortfolio(page)
      await expect(page.locator('#home .hero-boot')).toHaveAttribute('data-loader', phase, { timeout: 6000 })
      expect(await audit(page, '#home .hero-boot'), phase).toEqual([])
    })
  }

  test('dica da dock visível', async ({ page }) => {
    await page.goto('./')
    await enterPortfolio(page)
    await page.locator('.app-dock .dock-btn').hover()
    await expect(page.locator('.app-dock .dock-tip')).toBeVisible()
    expect(await audit(page, '.app-dock-root'), 'dica').toEqual([])
  })
})
