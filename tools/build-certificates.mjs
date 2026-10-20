#!/usr/bin/env node
// Gera as imagens publicadas da feature 010 (research R4 e R5): a miniatura e o tamanho real de cada
// certificado e as duas versões da foto do 1º dia na Prime Control.
//
//   public/certificados/<plataforma>/<AAAA-MM-DD>_<slug>-640.webp        miniatura, no arquivo da janela
//   public/certificados/<plataforma>/<AAAA-MM-DD>_<slug>-<largura>.webp  tamanho real, no visualizador
//   public/carreira/prime-control/integracao-2020-10-15-{512,1024}.webp   a foto
//
// A lista de certificados vem do próprio src/data/resume.ts (o Node ≥ 23.6 apaga os tipos e o executa);
// este script só guarda o arquivo de origem de cada um e as edições. As origens ficam FORA do repositório
// (CERTIFICADOS_DIR, por padrão ~/Documents/certificados): os PDFs não são versionados (`*.pdf` no
// .gitignore, pela constituição), e o certificado do SENAI e a foto originais não podem ir para um
// repositório público. PDF: a 1ª página, renderizada pelo `pdftoppm` (poppler-utils) com 1200 px de
// largura. PNG e JPEG: como estão.
//
// Privacidade (FR-010, FR-020): o Chromium do Playwright desenha a origem num <canvas> na resolução dela,
// aplica as tarjas pretas e os desfoques ANTES de qualquer redução, e só então exporta as versões; nenhuma
// versão publicada passa pelo original sem edição. O WebP sai sem metadados (`stripMetadata`). Os
// arquivos gerados são versionados (Princípio III).
//
// Uso: node tools/build-certificates.mjs
// Precisa de Node ≥ 23.6, do Chromium do Playwright (npx playwright install chromium) e do pdftoppm.
// Falha se uma versão passar do teto de peso dela (SC-011), se faltar uma origem, ou se a altura gerada
// não bater com a `image` da plataforma nos dados.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { stripMetadata } from './lib/webp.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_DIR = process.env.CERTIFICADOS_DIR ?? join(homedir(), 'Documents', 'certificados')

const [major, minor] = process.versions.node.split('.').map(Number)
if (major < 23 || (major === 23 && minor < 6)) {
  console.error(`Node ${process.versions.node}: este script precisa de Node ≥ 23.6 (lê o src/data/resume.ts direto).`)
  process.exit(1)
}

/** Largura da miniatura: igual a `CERT_THUMB_WIDTH` de src/lib/certificates.ts. */
const THUMB_WIDTH = 640
/** Tetos da SC-011, em KB. */
const MAX_KB = { thumb: 40, full: 200, photo: 60, photoFull: 150 }
/** Qualidade do WebP: 0,80; a borda de guilhoché da Udemy pede 0,70 na miniatura (research R4). */
const QUALITY = { thumb: 0.8, full: 0.8, thumbByPlatform: { udemy: 0.7 } }

