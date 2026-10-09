# Research: Projetos ampliados, terminais animados e ícones nas skills

**Feature**: `002-projects-animated-terminals` | **Date**: 2026-10-08

Cada decisão resolve um ponto do Technical Context ou uma escolha de implementação da spec.

## R1. Pacote de ícones Lucide

**Decision**: `@lucide/vue` 1.53.0, importando ícone por ícone (`import { CodeXml } from '@lucide/vue'`).

**Rationale**:
- É o pacote oficial do Lucide para Vue; o `lucide-vue-next` está marcado como *deprecated* no npm
  ("Please use @lucide/vue instead"). O próprio autor já usa `@lucide/vue` no SRG-Vue.
- Renderiza `<svg>` inline no SSR do `vite-ssg`: testado com `renderToString`, sai um
  `<svg ... stroke="currentColor" aria-hidden="true">` completo no HTML. Não há fonte de ícones
  nem requisição a terceiros (Princípio III, FR-035).
- `aria-hidden="true"` vem por padrão (FR-035); `stroke="currentColor"` herda a cor dos tokens e,
  no modo forced colors, vira `CanvasText` sozinho (FR-036).
- Peso medido (esbuild `--minify`, gzip -9, `vue` externo): os 6 ícones usados (5 grupos + cadeado)
  somam 5,4 KB / **2,3 KB gzip**, com tree-shaking por ícone.

**Alternatives considered**:
- `lucide-vue-next`: descontinuado.
- `lucide-static` (SVG como string ou sprite): exige `v-html` ou `<use>`, e perde o SSR tipado.
- Copiar os SVGs à mão para componentes: zero dependência, mas o pedido do autor é usar o Lucide e
  a cópia manual sai de sincronia com a biblioteca.

## R2. Ícones escolhidos

| Uso | Ícone Lucide | Motivo |
|-----|--------------|--------|
| `linguagens_frameworks` | `CodeXml` | código |
| `conceitos_web` | `Globe` | web |
| `gestao_de_dados` | `Database` | dados |
| `desenho_de_processos` | `Workflow` | fluxo de processos |
| `devops_qualidade` | `ServerCog` | operação e infraestrutura |
| link privado | `Lock` | forma, não só cor (FR-006) |

Tamanhos vêm de tokens novos em `tokens.css` (`--icon-skill`, `--icon-inline`), aplicados por CSS
em `width`/`height`; a prop `size` do Lucide não é usada (FR-036, Princípio V).

Os dados guardam o **nome** do ícone (`'code-xml'`), não o componente: `src/data/resume.ts` segue sem
importar Vue. Um registro tipado em `src/lib/icons.ts` faz `nome → componente`; um nome inexistente
quebra o `vue-tsc`.

## R3. Como os terminais digitam sem esconder conteúdo de leitores de tela nem mexer no layout

**Decision**: animação por DOM, num composable `useTerminalTyping` chamado pela `TerminalWindow`.

- O texto real fica sempre no fluxo e na árvore de acessibilidade. Durante a animação:
  - **comando ainda não digitado**: o texto real fica com `color: transparent` (ocupa o mesmo
    espaço e continua acessível) e uma **sobreposição** `aria-hidden` (`position: absolute;
    inset: 0` dentro da linha) recebe um clone do conteúdo do comando, revelado caractere a
    caractere. Como a sobreposição tem a mesma largura e o mesmo texto, quebra as linhas no mesmo
    lugar que o texto real, e a janela não muda de altura (FR-031). O clone preserva as classes
    (ex.: a linha verde do Contato).
  - **saída ainda não revelada**: `opacity: 0`. Continua no fluxo (sem deslocamento) e na árvore
    de acessibilidade (FR-030); `visibility: hidden` foi descartado porque tiraria o texto dos
    leitores de tela.
- Os estados ficam em atributos `data-t-state="pending|typing|done"`, não em classes: o Vue só
  reescreve `class` quando o binding muda, mas atributos que ele não conhece nunca são tocados, então
  um re-render (ex.: o badge que falha no `EvidenceLink`) não desfaz o estado.
