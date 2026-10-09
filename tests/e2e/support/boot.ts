import { expect, type Page } from '@playwright/test'

/**
 * Entra no portfólio (feature 005, research R14): com a porta de acesso na tela, clica no ícone
 * `acessar_portfolio.sh` e espera a sessão terminar e a capa sair (≤ 4 s do clique, ~1 s com movimento
 * reduzido). Sem porta (JavaScript que chegou tarde, ou nenhum JavaScript), volta assim que a página
 * está descoberta.
 */
export async function enterPortfolio(page: Page): Promise<void> {
  const state = await page
    .waitForFunction(
      () => {
        const root = document.documentElement
        const icon = document.querySelector<HTMLElement>('.gate-icon')
        if (icon && icon.offsetParent !== null) return 'gate'
        const covered = root.classList.contains('booting') || document.querySelector('.boot-screen, .access-gate')
        return covered ? false : 'open'
      },
      null,
      { polling: 50, timeout: 7500 },
    )
    .then((handle) => handle.jsonValue())

  if (state === 'gate') {
    await page.locator('.gate-icon').click()
    await page.waitForFunction(
      () => {
        const root = document.documentElement
        return !root.classList.contains('booting') && !root.classList.contains('gate') && !document.querySelector('.access-gate')
      },
      null,
      { polling: 50, timeout: 6000 },
    )
  }
  await expect(page.locator('.boot-screen, .access-gate')).toHaveCount(0)
}
