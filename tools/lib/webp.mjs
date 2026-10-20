// Funções de WebP dos scripts de imagem (feature 009: build-screenshots.mjs; feature 010:
// build-certificates.mjs) e dos testes que conferem os arquivos publicados. Sem dependência: só lê e
// reescreve os blocos RIFF do formato. Trabalha com `Uint8Array` (um `Buffer` do Node também é um), para
// servir aos scripts e aos testes do Vitest, que não têm os tipos do Node.

const ascii = (bytes, at, length) => String.fromCharCode(...bytes.subarray(at, at + length))
const u16 = (bytes, at) => bytes[at] | (bytes[at + 1] << 8)
const u24 = (bytes, at) => bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16)
const u32 = (bytes, at) => (bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16) | (bytes[at + 3] << 24)) >>> 0

/** Blocos RIFF de um WebP: o id, o conteúdo e o bloco inteiro (com o cabeçalho e o byte de alinhamento). */
function chunks(webp) {
  if (ascii(webp, 0, 4) !== 'RIFF' || ascii(webp, 8, 4) !== 'WEBP') throw new Error('não é um WebP')
  const list = []
  for (let at = 12; at < webp.length; ) {
    const id = ascii(webp, at, 4)
    const size = u32(webp, at + 4)
    const end = at + 8 + size + (size % 2)
    list.push({ id, data: webp.subarray(at + 8, at + 8 + size), raw: webp.subarray(at, end) })
    at = end
  }
  return list
}

/**
 * Tira do WebP os blocos de metadados (`ICCP`, `EXIF`, `XMP `) e as marcas deles no `VP8X`. O canvas do
 * Chromium grava um perfil sRGB genérico (`ICCP`); sem ele, o navegador já assume sRGB, então a cor não
 * muda (FR-019 da 009: publicada sem metadados).
 */
export function stripMetadata(webp) {
  const kept = chunks(webp)
    .filter((c) => !['ICCP', 'EXIF', 'XMP '].includes(c.id))
    .map((c) => Uint8Array.from(c.raw))
  const vp8x = kept.find((c) => ascii(c, 0, 4) === 'VP8X')
  // marcas do VP8X: 0x20 ICC, 0x08 EXIF, 0x04 XMP
  if (vp8x) vp8x[8] &= ~(0x20 | 0x08 | 0x04)
  const bodyLength = kept.reduce((sum, c) => sum + c.length, 0)
  const out = new Uint8Array(12 + bodyLength)
  out.set([...'RIFF'].map((ch) => ch.charCodeAt(0)), 0)
  new DataView(out.buffer).setUint32(4, 4 + bodyLength, true)
  out.set([...'WEBP'].map((ch) => ch.charCodeAt(0)), 8)
  let at = 12
  for (const c of kept) {
    out.set(c, at)
    at += c.length
  }
  return out
}

/** Ids dos blocos do arquivo, na ordem (`['VP8X', 'VP8 ']`): o teste de metadados olha estes. */
export function webpChunkIds(webp) {
  return chunks(webp).map((c) => c.id)
}

/** Largura e altura lidas do cabeçalho (`VP8X`, `VP8 ` ou `VP8L`). */
export function webpSize(webp) {
  const list = chunks(webp)
  const vp8x = list.find((c) => c.id === 'VP8X')
  if (vp8x) return { width: 1 + u24(vp8x.data, 4), height: 1 + u24(vp8x.data, 7) }
  const lossy = list.find((c) => c.id === 'VP8 ')
  // quadro-chave: 3 bytes de marca, 3 de assinatura (9d 01 2a), depois largura e altura de 14 bits
  if (lossy) return { width: u16(lossy.data, 6) & 0x3fff, height: u16(lossy.data, 8) & 0x3fff }
  const lossless = list.find((c) => c.id === 'VP8L')
  if (lossless) {
    const bits = u32(lossless.data, 1)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  throw new Error('WebP sem bloco de imagem')
}

/** Bytes de uma data URL `data:…;base64,…` (os testes leem as imagens assim, pelo `import.meta.glob`). */
export function fromDataUrl(url) {
  const binary = atob(url.slice(url.indexOf(',') + 1))
  return Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
}