- O CSS só esconde sob `html.motion` e fora do `@media print` (FR-029); sem JS nada é escondido,
  porque os atributos só existem depois que o app monta (mesmo padrão do `v-reveal`, research R7 da
  001).

**Alternatives considered**:
- Envolver cada caractere real num `<span>`: alguns leitores de tela soletram letra a letra.
- `TextType`/`DecryptedText` do Vue Bits: digitam um texto só, não uma sequência comando → saída
  com conteúdo arbitrário (listas, links, `RichText`), e trazem dependências (GSAP).
- Pré-esconder via CSS antes do primeiro paint: um bundle que falha deixaria texto invisível
  (viola FR-018 da 001 e o Princípio III).

## R4. Quando cada janela anima

**Decision**: ao montar, com `html.motion`:

| Situação ao montar | O que acontece |
|--------------------|----------------|
| janela abaixo da dobra | pré-esconde e anima ao cruzar 25% da viewport (`IntersectionObserver`, `threshold: 0.25`) |
| janela visível e `html.booting` (capa de boot cobrindo) | pré-esconde (ninguém vê, a capa cobre) e anima quando `booting` sai |
| janela visível sem capa (bundle chegou tarde) ou acima da dobra | fica completa, sem animar (edge case da spec: esconder texto já visto faria piscar) |

Uma vez completa, a janela desliga o observer: a animação não se repete (FR-027).

**Pular (FR-028)**: `pointerdown` ou `focusin` dentro da janela completa tudo na hora. O `focusin`
dispara antes de o anel de foco ser pintado, então o foco num link de uma saída ainda escondida já
encontra a saída visível.

**Movimento reduzido no meio da visita (FR-029)**: o `watch` sobre `useMotion()` completa todas as
janelas; além disso o CSS só esconde sob `html.motion`.

**Impressão**: `@media print` força `opacity: 1`, cor normal e esconde a sobreposição.

## R5. Duração e ritmo da digitação

**Decision**: orçamento fixo de **2,2 s** por janela (abaixo dos 2,5 s do FR-026, com folga para
timers atrasados). Divisão:

- 150 ms de espera inicial;
- 220 ms de pausa depois de cada comando, antes de a saída aparecer;
- o restante vai para a digitação: `ms por caractere = min(45, restante / total de caracteres)`,
  com piso de 8 ms.

Para que o arredondamento de cada comando não estoure o orçamento, a conta reserva um tique máximo
(45 ms) por comando. Exemplos: Sobre (2 comandos, 34 caracteres) digita a 44 ms/caractere e termina
em ~2,1 s; Contato (2 linhas, ~66 caracteres) a ~23 ms; cartão de projeto (1 comando de ~25
caracteres) a 45 ms, em ~1,5 s. A conta é uma função pura (`src/lib/typing.ts`), testada em Vitest sem DOM.

Os timers usam `setTimeout` (como o `BootScreen` e o `TypedPrompt`), não `requestAnimationFrame`:
em aba de fundo o rAF para e a janela ficaria incompleta; o `setTimeout` só atrasa.

## R6. Ordem de leitura dos passos de uma janela

**Decision**: os filhos diretos de `.terminal-body`, na ordem do DOM. Uma `TerminalLine` de comando
(marcada `data-t-cmd`) abre um passo; todo elemento seguinte, até o próximo comando, é a saída
desse passo. Elementos antes do primeiro comando aparecem desde o início.

Isso cobre as três janelas sem mudar a estrutura delas: Sobre (`cat` → texto, `whois` → selos),
Contato (`./contato.sh` → lista, linha final digitada) e cartões de projeto (comando → nome,
propósito, metadados, stack, links, rodapé).

## R7. Layout dos projetos com um por linha

**Decision**: `.projects-grid` com uma coluna (`grid-template-columns: 1fr`) em todas as larguras
(FR-001). Dentro do cartão, a partir de 900px, a saída da janela usa duas colunas: à esquerda nome,
propósito, metadados e stack; à direita os links (até 5 no SRG). Abaixo de 900px, uma coluna.

