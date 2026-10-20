#!/usr/bin/env node
// Gera as capturas de tela publicadas como evidência de projeto (feature 009, FR-019, research R4): a
// 4ª exceção do Princípio II (v3.1.0), infraestrutura pessoal sem acesso público, comprovada por uma
// captura datada. Para cada captura do manifesto, a partir do original em tools/source/:
//
//   public/projetos/<projeto>/<nome>-<largura>.webp   uma versão por largura (a exibida na janela e a de
//                                                     tamanho real, que é a resolução original)
//
// O Chromium do Playwright desenha o original num <canvas> e exporta em WebP: o canvas não copia os
// metadados do original (EXIF, XMP, nome do arquivo), e o perfil sRGB genérico que ele grava é tirado
// em seguida (`stripMetadata`), então nada do arquivo de origem vai para o site (FR-019, FR-020). Os
// arquivos gerados são versionados (Princípio III: assets gerados por tools/ ficam no git), e o
// original também, como fonte. O nome leva a data da captura: trocar a captura troca o nome, e nenhum
// cache serve a antiga.
//
// Uso: node tools/build-screenshots.mjs
// Precisa do Chromium do Playwright (npx playwright install chromium). Falha se uma versão passar do
// teto de peso dela (SC-003).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { stripMetadata } from './lib/webp.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Capturas publicadas. `width` igual à do original = tamanho real; `maxKB`: teto da SC-003. */
const SCREENSHOTS = [
  {
    source: 'tools/source/debianserver/painel-casaos-2026-10-20.png',
    outputs: [
      // exibida na janela: cobre a coluna de ~360 px a 1× e a 2× (analyze I2)
      { file: 'public/projetos/debianserver/painel-2026-10-20-800.webp', width: 800, quality: 0.85, maxKB: 120 },
      // tamanho real: o visualizador, o link sem JavaScript e o celular
      { file: 'public/projetos/debianserver/painel-2026-10-20-1396.webp', width: 1396, quality: 0.9, maxKB: 300 },
    ],
  },
]

const browser = await chromium.launch()
const page = await browser.newPage()
let failed = false

try {
  for (const { source, outputs } of SCREENSHOTS) {
    const src = `data:image/png;base64,${readFileSync(join(root, source)).toString('base64')}`
    for (const { file, width, quality, maxKB } of outputs) {
      const result = await page.evaluate(
        async ({ src, width, quality }) => {
          const img = new Image()
          img.src = src
          await img.decode()
          const height = Math.round((img.naturalHeight * width) / img.naturalWidth)
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
          if (!blob || blob.type !== 'image/webp') throw new Error('o navegador não exportou WebP')
          const bytes = new Uint8Array(await blob.arrayBuffer())
          let binary = ''
          for (const byte of bytes) binary += String.fromCharCode(byte)
          return { height, natural: [img.naturalWidth, img.naturalHeight], base64: btoa(binary) }
        },
        { src, width, quality },
      )
      if (width > result.natural[0]) throw new Error(`${file}: ${width} px é maior que o original (${result.natural[0]} px)`)
      const data = stripMetadata(Buffer.from(result.base64, 'base64'))
      mkdirSync(dirname(join(root, file)), { recursive: true })
      writeFileSync(join(root, file), data)
      const kb = data.length / 1024
      const ok = kb <= maxKB
      if (!ok) failed = true
      console.log(`${ok ? 'ok ' : 'ERRO'} ${file}: ${width} × ${result.height}, ${kb.toFixed(1)} KB (teto ${maxKB} KB)`)
    }
  }
} finally {
  await browser.close()
}

if (failed) process.exit(1)
