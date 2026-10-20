/**
 * Contrato da fonte de dados do portfólio (FR-001, FR-002 da 001; revisado pela 002, pela 003, pela
 * 004 e pela 009).
 *
 * Mudanças da 004 (specs/004-dock-windows-crt/data-model.md):
 * - TechName: 'JSON de tema' → 'JSON' (FR-041);
 * - TechIconId: prefixo novo `dashboard-` (homarr-labs/dashboard-icons, logotipo do Valkey, FR-043);
 * - SkillGroup.loopDirection (FR-046).
 *
 * Mudanças da 009 (specs/009-homeserver-bomjesus-challenge/data-model.md):
 * - TechName: 13 nomes novos (o challenge Bom Jesus (FAE) e o DebianServer); TechIconId: `simpleicons-`;
 * - ProjectKind 'side-project'; Detail, ServerApp e Screenshot; `inProductionSince`, `details` e `apps`;
 * - Project: 4ª variante, a exceção do Princípio II v3.1.0 (captura de tela no lugar dos links).
 *
 * `src/data/resume.ts` exporta
 * `export const resume = { ... } satisfies Resume`, então qualquer campo obrigatório ausente
 * ou com tipo errado quebra o `vue-tsc` e, com ele, o build.
 *
 * Regras que o tipo não expressa estão em specs/003-devicons-skill-loops/data-model.md
 * ("Validação") e são verificadas em tests/unit/resume.data.spec.ts e tests/unit/tech-icons.spec.ts.
 */

/** Lista que precisa ter ao menos um item. */
export type NonEmpty<T> = [T, ...T[]]

/** "AAAA-MM", ex.: "2026-03". O formato exato é validado no Vitest. */
export type YearMonth = `${number}-${number}`

/** "AAAA-MM-DD", ex.: "2026-10-01": data com o dia (feature 009, a entrada em produção). Validada no Vitest. */
export type YearMonthDay = `${number}-${number}-${number}`

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
  tech: NonEmpty<TechName>
}

/**
 * Nomes de tecnologia exibidos nos chips e nos loops de skills, com a grafia exata dos dados. Nome novo
 * exige entrada aqui e em TECH_ICONS (src/lib/tech-icons.ts), senão o vue-tsc quebra (FR-017 da 003).
 */
export type TechName =
  | '.NET' | 'Agentes de IA' | 'Agile/Scrum' | 'Angular' | 'Análise Funcional' | 'APIs REST'
  | 'Arquitetura' | 'Axios' | 'C#' | 'CasaOS' | 'Clean Code' | 'DDD' | 'Debian' | 'Design Patterns'
  | 'Docker' | 'Elasticsearch' | 'Ente Photos' | 'Factory' | 'Flask' | 'Git' | 'H2' | 'Java'
  | 'Java (Quarkus)' | 'Jenkins' | 'JSON' | 'JSON Server' | 'Kibana' | 'Kiwix' | 'LLMs' | 'MongoDB'
  | 'MVC' | 'MySQL' | 'NestJS' | 'Nginx' | 'Node.js' | 'OCR' | 'Ollama' | 'Open VSX Registry'
  | 'OpenWebUI' | 'PostgreSQL' | 'Prisma' | 'Processos' | 'Programação Web' | 'Python'
  | 'Python (Flask)' | 'Quarkus' | 'RabbitMQ' | 'React' | 'Redis' | 'Robocorp (RPA Framework)'
  | 'Robot Framework' | 'Samba' | 'SAP SD' | 'SearXNG' | 'Singleton' | 'Spring Boot' | 'SQL Server'
  | 'Syncthing' | 'Tailscale' | 'TDD' | 'TypeScript' | 'Valkey' | 'Vite' | 'VS Code Extension API'
  | 'Vue 3' | 'Vue.js' | 'Watchtower'

/** Id de um <symbol> de src/assets/tech-icons/sprite.svg, prefixado pela fonte (devicon →
 *  vectorlogo.zone → Lucide, research R1 da 003; dashboard-icons para o Valkey, research R11 da
 *  004). Gerado por tools/build-tech-icons.mjs. */
export type TechIconId =
  | `devicon-${string}`
  | `vectorlogo-${string}`
  | `simpleicons-${string}`
  | `dashboard-${string}`
  | `lucide-${string}`

export interface SkillItem {
  name: TechName
}

/** Nomes de ícones do Lucide (lucide.dev/icons) usados nos grupos (FR-034). O registro nome →
 *  componente fica em src/lib/icons.ts e precisa cobrir todos os nomes desta união. */
export type SkillIconName = 'code-xml' | 'globe' | 'database' | 'workflow' | 'server-cog'

/** Sentido em que os itens do loop correm. Padrão: da direita para a esquerda (FR-046 da 004). */
export type LoopDirection = 'to-left' | 'to-right'

