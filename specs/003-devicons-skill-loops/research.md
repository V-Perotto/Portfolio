# Research: Limpeza visual, links destacados, ícones devicon e skills em loops

**Feature**: `003-devicons-skill-loops` | **Date**: 2026-10-08 | **Spec**: [spec.md](spec.md)

Cada decisão segue o formato Decisão / Racional / Alternativas. As medições foram feitas em
2026-10-08 com o build atual (estado da 002) e os SVGs baixados das fontes.

## R1 — Fonte de cada ícone de tecnologia

**Decisão**: a ordem decidida pelo autor (Clarifications): devicon v2.17.0 → vectorlogo.zone →
Lucide pelo assunto. Inventário resultante (detalhado no [data-model](data-model.md)):

- **devicon (28)**: python, flask, java, quarkus, typescript, vuejs, react, angular, nodejs, csharp,
  dot-net, mongodb, postgresql, microsoftsqlserver, mysql, git, docker, jenkins, rabbitmq, redis,
  elasticsearch, kibana, nestjs, prisma, vitejs, axios, json, vscode.
- **vectorlogo.zone (2)**: sap (`sap-icon.svg`), para "SAP SD"; nginx (`nginx-icon.svg`), ver a
  conferência abaixo.
- **Lucide (20 ícones, 21 tecnologias)**: Valkey → `database`, OCR → `scan-text`, LLMs →
  `brain-circuit`, Agentes de IA → `bot`, Robocorp (RPA Framework) → `bot`, Robot Framework →
  `list-checks`, Arquitetura → `blocks`, APIs REST → `webhook`, Programação Web → `app-window`,
  Análise Funcional → `clipboard-list`, Processos → `workflow`, Open VSX Registry → `package`, JSON
  Server → `server`, Design Patterns → `shapes`, Singleton → `circle-dot`, Factory → `factory`, MVC →
  `panels-top-left`, DDD → `boxes`, TDD → `flask-conical`, Clean Code → `brush-cleaning`,
  Agile/Scrum → `iteration-cw`.

Variante do devicon: `plain` quando existe, senão `line`, senão `original` (flask, react, mysql,
rabbitmq e prisma só têm `original`). Depois da otimização todas essas variantes têm uma cor só, então
a troca por `currentColor` não perde forma.

**Conferência visual (T003, grade em 16 e 32 px)**: duas trocas, pelo edge case "logotipo que vira
borrão → outra variante do mesmo logotipo". (1) **NestJS**: `original` (preenchido) no lugar do
`line`, cujo traço fino some em 12–16 px. (2) **Nginx**: o devicon só tem `original`, que é o
logotipo escrito "NGINX", ilegível no tamanho do chip; o ícone vem do vectorlogo.zone (hexágono com
"N"), com o "N" branco recortado como o texto do SAP. Os demais 48 ficaram reconhecíveis.

**Racional**: segue o pedido. Os nomes Lucide foram conferidos no `@lucide/vue` 1.53 instalado. O
vectorlogo.zone só acrescenta o SAP: Valkey, Robot Framework, Robocorp e JSON Server não estão em
nenhuma das duas coleções (conferido no índice de 1.757 logotipos do vectorlogo.zone e no
`devicon.json`).

**Alternativas**: `devicon-original` colorido (contraria "mesma cor do texto"); ícone único para
todas as genéricas (o autor escolheu um por assunto).

**Licenças**: devicon é MIT. O vectorlogo.zone declara que "os logotipos continuam propriedade dos
donos" e que "modificações nos logotipos estão em domínio público"; o uso aqui é nominativo
(identificar uma skill). Lucide é ISC. As três ficam registradas num `NOTICE.md` ao lado do sprite
(FR-013).

## R2 — Como embutir os ícones: sprite SVG externo, gerado e versionado

**Decisão**: um sprite `src/assets/tech-icons/sprite.svg` com um `<symbol>` por ícone (devicon,
vectorlogo e Lucide), gerado por `tools/build-tech-icons.mjs` e versionado como as fontes
(Princípio III: assets gerados por `tools/` ficam no git). O Vite publica o sprite como asset com
hash (`import spriteUrl from '@/assets/tech-icons/sprite.svg?url&no-inline'`), e cada ícone é
`<svg class="tech-icon" aria-hidden="true" focusable="false"><use href="{spriteUrl}#{id}"/></svg>`.

