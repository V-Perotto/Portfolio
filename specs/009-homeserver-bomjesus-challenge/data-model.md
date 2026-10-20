# Data Model: challenge Bom Jesus (FAE) e o side-project DebianServer (feature 009)

Mudanças em `src/types/resume.ts` e os itens novos de `src/data/resume.ts`. Pesquisa: R1–R3, R6.

## 1. Tipos

### `TechName` (+13)

```ts
| 'CasaOS' | 'Debian' | 'Ente Photos' | 'H2' | 'Kiwix' | 'Ollama' | 'OpenWebUI' | 'Samba'
| 'SearXNG' | 'Spring Boot' | 'Syncthing' | 'Tailscale' | 'Watchtower'
```

Cada um com ícone em `TECH_ICONS` (tabela do R3). `TechIconId` ganha o prefixo `simpleicons-${string}`.

### `ProjectKind`

```ts
export type ProjectKind = 'pessoal' | 'academico' | 'open-source' | 'profissional' | 'side-project'
```

Rótulo exibido (`KIND_LABEL`): `side-project`.

### Tipos novos

```ts
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
 * público). Arquivos em `public/`, gerados por tools/build-screenshots.mjs (research R4).
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
  /** Mês da captura, exibido no formato da página (`OUT 2026`). */
  captured: YearMonth
}
```

### `ProjectBase` (+3 opcionais)

```ts
/** Em uso desde o mês informado: selo "EM PRODUÇÃO" e linha `desde` (FR-007). Nunca com `inProgress`. */
inProductionSince?: YearMonthDay
/** Linhas extras do `dl`, depois de `contexto` (FR-010). */
details?: NonEmpty<Detail>
/** Apps do servidor, na ordem dos dados (FR-012). */
apps?: NonEmpty<ServerApp>
```

### `Project` (+1 variante)

```ts
export type Project =
  | (ProjectBase & { evidence: NonEmpty<Evidence>; confidential?: never; noEvidenceReason?: never; screenshot?: never })
  | (ProjectBase & { evidence: []; confidential: true; noEvidenceReason: string; screenshot?: never })
  | (ProjectBase & { kind: 'academico'; evidence: []; confidential?: never; noEvidenceReason: string; screenshot?: never })
  // Princípio II v3.1.0: infraestrutura pessoal sem acesso público, comprovada pela captura
  | (ProjectBase & { kind: 'side-project'; evidence: []; screenshot: Screenshot; confidential?: never; noEvidenceReason?: never })
```

## 2. Itens novos de `src/data/resume.ts`

### Projeto (2º da lista, depois de `srg`)

| Campo | Valor |
|-------|-------|
| `id` | `debianserver` |
| `name` | `DebianServer` |
| `subtitle` | `Meu homeserver` |
| `command` | `debianserver --status` |
| `purpose` | `Servidor caseiro self-hosted num notebook reaproveitado: guarda as fotos do celular, dá acesso à IA local, a uma Wikipedia offline e à sincronização de notas, sem depender de nuvem de terceiros.` |
| `role` | `Autor: instalação, configuração e manutenção` |
| `kind` | `side-project` |
| `tag` | `[side-project]` |
| `inProductionSince` | `2026-10-01` (exibido `desde = 01 OUT 2026`) |
| `details` | `hardware` = `Notebook reaproveitado: Lenovo ideapad 330-15IKB, Intel Core i5-8250U`; `sistema` = `CasaOS sobre Debian 13, com os apps em containers Docker`; `acesso` = `Tailscale (VPN) de fora de casa, sem porta aberta na internet; no celular, os arquivos por SMB` |
| `stack` | `Debian`, `CasaOS`, `Docker`, `Tailscale`, `Ollama`, `Samba` |
| `evidence` | `[]` |

`apps`, na ordem:

| `name` | `summary` |
|--------|-----------|
| `Ente Photos` | `Backup automático das fotos e vídeos do celular, criptografados de ponta a ponta e guardados no próprio servidor, no lugar de uma nuvem de terceiros.` |
| `OpenWebUI` | `Interface de chat com IA: serve de ponte para os modelos locais (Ollama) que rodam no desktop, numa RTX 3060 de 12 GB, e pesquisa na web pelo SearXNG.` |
| `Kiwix` | `Cópia offline da Wikipedia em português.` |
| `Syncthing` | `Mantém o cofre do Obsidian sincronizado entre o desktop, o celular e o servidor.` |
| `SearXNG` | `Metabuscador próprio, usado como fonte de busca na web do OpenWebUI.` |
| `Watchtower` | `Atualiza sozinho os containers dos outros apps quando sai uma versão nova.` |

`screenshot`:

| Campo | Valor |
|-------|-------|
| `src` | `projetos/debianserver/painel-2026-10-20-800.webp` |
| `srcWidth` | `800` |
| `full` | `projetos/debianserver/painel-2026-10-20-1396.webp` |
| `width` × `height` | `1396` × `809` |
| `alt` | `Painel do CasaOS do DebianServer em 20/10/2026: CPU a 3%, RAM a 26% de 11,6 GB, disco com 122 GB usados de 460 GB e os apps App Store, Files, OpenWebUI, Syncthing, Watchtower, SearXNG, Kiwix Server e Ente Photos.` |
| `caption` | `painel do CasaOS do DebianServer` |
| `captured` | `2026-10` |

### Challenge

| Campo | Valor |
|-------|-------|
| `id` | `bomjesus-challenge` |
| `name` | `Bom Jesus (FAE)` |
| `created` | `2026-10` |
| `summary` | `Gestão acadêmica: API REST e interface web para cadastrar, consultar, atualizar e excluir alunos e professores de uma instituição de ensino.` |
| `stack` | `Java`, `Spring Boot`, `Vue 3`, `TypeScript`, `H2`, `Docker` |
| `url` | `https://github.com/V-Perotto/bomjesus-challenge` |

Arquivo gerado: `2026-10_bom-jesus-fae.yml`, posição `1 / 8`.

## 3. Validação (Vitest, `tests/unit/resume.data.spec.ts`)

Regras que o tipo não expressa:

1. Projeto sem link é confidencial, acadêmico com motivo, **ou `side-project` com `screenshot`** (a regra
   (6) de hoje ganha o 3º caso).
2. `inProductionSince` e `inProgress` nunca no mesmo projeto.
3. `details[].label` casa com `^[a-z]+$`; rótulos únicos no projeto.
4. `apps[].summary` e `screenshot.alt`/`caption` não vazios; `screenshot.alt` cita a data da captura.
5. `screenshot.src` e `screenshot.full` relativos (sem `/` no início, sem protocolo), terminam em `.webp`
   e existem em `public/`; `srcWidth < width`.
6. Inventário: `['srg', 'debianserver', 'vscode-themes', 'italiami', 'ocr-prontuarios', 'qclass-bot',
   'monitoria']`; 8 challenges; `inProgress` só no `srg`; `inProductionSince` só no `debianserver`.
7. Privacidade (R11): nenhum texto do projeto casa com IPv4, `.ts.net` ou `:\d{2,5}` (porta).

## 4. Estados

- **Janela do DebianServer**: os mesmos de toda janela de projeto (`open` | `minimized` | `closed`, 004/005).
- **Visualizador**: `fechado` → (clique/Enter no print) → `aberto` → (Esc | ✕ | clique no fundo) →
  `fechado`, com o foco de volta no print. Minimizar ou fechar a janela com o visualizador aberto não é
  possível (a janela fica inerte sob o diálogo modal).