export interface SkillGroup {
  id: string
  icon: SkillIconName
  items: NonEmpty<SkillItem>
  /** Ausente = 'to-left'. `conceitos_web` e `desenho_de_processos` usam 'to-right'. */
  loopDirection?: LoopDirection
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

export type ProjectKind = 'pessoal' | 'academico' | 'open-source' | 'profissional' | 'side-project'

/** Linha extra do `dl` da janela de projeto: `rótulo = valor` (feature 009, FR-010). */
export interface Detail {
  /** Minúsculas, sem acento nem espaço: `hardware`, `sistema`, `acesso`. */
  label: string
  value: string
}

/** App de um servidor (feature 009, FR-012): o ícone vem de TECH_ICONS pelo nome. */
export interface ServerApp {
  name: TechName
  /** Uma linha, fiel ao uso informado pelo autor (Princípio I). */
  summary: string
}

/**
 * Evidência por captura de tela (Princípio II v3.1.0, 4ª exceção: infraestrutura pessoal sem acesso
 * público). Arquivos em `public/`, gerados por tools/build-screenshots.mjs (research R4 da 009).
 */
export interface Screenshot {
  /** Versão exibida na janela, relativa ao `base`: 'projetos/debianserver/painel-2026-10-20-800.webp'. */
  src: string
  /** Largura da versão exibida, em px (800). */
  srcWidth: number
  /** Versão em tamanho real (resolução original), relativa ao `base`. */
  full: string
  /** Dimensões do original (1396 × 809): proporção reservada e tamanho no visualizador. */
  width: number
  height: number
  /** Texto alternativo: o que o painel mostra, com a data (FR-017). */
  alt: string
  /** Legenda sem a data: 'painel do CasaOS do DebianServer' (FR-016). */
  caption: string
  /** Mês da captura, exibido no formato da página (`01 OUT 2026`). */
  captured: YearMonth
}

interface ProjectBase {
  id: string
  name: string
  subtitle: string
  /** Linha de comando temática exibida na janela, sem `./run ` (FR-003 da 003). */
  command: string
  purpose: string
  stack: NonEmpty<TechName>
  role: string
  kind: ProjectKind
  /** Rodapé da janela, ex.: "[projeto pessoal]". */
  tag: string
  highlights?: Metric[]
  /** Empresa a que o projeto se relaciona, ex.: "Quadritech Tecnologia" (FR-009). */
  relatedTo?: string
  /** Projeto em andamento: selo "EM DESENVOLVIMENTO", sem data (FR-013). */
  inProgress?: true
  /** Em uso desde o dia informado: selo "EM PRODUÇÃO" e linha `desde = 01 OUT 2026` (FR-007 da 009). Nunca
   *  com `inProgress`. */
  inProductionSince?: YearMonthDay
  /** Linhas extras do `dl`, depois de `contexto` (FR-010 da 009). */
  details?: NonEmpty<Detail>
  /** Apps do servidor, na ordem dos dados (FR-012 da 009). */
  apps?: NonEmpty<ServerApp>
}

/**
 * Exceções do Princípio II (constituição v3.1.0):
 * - com evidência: ao menos um link; se todos forem `private`, é a exceção "código em repositório
 *   privado", e o cartão diz isso a partir dos próprios links (FR-005, FR-010);
 * - sem link nenhum: trabalho confidencial ou experiência acadêmica, com o motivo, ou infraestrutura
 *   pessoal sem acesso público (`side-project`), com a captura de tela no lugar dos links (feature 009).
 */
export type Project =
  | (ProjectBase & { evidence: NonEmpty<Evidence>; confidential?: never; noEvidenceReason?: never; screenshot?: never })
  | (ProjectBase & { evidence: []; confidential: true; noEvidenceReason: string; screenshot?: never })
  | (ProjectBase & { kind: 'academico'; evidence: []; confidential?: never; noEvidenceReason: string; screenshot?: never })
  // Princípio II v3.1.0: infraestrutura pessoal sem acesso público, comprovada pela captura
  | (ProjectBase & { kind: 'side-project'; evidence: []; screenshot: Screenshot; confidential?: never; noEvidenceReason?: never })

/** Desafio técnico público (FR-014 a FR-016). A ordem de exibição vem de `created`. */
export interface Challenge {
  id: string
  /** Nome exibido (empresa ou desafio), ex.: "CIEE-PR". */
  name: string
  /** Mês de criação do repositório. */
  created: YearMonth
  summary: string
  stack: NonEmpty<TechName>
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
  /**
   * Slug curto, `^[a-z0-9]+(-[a-z0-9]+)*$`, único na coleção: é o slug do nome do arquivo `AAAA_<id>.yml`
   * na janela de editor `~/formacao` e a chave do cartão (feature 008, research R3).
   */
  id: string
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