**Racional** (medido):

| Opção | Custo |
|-------|-------|
| SVGs do devicon como vêm | 84 KB brutos, 36 KB gzip, só os 29 ícones |
| `svgo --multipass -p 1` | 40 KB / 16,4 KB gzip |
| `svgo --multipass -p 0` (coordenadas inteiras na grade 128) | 18,9 KB / 7,7 KB gzip |

Com `-p 0`, o erro de arredondamento é de no máximo 0,5 unidade numa grade de 128, ou 0,06 px num
ícone de 16 px: invisível. Os ícones Lucide e do vectorlogo.zone usam `-p 1`: as grades deles são de
24 a 64 unidades, onde 0,5 unidade chegaria a 0,25 px num ícone de 12 px, e eles são poucos e
pequenos. **Resultado**: sprite com 50 símbolos, 24,6 KB bruto, 8,8 KB gzip. Os vilões são nestjs (17 KB), postgresql, microsoftsqlserver, jenkins e
flask (9–11 KB cada) antes da otimização.

- **Externo, não inline**: o sprite (~8–10 KB gzip com os Lucide) não entra no HTML, que é
  bloqueante; é um arquivo do próprio site, cacheável, pedido uma vez quando os chips aparecem.
  `<use>` com URL do mesmo domínio funciona sem JavaScript, na impressão e em todos os navegadores
  evergreen.
- **`currentColor`**: o `fill`/`stroke` do símbolo herda o `color` do `<svg>` que o usa, então o
  ícone acompanha o texto do chip, inclusive no hover (FR-014) e no alto contraste, onde o `color`
  é forçado (FR-034).
- **Lucide no sprite também**: o script renderiza os componentes do `@lucide/vue` instalado com o
  `renderToString` do Vue e guarda o miolo como símbolo (`viewBox 0 0 24 24`, `fill="none"`,
  `stroke="currentColor"`, `stroke-width 2`). Assim todo ícone de tecnologia é igual no HTML (um
  `<use>`), e o JS do cliente não carrega nenhum componente de ícone para isso. Os ícones Lucide dos
  títulos dos grupos (feature 002) continuam como componentes.
- **SAP e nginx (vectorlogo.zone)**: forma colorida (trapézio em degradê; hexágono) com um desenho
  branco por cima ("SAP"; "N"). Pintados com uma cor só, virariam blocos. O script junta forma e
  desenho num só `<path fill-rule="evenodd">`: o desenho vira recorte (vazado). Sem `<mask>` nem
  degradê, que nem todo navegador desenha num `<use>` de arquivo externo.
- **`?url&no-inline`**: o sprite passa do limite de inline do Vite (4 KB), mas o `no-inline` garante
  que nunca vire `data:`, que o `<use>` não aceita.

**Alternativas**:
- Sprite inline no HTML: sem requisição extra, mas +8–10 KB gzip no documento bloqueante; rejeitado.
- SVG inline em cada chip: ~94 ocorrências repetindo os caminhos; rejeitado pelo peso.
- `mask-image` com `data:` no CSS: mesmo peso no CSS bloqueante, e o alto contraste pinta o
  `background-color` com a cor do sistema de fundo (ícone some); rejeitado.
- Pacote npm `devicon` como dependência: traz centenas de ícones e fontes para usar 29; o script
  baixa só os escolhidos, da tag v2.17.0, pelo jsDelivr.
- `svgo` como devDependency: o script o roda com `npx --yes svgo@4.1.0` (versão fixa), como o
  `build-fonts.sh` cria um venv descartável para o `pyftsubset`. O build do site não precisa dele.

## R3 — Registro tecnologia → ícone com checagem em tempo de compilação

**Decisão**: `TechName` vira uma união de strings em `src/types/resume.ts` (os 54 nomes exibidos
hoje, com a grafia exata dos dados), e `src/lib/tech-icons.ts` exporta
`TECH_ICONS: Record<TechName, TechIconId>` (id do símbolo no sprite). `Experience.tech`,
`Project.stack`, `Challenge.stack` e `SkillItem.name` passam a ser `TechName`. Um teste Vitest
confere que todo id do registro existe como `<symbol>` no sprite e que todo símbolo do sprite é usado.

