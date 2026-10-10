import { slugify } from '@/lib/editor-files'
import type { Resume } from '@/types/resume'

export type SectionId = 'sobre' | 'experiencia' | 'skills' | 'projetos' | 'educacao' | 'contato'

export interface NavSection {
  id: SectionId
  label: string
}

const ORDER: readonly SectionId[] = ['sobre', 'experiencia', 'skills', 'projetos', 'educacao', 'contato']

/** Seções na ordem do FR-008; uma coleção vazia tira a seção da página e do menu. */
export function visibleSections(resume: Resume): NavSection[] {
  const hasContent: Record<SectionId, boolean> = {
    sobre: true,
    experiencia: resume.experiences.length > 0,
    skills: resume.skillGroups.length > 0,
    projetos: resume.projects.length > 0,
    educacao: resume.education.length > 0,
    contato: resume.contacts.length > 0,
  }
  return ORDER.filter((id) => hasContent[id]).map((id) => ({ id, label: `~/${id}` }))
}

/**
 * Alvos do comando `open` do terminal da dock (feature 007, FR-001 a FR-005, research R1, data-model §1):
 * os projetos abrem a janela deles; Experiência, Challenges e Comunitário abrem a janela de editor
 * maximizada (Q1). Na ordem da página, gerados dos dados: um projeto novo vira opção sozinho, e uma
 * coleção vazia não tem alvo.
 */
export type OpenMode = 'open' | 'maximize'

export interface OpenTarget {
  /** O que o visitante digita e o Tab completa: `experiencia`, `srg`, `temas-vs-code`… */
  name: string
  /** Id da janela no registro (`src/lib/windows.ts`). */
  windowId: string
  /** Caminho mostrado na saída: `~/carreira`, `~/projetos/srg`… */
  path: string
  /** Aceito, mas fora da lista de opções e do autocompletar: o caminho sem `~/`. */
  alias: string
  mode: OpenMode
}

const editorTarget = (name: string, path: string): OpenTarget => ({
  name,
  windowId: name,
  path,
  alias: path.replace(/^~\//, ''),
  mode: 'maximize',
})

/** Id da janela de um projeto: o nome exibido em slug (clarify), `OCR de Prontuários` → `projetos/ocr-de-prontuarios`. */
export const projectWindowId = (projectName: string) => `projetos/${slugify(projectName)}`

export function openTargets(resume: Resume): OpenTarget[] {
  const projects = resume.projects.map((project): OpenTarget => {
    const windowId = projectWindowId(project.name)
    return { name: windowId.slice('projetos/'.length), windowId, path: `~/${windowId}`, alias: windowId, mode: 'open' }
  })
  return [
    ...(resume.experiences.length ? [editorTarget('experiencia', '~/carreira')] : []),
    ...projects,
    ...(resume.challenges.length ? [editorTarget('challenges', '~/projetos/challenges')] : []),
    ...(resume.community.length ? [editorTarget('comunitario', '~/projetos/comunitario')] : []),
  ]
}