/** Arquivo de origem de cada certificado, por `<plataforma>/<id>` (data-model §7, coluna "Origem"). */
const SOURCES = {
  // dio
  'dio/empregotech-basico': '207D7222.pdf',
  'dio/empregotech-inter': 'E1741B9C.pdf',
  'dio/node-filas': 'A35EA586.pdf',
  'dio/node-backend': '04197A25.pdf',
  'dio/node-api-crushes': '2A52F6C3.pdf',
  'dio/postgresql': '1D1848C9.pdf',
  'dio/node-express': '20FDACA9.pdf',
  'dio/redux': '09DC6357.pdf',
  'dio/js-com-react': '37389BE3.pdf',
  'dio/reactjs-web': '63AD8F56.pdf',
  'dio/react-typescript': 'A37A0FDD.pdf',
  'dio/intro-reactjs': 'F95A98CB.pdf',
  'dio/performance-web': '6302A4C9.pdf',
  'dio/tdd-javascript': '83658A4D.pdf',
  'dio/js-es6-avancado': 'A505E509.pdf',
  'dio/styled-components': 'FB4F39F0.pdf',
  'dio/js-es6-essencial': 'AA7D3B45.pdf',
  'dio/promises': 'C162ED32.pdf',
  'dio/modelagem-negocios': '6C7F9089.pdf',
  'dio/javascript-web': 'EE630C61.pdf',
  'dio/negocios-digitais': 'B00E13E2.pdf',
  'dio/hexagonal': '79B5C5C4.pdf',
  'dio/arquitetura-avancado': '61817017.pdf',
  'dio/ddd-arquitetura': 'DA144088.pdf',
  'dio/bootstrap': '79F59175.pdf',
  'dio/html5-css3': '3085EBFF.pdf',
  'dio/mentalidade': '265A8CDF.pdf',
  'dio/intraempreendedor': '4DD49C6E.pdf',
  'dio/scrum': 'F861E33A.pdf',
  'dio/github': '4091DB01.pdf',
  'dio/git': '1D2A9D24.pdf',
  'dio/arquitetura-sistemas': 'B10F8D56.pdf',
  'dio/logica-programacao': 'F4F49CF0.pdf',
  // prime-academy
  'prime-academy/scrum': 'CertificadoSCRUM.png',
  'prime-academy/apis': 'CertificadoAPI.png',
  'prime-academy/bdd': 'CertificadoBDD.png',
  'prime-academy/csharp-convencoes': 'certificadoC#.png',
  'prime-academy/hp-alm-qc': 'CertificadoHP-ALM-QC.png',
  'prime-academy/rabbiit': 'CertificadoRabbiit.png',
  'prime-academy/sql-basico': 'CertificadoSQL.png',
  'prime-academy/chatbots': 'CertificadoChatbot.png',
  'prime-academy/hp-alm-uft': 'CertificadoHP_ALM-HP_UFT.png',
  'prime-academy/varejo': 'CertificadoNocoesBasicasVarejo.png',
  'prime-academy/abertura-bugs': 'CertificadoAberturaBugs.png',
  'prime-academy/web-ruby': 'CertificadoAutomarWebRuby.png',
  'prime-academy/gtd': 'CertificadoGTD.png',
  'prime-academy/teste-software': 'CertificadoTesteSoftware.png',
  'prime-academy/testador-agil': 'CertificadoTestadorAgil.png',
  'prime-academy/casos-de-teste': 'CertificadoEspecificacaoCasosTeste.png',
  'prime-academy/continuous-testing': 'CertificadoAcelerarEntregasTesting.png',
  'prime-academy/bdd-caso-de-teste': 'CertificadoBDDn.png',
  'prime-academy/ct-academy': 'CertificadoContinousTestingAcademy.png',
  'prime-academy/conhecendo-prime': 'CertificadoWebinarConhecerPrime.png',
  // udemy
  'udemy/robot-avancado': 'CertificadoRobotAvançado.pdf',
  'udemy/robot-basico': 'CertificadoRobotBasico.pdf',
  // senai
  'senai/ia': 'CERTIFICADO.pdf',
  // promenady
  'promenady/abap-funcionais': 'certificado-visao-abap-funcionais.pdf',
  'promenady/taxbra-avancado': 'certificado-taxbra-avancado.pdf',
  'promenady/taxbra-basico': 'certificado-taxbra-basico.pdf',
  'promenady/localizacao-br': 'certificado-localizacao-brasileira.pdf',
  'promenady/formacao-consultores': 'certificado-formacao-consultores.pdf',}

/**
 * Tarjas pretas opacas, em pt da página do PDF (data-model §5; medidas com `pdftotext -bbox-layout` e
 * conferidas numa prévia). No SENAI, cobrem a naturalidade (cidade e UF), o número do RG (com a UF), o do
 * CPF, a data de nascimento e o código de identificação, que abre o certificado inteiro no site do
 * emissor (clarify; plano, C2). Os rótulos ficam à vista.
 */
const REDACTIONS = {
  'senai/ia': {
    pageWidthPt: 841.89,
    rects: [
      [147, 296, 294, 321],
      [325, 296, 447, 321],
      [490, 296, 593, 321],
      [709, 296, 794, 321],
      [497, 571, 557, 587],
    ],
  },
}

