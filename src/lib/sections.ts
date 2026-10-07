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
