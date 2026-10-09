import type { Page } from '@playwright/test'

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** Luminância relativa (WCAG) de uma cor `rgb(r, g, b)` ou `#rrggbb`. */
export function luminanceOf(color: string): number {
  const m = color.match(/\d+(\.\d+)?/g)
  const hex = color.match(/^#([0-9a-f]{6})$/i)?.[1]
  const [r, g, b] = hex
    ? [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
    : (m ?? ['0', '0', '0']).slice(0, 3).map(Number)
  const f = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!)
}

export const contrastRatio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

/**
 * Maior luminância entre os pixels de cada caixa numa captura da tela (o fundo atrás do texto, com o
 * texto já transparente). Com `quantile` < 1, o quantil em vez do máximo (fundos com grão de ruído,
 * onde um pixel isolado não representa o fundo). A decodificação do PNG roda no próprio navegador
 * (canvas 2D), sem dependência nova no projeto.
 */
export async function maxLuminance(page: Page, boxes: Box[], quantile = 1): Promise<number[]> {
  const png = (await page.screenshot()).toString('base64')
  return page.evaluate(
    async ({ png, boxes, dpr, quantile }) => {
      const img = new Image()
      img.src = `data:image/png;base64,${png}`
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0)
      const f = (v: number) => {
        const c = v / 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      }
      return boxes.map((box) => {
        const x = Math.max(0, Math.floor(box.x * dpr))
        const y = Math.max(0, Math.floor(box.y * dpr))
        const w = Math.max(1, Math.min(canvas.width - x, Math.ceil(box.width * dpr)))
        const h = Math.max(1, Math.min(canvas.height - y, Math.ceil(box.height * dpr)))
        const data = ctx.getImageData(x, y, w, h).data
        const values: number[] = []
        let max = 0
        for (let i = 0; i < data.length; i += 4) {
          const l = 0.2126 * f(data[i]!) + 0.7152 * f(data[i + 1]!) + 0.0722 * f(data[i + 2]!)
          if (l > max) max = l
          if (quantile < 1) values.push(l)
        }
        if (quantile >= 1) return max
        values.sort((a, b) => a - b)
        return values[Math.min(values.length - 1, Math.floor(quantile * (values.length - 1)))] ?? 0
      })
    },
    { png, boxes, dpr: await page.evaluate(() => window.devicePixelRatio), quantile },
  )
}
