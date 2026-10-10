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

/** Luminâncias (WCAG) de uma região da tela, decodificadas no próprio navegador. */
async function regionLuminance(page: Page, box: Box): Promise<{ width: number; height: number; values: number[] }> {
  const png = (await page.screenshot({ clip: box })).toString('base64')
  return page.evaluate(async (data) => {
    const img = new Image()
    img.src = `data:image/png;base64,${data}`
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(img, 0, 0)
    const px = ctx.getImageData(0, 0, img.width, img.height).data
    const f = (v: number) => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
    const values: number[] = []
    for (let i = 0; i < px.length; i += 4) values.push(0.2126 * f(px[i]!) + 0.7152 * f(px[i + 1]!) + 0.0722 * f(px[i + 2]!))
    return { width: img.width, height: img.height, values }
  }, png)
}

/** Caixa (em CSS px) dos nós de texto visíveis de um elemento, sem os `.sr-only`, com uma margem. */
export async function textBox(page: Page, selector: string, margin = 0): Promise<Box> {
  return page.evaluate(
    ({ selector, margin }) => {
      const el = document.querySelector<HTMLElement>(selector)!
      const rects: DOMRect[] = []
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const node = walker.currentNode
        if (!node.textContent?.trim() || node.parentElement?.closest('.sr-only')) continue
        const range = document.createRange()
        range.selectNodeContents(node)
        rects.push(...[...range.getClientRects()].filter((c) => c.width > 0 && c.height > 0))
      }
      const left = Math.min(...rects.map((c) => c.left)) - margin
      const top = Math.min(...rects.map((c) => c.top)) - margin
      const right = Math.max(...rects.map((c) => c.right)) + margin
      const bottom = Math.max(...rects.map((c) => c.bottom)) + margin
      return { x: Math.max(0, left), y: Math.max(0, top), width: right - Math.max(0, left), height: bottom - Math.max(0, top) }
    },
    { selector, margin },
  )
}

/**
 * Contraste de um texto do hero que tem halo (feature 007, research R8). O WCAG, para texto sobre imagem
 * com halo, mede o texto contra o halo: o fundo que conta é o que encosta nas letras. Por isso:
 *
 * 1. fixa a altura da linha do prompt (a frase digitada quebra em duas linhas no celular e empurraria o
 *    texto entre a máscara e os quadros);
 * 2. máscara das letras: o fundo animado escondido, o hero em preto e o texto em branco, sem sombra;
 *    traço = luminância > 0,25; borda antisserrilhada = > 0,05;
 * 3. vizinhança: os pixels a até 2 px CSS (× DPR) de um traço que não são letra nem borda dela;
 * 4. em cada quadro, com o texto transparente e o halo mantido (a sombra continua desenhada com
 *    `color: transparent`), a maior luminância da vizinhança, contra a cor do texto.
 *
 * `hide`: seletores escondidos nas duas capturas (ex.: a grade do loader, ao lado do texto dele).
 */
export async function haloContrast(page: Page, selector: string, textColor: string, frames = 10, hide = ''): Promise<number> {
  const pin = await page.addStyleTag({
    content: `#home .hero-terminal { min-height: 3.6em !important; }${hide ? ` ${hide} { visibility: hidden !important; }` : ''}`,
  })
  const box = await textBox(page, selector, 12)
  const mask = await page.addStyleTag({
    content:
      `#home .hero-glitch { visibility: hidden !important; } #home { background: #000 !important; } ` +
      // o `filter` fica como está: com e sem filtro, o Chromium encaixa um texto em meio pixel em pixels
      // diferentes, e a máscara sairia 1 px fora dos quadros
      `${selector}, ${selector} * { color: #fff !important; text-shadow: none !important; transition: none !important; }`,
  })
  const m = await regionLuminance(page, box)
  await mask.evaluate((node) => (node as Element).remove())
  const r = Math.round(2 * (await page.evaluate(() => window.devicePixelRatio)))
  const stroke = m.values.map((v) => v > 0.25)
  const ink = m.values.map((v) => v > 0.05)
  const near = m.values.map((_, i) => {
    if (ink[i]) return false
    const x = i % m.width
    const y = Math.floor(i / m.width)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx
        const yy = y + dy
        if (xx >= 0 && yy >= 0 && xx < m.width && yy < m.height && stroke[yy * m.width + xx]) return true
      }
    return false
  })
  const transparent = await page.addStyleTag({
    content: `${selector}, ${selector} * { color: transparent !important; transition: none !important; }`,
  })
  let worst = Infinity
  for (let frame = 0; frame < frames; frame++) {
    const shot = await regionLuminance(page, box)
    let max = 0
    shot.values.forEach((v, i) => {
      if (near[i] && v > max) max = v
    })
    worst = Math.min(worst, contrastRatio(luminanceOf(textColor), max))
    await page.waitForTimeout(120)
  }
  await transparent.evaluate((node) => (node as Element).remove())
  await pin.evaluate((node) => (node as Element).remove())
  return worst
}
