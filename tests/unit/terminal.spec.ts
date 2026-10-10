import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import { openTargets, visibleSections } from '@/lib/sections'
import { complete, completeWith, normalizeOption, run, type TerminalContext } from '@/lib/terminal'

// Feature 004, US2: contrato de specs/004-dock-windows-crt/contracts/terminal-commands.md. Desde a 007, o
// motor recebe um contexto com as seções e os alvos do `open`.
const sections = visibleSections(resume)
const ctx: TerminalContext = { sections, targets: openTargets(resume) }
const OPTIONS = 'OPTIONS: sobre | experiencia | skills | projetos | educacao | contato'
const HINT = 'Digite help para ver os comandos.'
const OPEN_OPTIONS =
  'OPTIONS: experiencia | srg | temas-vs-code | italiami | ocr-de-prontuarios | qclass-bot | monitor-de-curso | challenges | comunitario | educacao'

describe('run', () => {
  it('linha vazia: nada', () => {
    expect(run('   ', ctx)).toEqual({ output: [], action: { type: 'none' } })
  })

  it('help (sem diferenciar maiúsculas) explica o find e o open com as opções', () => {
    const { output, action } = run('HELP', ctx)
    expect(action).toEqual({ type: 'none' })
    expect(output).toEqual([
      'Comandos disponíveis:',
      '  help             mostra esta ajuda',
      '  find <OPTIONS>   busca uma seção e leva a página até ela',
      '  open <OPTIONS>   abre uma janela e leva a página até ela',
      '  clear            limpa o terminal',
      '  exit             fecha o terminal',
      '',
      'find <OPTIONS>',
      `  ${OPTIONS}`,
      '  exemplo: find projetos',
      '',
      'open <OPTIONS>',
      '  projetos abrem; experiencia, challenges, comunitario e educacao abrem maximizados',
      `  ${OPEN_OPTIONS}`,
      '  exemplo: open srg',
      '',
      'Tab completa comandos e opções; ↑ e ↓ percorrem os comandos já digitados.',
    ])
  })

  // Feature 008 (FR-017, research R8): a linha do open sobre os modos sai dos alvos
  it('help: a linha dos modos do open é gerada dos alvos', () => {
    const all = openTargets(resume)
    const projects = all.filter((t) => t.mode === 'open')
    const editor = (name: string) => all.find((t) => t.name === name)!
    // a linha logo abaixo do título do bloco do open
    const modes = (targets: typeof all) => {
      const { output } = run('help', { sections, targets })
      return output[output.indexOf('open <OPTIONS>') + 1]
    }
    expect(modes(projects)).toBe('  projetos abrem')
    expect(modes([...projects, editor('experiencia')])).toBe('  projetos abrem; experiencia abre maximizado')
    expect(modes([...projects, editor('experiencia'), editor('challenges')])).toBe('  projetos abrem; experiencia e challenges abrem maximizados')
    expect(modes([editor('educacao')])).toBe('  educacao abre maximizado')
  })

  it('find <seção> leva à seção', () => {
    expect(run('find projetos', ctx)).toEqual({ output: ['→ ~/projetos'], action: { type: 'goto', id: 'projetos' } })
    expect(run('find contato', ctx).action).toEqual({ type: 'goto', id: 'contato' })
  })

  it.each(['Experiência', '~/experiencia', '/experiencia', 'EXPERIENCIA/'])('find %s é normalizado', (arg) => {
    expect(run(`find ${arg}`, ctx).action).toEqual({ type: 'goto', id: 'experiencia' })
  })

  it('find sem opção mostra o uso', () => {
    expect(run('find', ctx)).toEqual({ output: ['uso: find <OPTIONS>', OPTIONS], action: { type: 'none' } })
  })

  it('find com opção inválida: erro, opções e o help', () => {
    expect(run('find xyz', ctx).output).toEqual([`find: 'xyz': seção não encontrada`, OPTIONS, HINT])
  })

  it('seção fora da lista recebida não é opção', () => {
    const semContato = sections.filter((s) => s.id !== 'contato')
    expect(run('find contato', { ...ctx, sections: semContato }).action).toEqual({ type: 'none' })
  })

  it('comando desconhecido', () => {
    expect(run('foo bar', ctx).output).toEqual([`foo: comando não encontrado. ${HINT}`])
  })

  it('clear e exit são ações', () => {
    expect(run('clear', ctx)).toEqual({ output: [], action: { type: 'clear' } })
    expect(run(' exit ', ctx)).toEqual({ output: [], action: { type: 'exit' } })
  })
})

