# Data Model: Porta de acesso no boot, IP real, Dot Field no hero e ajustes nas janelas

**Feature**: `005-access-gate-dotfield` | **Date**: 2026-10-09 | Pesquisa: [research.md](research.md)

Nada desta feature muda os dados do currículo (`src/types/resume.ts`, `src/data/resume.ts`). As
entidades abaixo são estado de interface (só no cliente) e constantes de build.

## 1. Tentativa de acesso (`AccessGate.vue`)

Uma por carga da página. Não é guardada (FR-010).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `state` | `'idle' \| 'open' \| 'minimized' \| 'done'` | ícone na tela / janela aberta com sessão / janela minimizada com sessão / saída em curso |
| `sessionStartedAt` | `number \| null` | `performance.now()` do início da sessão em curso; `null` sem sessão |
| `elapsed` | `number` | ms desde `sessionStartedAt`, atualizado a cada tique de 16 ms |
| `ip` | `string` | IP desta sessão: o do ipify, se já chegou no início dela, senão `127.0.0.1` |
| `lookup` | `Promise<string \| null>` + valor resolvido | consulta do IP, começada quando a porta aparece (uma por carga) |
| `lastLogin` | `string` | `new Date().toLocaleString('pt-BR')` no início da sessão |
| `reduced` | `boolean` | sem a classe `motion` no `<html>` (lido no início de cada ação) |

### Transições

| De | Evento | Para | Efeito |
|----|--------|------|--------|
| (montagem) | app montado até 2055 ms, `booting` presente | `idle` | põe `gate`, `inert` nos irmãos, foco no ícone, começa a consulta do IP |
| (montagem) | app montado depois de 2055 ms ou sem `booting` | — | tira `booting`; a porta não aparece |
| `idle` | abrir o ícone (clique, toque, Enter, Espaço) | `open` | nova sessão: lê o IP (ou `127.0.0.1`) e a data; a janela cresce em 320 ms; a sessão começa no fim da animação |
| `open` | minimizar | `minimized` | a janela encolhe até o ícone; a sessão **continua** (clarify Q1) |
| `minimized` | abrir o ícone | `open` | a janela cresce; mostra o ponto atual da sessão |
| `open` | fechar | `idle` | a janela encolhe; a sessão é descartada; status "Conexão encerrada" |
| `open` ou `minimized` | `elapsed ≥ SESSION_MS` | `done` | fade de 550 ms (sem fade com movimento reduzido); tira `gate`, `booting` e `inert`; foco na seção da âncora ou, sem âncora, no início do documento |

Regras:

- `open` em `idle` começa uma **nova** sessão (linha 1 desde o zero, IP relido). `open` em
  `minimized` só mostra a janela; a sessão segue (clarify Q1).
- `close` só existe com a janela aberta; descarta a sessão (FR-008) e volta a `idle`, com o foco no
  ícone.
- Cliques no ícone durante a animação de abrir são ignorados (o ícone está oculto e o estado já é
  `open`) (FR-004).
- Minimizar ou fechar durante uma animação termina a animação em curso na hora (`finishAll`) e
  atende o pedido (Edge Cases).
- Com movimento reduzido: sem animação de abrir; a sessão começa no clique com todas as linhas
  visíveis (`sessionAt(SESSION_MS)`, `TextType instant`); `done` chega em `REDUCED_HOLD_MS` (1000 ms);
  a saída é imediata (FR-012).

## 2. Linha do tempo da sessão (`src/lib/boot.ts`)

```ts
interface BootPart { cls?: string; text: string }        // trecho fixo com a classe de cor
interface TypedPart { text: string; speed: number; cls?: string } // trecho digitado (TextType)
interface SessionLine {
  at: number                 // ms desde o início da sessão em que a linha aparece
  parts: BootPart[]          // prefixo fixo (prompt, rótulo)
  typed?: TypedPart          // digitado depois do prefixo, começando em `at`
}
function sessionLines(ip: string, version: string, lastLogin: string): SessionLine[]
function sessionAt(elapsed: number, lines: SessionLine[]): number // quantas linhas visíveis
function displayVersion(semver: string): string                    // '2.4.0' → 'v2.4'
```

| # | `at` (ms) | Prefixo fixo | Digitado (ms/caractere) |
|---|-----------|--------------|--------------------------|
| 1 | 0 | `anon@<ip>:~$ ` (classes `prompt-*`) | `ssh viper@portfolio` (29) |
| 2 | 697 | `Conectando ao portfolio...` (`boot-dim`) | — |
| 3 | 1047 | `viper@portfolio password: ` | `••••••••` (38) |
| 4 | 1628 | `Autenticado. ` (`boot-ok`) + `Bem-vindo ao Portfolio v2.4` | — |
| 5 | 1838 | `Last login: <lastLogin> from <ip>` (`boot-dim`) | — |
| 6 | 2118 | `viper@portfolio:~$ ` (classes `prompt-*`) | `./iniciar_portfolio.sh` (17, `boot-ok`) |

Constantes: `SESSION_MS = 2720` (último caractere em 2475 + pausa de 245), `GATE_LATEST_START_MS =
2055`, `APP_FAILED_MS = 3900`, `FADE_MS = 550`, `OPEN_MS = 320`, `REDUCED_HOLD_MS = 1000`,
`FALLBACK_IP = '127.0.0.1'`, `BOOT_COMMAND = './iniciar_portfolio.sh'`.