**Racional**: segue o padrão da 002 (`SkillIconName` + `Record` em `icons.ts`). Tecnologia nova nos
dados sem entrada no registro quebra o `vue-tsc` (e o build), apontando a linha (FR-017); id que não
existe no sprite quebra o Vitest, que roda no workflow antes do deploy. Variações de nome ("Vue 3" e
"Vue.js", "Python (Flask)" e "Python") são entradas explícitas apontando para o mesmo id.

**Alternativas**: normalizar o nome em tempo de execução (regex para "Linguagem (Framework)") e cair
num ícone padrão: esconde erro de digitação nos dados; rejeitado. Só teste, sem união: o erro
apareceria só no Vitest, mais tarde.

## R4 — Loop das skills: componente próprio no visual do Text Loop, com animação CSS

**Decisão**: `src/components/base/SkillLoop.vue`, escrito para esta feature a partir do visual do
Text Loop do Vue Bits na forma `line`: uma fita (faixa colorida que atravessa a largura), os itens
(ícone + nome) correndo da direita para a esquerda, o separador `✦` entre eles e pausa com o ponteiro
em cima. O componente não é cópia do Text Loop e fica fora de `vendor/`, com a origem citada no
comentário.

Funcionamento:

- **HTML pré-renderizado**: uma lista `<ul role="list">` com todas as skills do grupo, uma vez.
  Cada `<li>` tem o ícone (`aria-hidden`), o nome e o separador `✦` (`aria-hidden`).
- **Sem movimento** (`html:not(.motion)`: sem JS, "reduzir movimento", e também na impressão): a
  lista quebra em linhas dentro da fita (`flex-wrap`), com todas as skills visíveis (FR-025).
- **Com movimento** (`html.motion`, decidido pelo script inline do `<head>` antes do primeiro paint):
  a fita tem uma linha só, altura fixa e `overflow: hidden` desde o primeiro paint (FR-029). Depois
  de montar, o componente mede a largura da sequência (após `document.fonts.ready`), acrescenta as
  cópias necessárias para cobrir a largura (`aria-hidden`, fora da árvore de acessibilidade, FR-026)
  e define `--loop-shift` (largura da sequência) e `--loop-duration` (largura ÷ velocidade). A trilha
  anima `transform: translateX(0 → -var(--loop-shift))` em `linear infinite`.
- **Pausa**: `:hover` → `animation-play-state: paused` (FR-023); fora da tela, um
  `IntersectionObserver` tira o atributo `data-loop-visible` e a trilha pausa (FR-024).
- **"Reduzir movimento" no meio da visita**: `useMotion` troca a classe `motion` no `<html>`; o CSS
  volta para a lista parada e esconde as cópias na hora.
- **Velocidade**: 40 px/s. Na tela de 320 px a área do loop tem ~288 px, então um item leva ~7,2 s
  para atravessá-la (FR-028 pede ≥ 6 s); em telas maiores leva mais.
- **Redimensionamento**: `ResizeObserver` recalcula as cópias e a duração.
- **JS principal falhou** (FR-018 da 001: o script inline rodou e ligou `html.motion`, mas o app não):
  a fita ficaria numa linha só, cortando skills para sempre. O `main.ts` marca `html.app-loaded` assim
  que roda, e o script inline, no fim do boot (3,9 s), tira o `motion` se essa marca não existir. Sem
  app não há movimento, então a página toda volta ao estado final parado (encontrado na
  implementação, T012/T014).

**Racional**:
- O Text Loop (`TextAnimations/TextLoop`, Vue Bits, commit de 2026-09-11) desenha texto num
  `<textPath>` de SVG: não aceita imagens, e o autor pediu imagem + nome. Também depende do GSAP
  (~25 KB gzip), que o projeto não tem. Na forma "linha", um `<textPath>` reto equivale a uma trilha
  HTML que translada, que aceita os ícones.
- Animação por CSS, não por `requestAnimationFrame`: o navegador anima no compositor, sem JS a cada
  quadro, e pausar é só trocar `animation-play-state`.
