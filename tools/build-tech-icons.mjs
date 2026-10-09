#!/usr/bin/env node
// Gera o sprite de ícones de tecnologia do site (feature 003, research R1–R2).
//
// Cada chip e cada item dos loops de skills usa <svg><use href="sprite.svg#id"></svg>. Os ícones vêm,
// nesta ordem de preferência, do devicon (v2.17.0, MIT), do vectorlogo.zone e do Lucide (ISC, pelo
// assunto da tecnologia). Este script baixa os escolhidos, otimiza com o svgo, tira as cores das
// marcas (tudo pinta com currentColor, a cor do texto do chip) e grava:
//
//   src/assets/tech-icons/sprite.svg   um <symbol id="devicon-python"> etc. por ícone
//   src/assets/tech-icons/NOTICE.md    origem, versão e licença de cada fonte
//
// Os dois arquivos são versionados (Princípio III: assets gerados por tools/ ficam no git), então o
// build do site não precisa de rede nem do svgo. Rode de novo só quando o registro
// src/lib/tech-icons.ts ganhar um ícone novo; o teste tests/unit/tech-icons.spec.ts aponta id do
// registro que falte no sprite.
//
// Uso: node tools/build-tech-icons.mjs [--preview <arquivo.html>]
//      --preview grava também uma grade com todos os ícones (16px e 32px) para conferir que nenhum
//      virou borrão ao ganhar uma cor só.
//
// Precisa de rede (jsDelivr e vectorlogo.zone) e do npx (o svgo roda com versão fixa, sem entrar no
// package.json, como o build-fonts.sh faz com o pyftsubset).

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as lucide from '@lucide/vue'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'src/assets/tech-icons')
const DEVICON_VERSION = '2.17.0'
const SVGO = 'svgo@4.1.0'

/** devicon: nome → variante. `plain` quando existe; senão `line`; senão `original` (data-model). */
const DEVICON = {
  python: 'plain',
  flask: 'original',
  java: 'plain',
  quarkus: 'plain',
  typescript: 'plain',
  vuejs: 'plain',
  react: 'original',
  angular: 'plain',
  nodejs: 'plain',
  csharp: 'plain',
  'dot-net': 'plain',
  mongodb: 'plain',
  postgresql: 'plain',
  microsoftsqlserver: 'plain',
  mysql: 'original',
  git: 'plain',
  docker: 'plain',
  jenkins: 'plain',
  rabbitmq: 'original',
  redis: 'plain',
  elasticsearch: 'plain',
  kibana: 'plain',
  nestjs: 'original', // o `line` some em 12px; o `original` preenchido continua legível
  prisma: 'original',
  vitejs: 'plain',
  axios: 'plain',
  json: 'plain',
  vscode: 'plain',
}

/**
 * vectorlogo.zone: o que falta no devicon (SAP) e o que no devicon só existe como logotipo escrito,
 * ilegível no tamanho do chip (nginx: o devicon só tem "NGINX" por extenso; aqui é o hexágono com N).
 */
const VECTORLOGO = {
  sap: 'https://www.vectorlogo.zone/logos/sap/sap-icon.svg',
  nginx: 'https://www.vectorlogo.zone/logos/nginx/nginx-icon.svg',
}

