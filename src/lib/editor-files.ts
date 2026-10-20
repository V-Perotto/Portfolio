import {
  byIssuedDesc,
  certificateCaption,
  certificateFileName,
  certificateImage,
  formatHours,
  verificationText,
} from '@/lib/certificates'
import { formatDate, formatPeriod, formatYearMonth, formatYears } from '@/lib/period'
import { byCreatedDesc, byStartDesc, byStartYearDesc } from '@/lib/sort'
import type { Certificate, CertificatePlatform, Challenge, CommunityProject, Education, Experience, ImageFile, Photo } from '@/types/resume'

/**
 * Arquivos das janelas de editor (feature 006, FR-005 a FR-009, research R3, data-model §1): cada item
 * de Experiência, Challenges, Comunitário e Educação (feature 008) vira um "arquivo" YAML (clarify),
 * gerado dos mesmos dados dos cartões, sem texto escrito à mão. Funções puras: o componente só desenha
 * os trechos.
 *
 * - Uma chave por fato do cartão, sem acento (`cargo`, `periodo`, `instituicao`…); nada além deles
 *   (Princípio I). A 1ª linha é um comentário com a posição na sequência e o nome do item.
 * - Datas e períodos no formato único da página (`formatPeriod`, `formatYearMonth`).
 * - Textos longos (`resumo`) ficam num bloco `>` de uma linha lógica; quem quebra é o CSS.
 * - `repositorio` e `fonte` são trechos `link`: o componente os desenha como links externos.
 * - Nome do arquivo: `AAAA-MM_<slug>.yml`, a data do item e um slug curto; na formação, que só tem anos,
 *   `AAAA_<id>.yml` (feature 008, clarify); no certificado, que tem o dia, `AAAA-MM-DD_<id>.yml` (feature 010).
 * - Certificados (feature 010, research R3): a janela tem várias pastas (`groups`, uma por plataforma), e a
 *   posição de cada arquivo é contada dentro da pasta dele. Os arquivos podem ter uma imagem (`figure`).
 */
export type SyntaxKind = 'key' | 'str' | 'date' | 'punct' | 'comment' | 'link'

export interface Token {
  kind: SyntaxKind
  text: string
  /** Só em `link`: o endereço (abre em nova aba). */
  href?: string
}

export interface EditorLine {
  /** 0 = chave de topo; 1 = item de lista ou texto de bloco. */
  indent: 0 | 1
  tokens: Token[]
}

/**
 * Imagem dentro do arquivo (feature 010, data-model §3): a miniatura do certificado, abaixo das linhas, ou
 * a foto da experiência, ao lado delas a partir de 900 px. Abre no visualizador único.
 */
export interface EditorFigure extends ImageFile {
  /** Legenda no estilo `# …`; ausente nos certificados (o arquivo já diz o que é). */
  caption?: string
  /** 'below': abaixo das linhas (certificados); 'side': ao lado a partir de 900 px (foto). */
  placement: 'below' | 'side'
  /** Texto `.sr-only` do link: '(abre o certificado em tamanho real)'. */
  openLabel: string
  /** `sizes` do `<img>` (research R6, R8). */
  sizes: string
  /** Legenda do visualizador: '# DIO · <título> · 29 JUL 2020' (certificado) ou a da foto. */
  viewerCaption: string
}

export interface EditorFile {
  /** id do item no currículo: chave estável do arquivo e do cartão. */
  id: string
  /** `AAAA-MM_<slug>.yml` */
  name: string
  /** `~/carreira/2026-03_confidencial.yml` */
  path: string
  /** 1 a `total`, na ordem da seção. */
  position: number
  total: number
  lines: EditorLine[]
  /** Pasta do arquivo, quando a janela tem várias ('dio'); a posição é contada dentro dela (feature 010). */
  group?: string
  /** Imagem do arquivo (feature 010). */
  figure?: EditorFigure
}

/** Pasta da árvore numa janela com várias (feature 010, data-model §3). */
export interface EditorGroup {
  /** 'dio' (rótulo da pasta na árvore: 'dio/'). */
  label: string
  /** 'DIO': título do grupo de cartões. */
  title: string
  files: EditorFile[]
}

export interface EditorFolder {
  /** `carreira` | `challenges` | `comunitario` | `formacao` */
  label: string
  /** `~/carreira` | `~/projetos/challenges` | `~/projetos/comunitario` | `~/formacao` (título da janela e comando). */
  path: string
  /** Todos os arquivos, na ordem das pastas. */
  files: EditorFile[]
  /** Pastas da árvore (só Certificados). Sem `groups`, a árvore tem a pasta raiz, como na 006. */
  groups?: EditorGroup[]
}

