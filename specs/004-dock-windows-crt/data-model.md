# Data Model: Janelas de área de trabalho, dock com terminal e telas CRT

**Feature**: `004-dock-windows-crt` | **Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

O contrato de tipos dos dados está em [contracts/resume.schema.ts](contracts/resume.schema.ts) (o
novo `src/types/resume.ts`). As entidades de interface (janela, terminal, boot) não fazem parte do
`resume.ts`: são estado de componente ou constantes de `src/lib/`.

## Entidades de dados (src/data/resume.ts)

### TechName (alterada)

- `'JSON de tema'` → `'JSON'` (FR-041). O ícone continua `devicon-json`.

### TechIconId (alterada)

- Prefixo novo `dashboard-<nome>` (homarr-labs/dashboard-icons). Primeiro e único uso:
  `dashboard-valkey` (FR-043).

### Registro `TECH_ICONS` (src/lib/tech-icons.ts)

- `JSON: 'devicon-json'` (renomeado de `'JSON de tema'`).
- `Valkey: 'dashboard-valkey'` (era `'lucide-database'`). O Valkey era o único usuário de
  `lucide-database`, então a entrada `database` sai do manifesto do gerador e o símbolo sai do
  sprite.

### SkillGroup (alterada)

| Campo | Tipo | Regra |
|-------|------|-------|
| `loopDirection` | `'to-left' \| 'to-right'` (opcional) | ausente = `'to-left'`; `conceitos_web` e `desenho_de_processos` = `'to-right'` (FR-046) |

### Project `italiami` (dado)

- `role: 'Autor e desenvolvedor'` (FR-047).

## Entidades de interface

### Janela de área de trabalho (`DesktopWindow`, estado de componente)

| Campo | Tipo | Origem |
|-------|------|--------|
| `title` | string | título da janela (`sobre.txt`, nome do projeto, `contato.sh`) |
| `kind` | `'document' \| 'script' \| 'project'` | prop: Sobre = `document`, Contato = `script`, cartões = `project` |
| `state` | `'open' \| 'minimized' \| 'closed'` | começa `open` em toda visita (FR-010) |
| `replayOnOpen` | boolean | `true` só depois de fechar (FR-005) |
| `animating` | boolean | animação de 320 ms em curso |

Ícone pelo tipo (Lucide): `document` → `FileText`, `script` → `FileTerminal`, `project` →
`FolderCode`.

Transições:

```text
open ──minimizar──▶ minimized      (typing.complete(); foco → ícone)
open ──fechar─────▶ closed         (typing.complete(); replayOnOpen = true; foco → ícone)
minimized ──abrir─▶ open           (cresce; conteúdo completo; foco → botão minimizar)
closed ──abrir────▶ open           (cresce; depois typing.replay(); replayOnOpen = false)
```

Um clique durante `animating` termina a animação atual (`finish()`) e aplica a transição pedida.
Sem movimento: as mesmas transições, sem animação, e `replay()` não faz nada.

### Comando do terminal (`src/lib/terminal.ts`)

| Campo | Tipo | Regra |
|-------|------|-------|
| `name` | `'help' \| 'find' \| 'clear' \| 'exit'` | comparado sem diferenciar maiúsculas |
| `summary` | string | linha do `help` |
| `options` | `SectionId[]` (só `find`) | as seções visíveis, na ordem do menu |

Resultado de `run(linha, opções)`:

```ts
type TerminalAction = { type: 'none' } | { type: 'clear' } | { type: 'exit' } | { type: 'goto'; id: SectionId }
interface TerminalResult { output: string[]; action: TerminalAction }
```

Resultado de `complete(linha, opções)`:

```ts
interface Completion { line: string; candidates: string[] }   // line = linha completada (ou a mesma)
```

Contrato completo de entradas e saídas: [contracts/terminal-commands.md](contracts/terminal-commands.md).

### Sessão do terminal (estado de componente)

| Campo | Tipo | Regra |
|-------|------|-------|
| `open` | boolean | começa `false` |
| `history` | string[] | comandos não vazios da visita, em memória |
| `cursor` | number | posição no histórico durante ↑/↓ |
| `lines` | `{ kind: 'cmd' \| 'out'; text: string }[]` | saída; `clear` esvazia |

### Linha do tempo do boot (`src/lib/boot.ts`)

| Constante | Valor | Origem |
|-----------|-------|--------|
| `BOOT_SEQUENCE_MS` | 3895 | soma da sequência atual (research R4) |
| `BOOT_FADE_MS` | 550 | fade de 0,5 s + folga |
| `BOOT_SAFETY_MS` | 500 | folga para timers atrasados (250 não bastou nos testes, research R4) |
| `BOOT_DEADLINE_MS` | 7000 | teto (constituição v2.3.0, clarify) |
| `BOOT_LATEST_START_MS` | 2055 | `DEADLINE − SEQUENCE − FADE − SAFETY` |

`bootFrame(elapsedMs): BootLine[]` é uma função pura do tempo. `bootFrame(BOOT_SEQUENCE_MS)` é a
sessão inteira, e o último trecho é `./iniciar_portfolio.sh`.

### Chuva Matrix (`src/lib/matrix-rain.ts`)

- `MATRIX_CHARS`: `A–Z a–z 0–9 *&%$#@!?+=-<>[]{}()/\|~^;:` (FR-037).
- `MatrixRain`: colunas, passo de 55 ms, rastro do fundo a 12%, cor alternada a cada 3 colunas
  (roxo/verde dos tokens). Desenha num `CanvasRenderingContext2D` qualquer (na tela ou fora dela).

## Inventário

### Janelas (FR-001, FR-002)

| Janela | `kind` | Ícone |
|--------|--------|-------|
| `sobre.txt` | document | FileText |
| SRG, Temas VS Code, ItaliaMi, OCR de Prontuários, QClass-BOT, Monitor de Curso | project | FolderCode |
| `contato.sh` | script | FileTerminal |

### Tokens novos (src/styles/tokens.css)

| Token | Valor | Uso |
|-------|-------|-----|
| `--hero-gap` | `50svh` | espaço do hero ao Sobre (FR-014) |
| `--dock-space` | `4.75rem` | reserva inferior para a dock (FR-027) |
| `--desktop-icon-size` | `5.5rem` | quadrado do ícone de área de trabalho |
| `--grape` | `#852ffc` | sublinhado do badge Grape Glass (FR-042) |
| `--sith-badge` | `#d90404` | sublinhado do badge Shadow Lord (FR-042) |
| `--boot-panel` | `color-mix(in srgb, var(--bg) 92%, transparent)` | painel do texto do boot (FR-029) |
| `--hero-scrim` | `color-mix(in srgb, var(--bg) 80%, transparent)` | penumbra sob o texto do hero (FR-038) |
| `--loop-font` | `1.7rem` | texto dos loops (FR-045) |

## Validação

- **Vitest (`resume.data.spec.ts`)**: nenhum `'JSON de tema'`; `italiami.role === 'Autor e
  desenvolvedor'`; `loopDirection === 'to-right'` exatamente em `conceitos_web` e
  `desenho_de_processos`.
- **Vitest (`tech-icons.spec.ts`)**: `TECH_ICONS.Valkey === 'dashboard-valkey'`; todo id do registro
  existe no sprite; nenhum símbolo com cor fixa.
- **Vitest (`terminal.spec.ts`, `boot.spec.ts`, `matrix-rain.spec.ts`)**: o contrato do terminal; a
  linha do tempo do boot e a sincronia das constantes com `index.html`; os caracteres da chuva.
- **vue-tsc**: `TechName`, `TechIconId` e `LoopDirection` checados na compilação.
