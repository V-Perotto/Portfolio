/**
 * Motor do terminal da dock (feature 004, FR-020 a FR-025; contrato em
 * specs/004-dock-windows-crt/contracts/terminal-commands.md). Funções puras: recebem a linha digitada
 * e o contexto (as seções do menu e os alvos do `open`) e devolvem a saída e o que a interface deve fazer.
 *
 * Feature 007 (FR-001 a FR-008, research R2; contrato em
 * specs/007-open-command-dock-minimize/contracts/terminal-open.md): o comando `open <OPTIONS>` abre a
 * janela de um projeto ou, maximizada, a da experiência, dos challenges ou do comunitário. As opções e o
 * autocompletar seguem as regras do `find`.
 */
import type { NavSection, OpenTarget, SectionId } from '@/lib/sections'

export interface TerminalContext {
  /** As seções do menu: opções do `find` e a dica do `open` para uma seção que ele não abre. */
  sections: readonly NavSection[]
  /** Os alvos do `open` (`openTargets`). */
  targets: readonly OpenTarget[]
}

export type TerminalAction =
  | { type: 'none' }
  | { type: 'clear' }
  | { type: 'exit' }
  | { type: 'goto'; id: SectionId }
  | { type: 'open'; target: OpenTarget }

export interface TerminalResult {
  output: string[]
  action: TerminalAction
}

export interface Completion {
  /** A linha completada (ou a mesma, quando não há o que completar). */
  line: string
  candidates: string[]
}

export const COMMANDS = ['help', 'find', 'open', 'clear', 'exit'] as const

/** Comandos que recebem uma opção: o Tab os completa com um espaço no fim. */
const WITH_OPTION = ['find', 'open']
/** `find <opção>` ou `open <opção>` com o cursor na opção. */
const OPTION_LINE = /^(\s*(find|open)\s+)(\S*)$/i

const HELP_HINT = 'Digite help para ver os comandos.'
const NONE: TerminalAction = { type: 'none' }

/** Opção como o visitante pode escrever: sem maiúsculas, acentos, `~/`, `/` nem `/` no fim. */
export function normalizeOption(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^~?\//, '')
    .replace(/\/+$/, '')
}

/** Sem alvos (currículo sem projetos nem janelas de editor), o `open` não existe. */
const commands = (ctx: TerminalContext) => COMMANDS.filter((c) => c !== 'open' || ctx.targets.length > 0)

const optionsLine = (names: readonly string[]) => `OPTIONS: ${names.join(' | ')}`
const findNames = (ctx: TerminalContext) => ctx.sections.map((s) => s.id)
const openNames = (ctx: TerminalContext) => ctx.targets.map((t) => t.name)

export function helpText(ctx: TerminalContext): string[] {
  const { sections, targets } = ctx
  const hasOpen = targets.length > 0
  const firstProject = targets.find((t) => t.mode === 'open') ?? targets[0]
  return [
    'Comandos disponíveis:',
    '  help             mostra esta ajuda',
    '  find <OPTIONS>   busca uma seção e leva a página até ela',
    ...(hasOpen ? ['  open <OPTIONS>   abre uma janela e leva a página até ela'] : []),
    '  clear            limpa o terminal',
    '  exit             fecha o terminal',
    '',
    'find <OPTIONS>',
    `  ${optionsLine(findNames(ctx))}`,
    `  exemplo: find ${sections.find((s) => s.id === 'projetos')?.id ?? sections[0]?.id ?? 'sobre'}`,
    '',
    ...(hasOpen
      ? [
          'open <OPTIONS>',
          '  projetos abrem; experiencia, challenges e comunitario abrem maximizados',
          `  ${optionsLine(openNames(ctx))}`,
          `  exemplo: open ${firstProject!.name}`,
          '',
        ]
      : []),
    'Tab completa comandos e opções; ↑ e ↓ percorrem os comandos já digitados.',
  ]
}