/** Lucide: id do símbolo → componente do @lucide/vue instalado (ícone genérico pelo assunto). */
const LUCIDE = {
  database: 'Database',
  'scan-text': 'ScanText',
  'brain-circuit': 'BrainCircuit',
  bot: 'Bot',
  'list-checks': 'ListChecks',
  blocks: 'Blocks',
  webhook: 'Webhook',
  'app-window': 'AppWindow',
  'clipboard-list': 'ClipboardList',
  workflow: 'Workflow',
  package: 'Package',
  server: 'Server',
  shapes: 'Shapes',
  'circle-dot': 'CircleDot',
  factory: 'Factory',
  'panels-top-left': 'PanelsTopLeft',
  boxes: 'Boxes',
  'flask-conical': 'FlaskConical',
  'brush-cleaning': 'BrushCleaning',
  'iteration-cw': 'IterationCw',
}

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ao baixar ${url}`)
  return res.text()
}

/** Raiz e miolo de um SVG de uma linha só (saída do svgo). */
function splitSvg(svg) {
  const m = svg.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>/)
  if (!m) throw new Error(`SVG inválido: ${svg.slice(0, 80)}`)
  const attrs = m[1]
  const viewBox = attrs.match(/viewBox="([^"]+)"/)?.[1]
  const width = attrs.match(/\bwidth="([\d.]+)"/)?.[1]
  const height = attrs.match(/\bheight="([\d.]+)"/)?.[1]
  return { viewBox: viewBox ?? (width && height ? `0 0 ${width} ${height}` : null), inner: m[2] }
}

/** Tira toda cor fixa: o símbolo inteiro pinta com o currentColor do <g> que o embrulha. */
function decolor(inner) {
  return inner
    .replace(/\s(fill|stroke)="(?!none")[^"]*"/g, '')
    .replace(/\sstyle="[^"]*"/g, '')
    .replace(/\sclass="[^"]*"/g, '')
}

// ---- vectorlogo.zone: forma colorida com um desenho branco por cima (SAP: trapézio em degradê e o
// texto "SAP"; nginx: hexágono e o "N"). Com uma cor só, o branco vira recorte: forma e desenho entram
// num mesmo <path fill-rule="evenodd">, então o desenho fura a forma (e o miolo do "A" e do "P" volta
// a ser preenchido). Sem <mask> nem degradê, que nem todo navegador desenha num <use> de arquivo
// externo.

/** Aplica translate + scale a um caminho só de retas (M/L/H/V/Z, absolutos ou relativos). */
function transformPolygon(d, tx, ty, s) {
  const tokens = d.match(/[MLHVZmlhvz]|-?[\d.]+(?:e-?\d+)?/g)
  let x = 0
  let y = 0
  let cmd = ''
  const pts = []
  for (let i = 0; i < tokens.length; ) {
    const t = tokens[i]
    if (/[A-Za-z]/.test(t)) {
      cmd = t
      i++
      if (cmd === 'Z' || cmd === 'z') pts.push('Z')
      continue
    }
    const n = () => Number(tokens[i++])
    switch (cmd) {
      case 'M': case 'L': x = n(); y = n(); break
      case 'm': case 'l': x += n(); y += n(); break
      case 'H': x = n(); break
      case 'h': x += n(); break
      case 'V': y = n(); break
      case 'v': y += n(); break
      default: throw new Error(`comando ${cmd} não suportado no polígono do SAP`)
    }
    const r = (v) => Math.round(v * 10) / 10
    pts.push(`${pts.length === 0 || pts.at(-1) === 'Z' ? 'M' : 'L'}${r(x * s + tx)} ${r(y * s + ty)}`)
    if (cmd === 'M') cmd = 'L'
    if (cmd === 'm') cmd = 'l'
  }
  return pts.join('')
}

const WHITE = /^#f(?:ff|efefe|fffff)$/i

function knockout(id, inner) {
  const paths = [...inner.matchAll(/<path\b([^>]*)\/>/g)].map(([, attrs]) => ({
    fill: attrs.match(/\sfill="([^"]+)"/)?.[1] ?? '',
    d: attrs.match(/\sd="([^"]+)"/)?.[1] ?? '',
    transform: attrs.match(/\stransform="([^"]+)"/)?.[1],
  }))
  const shapes = paths.filter((p) => !WHITE.test(p.fill))
  const holes = paths.filter((p) => WHITE.test(p.fill))
  if (shapes.length !== 1 || holes.length < 1 || holes.some((p) => p.transform)) {
    throw new Error(`${id} mudou de formato (esperado: 1 forma colorida + desenho branco); ajuste knockout()`)
  }
  let d = shapes[0].d
  if (shapes[0].transform) {
    const t = shapes[0].transform.match(/^translate\(([\d.-]+)[ ,]([\d.-]+)\)scale\(([\d.]+)\)$/)
    if (!t) throw new Error(`${id}: transform não suportado (${shapes[0].transform})`)
    d = transformPolygon(d, +t[1], +t[2], +t[3])
  }
  return `<path fill-rule="evenodd" d="${d}${holes.map((p) => p.d).join('')}"/>`
}

// -----------------------------------------------------------------------------------------------

const work = mkdtempSync(join(tmpdir(), 'tech-icons-'))
const dirs = {
  raw: join(work, 'raw'),
  rawVectorlogo: join(work, 'raw-vectorlogo'),
  rawLucide: join(work, 'raw-lucide'),
  min: join(work, 'min'),
}
Object.values(dirs).forEach((d) => mkdirSync(d))

try {
  console.log(`baixando ${Object.keys(DEVICON).length} ícones do devicon v${DEVICON_VERSION}…`)
  for (const [name, variant] of Object.entries(DEVICON)) {
    const url = `https://cdn.jsdelivr.net/gh/devicons/devicon@v${DEVICON_VERSION}/icons/${name}/${name}-${variant}.svg`
    writeFileSync(join(dirs.raw, `devicon-${name}.svg`), await fetchText(url))
  }
  for (const [name, url] of Object.entries(VECTORLOGO)) {
    writeFileSync(join(dirs.rawVectorlogo, `vectorlogo-${name}.svg`), await fetchText(url))
  }
  for (const [id, component] of Object.entries(LUCIDE)) {
    if (!(component in lucide)) throw new Error(`@lucide/vue não tem ${component}`)
    const svg = await renderToString(createSSRApp({ render: () => h(lucide[component]) }))
    writeFileSync(join(dirs.rawLucide, `lucide-${id}.svg`), svg)
  }

  // devicon (grade de 128): coordenadas inteiras erram ≤ 0,06 px num ícone de 16 px. vectorlogo.zone
  // (grades de 64 e 32) e Lucide (24) ficam com uma casa decimal (research R2).
  const svgo = (from, precision) =>
    execFileSync('npx', ['--yes', SVGO, '-q', '--multipass', '-p', String(precision), '-f', from, '-o', dirs.min], {
      stdio: 'inherit',
    })
  svgo(dirs.raw, 0)
  svgo(dirs.rawVectorlogo, 1)
  svgo(dirs.rawLucide, 1)

  const symbols = []
  for (const file of readdirSync(dirs.min).sort()) {
    const id = file.replace(/\.svg$/, '')
    const { viewBox, inner } = splitSvg(readFileSync(join(dirs.min, file), 'utf8'))
    if (!viewBox) throw new Error(`${id} sem viewBox`)
    if (/\sid="/.test(inner) && !id.startsWith('vectorlogo-')) throw new Error(`${id} tem ids internos; prefixe-os`)
    let body
    if (id.startsWith('lucide-')) {
      body = `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${decolor(inner)}</g>`
    } else if (id.startsWith('vectorlogo-')) {
      body = `<g fill="currentColor">${knockout(id, inner)}</g>`
    } else {
      if (/<(linearGradient|radialGradient|mask|clipPath|style)\b/.test(inner)) throw new Error(`${id}: degradê, máscara ou <style>`)
      body = `<g fill="currentColor">${decolor(inner)}</g>`
    }
    symbols.push(`<symbol id="${id}" viewBox="${viewBox}">${body}</symbol>`)
  }

  mkdirSync(OUT, { recursive: true })
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join('\n')}\n</svg>\n`
  writeFileSync(join(OUT, 'sprite.svg'), sprite)

  const deviconLicense = await fetchText(`https://cdn.jsdelivr.net/gh/devicons/devicon@v${DEVICON_VERSION}/LICENSE`)
  const lucideLicense = readFileSync(join(ROOT, 'node_modules/@lucide/vue/LICENSE'), 'utf8')
  const lucideVersion = JSON.parse(readFileSync(join(ROOT, 'node_modules/@lucide/vue/package.json'), 'utf8')).version
  const today = new Date().toISOString().slice(0, 10)
  writeFileSync(
    join(OUT, 'NOTICE.md'),
    `# Ícones de tecnologia — origem e licenças

Gerado por \`tools/build-tech-icons.mjs\` em ${today}. Não edite \`sprite.svg\` à mão: mude o
manifesto do script e rode-o de novo. Todos os ícones foram otimizados com o svgo e reduzidos a uma
cor só (\`currentColor\`).

## devicon v${DEVICON_VERSION} — ${Object.keys(DEVICON).length} ícones

Fonte: https://devicon.dev (jsDelivr, tag v${DEVICON_VERSION}). Símbolos \`devicon-*\`:
${Object.entries(DEVICON).map(([n, v]) => `\`${n}\` (${v})`).join(', ')}.