- O `LogoLoop` vendorizado (base da faixa removida, FR-019) sai do projeto: ele anima por
  `requestAnimationFrame` e o seu uso era exatamente a faixa que o autor pediu para remover.

**Alternativas**: vendorizar o Text Loop e trocar o `<textPath>` por `<foreignObject>` com HTML
(SVG escala o texto junto com a largura e deixaria os nomes ilegíveis em 320 px, contra o FR-027);
reaproveitar o `LogoLoop` com uma fita (`requestAnimationFrame` contínuo nos 5 grupos e a mesma
mecânica da faixa que o autor pediu para tirar); CSS puro sem JS (o número de cópias depende da
largura da tela e do grupo; com 2 skills, `conceitos_web` precisaria de muitas cópias fixas no HTML).

## R5 — Fita e item do loop: cores e tamanhos

**Decisão**: tokens novos em `tokens.css`:

- `--ribbon-bg`: `color-mix(in srgb, var(--purple) 55%, var(--bg))`, a fita.
- `--ribbon-edge`: `var(--purple-light)`, fio de 1px em cima e embaixo da fita.
- `--icon-tech`: `1em`, ícone junto ao texto (chips e loops).

Item do loop: nome em mono 0.85rem (o chip usa 0.75rem; FR-027 pede ≥ o tamanho do chip), em
`--green-bright`, a mesma cor de texto dos chips de skills de hoje; separador `✦` em
`--purple-glow`. Altura da fita com movimento: `2.6rem`.

