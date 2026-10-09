import { formatPeriod, formatYearMonth } from '@/lib/period'
import { byCreatedDesc, byStartDesc } from '@/lib/sort'
import type { Challenge, CommunityProject, Experience } from '@/types/resume'

/**
 * Arquivos das janelas de editor (feature 006, FR-005 a FR-009, research R3, data-model §1): cada item
 * de Experiência, Challenges e Comunitário vira um "arquivo" YAML (clarify), gerado dos mesmos dados dos
 * cartões, sem texto escrito à mão. Funções puras: o componente só desenha os trechos.
 *
 * - Uma chave por fato do cartão, sem acento (`cargo`, `periodo`, `instituicao`…); nada além deles
 *   (Princípio I). A 1ª linha é um comentário com a posição na sequência e o nome do item.
 * - Datas e períodos no formato único da página (`formatPeriod`, `formatYearMonth`).
 * - Textos longos (`resumo`) ficam num bloco `>` de uma linha lógica; quem quebra é o CSS.
 * - `repositorio` e `fonte` são trechos `link`: o componente os desenha como links externos.
 * - Nome do arquivo: `AAAA-MM_<slug>.yml`, a data do item e um slug curto.
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
}

export interface EditorFolder {
  /** `carreira` | `challenges` | `comunitario` */
  label: string
  /** `~/carreira` | `~/projetos/challenges` | `~/projetos/comunitario` (título da janela e comando). */
  path: string
  files: EditorFile[]
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
): EditorFolder {
  const total = items.length
  return {
    label,
    path,
    files: items.map((item, i) => {
      const { id, date, slug, title, lines } = build(item)
      const name = `${date}_${slug}.yml`
      return { id, name, path: `${path}/${name}`, position: i + 1, total, lines: [header(i + 1, total, title), ...lines] }
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
  })
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

/** Texto corrido de um arquivo (testes e conferências). */
export const fileText = (file: EditorFile): string =>
  file.lines.map((l) => '  '.repeat(l.indent) + l.tokens.map((tok) => tok.text).join('')).join('\n')
