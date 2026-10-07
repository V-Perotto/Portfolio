/**
 * Contrato da fonte de dados do portfólio (FR-001, FR-002).
 *
 * `src/data/resume.ts` exporta
 * `export const resume = { ... } satisfies Resume`, então qualquer campo obrigatório ausente
 * ou com tipo errado quebra o `vue-tsc` e, com ele, o build.
 *
 * Regras que o tipo não expressa estão em specs/001-vue-resume-refactor/data-model.md
 * ("Validação") e são verificadas em tests/unit/resume.data.spec.ts.
 */

/** Lista que precisa ter ao menos um item. */
export type NonEmpty<T> = [T, ...T[]]

/** "AAAA-MM", ex.: "2026-03". O formato exato é validado no Vitest. */
export type YearMonth = `${number}-${number}`

export type Highlight = 'green' | 'purple'

/** Texto com trechos destacados, sem HTML nos dados. */
export type RichText = Array<string | { text: string; highlight: Highlight }>

export interface Attribute {
  /** Emoji decorativo, renderizado com aria-hidden. */
  icon: string
  label: string
}

export interface Seo {
  title: string
  description: string
  /** Caminho relativo ao `base` do site. */
  ogImage?: string
}

export interface Profile {
  name: string
  headline: string
  typedPhrases: NonEmpty<string>
  /** Frase exibida estática quando o movimento está reduzido. */
  staticPhraseIndex: number
  tagline: string
  about: RichText
  attributes: Attribute[]
  seo: Seo
}

export interface Metric {
  value: string
  label: string
}

export interface Experience {
  id: string
  role: string
  /** Já anonimizado quando `confidential` (FR-007). */
  company: string
  confidential?: boolean
  location: string
  start: YearMonth
  /** Ausente = vínculo em andamento. */
  end?: YearMonth
  summary: string
  highlights?: Metric[]
  tech: NonEmpty<string>
}

export interface SkillItem {
  name: string
  /** Aparece na faixa contínua (TechMarquee). */
  featured?: boolean
}

export interface SkillGroup {
  id: string
  icon: string
  items: NonEmpty<SkillItem>
}

export type EvidenceKind = 'repositorio' | 'demo' | 'marketplace' | 'artigo'

export interface Evidence {
  label: string
  url: string
  kind: EvidenceKind
  badge?: { src: string; alt: string }
  accent?: 'grape' | 'sith'
}

export type ProjectKind = 'pessoal' | 'academico' | 'open-source' | 'profissional'

interface ProjectBase {
  id: string
  name: string
  subtitle: string
  /** Linha de comando temática exibida na janela. */
  command: string
  purpose: string
  stack: NonEmpty<string>
  role: string
  kind: ProjectKind
  /** Rodapé da janela, ex.: "[projeto pessoal]". */
  tag: string
  highlights?: Metric[]
}

/**
 * Sem evidência pública, só trabalho confidencial (`confidential: true`) ou experiência acadêmica
 * sem artefato público (`kind: 'academico'`), e o motivo precisa dizer qual é o caso (FR-010,
 * Princípio II da constituição v2.1.0). Outro projeto sem evidência não entra nos dados.
 */
export type Project =
  | (ProjectBase & { evidence: NonEmpty<Evidence>; confidential?: never; noEvidenceReason?: never })
  | (ProjectBase & { evidence: []; confidential: true; noEvidenceReason: string })
  | (ProjectBase & { kind: 'academico'; evidence: []; confidential?: never; noEvidenceReason: string })

export interface Education {
  course: string
  institution: string
  location: string
  startYear: number
  endYear: number
  status: 'concluido' | 'em-curso'
}

export interface Contact {
  key: string
  url: string
  /** Padrão: a URL sem protocolo. */
  label?: string
}

export interface Resume {
  profile: Profile
  experiences: NonEmpty<Experience>
  skillGroups: NonEmpty<SkillGroup>
  projects: NonEmpty<Project>
  education: Education[]
  contacts: NonEmpty<Contact>
}
