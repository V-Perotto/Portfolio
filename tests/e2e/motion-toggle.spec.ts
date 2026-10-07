import { expect, test } from '@playwright/test'

// FR-035, US4 cenário 8, SC-007: o controle da navegação para todo o movimento e lembra a escolha.
test.use({ reducedMotion: 'no-preference', viewport: { width: 1280, height: 900 } })

test('controle de movimento desliga tudo e vale na visita seguinte', async ({ page }) => {
  await page.goto('./')
  await page.keyboard.press('Escape') // pula o boot
  await expect(page.locator('.boot-screen')).toHaveCount(0, { timeout: 2000 })

  const toggle = page.locator('.motion-toggle')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#home canvas')).toHaveCount(1)

  // só teclado: Tab até o controle, Enter
  for (let i = 0; i < 20 && !(await toggle.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab')
  }
  await expect(toggle).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await expect(toggle).toHaveText('motion: off')

  // mesmo estado final do movimento reduzido: sem matrix, prompt parado, faixa parada, cursor fixo
  await expect(page.locator('html')).not.toHaveClass(/\bmotion\b/)
  await expect(page.locator('#home canvas')).toHaveCount(0)
  await expect(page.locator('.hero-terminal .typed')).toHaveText('Desenvolvedor Full-Stack')
  await expect(page.locator('.marquee-static')).toHaveCount(1)
  await page.mouse.move(0, 0) // nada sob o ponteiro
  await toggle.blur()
  await page.waitForTimeout(500)
  const first = await page.screenshot()
  await page.waitForTimeout(2000)
  expect(Buffer.compare(first, await page.screenshot())).toBe(0)

  // a escolha vale ao recarregar: sem boot e sem movimento desde o início
  await page.reload()
  await expect(page.locator('html')).not.toHaveClass(/\bmotion\b|\bbooting\b/)
  await expect(page.locator('.boot-screen')).toHaveCount(0)
  await expect(page.locator('.motion-toggle')).toHaveAttribute('aria-pressed', 'false')

  // e religar volta os efeitos
  await page.locator('.motion-toggle').click()
  await expect(page.locator('#home canvas')).toHaveCount(1)
})

test('sem JavaScript o controle não aparece', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(test.info().project.use.baseURL!)
  await expect(page.locator('.motion-toggle')).toBeHidden()
  await context.close()
})
