#!/usr/bin/env node
// Gera o favicon do site (feature 006, FR-028, research R11): o ícone de terminal da dock
// (`square-terminal` do Lucide, ISC) no verde do tema, com um brilho difuso no roxo do tema atrás.
//
//   public/favicon.svg            o desenho, com as cores lidas de src/styles/tokens.css
//   public/favicon-32.png         32 px, fundo transparente (navegadores sem favicon em SVG)
//   public/apple-touch-icon.png   180 px, sobre o fundo do tema (o iOS não usa transparência)
//
// O quadrado do ícone é preenchido com o fundo do tema: o verde do tema sobre uma aba branca teria
// 1,9:1. Os três arquivos são versionados (Princípio III: assets gerados por tools/ ficam no git). Rode
// de novo só se as cores do tema mudarem.
//
// Uso: node tools/build-favicon.mjs
// Precisa do Chromium do Playwright (npx playwright install chromium), que rasteriza os PNGs.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8')

/** Primeiro valor `#rrggbb` do token (o do tema escuro, no :root). */
function token(name) {
  const match = tokens.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))
  if (!match) throw new Error(`token ${name} sem valor #rrggbb em tokens.css`)
  return match[1].toLowerCase()
}

const green = token('--green-bright')
const purple = token('--purple-light')
const bg = token('--bg')

// viewBox de 32: o ícone de 24 do Lucide no meio, com 4 de folga para o brilho
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.2"/>
    </filter>
  </defs>
  <rect x="6" y="6" width="20" height="20" rx="4" fill="${purple}" filter="url(#glow)"/>
  <g transform="translate(4 4)" fill="none" stroke="${green}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" fill="${bg}"/>
    <path d="m7 11 2-2-2-2"/>
    <path d="M11 13h4"/>
  </g>
</svg>
`

writeFileSync(join(root, 'public/favicon.svg'), svg)

const browser = await chromium.launch()
async function rasterize(size, file, background) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  await page.setContent(
    `<html><body style="margin:0;background:${background ?? 'transparent'}"><img src="${src}" width="${size}" height="${size}" style="display:block"></body></html>`,
  )
  await page.locator('img').evaluate((img) => img.decode())
  await page.screenshot({ path: join(root, file), omitBackground: !background })
  await page.close()
}
await rasterize(32, 'public/favicon-32.png')
await rasterize(180, 'public/apple-touch-icon.png', bg)
await browser.close()

console.log(`favicon: verde ${green}, brilho ${purple}, fundo ${bg} → public/favicon.svg, favicon-32.png, apple-touch-icon.png`)