Validações (unidade):

- Cada `at` ≥ o fim do trecho digitado da linha anterior (o texto nunca se sobrepõe).
- `SESSION_MS ≤ 2900` e `SESSION_MS / 3895 ≤ 0,75` (FR-020).
- Os prazos do script inline de `index.html` são `GATE_LATEST_START_MS` e `APP_FAILED_MS`, e o 7000
  não aparece mais.
- `displayVersion(__PORTFOLIO_VERSION__)` = `v` + maior + `.` + menor do `package.json`.

## 3. TextType vendorizado (`vendor/vue-bits/TextType.vue`)

| Prop | Tipo | Padrão | Origem |
|------|------|--------|--------|
| `text` | `string \| string[]` | — | original |
| `as` | `string` | `'span'` | original (`'div'` lá) |
| `typingSpeed` | `number` (ms) | `50` | original |
| `initialDelay` | `number` (ms) | `0` | original |
| `showCursor` | `boolean` | `true` | original |
| `cursorCharacter` | `string` | `'▊'` | original (`'|'` lá) |
| `cursorClassName` | `string` | `''` | original |
| `loop` | `boolean` | `false` | original (`true` lá) |
| `pauseDuration`, `deletingSpeed` | `number` | `2000`, `30` | original (só com várias frases + `loop`) |
| `startAt` | `number` (`performance.now()`) | instante da montagem | **novo** (R3) |
| `instant` | `boolean` | `false` | **novo** (movimento reduzido) |
| `reserve` | `boolean` | `false` | **novo** (texto não digitado invisível, R4) |

Evento novo: `complete` (uma vez, quando o texto termina). Fora do escopo do vendorizado: `textColors`,
`variableSpeed`, `startOnVisible`, `reverseMode` e `hideCursorWhileTyping` saem (a sessão não usa, e
removê-los evita código morto; o cabeçalho registra).

## 4. Dot Field vendorizado (`vendor/vue-bits/DotField.vue`) e `HeroDots.vue`

| Prop | Valor na feature | Padrão do componente |
|------|------------------|----------------------|
| `dotRadius` | **2** | 1,5 |
| `dotSpacing` | 14 | 14 |
| `cursorRadius` | 500 | 500 |
| `cursorForce` | **0** | 0,1 |
| `bulgeOnly` | **false** | true |
| `bulgeStrength` | 67 | 67 |
| `glowRadius` | **80** | 160 |
| `sparkle` | **true** | false |
| `waveAmplitude` | 0 | 0 |
| `gradientFrom` | `rgba(--dots-from, --dots-from-alpha)` | `rgba(124, 255, 103, 0.35)` |
| `gradientTo` | `rgba(--dots-to, --dots-to-alpha)` | `rgba(160, 255, 188, 0.25)` |
| `glowColor` | `rgba(--dots-glow, --dots-glow-alpha)` | `#14110E` |

`HeroDots` lê os tokens com `tokenRgb` + `getPropertyValue` e monta as três cores. Também liga e
desliga o `DotField` com o `IntersectionObserver` do `#home`. Vida do componente: montado só com
`motion && bootDone` (o `HeroSection` decide); sai se o movimento for desligado ao vivo.

## 5. Tokens novos (`src/styles/tokens.css`)

| Token | Valor inicial | Uso |
|-------|---------------|-----|
| `--dots-from` | `var(--purple-glow)` | "gradient from" do Dot Field (FR-030) |
| `--dots-to` | `var(--green-bright)` | "gradient to" |
| `--dots-glow` | `var(--purple-light)` | "glow color" |
| `--dots-from-alpha` | `0.45` | transparência dos pontos no canto roxo (calibrada no T de contraste) |
| `--dots-to-alpha` | `0.35` | transparência dos pontos no canto verde |
| `--dots-glow-alpha` | `0.35` | intensidade máxima do halo |
| `--gate-window-width` | `680px` | largura da janela da porta (R4) |

Na impressão (`@media print`), nenhum desses aparece (a porta e o Dot Field não são impressos).
`--boot-panel` passa a ser a cor da penumbra sob o ícone e a dica (R8). `--hero-scrim` continua.

## 6. Versão do portfólio

| Fonte | Valor | Exibido |
|-------|-------|---------|
| `package.json` → `version` (+ raiz do `package-lock.json`) | `2.4.0` | `v2.4` |
| `vite.config.ts` / `vitest.config.ts` → `define.__PORTFOLIO_VERSION__` | `"2.4.0"` | — |

Política (README): cada feature sobe a versão menor (FR-016).

## 7. Ícone de área de trabalho (`base/DesktopIcon.vue`)

| Prop | Tipo | Uso |
|------|------|-----|
| `title` | `string` | nome embaixo do quadrado e `aria-label="Abrir <title>"` |
| `kind` | `'document' \| 'script' \| 'project'` | glifo (`FileText`, `FileTerminal`, `FolderCode`) |
| `describedby` | `string?` | `aria-describedby` (a dica da porta) |

Expõe o elemento do quadrado (`.desktop-icon-square`) para o FLIP. O desenho é o da 004, sem mudança.
