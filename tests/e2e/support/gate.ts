import { expect, type Page } from '@playwright/test'

/**
 * Auxiliares dos e2e da porta de acesso (feature 005, contracts/access-gate.md).
 */

export const COMMAND = 'viper@portfolio:~$ ./iniciar_portfolio.sh'

/** Texto visível de cada linha da sessão (sem o fantasma reservado nem o cursor). */
export const visibleLineTexts = (page: Page): Promise<string[]> =>
  page.locator('.gate-session .boot-line:not(.boot-pending)').evaluateAll((els) =>
    els.map((el) => {
      const clone = el.cloneNode(true) as HTMLElement
      clone.querySelectorAll('.text-type-ghost, .cursor').forEach((n) => n.remove())
      return (clone.textContent ?? '').trim()
    }),
  )

export const gateState = (page: Page): Promise<string | null> =>
  page.locator('.access-gate').getAttribute('data-gate-state', { timeout: 2000 })

/**
 * Abre a página com a porta na tela. Sob carga (muitos navegadores em paralelo), o app pode montar
 * depois de 2055 ms, e aí a porta, corretamente, não aparece (FR-011, testado à parte): recarrega até
 * ela aparecer, no máximo 3 vezes.
 */
export async function gotoGate(page: Page, url = './'): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    // sem esperar o `load` (os badges externos podem segurá-lo): a porta aparece antes
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    const shown = await page
      .waitForFunction(
        () => {
          const icon = document.querySelector<HTMLElement>('.gate-icon')
          if (icon && icon.offsetParent !== null) return 'gate'
          return document.documentElement.classList.contains('booting') ? false : 'none'
        },
        null,
        { polling: 20, timeout: 7500 },
      )
      .then((handle) => handle.jsonValue())
    if (shown === 'gate') return
    if (attempt === 3) throw new Error('a porta de acesso não apareceu em 3 cargas (o app montou depois de 2055 ms)')
  }
}

/**
 * Espera o ícone e clica nele; devolve o `performance.now()` do clique. Um MutationObserver anota em
 * `window.__uncoveredAt` o instante exato em que `booting` sai (sem o atraso do polling do teste).
 */
export async function openGate(page: Page): Promise<number> {
  await expect(page.locator('.gate-icon')).toBeVisible({ timeout: 7500 })
  return page.evaluate(() => {
    const root = document.documentElement
    const w = window as unknown as { __uncoveredAt?: number }
    delete w.__uncoveredAt
    const observer = new MutationObserver(() => {
      if (root.classList.contains('booting')) return
      w.__uncoveredAt = performance.now()
      observer.disconnect()
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    const t0 = performance.now()
    document.querySelector<HTMLButtonElement>('.gate-icon')!.click()
    return t0
  })
}

/** `performance.now()` em que a página ficou descoberta (sem `booting`): o instante anotado pelo
 *  `openGate`, ou o do polling quando não houve clique. */
export const uncoveredAt = (page: Page, timeout = 8000): Promise<number> =>
  page
    .waitForFunction(
      () => {
        if (document.documentElement.classList.contains('booting')) return false
        return (window as unknown as { __uncoveredAt?: number }).__uncoveredAt ?? performance.now()
      },
      null,
      { polling: 10, timeout },
    )
    .then((handle) => handle.jsonValue() as Promise<number>)

/**
 * Clica no ícone e mede quanto tempo (ms) a página levou para ficar descoberta, com as linhas visíveis
 * no instante da saída.
 */
export async function enterAndMeasure(page: Page): Promise<{ ms: number; lastAtExit: string; count: number }> {
  await expect(page.locator('.gate-icon')).toBeVisible({ timeout: 7500 })
  return page.evaluate(async () => {
    const t0 = performance.now()
    document.querySelector<HTMLButtonElement>('.gate-icon')!.click()
    let lastAtExit = ''
    let count = 0
    await new Promise<void>((resolve) => {
      const check = () => {
        if (!document.documentElement.classList.contains('booting')) {
          const lines = [...document.querySelectorAll('.gate-session .boot-line:not(.boot-pending)')].map((el) => {
            const clone = el.cloneNode(true) as HTMLElement
            clone.querySelectorAll('.text-type-ghost, .cursor').forEach((n) => n.remove())
            return (clone.textContent ?? '').trim()
          })
          lastAtExit = lines.at(-1) ?? ''
          count = lines.length
          return resolve()
        }
        setTimeout(check, 10)
      }
      check()
    })
    return { ms: performance.now() - t0, lastAtExit, count }
  })
}
