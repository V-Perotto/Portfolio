import { readdirSync, readFileSync } from 'node:fs'
import { expect, test } from './support/test'

// Feature 010 (quickstart V10; FR-010, SC-005; research R5): o certificado do SENAI publicado não deixa ler
// nenhum dado de documento. Os valores reais nunca aparecem neste repositório (nem aqui): o teste confere
// os pixels das tarjas e procura padrões, não os números.

/** As 5 tarjas, em pt da página A4 (data-model §5): naturalidade, RG, CPF, data de nascimento e código. */
const TARJAS = [
  [147, 296, 294, 321],
  [325, 296, 447, 321],
  [490, 296, 593, 321],
  [709, 296, 794, 321],
  [497, 571, 557, 587],
] as const
const PAGE_WIDTH_PT = 841.89

for (const [file, width] of [
  ['certificados/senai/2020-12-30_ia-1200.webp', 1200],
  ['certificados/senai/2020-12-30_ia-640.webp', 640],
] as const) {
  test(`SENAI ${width} px: as 5 tarjas estão pretas, sem nada legível por baixo (V10, FR-010)`, async ({ page }) => {
    await page.goto('./')
    const scale = width / PAGE_WIDTH_PT
    // 2 px de folga para dentro: a borda da tarja pode misturar com o fundo na redução
    const rects = TARJAS.map(([x0, y0, x1, y1]) => [x0 * scale + 2, y0 * scale + 2, x1 * scale - 2, y1 * scale - 2])
    const means = await page.evaluate(
      async ({ src, rects }) => {
        const img = new Image()
        img.src = src
        await img.decode()
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        return rects.map(([x0, y0, x1, y1]) => {
          const x = Math.ceil(x0!)
          const y = Math.ceil(y0!)
          const data = ctx.getImageData(x, y, Math.floor(x1!) - x, Math.floor(y1!) - y).data
          let r = 0
          let g = 0
          let b = 0
          let max = 0
          for (let i = 0; i < data.length; i += 4) {
            r += data[i]!
            g += data[i + 1]!
            b += data[i + 2]!
            max = Math.max(max, data[i]!, data[i + 1]!, data[i + 2]!)
          }
          const n = data.length / 4
          return { r: r / n, g: g / n, b: b / n, max }
        })
      },
      { src: `${new URL(page.url()).pathname}${file}`, rects },
    )
    for (const [i, mean] of means.entries()) {
      expect(mean.r, `tarja ${i + 1}`).toBeLessThan(16)
      expect(mean.g, `tarja ${i + 1}`).toBeLessThan(16)
      expect(mean.b, `tarja ${i + 1}`).toBeLessThan(16)
      // nenhum pixel claro (letra) dentro da tarja
      expect(mean.max, `tarja ${i + 1}`).toBeLessThan(64)
    }
  })
}

test('o site publicado não tem padrão de CPF nem de documento (V10, SC-005)', () => {
  const files = ['dist/index.html', ...readdirSync('dist/assets').filter((f) => f.endsWith('.js')).map((f) => `dist/assets/${f}`)]
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    expect(text, file).not.toMatch(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/)
    expect(text, file).not.toMatch(/CPF\W{0,3}\d{11}/)
    expect(text.toLowerCase(), file).not.toMatch(/natural de|nascid[oa]/)
  }
})

test('o SENAI não publica o código de verificação: só o comentário de privacidade (C2)', () => {
  const html = readFileSync('dist/index.html', 'utf8')
  expect(html).not.toContain('sistemafiep')
  expect(html).toContain('código omitido por privacidade')
})
