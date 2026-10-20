import { describe, expect, it } from 'vitest'
import { fromDataUrl, webpChunkIds } from '../../tools/lib/webp.mjs'

// Feature 010 (quickstart V16; FR-019 da 009, FR-009 e FR-021 da 010): toda imagem publicada em public/
// sai sem metadados — nem perfil de cor, nem EXIF, nem XMP (o canvas e o `stripMetadata` dos scripts).
// As imagens chegam como data URL: o tsconfig dos testes não tem os tipos do Node.
const files = import.meta.glob<string>('../../public/**/*.webp', { query: '?inline', import: 'default', eager: true })

describe('WebP publicados', () => {
  it('há imagens a conferir', () => {
    expect(Object.keys(files).length).toBeGreaterThan(100)
  })

  it('nenhum tem ICCP, EXIF ou XMP', () => {
    for (const [file, url] of Object.entries(files)) {
      const ids = webpChunkIds(fromDataUrl(url))
      expect(ids.filter((id) => ['ICCP', 'EXIF', 'XMP '].includes(id)), file).toEqual([])
    }
  })
})
