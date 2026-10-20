import { readFileSync } from 'node:fs'
import { expect, test } from './support/test'

// Feature 009 (FR-019, FR-020, SC-003; research R4 e R11): as capturas publicadas são WebP sem metadados,
// na largura e no peso combinados. Lê os arquivos de `public/` direto, sem navegador.
const FILES = [
  { path: 'public/projetos/debianserver/painel-2026-10-20-800.webp', width: 800, maxKB: 120 },
  { path: 'public/projetos/debianserver/painel-2026-10-20-1396.webp', width: 1396, maxKB: 300 },
]

/** Blocos do RIFF de um WebP: id e tamanho do conteúdo. */
function chunks(data: Buffer): { id: string; start: number; size: number }[] {
  const found: { id: string; start: number; size: number }[] = []
  for (let at = 12; at < data.length; ) {
    const size = data.readUInt32LE(at + 4)
    found.push({ id: data.toString('ascii', at, at + 4), start: at + 8, size })
    at += 8 + size + (size % 2)
  }
  return found
}

/** Largura da imagem pelo cabeçalho do bloco de imagem (VP8X, VP8L ou VP8). */
function widthOf(data: Buffer): number {
  const list = chunks(data)
  const vp8x = list.find((c) => c.id === 'VP8X')
  if (vp8x) return 1 + data.readUIntLE(vp8x.start + 4, 3)
  const lossless = list.find((c) => c.id === 'VP8L')
  if (lossless) return 1 + (data.readUInt32LE(lossless.start + 1) & 0x3fff)
  const lossy = list.find((c) => c.id === 'VP8 ')!
  return data.readUInt16LE(lossy.start + 6) & 0x3fff
}

for (const { path, width, maxKB } of FILES) {
  test(`${path}: WebP sem metadados, ${width} px, até ${maxKB} KB (FR-019, SC-003)`, () => {
    const data = readFileSync(path)
    expect(data.toString('ascii', 0, 4)).toBe('RIFF')
    expect(data.toString('ascii', 8, 12)).toBe('WEBP')
    const ids = chunks(data).map((c) => c.id)
    for (const id of ids) expect(['VP8 ', 'VP8L', 'VP8X', 'ALPH']).toContain(id)
    expect(ids).not.toContain('EXIF')
    expect(ids).not.toContain('XMP ')
    expect(ids).not.toContain('ICCP')
    expect(widthOf(data)).toBe(width)
    expect(data.length / 1024).toBeLessThanOrEqual(maxKB)
  })
}