/** Minúsculas, sem acentos, só letras e números ligados por hífen: `'NY Times (RPA)'` → `'ny-times-rpa'`. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const t = (kind: SyntaxKind, text: string, href?: string): Token => (href ? { kind, text, href } : { kind, text })
const line = (tokens: Token[], indent: 0 | 1 = 0): EditorLine => ({ indent, tokens })

/** `chave: valor` numa linha. */
const pair = (key: string, value: string, kind: SyntaxKind = 'str'): EditorLine =>
  line([t('key', key), t('punct', ': '), t(kind, value)])

/** `chave: >` e o texto longo na linha seguinte, com recuo. */
const block = (key: string, text: string): EditorLine[] => [line([t('key', key), t('punct', ': >')]), line([t('str', text)], 1)]

/** `chave: [a, b, c]` */
function list(key: string, items: readonly string[]): EditorLine {
  const tokens: Token[] = [t('key', key), t('punct', ': [')]
  items.forEach((item, i) => {
    if (i) tokens.push(t('punct', ', '))
    tokens.push(t('str', item))
  })
  tokens.push(t('punct', ']'))
  return line(tokens)
}

/** `chave: endereço`, com o endereço como link. */
const link = (key: string, text: string, href: string): EditorLine => line([t('key', key), t('punct', ': '), t('link', text, href)])

const header = (position: number, total: number, title: string): EditorLine =>
  line([t('comment', `# ${position} / ${total} · ${title}`)])