/** `open <opção>`: um alvo pelo nome ou pelo apelido (o caminho sem `~/`), uma seção que ele não abre, ou nada. */
function runOpen(arg: string | undefined, ctx: TerminalContext): TerminalResult {
  const names = openNames(ctx)
  if (!arg) return { output: ['uso: open <OPTIONS>', optionsLine(names)], action: NONE }
  const option = normalizeOption(arg)
  const target = ctx.targets.find((t) => t.name === option || t.alias === option)
  if (target) return { output: [`→ ${target.path}`], action: { type: 'open', target } }
  const section = ctx.sections.find((s) => s.id === option)
  if (section) {
    return { output: [`open: '${arg}': essa seção não abre com o open. Use: find ${section.id}`], action: NONE }
  }
  return { output: [`open: '${arg}': não encontrado`, optionsLine(names), HELP_HINT], action: NONE }
}

export function run(line: string, ctx: TerminalContext): TerminalResult {
  const words = line.trim().split(/\s+/).filter(Boolean)
  const [typed, arg] = words
  if (!typed) return { output: [], action: NONE }
  const command = typed.toLowerCase()
  if (command === 'open' && ctx.targets.length) return runOpen(arg, ctx)
  switch (command) {
    case 'help':
      return { output: helpText(ctx), action: NONE }
    case 'clear':
      return { output: [], action: { type: 'clear' } }
    case 'exit':
      return { output: [], action: { type: 'exit' } }
    case 'find': {
      const names = findNames(ctx)
      if (!arg) return { output: ['uso: find <OPTIONS>', optionsLine(names)], action: NONE }
      const target = ctx.sections.find((o) => o.id === normalizeOption(arg))
      if (!target) {
        return { output: [`find: '${arg}': seção não encontrada`, optionsLine(names), HELP_HINT], action: NONE }
      }
      return { output: [`→ ~/${target.id}`], action: { type: 'goto', id: target.id } }
    }
    default:
      return { output: [`${typed}: comando não encontrado. ${HELP_HINT}`], action: NONE }
  }
}

function commonPrefix(words: readonly string[]): string {
  if (!words.length) return ''
  let prefix = words[0]!
  for (const word of words) while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1)
  return prefix
}

export function complete(line: string, ctx: TerminalContext): Completion {
  const option = line.match(OPTION_LINE)
  if (option) {
    const names = option[2]!.toLowerCase() === 'open' ? openNames(ctx) : findNames(ctx)
    const partial = normalizeOption(option[3]!)
    const candidates = names.filter((name) => name.startsWith(partial))
    if (!candidates.length) return { line, candidates }
    const word = candidates.length === 1 ? candidates[0]! : commonPrefix(candidates)
    // só completa se acrescenta algo ao que foi digitado
    return { line: word.length >= partial.length ? `${option[1]!}${word}` : line, candidates }
  }
  const word = line.trimStart()
  if (!word || /\s/.test(word)) return { line, candidates: [] }
  const lower = word.toLowerCase()
  const candidates: string[] = commands(ctx).filter((c) => c.startsWith(lower))
  if (!candidates.length) return { line, candidates: [] }
  const lead = line.slice(0, line.length - word.length)
  if (candidates.length === 1) {
    const command = candidates[0]!
    return { line: `${lead}${command}${WITH_OPTION.includes(command) ? ' ' : ''}`, candidates }
  }
  return { line: `${lead}${commonPrefix(candidates)}`, candidates }
}

/** Aplica um dos candidatos de `complete` (sugestão tocada): a palavra atual vira o candidato. */
export function completeWith(line: string, candidate: string): string {
  const option = line.match(OPTION_LINE)
  if (option) return `${option[1]!}${candidate}`
  const word = line.trimStart()
  const lead = line.slice(0, line.length - word.length)
  return `${lead}${candidate}${WITH_OPTION.includes(candidate) ? ' ' : ''}`
}