/**
 * A foto do 1º dia (Q2, C1): seis pessoas; os rostos das 5 que não são o autor recebem um desfoque forte,
 * em px da origem (1024 × 768). O rosto do autor, na ponta direita da mesa (x ~860–950), não é tocado.
 */
const PHOTO = {
  source: 'DiaE-PrimeControl.jpeg',
  blur: [
    [85, 255, 190, 365],
    [175, 215, 250, 300],
    [270, 190, 335, 260],
    [620, 215, 690, 290],
    [690, 230, 770, 335],
  ],
  outputs: [
    { file: 'public/carreira/prime-control/integracao-2020-10-15-512.webp', width: 512, maxKB: MAX_KB.photo },
    { file: 'public/carreira/prime-control/integracao-2020-10-15-1024.webp', width: 1024, maxKB: MAX_KB.photoFull },
  ],
}
/** Raio e passadas do desfoque: o bastante para o rosto não ser reconhecível em nenhum tamanho. */
const BLUR_PX = 18
const BLUR_PASSES = 3

const { resume } = await import('../src/data/resume.ts')

function fail(message) {
  console.error(`ERRO ${message}`)
  process.exit(1)
}

if (!existsSync(SOURCE_DIR)) fail(`pasta de origem não encontrada: ${SOURCE_DIR} (defina CERTIFICADOS_DIR)`)
try {
  execFileSync('pdftoppm', ['-v'], { stdio: 'ignore' })
} catch {
  fail('pdftoppm não encontrado: instale o poppler-utils')
}

// o manifesto e os dados precisam ter os mesmos certificados
const wanted = resume.certificatePlatforms.flatMap((p) => p.certificates.map((c) => ({ platform: p, cert: c, key: `${p.id}/${c.id}` })))
const missing = wanted.filter((w) => !SOURCES[w.key]).map((w) => w.key)
const extra = Object.keys(SOURCES).filter((key) => !wanted.some((w) => w.key === key))
if (missing.length) fail(`sem origem no manifesto: ${missing.join(', ')}`)
if (extra.length) fail(`origem sem certificado nos dados: ${extra.join(', ')}`)
for (const key of Object.keys(REDACTIONS)) if (!SOURCES[key]) fail(`tarja de um certificado que não existe: ${key}`)

const tmp = mkdtempSync(join(tmpdir(), 'certificados-'))
const toDataUrl = (path) => {
  const type = path.endsWith('.png') ? 'image/png' : 'image/jpeg'
  return `data:${type};base64,${readFileSync(path).toString('base64')}`
}

/** A imagem de origem, em PNG ou JPEG: o PDF vira a 1ª página com `width` px. */
function sourceImage(file, width) {
  const path = join(SOURCE_DIR, file)
  if (!existsSync(path)) fail(`origem não encontrada: ${path}`)
  if (!file.toLowerCase().endsWith('.pdf')) return path
  const out = join(tmp, `page-${Math.random().toString(36).slice(2)}`)
  execFileSync('pdftoppm', ['-f', '1', '-l', '1', '-scale-to-x', String(width), '-scale-to-y', '-1', '-png', '-singlefile', path, out])
  return `${out}.png`
}

const browser = await chromium.launch()
const page = await browser.newPage()
const written = new Set()
let failed = false

/**
 * Desenha a origem na resolução dela, aplica as tarjas (`redact`, px da origem) e os desfoques (`blur`)
 * e só então exporta cada largura pedida em WebP.
 */