Desse jeito o cartão de largura inteira não vira uma linha de texto de 1100px (legibilidade: a
coluna de texto fica em ~65–75 caracteres) e os 5 links do SRG não esticam o cartão para baixo.

**Alternatives considered**: manter a coluna única dentro do cartão largo, com o texto limitado por
`max-width` e um vazio grande à direita; links em linha no rodapé (5 URLs longas quebram mal em
320px).

## R8. Challenges e projeto comunitário: listas, não janelas

**Decision**: duas sub-partes depois da lista principal, cada uma com título `h3` no estilo dos
títulos de seção (`### challenges/`, `### comunitario/`) e uma linha de comando decorativa, estática:
`$ ls -lt ~/projetos/challenges` e `$ cat ~/projetos/comunitario/*.md`. Os itens são `BaseCard
variant="card"` (o cartão com borda esquerda da experiência e da educação), com `h4`.

- **Challenge**: `// JAN 2026` (data de criação, `formatYearMonth`), nome, uma linha de descrição,
  chips de stack e link para o repositório.
- **Comunitário**: `// JUN 2023`, nome, instituição e local, descrição, papel e link para a notícia.

Os 7 challenges ocupam ~7 × 170px ≈ 1.200px em desktop, menos que 3 cartões de projeto (~3 × 480px),
o que atende o FR-017. A ordem vem de `byCreatedDesc` (data de criação desc, nome asc no empate),
calculada no componente, não da ordem do arquivo (FR-015, SC-004).

## R9. Formação com observação e fontes

**Decision**: `Education` ganha `note?: string` e `sources?: NonEmpty<Link>`. O `EducationCard`
mostra a observação como uma linha em `--text` e as fontes como uma lista `fonte: <domínio>` com
`ExternalLink`. Ordem: `byStartYearDesc` passa a desempatar por `endYear` desc (FR-024).

Instituição do Empregotech: "Prefeitura de Curitiba"; o programa é da Agência Curitiba de
Desenvolvimento e Inovação com a FAS e a Assespro-PR (overbr.com.br, 11 MAR 2020), aberto com
seminário na Ópera de Arame em 16 FEV 2020, com 4 meses de curso. A Prime Control consta entre as
empresas que apoiaram o programa (notícia da prefeitura, via busca; a página da prefeitura bloqueia
acesso automatizado com 403). O texto usa "patrocinadoras", termo do autor.

## R10. Fatos dos challenges (para os dados)

Fonte: API pública do GitHub e READMEs, 2026-10-08.

| Repositório | Criado | Descrição (para o site) | Stack |
|-------------|--------|-------------------------|-------|
| `cieepr-challenge` | 2026-09 | Cadastro e consulta de candidatos, com extração de nome, e-mail e telefone de currículos em PDF | Angular, Node.js, TypeScript, SQL Server, Docker |
| `mobiis-challenge` | 2026-02 | API de cadastro de usuários com autenticação | Node.js, TypeScript, MongoDB, Docker |
| `econet-challenge` | 2026-01 | Front-end para gerenciar empresas e seus usuários | Vue 3, TypeScript, Vite, Axios, JSON Server |
| `executiva-service-tech-challenge` | 2025-10 | Gerenciador de tarefas full-stack com autenticação de usuário | React, Node.js, TypeScript, MongoDB |
| `teste-pandavideo` | 2024-10 | Back-end e front-end que consomem a API da PandaVideo, com autenticação e rotas protegidas | Node.js, Vue.js, MongoDB, Docker |
| `RPA_Challenge-NY_Times` | 2024-01 | Robô que busca notícias no site do NY Times por frase, seção e período e salva em Excel | Python, Robocorp (RPA Framework) |
| `AxyaTest_API` | 2023-07 | API REST de exemplo com testes automatizados (TDD) | Python, Flask, MySQL, Robot Framework |

