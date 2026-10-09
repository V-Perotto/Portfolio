import { expect, type Page } from '@playwright/test'

/**
 * Loops de skills parados (feature 003, V10, FR-025): nenhuma cópia visível e as 28 skills visíveis e
 * inteiras dentro da fita do próprio grupo, sem nenhuma cortada.
 */
export async function expectStaticSkillLoops(page: Page) {
  await expect(page.locator('#skills .skill-loop')).toHaveCount(5)
  await expect(page.locator('#skills [data-loop-copy]:visible')).toHaveCount(0)
  const outside = await page.locator('#skills .skill-loop').evaluateAll((loops) =>
    loops.flatMap((loop) => {
      const box = loop.getBoundingClientRect()
      return [...loop.querySelectorAll('ul:not([aria-hidden]) > li')]
        .filter((li) => {
          const r = li.getBoundingClientRect()
          return r.width === 0 || r.left < box.left - 0.5 || r.right > box.right + 0.5 || r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5
        })
        .map((li) => li.textContent?.trim())
    }),
  )
  expect(outside).toEqual([])
  await expect(page.locator('#skills .skill-loop ul:not([aria-hidden]) > li')).toHaveCount(28)
}
