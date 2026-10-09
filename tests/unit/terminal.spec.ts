import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import { visibleSections } from '@/lib/sections'
import { complete, completeWith, normalizeOption, run } from '@/lib/terminal'

// Feature 004, US2: contrato de specs/004-dock-windows-crt/contracts/terminal-commands.md.
const sections = visibleSections(resume)
const OPTIONS = 'OPTIONS: sobre | experiencia | skills | projetos | educacao | contato'
const HINT = 'Digite help para ver os comandos.'

describe('run', () => {
  it('linha vazia: nada', () => {
    expect(run('   ', sections)).toEqual({ output: [], action: { type: 'none' } })
  })

  it('help (sem diferenciar maiúsculas) explica o find com as opções do menu', () => {
    const { output, action } = run('HELP', sections)
    expect(action).toEqual({ type: 'none' })
    expect(output).toEqual([
      'Comandos disponíveis:',
      '  help             mostra esta ajuda',
      '  find <OPTIONS>   busca uma seção e leva a página até ela',
      '  clear            limpa o terminal',
      '  exit             fecha o terminal',
      '',
      'find <OPTIONS>',
      `  ${OPTIONS}`,
      '  exemplo: find projetos',
      '',
      'Tab completa comandos e opções; ↑ e ↓ percorrem os comandos já digitados.',
    ])
  })

  it('find <seção> leva à seção', () => {
    expect(run('find projetos', sections)).toEqual({ output: ['→ ~/projetos'], action: { type: 'goto', id: 'projetos' } })
    expect(run('find contato', sections).action).toEqual({ type: 'goto', id: 'contato' })
  })

  it.each(['Experiência', '~/experiencia', '/experiencia', 'EXPERIENCIA/'])('find %s é normalizado', (arg) => {
    expect(run(`find ${arg}`, sections).action).toEqual({ type: 'goto', id: 'experiencia' })
  })

  it('find sem opção mostra o uso', () => {
    expect(run('find', sections)).toEqual({ output: ['uso: find <OPTIONS>', OPTIONS], action: { type: 'none' } })
  })

  it('find com opção inválida: erro, opções e o help', () => {
    expect(run('find xyz', sections).output).toEqual([`find: 'xyz': seção não encontrada`, OPTIONS, HINT])
  })

  it('seção fora da lista recebida não é opção', () => {
    const semContato = sections.filter((s) => s.id !== 'contato')
    expect(run('find contato', semContato).action).toEqual({ type: 'none' })
  })

  it('comando desconhecido', () => {
    expect(run('foo bar', sections).output).toEqual([`foo: comando não encontrado. ${HINT}`])
  })

  it('clear e exit são ações', () => {
    expect(run('clear', sections)).toEqual({ output: [], action: { type: 'clear' } })
    expect(run(' exit ', sections)).toEqual({ output: [], action: { type: 'exit' } })
  })
})

describe('complete', () => {
  it('completa o comando (find ganha o espaço)', () => {
    expect(complete('fi', sections)).toEqual({ line: 'find ', candidates: ['find'] })
    expect(complete('he', sections)).toEqual({ line: 'help', candidates: ['help'] })
  })

  it('completa a opção do find', () => {
    expect(complete('find pro', sections)).toEqual({ line: 'find projetos', candidates: ['projetos'] })
    expect(complete('find ~/Ski', sections).line).toBe('find skills')
  })

  it('com várias possibilidades, o prefixo comum e os candidatos', () => {
    expect(complete('find e', sections)).toEqual({ line: 'find e', candidates: ['experiencia', 'educacao'] })
    expect(complete('find s', sections)).toEqual({ line: 'find s', candidates: ['sobre', 'skills'] })
  })

  it('sem candidato, nada muda', () => {
    expect(complete('x', sections)).toEqual({ line: 'x', candidates: [] })
    expect(complete('find xyz', sections)).toEqual({ line: 'find xyz', candidates: [] })
    expect(complete('', sections)).toEqual({ line: '', candidates: [] })
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