Nomes exibidos: o nome da empresa ou do desafio (CIEE-PR, Mobiis, Econet, Executiva Service,
PandaVideo, NY Times RPA, Axya); o texto do link é o caminho do repositório.

## R11. SRG (para os dados)

Fonte: clones locais em `~/Desktop/SRG Projects/` e notas do autor (Obsidian), 2026-10-08.

- Propósito: sistema de demonstrativo de aluguéis (imóveis, inquilinos, despesas e resultados),
  com console de administração entre organizações.
- Stack: Vue 3, TypeScript, NestJS, PostgreSQL, Prisma, Valkey, Docker, Nginx.
- Papel: autor; front-end, back-end e infraestrutura.
- O README cita a empresa cliente; o site **não** a cita (Assumptions da spec).

## R12. Orçamento de peso

Linha de base medida em 2026-10-08 (build atual, gzip -9): `index.html` 12,4 KB + CSS 9,7 KB + JS
inicial 47,7 KB = **69,8 KB**. SC-010 permite +15 KB → teto de **84,8 KB** para os mesmos três
arquivos. Estimativa: ícones 2,3 KB, composable de digitação ~1,5 KB, HTML do conteúdo novo (6
projetos, 7 challenges, 1 comunitário, 1 formação) ~5–7 KB, CSS ~1 KB → ~11 KB. O `weight.spec.ts`
existente (≤ 500 KB no total) continua valendo.

**Medido depois da implementação (T048, 2026-10-08)**, mesma conta (gzip -9; unidades de 1.000
bytes, como a linha de base): `index.html` 16,4 KB + CSS 10,4 KB + JS inicial 53,4 KB = **80,2 KB**
(80.243 bytes), +10,4 KB sobre a linha de base (69.809 bytes): **dentro** do teto de +15 KB do
SC-010. O `weight.spec.ts` mede 456 KB no carregamento total (≤ 500 KB); o chunk do `BlurText`
agora entra nessa conta porque é pré-carregado no `load` (R13).

## R13. Prazo do boot (achado da validação, T047)

**Decision**: o prazo da capa de boot passa de 4,2 s para **3,9 s** (`DEADLINE_MS` em
`src/components/terminal/BootScreen.vue` e o `setTimeout` do script inline de `index.html`). Com o
fade de 0,55 s, a página fica descoberta em ~4,45 s.

**Rationale**: o e2e "boot some sozinho em até 5 s" (FR-031 da 001) passou a falhar sob a carga da
suíte paralela (5046–5271 ms). Medido em 2026-10-08 com a CPU 4× mais lenta (CDP), **o build anterior
à 002 também passava de 5 s** (5007–5137 ms; a 002, 5124–5246 ms): o fim do boot faz um reflow da
página inteira (a barra de rolagem volta e muda a largura) e reinicia os efeitos, e os ~250 ms de
folga não bastavam num celular lento. O conteúdo novo da 002 (+30% de HTML) só aumentou um pouco
esse custo. Sem carga, os dois builds terminavam em ~4,85 s.

Junto, o `RevealText` passa a baixar e avaliar o chunk do `BlurText` (motion-v) no evento `load` da
página, com movimento, em vez de só no fim do boot: o parse caía em cima do prazo. (Baixar já na
montagem, antes do `DOMContentLoaded`, deixava o Chrome sem nenhuma requisição depois dele, e o
`networkidle` dos testes e2e nunca disparava sob carga.) Resultado com a CPU 4× mais lenta, 6
amostras: **4743–4911 ms** (antes, 5124–5246 ms); sem carga, ~4,5 s. O `BlurText` continua só no
cliente, só com movimento e renderizado só depois do boot.

**Alternatives considered**: `content-visibility: auto` nas seções abaixo da dobra (reduz o reflow,
mas mexe em âncoras, IntersectionObserver e medição de CLS); encurtar só o fade (o fade de 0,5 s é
parte do desenho do boot). A última linha do boot (`./iniciar_portfolio.sh`) pode ser cortada
~300 ms antes; o boot é decorativo e pulável.