\`\`\`text
${deviconLicense.trim()}
\`\`\`

## vectorlogo.zone — ${Object.keys(VECTORLOGO).length} ícones

Fonte: https://www.vectorlogo.zone (baixado em ${today}). Símbolos \`vectorlogo-*\`:
${Object.entries(VECTORLOGO).map(([n, u]) => `\`${n}\` (${u})`).join(', ')}. O desenho branco de cada
um (o texto do SAP, o "N" do nginx) virou recorte (\`fill-rule="evenodd"\`). O nginx vem daqui porque
o devicon só tem o logotipo escrito por extenso, ilegível no tamanho do chip.

Termos do vectorlogo.zone: "The logos themselves remain property of their original owners. [...] Any
modifications to the logos are in the public domain." Os logotipos são marcas dos donos e aparecem
aqui só para identificar a tecnologia.

## Lucide (@lucide/vue ${lucideVersion}) — ${Object.keys(LUCIDE).length} ícones

Fonte: https://lucide.dev, renderizados do pacote instalado. Símbolos \`lucide-*\`: ícones genéricos
pelo assunto, para tecnologias sem logotipo no devicon nem no vectorlogo.zone:
${Object.entries(LUCIDE).map(([id, c]) => `\`${id}\` (${c})`).join(', ')}.

\`\`\`text
${lucideLicense.trim()}
\`\`\`
`,
  )
  console.log(`sprite: ${symbols.length} símbolos, ${sprite.length} bytes → ${join('src/assets/tech-icons', 'sprite.svg')}`)

  const previewAt = process.argv.indexOf('--preview')
  if (previewAt !== -1) {
    const target = process.argv[previewAt + 1]
    if (!target) throw new Error('--preview pede o caminho do HTML')
    const ids = symbols.map((s) => s.match(/id="([^"]+)"/)[1])
    const cell = (id) =>
      `<figure><svg width="16" height="16"><use href="#${id}"/></svg><svg width="32" height="32"><use href="#${id}"/></svg><figcaption>${id}</figcaption></figure>`
    writeFileSync(
      target,
      `<!doctype html><meta charset="utf-8"><style>body{background:#16101f;color:#4ade9b;font:12px monospace;display:grid;grid-template-columns:repeat(6,1fr);gap:12px;padding:16px}figure{margin:0;display:flex;align-items:center;gap:8px}figcaption{color:#8a819e}</style>${sprite.replace('<svg ', '<svg style="display:none" ')}${ids.map(cell).join('')}`,
    )
    console.log(`grade de conferência: ${target}`)
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
