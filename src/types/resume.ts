/**
 * Contrato da fonte de dados do portfólio (FR-001, FR-002 da 001; revisado pela 002).
 *
 * `src/data/resume.ts` exporta
 * `export const resume = { ... } satisfies Resume`, então qualquer campo obrigatório ausente
 * ou com tipo errado quebra o `vue-tsc` e, com ele, o build.
 *
 * Regras que o tipo não expressa estão em specs/002-projects-animated-terminals/data-model.md
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

/** Nomes de ícones do Lucide (lucide.dev/icons) usados nos grupos (FR-034). O registro nome →
 *  componente fica em src/lib/icons.ts e precisa cobrir todos os nomes desta união. */
export type SkillIconName = 'code-xml' | 'globe' | 'database' | 'workflow' | 'server-cog'

export interface SkillGroup {
  id: string
  icon: SkillIconName
  items: NonEmpty<SkillItem>
}

/** Link simples: fontes da formação e do projeto comunitário. */
export interface Link {
  label: string
  url: string
}

export type EvidenceKind = 'repositorio' | 'demo' | 'marketplace' | 'artigo'

export interface Evidence {
  label: string
  url: string
  kind: EvidenceKind
  /** Repositório privado: o visitante pode cair numa página "não encontrado" (FR-005). */
  private?: true
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
  /** Empresa a que o projeto se relaciona, ex.: "Quadritech Tecnologia" (FR-009). */
  relatedTo?: string
  /** Projeto em andamento: selo "EM DESENVOLVIMENTO", sem data (FR-013). */
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

/** Desafio técnico público (FR-014 a FR-016). A ordem de exibição vem de `created`. */
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

/** Projeto comunitário ou de extensão: não técnico, dispensa stack (FR-018, FR-019). */
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
  /** Observação curta, ex.: o que o curso possibilitou (FR-021). */
  note?: string
  /** Links que comprovam a formação (FR-022). */
  sources?: NonEmpty<Link>
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
  challenges: Challenge[]
  community: CommunityProject[]
  education: Education[]
  contacts: NonEmpty<Contact>
}
