/**
 * Contrato da fonte de dados do portfólio — revisão da feature 002.
 *
 * Substitui `src/types/resume.ts` na implementação. Mudanças em relação à 001 estão marcadas com
 * `// 002:`. Regras que o tipo não expressa estão em ../data-model.md, seção "Validação".
 */

export type NonEmpty<T> = [T, ...T[]]

export type YearMonth = `${number}-${number}`

export type Highlight = 'green' | 'purple'

export type RichText = Array<string | { text: string; highlight: Highlight }>

export interface Attribute {
  icon: string
  label: string
}

export interface Seo {
  title: string
  description: string
  ogImage?: string
}

export interface Profile {
  name: string
  headline: string
  typedPhrases: NonEmpty<string>
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
  company: string
  confidential?: boolean
  location: string
  start: YearMonth
  end?: YearMonth
  summary: string
  highlights?: Metric[]
  tech: NonEmpty<string>
}

export interface SkillItem {
  name: string
  featured?: boolean
}

// 002: nomes de ícones do Lucide (lucide.dev/icons) usados nos grupos (FR-034). O registro
// nome → componente fica em src/lib/icons.ts e precisa cobrir todos os nomes desta união.
export type SkillIconName = 'code-xml' | 'globe' | 'database' | 'workflow' | 'server-cog'

export interface SkillGroup {
  id: string
  icon: SkillIconName // 002: era um caractere solto
  items: NonEmpty<SkillItem>
}

// 002: link simples, reaproveitado nas fontes da formação e do projeto comunitário
export interface Link {
  label: string
  url: string
}

export type EvidenceKind = 'repositorio' | 'demo' | 'marketplace' | 'artigo'

export interface Evidence {
  label: string
  url: string
  kind: EvidenceKind
  /** 002: repositório privado — o visitante pode cair numa página "não encontrado" (FR-005). */
  private?: true
  badge?: { src: string; alt: string }
  accent?: 'grape' | 'sith'
}

export type ProjectKind = 'pessoal' | 'academico' | 'open-source' | 'profissional'

interface ProjectBase {
  id: string
  name: string
  subtitle: string
  command: string
  purpose: string
  stack: NonEmpty<string>
  role: string
  kind: ProjectKind
  tag: string
  highlights?: Metric[]
  /** 002: empresa a que o projeto se relaciona, ex.: "Quadritech Tecnologia" (FR-009). */
  relatedTo?: string
  /** 002: projeto em andamento — selo "EM DESENVOLVIMENTO", sem data (FR-013). */
  inProgress?: true
}

/**
 * Exceções do Princípio II (constituição v2.2.0):
 * - com evidência: ao menos um link; se todos forem `private`, é a exceção "código em repositório
 *   privado", e o cartão diz isso a partir dos próprios links (FR-005, FR-010);
 * - sem link nenhum: só trabalho confidencial ou experiência acadêmica, com o motivo.
 */
export type Project =
  | (ProjectBase & { evidence: NonEmpty<Evidence>; confidential?: never; noEvidenceReason?: never })
  | (ProjectBase & { evidence: []; confidential: true; noEvidenceReason: string })
  | (ProjectBase & { kind: 'academico'; evidence: []; confidential?: never; noEvidenceReason: string })

/** 002: desafio técnico público (FR-014 a FR-016). A ordem de exibição vem de `created`. */
export interface Challenge {
  id: string
  /** Nome exibido (empresa ou desafio), ex.: "CIEE-PR". */
  name: string
  /** Mês de criação do repositório. */
  created: YearMonth
  summary: string
  stack: NonEmpty<string>
  /** Repositório público; o texto do link é o caminho sem protocolo. */
  url: string
}

/** 002: projeto comunitário/de extensão — não técnico, dispensa stack (FR-018, FR-019). */
export interface CommunityProject {
  id: string
  name: string
  institution: string
  location: string
  date: YearMonth
  summary: string
  role: string
  source: Link
}

export interface Education {
  course: string
  institution: string
  location: string
  startYear: number
  endYear: number
  status: 'concluido' | 'em-curso'
  /** 002: observação curta, ex.: o que o curso possibilitou (FR-021). */
  note?: string
  /** 002: links que comprovam a formação (FR-022). */
  sources?: NonEmpty<Link>
}

export interface Contact {
  key: string
  url: string
  label?: string
}

export interface Resume {
  profile: Profile
  experiences: NonEmpty<Experience>
  skillGroups: NonEmpty<SkillGroup>
  projects: NonEmpty<Project>
  challenges: Challenge[] // 002
  community: CommunityProject[] // 002
  education: Education[]
  contacts: NonEmpty<Contact>
}