**Racional**: a fita do Text Loop é uma faixa de cor sólida sob o texto; aqui ela usa o roxo do tema.
Contraste estimado de `--green-bright` (#4ade9b) sobre `--ribbon-bg` ≈ 8:1, folgado acima de 4,5:1;
a auditoria axe confere no e2e. No impresso, os tokens já mudam para o tema claro.

**Alternativas**: texto branco em caixa alta como o exemplo do Text Loop (caixa alta deforma nomes
como "TypeScript" e "C#"; a spec mantém a grafia); fita verde (compete com os chips).

## R6 — Links de conteúdo: um estilo só, no `ExternalLink`

**Decisão**: todos os links de conteúdo já passam por `ExternalLink.vue` (contato, challenges,
comunitário, fontes da formação e links dos projetos); menu, botões do hero e "▼ scroll" usam `<a>`
direto (FR-010). O estilo sai dos quatro componentes que o repetem (`.c-val`, `.repo-link`,
`.source-link`, `.src-link`) e vai para `ExternalLink` (classe `ext-link`):

- repouso: cor `--green-bright`, `border-bottom: 1px dashed currentColor` (o sublinhado do hover do
  contato de hoje, agora parado — FR-007);
- hover e `:focus-visible`: `text-shadow` do brilho (`--glow-link`: `0 0 12px` de `--green-bright` a
  70%), o mesmo do contato; o sublinhado não muda (FR-008). O anel de foco global continua.

Nos links de projeto (`EvidenceLink`), o `<a>` é um flex com cadeado, caminho e etiqueta, ou com o
badge. Ali o sublinhado sai do `<a>` e vai para o `.evidence-url` e o `.badge-box` (FR-009), e o
`translateY(-2px)` do hover sai (o brilho é a única diferença). No badge, o brilho é o `drop-shadow`
que já existe (roxo no Grape Glass, vermelho no Shadow Lord), porque `text-shadow` não age sobre
imagem. O sublinhado do badge fica na própria `img` (na largura do badge, não
da caixa de 190px); a caixa reservada passa de 28 para 29px fixos, para caber o fio sem mudar de
tamanho quando a imagem carrega (FR-011 da 001). Se o badge falha, o domínio que aparece no lugar é um
`.evidence-url` e leva o sublinhado sozinho, sem linha dupla.

**Racional**: um lugar só para o estilo (Princípio V). `border-bottom` em elemento inline se repete
em cada linha quando o link quebra (edge case "link que quebra em duas linhas"). Toque não tem hover,
e agora o sublinhado parado identifica o link (WCAG 1.4.1: link distinto do texto por forma).

**Alternativas**: `text-decoration: underline dashed` (o tracejado e a distância variam por navegador
e não seriam "iguais ao do contato"); manter os estilos duplicados nos componentes.

## R7 — Cor dos comandos e rótulos

**Decisão**:
- `TerminalLine.vue`: a linha de comando (`.t-line`) passa de `--text` para `--text-dim` (FR-004). O
  `$` (`.prompt-dollar`) e trechos com classe própria (`.hl-green` na última linha do Contato) mantêm
  a cor. A cópia que digita (`.t-typed`) é filha da linha e herda a cor, então a digitação já sai na
  cor final (FR-005).
- `EvidenceLink.vue`: o rótulo sem `accent` passa de `.hl-green` para `--purple-glow`, a cor do `>`
  (FR-006); os rótulos com `accent` (neon dos temas) não mudam.

**Racional**: `--text-dim` sobre `--surface` dá 4,76:1 (token documentado), acima de 4,5:1. A nota de
privados também é itálica; o pedido é a cor, então o comando não fica itálico.

## R8 — Títulos das janelas e comandos sem `./run`

**Decisão**: `ProjectCard` passa `project.name` como título; `AboutSection` e `ContactSection`
passam `sobre.txt` e `contato.sh`. Os 5 comandos perdem `./run ` nos dados.

## R9 — Sub-partes das skills: o cabeçalho de sub-parte vira componente de layout

**Decisão**: `ProjectSubpart.vue` vira `src/components/layout/SectionSubpart.vue` (mesmo markup e
estilo: `### titulo/`), com `lead` opcional e um slot `icon` antes do título. Projetos passam a usá-lo
com o nome novo; Skills o usam com o ícone Lucide do grupo no slot (FR-030) e sem `lead` (a seção já
tem `$ ls -la /usr/lib/vittorio/`). `SkillGroupCard.vue` e `TechMarquee.vue` saem.

**Racional**: Princípio V ("reutilizar componentes antes de criar novos"); o nome antigo amarrava o
componente a projetos.

## R10 — Imagens de fundo

**Decisão**: apagar `src/assets/img/` (3 webp, 181 KB) e `tools/reencode-images.py` (só servia a
elas); tirar a prop `decor`, o markup e o CSS de `SectionShell`; tirar `.section-decor` das regras de
alto contraste e de impressão em `base.css`; atualizar o README e o `DESIGN.md`.

## R11 — Peso (SC-009)

**Linha de base** (T001, `npm run build` em 2026-10-08, `gzip -9`): `index.html` 16 475 B + CSS
10 446 B + JS `app` 53 383 B = **80 304 B** no carregamento inicial (o `BlurText` é carregado depois,
no `load`). **Teto**: 95 304 B.

**Medido depois da implementação** (T040, 2026-10-08): `index.html` 16 764 B + CSS 9 653 B + JS
`app` 51 653 B = **78 070 B**, ou seja, **−2 234 B** em relação à linha de base (bem abaixo do teto).
Sprite à parte: 24 573 B bruto, 8 823 B gzip. Carregamento inicial (`weight.spec.ts`): 285,2 KB, abaixo
dos 500 KB.

Estimativa feita no plano: −~3 KB (LogoLoop, TechMarquee, SkillGroupCard, CSS das imagens e dos links duplicados);
+~1,5 KB (SkillLoop, TechIcon, registro); +~3 KB no HTML (`<use>` em ~94 chips e itens, que o gzip
comprime bem por repetirem a URL). Saldo esperado: +1 a +3 KB. O sprite (~8–10 KB gzip) é arquivo à
parte, fora desse total, e conta no teste de 500 KB do carregamento inicial (`weight.spec.ts`), que
continua com folga (as imagens de fundo, ~181 KB, saem).

## R12 — Testes afetados

- `tests/e2e/reduced-motion.spec.ts`: `.marquee-static` → lista parada dos loops.
- `tests/e2e/a11y.spec.ts`: o teste de alto contraste cita `.section-decor`; o de ícones das skills
  continua (`#skills h3 svg.lucide`).
- `tests/component/ProjectCard.spec.ts`: título da janela e comando.
- Novos: registro × sprite (unit), `TagChip`/`TechIcon` e `SkillLoop` (component), e2e de links,
  loops, ícones e ausência de `./run`, `bash —` e imagens de fundo.
