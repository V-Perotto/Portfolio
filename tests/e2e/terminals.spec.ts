import { expect, test, type Page } from '@playwright/test'

// Feature 002, US8: janelas de terminal que digitam ao entrar na tela (quickstart V8–V12, FR-025 a FR-033).
test.use({ reducedMotion: 'no-preference' })

const skipBoot = async (page: Page) => {
  await page.keyboard.press('Escape')
  await expect(page.locator('.boot-screen')).toHaveCount(0, { timeout: 1500 })
}

/** Estados da janela, na ordem dos passos: "p" pending, "t" typing, "d" done. */
const states = (page: Page, scope: string) =>
  page.evaluate(
    (sel) => [...document.querySelectorAll(`${sel} [data-t-state]`)].map((el) => el.getAttribute('data-t-state')![0]).join(''),
    scope,
  )

/** Espera todos os passos da janela chegarem a "done" e devolve quantos ms levou. */
const timeToDone = async (page: Page, scope: string) => {
  const started = Date.now()
  await page.waitForFunction(
    (sel) => {
      const all = [...document.querySelectorAll(`${sel} [data-t-state]`)]
      return all.length > 0 && all.every((el) => el.getAttribute('data-t-state') === 'done')
    },
    scope,
    { polling: 20, timeout: 6000 },
  )
  return Date.now() - started
}

test('janela digita o comando, mostra a saída depois e completa em até 2,5 s (V8, SC-005)', async ({ page }) => {
  await page.goto('./')
  await skipBoot(page)
  expect(await states(page, '#sobre')).toMatch(/^p+$/) // armada abaixo da dobra

  await page.locator('#sobre').scrollIntoViewIfNeeded()
  // saída escondida enquanto o comando não termina (sem tirar o texto do lugar)
  const firstOutput = page.locator('#sobre .terminal-body > [data-t-state]:not([data-t-cmd])').first()
  await expect(firstOutput).toHaveCSS('opacity', '0')
  await expect(page.locator('#sobre .t-typed')).toHaveCount(1, { timeout: 1000 })

  expect(await timeToDone(page, '#sobre')).toBeLessThanOrEqual(2500)
  await expect(firstOutput).toHaveCSS('opacity', '1')
  await expect(page.locator('#sobre .t-typed')).toHaveCount(0)

  // FR-027: não repete ao sair e voltar
  await page.locator('#contato').scrollIntoViewIfNeeded()
  await page.locator('#sobre').scrollIntoViewIfNeeded()
  expect(await states(page, '#sobre')).toMatch(/^d+$/)
})

test('clique na janela completa a animação na hora (V9, FR-028)', async ({ page }) => {
  await page.goto('./')
  await skipBoot(page)
  const window = page.locator('#projetos .projects-grid > li').nth(2).locator('.terminal-window')
  await window.scrollIntoViewIfNeeded()
  await window.locator('.terminal-bar').click()
  await page.waitForTimeout(100)
  expect(await states(page, '#projetos .projects-grid > li:nth-child(3)')).toMatch(/^d+$/)
})

test('foco do teclado num link de saída ainda escondida completa a janela (V9, FR-028)', async ({ page }) => {
  await page.goto('./')
  await skipBoot(page)
  expect(await states(page, '#contato')).toMatch(/^p+$/)
  const link = page.locator('#contato .contact-list a').first()
  await link.focus()
  await expect(link).toBeFocused()
  expect(await states(page, '#contato')).toMatch(/^d+$/)
  await expect(page.locator('#contato .contact-list')).toHaveCSS('opacity', '1')
})

test('leitor de tela recebe o texto completo durante a digitação (V11, FR-030)', async ({ page }) => {
  await page.goto('./')
  await skipBoot(page)
  await page.locator('#sobre').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => document.querySelector('#sobre [data-t-state="typing"]'), null, { polling: 20 })
  await expect(page.locator('#sobre .t-typed')).toHaveAttribute('aria-hidden', 'true')
  const snapshot = await page.locator('#sobre .terminal-body').ariaSnapshot()
  expect(snapshot).toContain('cat sobre.txt')
  expect(snapshot).toContain('whois vittorio --info')
  expect(snapshot).toContain('Analista de Sistemas e Desenvolvedor Fullstack')
})

test('a animação não desloca o layout nem muda a altura da janela (V12, FR-031, SC-007)', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as unknown as { __shifts: number[] }).__shifts = []
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Node }[] }[]) {
        const inWindow = entry.sources?.some((s) => s.node instanceof Element && s.node.closest('#contato .terminal-window'))
        if (inWindow && !entry.hadRecentInput) (window as unknown as { __shifts: number[] }).__shifts.push(entry.value)
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto('./')
  await skipBoot(page)
  const window = page.locator('#contato .terminal-window')
  const before = (await window.boundingBox())!.height
  await window.scrollIntoViewIfNeeded()
  await timeToDone(page, '#contato')
  const after = (await window.boundingBox())!.height
  expect(after).toBe(before)
  const shifts = await page.evaluate(() => (window as unknown as { __shifts: number[] }).__shifts)
  expect(shifts.reduce((a, b) => a + b, 0)).toBe(0)
})

test('janela coberta pelo boot só anima depois que ele sai (FR-032)', async ({ page }) => {
  await page.goto('./#contato')
  await expect(page.locator('html')).toHaveClass(/\bbooting\b/)
  await page.waitForFunction(() => document.querySelector('#contato [data-t-anim]'), null, { polling: 20 })
  expect(await states(page, '#contato')).toMatch(/^p+$/)

  await page.waitForFunction(() => !document.documentElement.classList.contains('booting'), null, { polling: 20, timeout: 6000 })
  expect(await timeToDone(page, '#contato')).toBeLessThanOrEqual(2500)
})

test('na impressão a janela armada sai completa (V10, FR-029)', async ({ page }) => {
  await page.goto('./')
  await skipBoot(page)
  expect(await states(page, '#contato')).toMatch(/^p+$/)
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#contato .contact-list')).toHaveCSS('opacity', '1')
  const color = await page.locator('#contato [data-t-cmd] .t-cmd').first().evaluate((el) => getComputedStyle(el).color)
  expect(color).not.toBe('rgba(0, 0, 0, 0)')
})

test('rolagem rápida até o fim: as janelas puladas terminam sozinhas (edge case da spec)', async ({ page }) => {
  await page.goto('./')
  await skipBoot(page)
  // de uma vez para o fim: as janelas do meio nunca cruzam a tela
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await page.waitForFunction(() => !document.querySelector('[data-t-state]:not([data-t-state="done"])'), null, {
    polling: 50,
    timeout: 3000,
  })
  await expect(page.locator('.t-typed')).toHaveCount(0)
})
