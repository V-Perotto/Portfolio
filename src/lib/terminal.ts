/**
 * Motor do terminal da dock (feature 004, FR-020 a FR-025; contrato em
 * specs/004-dock-windows-crt/contracts/terminal-commands.md). Funções puras: recebem a linha digitada
 * e as seções da página (a mesma lista do menu) e devolvem a saída e o que a interface deve fazer.
 */
import type { NavSection, SectionId } from '@/lib/sections'

export type TerminalAction = { type: 'none' } | { type: 'clear' } | { type: 'exit' } | { type: 'goto'; id: SectionId }

export interface TerminalResult {
  output: string[]
  action: TerminalAction
}

export interface Completion {
  /** A linha completada (ou a mesma, quando não há o que completar). */
  line: string
  candidates: string[]
}

export const COMMANDS = ['help', 'find', 'clear', 'exit'] as const

const HELP_HINT = 'Digite help para ver os comandos.'
const NONE: TerminalAction = { type: 'none' }

/** Opção do `find` como o visitante pode escrever: sem maiúsculas, acentos, `~/`, `/` nem `/` no fim. */
export function normalizeOption(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^~?\//, '')
    .replace(/\/+$/, '')
}

const optionsLine = (options: readonly NavSection[]) => `OPTIONS: ${options.map((o) => o.id).join(' | ')}`

export function helpText(options: readonly NavSection[]): string[] {
  return [
    'Comandos disponíveis:',
    '  help             mostra esta ajuda',
    '  find <OPTIONS>   busca uma seção e leva a página até ela',
    '  clear            limpa o terminal',
    '  exit             fecha o terminal',
    '',
    'find <OPTIONS>',
    `  ${optionsLine(options)}`,
    `  exemplo: find ${options.find((o) => o.id === 'projetos')?.id ?? options[0]?.id ?? 'sobre'}`,
    '',
    'Tab completa comandos e opções; ↑ e ↓ percorrem os comandos já digitados.',
  ]
}

export function run(line: string, options: readonly NavSection[]): TerminalResult {
  const words = line.trim().split(/\s+/).filter(Boolean)
  const [typed, arg] = words
  if (!typed) return { output: [], action: NONE }
  switch (typed.toLowerCase()) {
    case 'help':
      return { output: helpText(options), action: NONE }
    case 'clear':
      return { output: [], action: { type: 'clear' } }
    case 'exit':
      return { output: [], action: { type: 'exit' } }
    case 'find': {
      if (!arg) return { output: ['uso: find <OPTIONS>', optionsLine(options)], action: NONE }
      const target = options.find((o) => o.id === normalizeOption(arg))
      if (!target) {
        return { output: [`find: '${arg}': seção não encontrada`, optionsLine(options), HELP_HINT], action: NONE }
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

export function complete(line: string, options: readonly NavSection[]): Completion {
  const find = line.match(/^(\s*find\s+)(\S*)$/i)
  if (find) {
    const partial = normalizeOption(find[2]!)
    const candidates = options.map((o) => o.id).filter((id) => id.startsWith(partial))
    if (!candidates.length) return { line, candidates }
    const word = candidates.length === 1 ? candidates[0]! : commonPrefix(candidates)
    // só completa se acrescenta algo ao que foi digitado
    return { line: word.length >= partial.length ? `${find[1]!}${word}` : line, candidates }
  }
  const word = line.trimStart()
  if (!word || /\s/.test(word)) return { line, candidates: [] }
  const lower = word.toLowerCase()
  const candidates = COMMANDS.filter((c) => c.startsWith(lower))
  if (!candidates.length) return { line, candidates: [] }
  const lead = line.slice(0, line.length - word.length)
  if (candidates.length === 1) {
    const command = candidates[0]!
    return { line: `${lead}${command}${command === 'find' ? ' ' : ''}`, candidates: [...candidates] }
  }
  return { line: `${lead}${commonPrefix(candidates)}`, candidates: [...candidates] }
}

/** Aplica um dos candidatos de `complete` (sugestão tocada): a palavra atual vira o candidato. */
export function completeWith(line: string, candidate: string): string {
  const find = line.match(/^(\s*find\s+)(\S*)$/i)
  if (find) return `${find[1]!}${candidate}`
  const word = line.trimStart()
  const lead = line.slice(0, line.length - word.length)
  return `${lead}${candidate}${candidate === 'find' ? ' ' : ''}`
}