async function render(src, { redact = [], blur = [] }, outputs) {
  return page.evaluate(
    async ({ src, redact, blur, outputs, BLUR_PX, BLUR_PASSES }) => {
      const img = new Image()
      img.src = src
      await img.decode()
      const master = document.createElement('canvas')
      master.width = img.naturalWidth
      master.height = img.naturalHeight
      const ctx = master.getContext('2d')
      ctx.drawImage(img, 0, 0)
      for (let pass = 0; pass < BLUR_PASSES; pass++) {
        for (const [x0, y0, x1, y1] of blur) {
          const copy = document.createElement('canvas')
          copy.width = master.width
          copy.height = master.height
          copy.getContext('2d').drawImage(master, 0, 0)
          ctx.save()
          ctx.beginPath()
          ctx.rect(x0, y0, x1 - x0, y1 - y0)
          ctx.clip()
          ctx.filter = `blur(${BLUR_PX}px)`
          ctx.drawImage(copy, 0, 0)
          ctx.restore()
        }
      }
      ctx.fillStyle = '#000'
      for (const [x0, y0, x1, y1] of redact) ctx.fillRect(x0, y0, x1 - x0, y1 - y0)
      const results = []
      for (const { width, quality } of outputs) {
        const height = Math.round((master.height * width) / master.width)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const out = canvas.getContext('2d')
        out.imageSmoothingEnabled = true
        out.imageSmoothingQuality = 'high'
        out.drawImage(master, 0, 0, width, height)
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
        if (!blob || blob.type !== 'image/webp') throw new Error('o navegador não exportou WebP')
        const bytes = new Uint8Array(await blob.arrayBuffer())
        let binary = ''
        for (const byte of bytes) binary += String.fromCharCode(byte)
        results.push({ width, height, base64: btoa(binary) })
      }
      return { natural: [img.naturalWidth, img.naturalHeight], results }
    },
    { src, redact, blur, outputs, BLUR_PX, BLUR_PASSES },
  )
}

function save(file, base64, maxKB, label) {
  const data = stripMetadata(Buffer.from(base64, 'base64'))
  mkdirSync(dirname(join(root, file)), { recursive: true })
  writeFileSync(join(root, file), data)
  written.add(file)
  const kb = data.length / 1024
  const ok = kb <= maxKB
  if (!ok) failed = true
  console.log(`${ok ? 'ok ' : 'ERRO'} ${file}: ${label}, ${kb.toFixed(1)} KB (teto ${maxKB} KB)`)
}

try {
  for (const { platform, cert, key } of wanted) {
    const path = sourceImage(SOURCES[key], platform.image.width)
    const redaction = REDACTIONS[key]
    const scale = redaction ? platform.image.width / redaction.pageWidthPt : 1
    const redact = (redaction?.rects ?? []).map((rect) => rect.map((v) => v * scale))
    const base = `public/certificados/${platform.id}/${cert.issued}_${cert.id}`
    const thumbQuality = QUALITY.thumbByPlatform[platform.id] ?? QUALITY.thumb
    const { natural, results } = await render(toDataUrl(path), { redact }, [
      { width: platform.image.width, quality: QUALITY.full },
      { width: THUMB_WIDTH, quality: thumbQuality },
    ])
    if (natural[0] !== platform.image.width) fail(`${key}: a origem tem ${natural[0]} px, e os dados dizem ${platform.image.width}`)
    const [full, thumb] = results
    if (full.height !== platform.image.height)
      fail(`${key}: altura ${full.height} px, e os dados de ${platform.id} dizem ${platform.image.height} (corrija o \`image\`)`)
    save(`${base}-${full.width}.webp`, full.base64, MAX_KB.full, `${full.width} × ${full.height}`)
    save(`${base}-${thumb.width}.webp`, thumb.base64, MAX_KB.thumb, `${thumb.width} × ${thumb.height}`)
  }

  const photo = sourceImage(PHOTO.source)
  const { results } = await render(
    toDataUrl(photo),
    { blur: PHOTO.blur },
    PHOTO.outputs.map(({ width }) => ({ width, quality: QUALITY.full })),
  )
  PHOTO.outputs.forEach((output, i) => save(output.file, results[i].base64, output.maxKB, `${results[i].width} × ${results[i].height}`))
} finally {
  await browser.close()
  rmSync(tmp, { recursive: true, force: true })
}

// imagens de certificados que saíram dos dados (slug ou data trocados) não ficam publicadas
const certDir = join(root, 'public/certificados')
for (const platformDir of readdirSync(certDir)) {
  for (const name of readdirSync(join(certDir, platformDir))) {
    const file = relative(root, join(certDir, platformDir, name))
    if (!written.has(file)) {
      rmSync(join(root, file))
      console.log(`removido ${file} (não está mais nos dados)`)
    }
  }
}

if (failed) process.exit(1)