const withoutProtocol = (url: string) => url.replace(/^https?:\/\//, '')

function folder<T>(
  label: string,
  path: string,
  items: readonly T[],
  build: (item: T) => { id: string; date: string; slug: string; title: string; lines: EditorLine[] },
  figure?: (item: T) => EditorFigure | undefined,
): EditorFolder {
  const total = items.length
  return {
    label,
    path,
    files: items.map((item, i) => {
      const { id, date, slug, title, lines } = build(item)
      const name = `${date}_${slug}.yml`
      const file: EditorFile = { id, name, path: `${path}/${name}`, position: i + 1, total, lines: [header(i + 1, total, title), ...lines] }
      const image = figure?.(item)
      return image ? { ...file, figure: image } : file
    }),
  }
}

/** Experiências, da mais recente para a mais antiga (a ordem da linha do tempo). */
export function experienceFolder(experiences: readonly Experience[]): EditorFolder {
  return folder('carreira', '~/carreira', byStartDesc(experiences), (exp) => {
    const lines: EditorLine[] = [
      pair('cargo', exp.role),
      pair('empresa', exp.company),
      pair('local', exp.location),
      pair('periodo', formatPeriod(exp.start, exp.end), 'date'),
    ]
    // o selo HEAD do cartão: só o vínculo em andamento
    if (!exp.end) lines.push(line([t('key', 'atual'), t('punct', ': '), t('str', 'true'), t('comment', '  # HEAD')]))
    lines.push(...block('resumo', exp.summary))
    if (exp.highlights?.length) {
      lines.push(line([t('key', 'resultados'), t('punct', ':')]))
      for (const metric of exp.highlights)
        lines.push(line([t('punct', '- '), t('date', metric.value), t('punct', ': '), t('str', metric.label)], 1))
    }
    lines.push(list('stack', exp.tech))
    return { id: exp.id, date: exp.start, slug: exp.id.replace(/-\d{4}$/, ''), title: exp.role, lines }
  }, (exp) => (exp.photo ? photoFigure(exp.photo) : undefined))
}

/** A foto de uma experiência, ao lado das linhas a partir de 900 px (feature 010, FR-017, Q3; research R8). */
function photoFigure(photo: Photo): EditorFigure {
  const caption = `# ${photo.caption} · ${formatDate(photo.taken)}`
  return {
    src: photo.src,
    srcWidth: photo.srcWidth,
    full: photo.full,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    caption,
    viewerCaption: caption,
    placement: 'side',
    openLabel: '(abre a foto em tamanho real)',
    sizes: '(min-width: 900px) 16rem, (max-width: 760px) calc(100vw - 6rem), 20rem',
  }
}

/** Challenges, pela data de criação, do mais recente para o mais antigo (a ordem dos cartões). */
export function challengeFolder(challenges: readonly Challenge[]): EditorFolder {
  return folder('challenges', '~/projetos/challenges', byCreatedDesc(challenges), (ch) => ({
    id: ch.id,
    date: ch.created,
    slug: slugify(ch.name),
    title: ch.name,
    lines: [
      pair('nome', ch.name),
      pair('criado', formatYearMonth(ch.created), 'date'),
      ...block('resumo', ch.summary),
      list('stack', ch.stack),
      link('repositorio', withoutProtocol(ch.url), ch.url),
    ],
  }))
}

/** Projetos comunitários, na ordem dos dados (a dos cartões). */
export function communityFolder(community: readonly CommunityProject[]): EditorFolder {
  return folder('comunitario', '~/projetos/comunitario', community, (p) => ({
    id: p.id,
    date: p.date,
    slug: slugify(p.name),
    title: p.name,
    lines: [
      pair('nome', p.name),
      pair('instituicao', p.institution),
      pair('local', p.location),
      pair('data', formatYearMonth(p.date), 'date'),
      ...block('resumo', p.summary),
      pair('papel', p.role),
      link('fonte', p.source.label, p.source.url),
    ],
  }))
}

/**
 * Formações, da mais recente para a mais antiga (a ordem dos cartões), na pasta `~/formacao` (feature 008,
 * research R2–R5). O selo `EM CURSO` vira a linha `em_curso`, como o `HEAD` da Experiência, e só na formação
 * em andamento; a observação e as fontes, só quando existem; as fontes sempre em lista (clarify).
 */
export function educationFolder(education: readonly Education[]): EditorFolder {
  return folder('formacao', '~/formacao', byStartYearDesc(education), (edu) => {
    const lines: EditorLine[] = [
      pair('curso', edu.course),
      pair('instituicao', edu.institution),
      pair('local', edu.location),
      pair('periodo', formatYears(edu.startYear, edu.endYear), 'date'),
    ]
    if (edu.status === 'em-curso')
      lines.push(line([t('key', 'em_curso'), t('punct', ': '), t('str', 'true'), t('comment', '  # EM CURSO')]))
    if (edu.note) lines.push(...block('observacao', edu.note))
    if (edu.sources) {
      lines.push(line([t('key', 'fontes'), t('punct', ':')]))
      for (const source of edu.sources) lines.push(line([t('punct', '- '), t('link', source.label, source.url)], 1))
    }
    return { id: edu.id, date: String(edu.startYear), slug: edu.id, title: edu.course, lines }
  })
}

/** Linhas de um certificado: só os fatos impressos nele (feature 010, FR-007 e FR-008; research R3, R5). */
function certificateLines(platform: CertificatePlatform, cert: Certificate): EditorLine[] {
  const lines: EditorLine[] = [pair('curso', cert.title), pair('plataforma', platform.name)]
  if (cert.kind) lines.push(pair('tipo', cert.kind))
  lines.push(pair('emitido', formatDate(cert.issued), 'date'), pair('carga_horaria', formatHours(cert.hours)))
  if (cert.syllabus) lines.push(list('ementa', cert.syllabus))
  const v = cert.verification
  if (v?.url) lines.push(link('verificacao', verificationText(v), v.url))
  else if (v?.code) lines.push(pair('codigo', v.code))
  // o código do SENAI abre o certificado inteiro, com os documentos, no site do emissor (plano, C2)
  else lines.push(line([t('comment', '# código omitido por privacidade')]))
  return lines
}

/**
 * Certificados (feature 010, FR-002 a FR-011): a pasta `~/certificados`, com uma pasta por plataforma, na
 * ordem dos dados, e, dentro dela, um arquivo por certificado, do mais recente para o mais antigo. Cada
 * arquivo tem a miniatura do certificado abaixo das linhas (Q1).
 */
export function certificateFolder(platforms: readonly CertificatePlatform[]): EditorFolder {
  const path = '~/certificados'
  const groups: EditorGroup[] = platforms.map((platform) => {
    const ordered = byIssuedDesc(platform.certificates)
    const total = ordered.length
    return {
      label: platform.id,
      title: platform.name,
      files: ordered.map((cert, i): EditorFile => {
        const name = certificateFileName(cert)
        return {
          id: `${platform.id}/${cert.id}`,
          name,
          path: `${path}/${platform.id}/${name}`,
          position: i + 1,
          total,
          group: platform.id,
          lines: [header(i + 1, total, cert.title), ...certificateLines(platform, cert)],
          figure: {
            ...certificateImage(platform, cert),
            placement: 'below',
            openLabel: '(abre o certificado em tamanho real)',
            sizes: '(max-width: 760px) calc(100vw - 6rem), 20rem',
            viewerCaption: certificateCaption(platform, cert),
          },
        }
      }),
    }
  })
  return { label: 'certificados', path, files: groups.flatMap((g) => g.files), groups }
}

/** Texto corrido de um arquivo (testes e conferências). */
export const fileText = (file: EditorFile): string =>
  file.lines.map((l) => '  '.repeat(l.indent) + l.tokens.map((tok) => tok.text).join('')).join('\n')
