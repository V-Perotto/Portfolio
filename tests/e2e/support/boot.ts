import { expect, type Page } from '@playwright/test'

/**
 * Espera a tela de boot terminar sozinha (feature 004: o boot não é mais pulável, FR-031; a página
 * fica descoberta em até 7 s do início da navegação, FR-032). Sem boot (movimento reduzido, JS que
 * chegou tarde), volta na hora.
 */
export async function waitBootEnd(page: Page): Promise<void> {
  await page.waitForFunction(
    () => !document.documentElement.classList.contains('booting') && !document.querySelector('.boot-screen'),
    null,
    { polling: 50, timeout: 7500 },
  )
  await expect(page.locator('.boot-screen')).toHaveCount(0)
}