describe('complete', () => {
  it('completa o comando (find ganha o espaço)', () => {
    expect(complete('fi', ctx)).toEqual({ line: 'find ', candidates: ['find'] })
    expect(complete('he', ctx)).toEqual({ line: 'help', candidates: ['help'] })
  })

  it('completa a opção do find', () => {
    expect(complete('find pro', ctx)).toEqual({ line: 'find projetos', candidates: ['projetos'] })
    expect(complete('find ~/Ski', ctx).line).toBe('find skills')
  })

  it('com várias possibilidades, o prefixo comum e os candidatos', () => {
    expect(complete('find e', ctx)).toEqual({ line: 'find e', candidates: ['experiencia', 'educacao'] })
    expect(complete('find s', ctx)).toEqual({ line: 'find s', candidates: ['sobre', 'skills'] })
  })

  it('sem candidato, nada muda', () => {
    expect(complete('x', ctx)).toEqual({ line: 'x', candidates: [] })
    expect(complete('find xyz', ctx)).toEqual({ line: 'find xyz', candidates: [] })
    expect(complete('', ctx)).toEqual({ line: '', candidates: [] })
  })
})

describe('normalizeOption', () => {
  it('tira maiúsculas, acentos e o caminho', () => {
    expect(normalizeOption('~/Educação/')).toBe('educacao')
  })
})

describe('completeWith', () => {
  it('troca a palavra atual pelo candidato tocado', () => {
    expect(completeWith('find e', 'educacao')).toBe('find educacao')
    expect(completeWith('f', 'find')).toBe('find ')
    expect(completeWith('  c', 'clear')).toBe('  clear')
  })
})

// Feature 007, US1: contrato de specs/007-open-command-dock-minimize/contracts/terminal-open.md.
describe('open', () => {
  const target = (name: string) => openTargets(resume).find((t) => t.name === name)!

  it('open <projeto> leva à janela dele', () => {
    expect(run('open italiami', ctx)).toEqual({ output: ['→ ~/projetos/italiami'], action: { type: 'open', target: target('italiami') } })
    expect(run('OPEN srg foo', ctx).action).toEqual({ type: 'open', target: target('srg') })
  })

  it.each([
    ['Experiência', 'experiencia', '→ ~/carreira'],
    ['~/carreira', 'experiencia', '→ ~/carreira'],
    ['~/projetos/challenges/', 'challenges', '→ ~/projetos/challenges'],
    ['COMUNITARIO', 'comunitario', '→ ~/projetos/comunitario'],
    ['Educação', 'educacao', '→ ~/formacao'],
    ['formacao', 'educacao', '→ ~/formacao'],
    ['~/formacao/', 'educacao', '→ ~/formacao'],
    ['projetos/OCR-de-Prontuarios', 'ocr-de-prontuarios', '→ ~/projetos/ocr-de-prontuarios'],
  ])('open %s é normalizado (nome ou apelido)', (arg, name, out) => {
    expect(run(`open ${arg}`, ctx)).toEqual({ output: [out], action: { type: 'open', target: target(name) } })
  })

  it('open sem opção mostra o uso', () => {
    expect(run('open', ctx)).toEqual({ output: ['uso: open <OPTIONS>', OPEN_OPTIONS], action: { type: 'none' } })
  })

  it.each([
    ['sobre', 'sobre'],
    ['skills', 'skills'],
    ['projetos', 'projetos'],
    ['Contato', 'contato'],
  ])('open %s: seção que o open não abre sugere o find', (arg, id) => {
    expect(run(`open ${arg}`, ctx)).toEqual({
      output: [`open: '${arg}': essa seção não abre com o open. Use: find ${id}`],
      action: { type: 'none' },
    })
  })

  it('open com opção inválida: erro, opções e o help', () => {
    expect(run('open xyz', ctx)).toEqual({ output: [`open: 'xyz': não encontrado`, OPEN_OPTIONS, HINT], action: { type: 'none' } })
  })

  it('sem alvos, o open não existe (nem no help nem no Tab)', () => {
    const none: TerminalContext = { sections, targets: [] }
    expect(run('open srg', none).output).toEqual([`open: comando não encontrado. ${HINT}`])
    expect(run('help', none).output.join('\n')).not.toContain('open')
    expect(complete('o', none)).toEqual({ line: 'o', candidates: [] })
  })

  it('Tab completa o comando e as opções do open', () => {
    expect(complete('o', ctx)).toEqual({ line: 'open ', candidates: ['open'] })
    expect(complete('open it', ctx)).toEqual({ line: 'open italiami', candidates: ['italiami'] })
    expect(complete('open c', ctx)).toEqual({ line: 'open c', candidates: ['challenges', 'comunitario'] })
    expect(complete('open qc', ctx)).toEqual({ line: 'open qclass-bot', candidates: ['qclass-bot'] })
    expect(complete('open ', ctx).candidates).toHaveLength(10)
    expect(complete('open ed', ctx)).toEqual({ line: 'open educacao', candidates: ['educacao'] })
    expect(complete('open e', ctx)).toEqual({ line: 'open e', candidates: ['experiencia', 'educacao'] })
    // os apelidos são aceitos, mas não são candidatos
    expect(complete('open carr', ctx)).toEqual({ line: 'open carr', candidates: [] })
    expect(completeWith('open c', 'comunitario')).toBe('open comunitario')
    expect(completeWith('o', 'open')).toBe('open ')
  })
})
