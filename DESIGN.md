---
name: Portfólio Vittorio Perotto
description: Cybercore Terminal. Um currículo que roda como sessão de shell, escuro, com neon Grape e fósforo Phosphor.
colors:
  bg: "#0a0612"
  bg-alt: "#0d0a16"
  surface: "#16101f"
  surface-2: "#1c1428"
  border: "#2c1d40"
  purple: "#462066"
  purple-light: "#7b3fb3"
  purple-glow: "#a06ae0"
  green: "#205e44"
  green-light: "#2fa876"
  green-bright: "#4ade9b"
  text: "#d8d2e4"
  text-dim: "#8a819e"
  on-accent: "#ffffff"
  sith: "#ff6b6b"
  grape-badge: "#852ffc"
  sith-badge: "#d90404"
typography:
  display:
    fontFamily: "Iosevka, ui-monospace, monospace"
    fontSize: "clamp(2.2rem, 7vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.6
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Iosevka, ui-monospace, monospace"
    fontSize: "clamp(1.5rem, 4vw, 2.1rem)"
    fontWeight: 700
  title:
    fontFamily: "Iosevka Aile, ui-sans-serif, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
  body:
    fontFamily: "Iosevka Aile, ui-sans-serif, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  terminal:
    fontFamily: "Iosevka, ui-monospace, monospace"
    fontSize: "0.9rem"
    fontWeight: 400
  label:
    fontFamily: "Iosevka, ui-monospace, monospace"
    fontSize: "0.78rem"
    fontWeight: 400
rounded:
  tag: "3px"
  nav: "4px"
  btn: "6px"
  card: "8px"
  window: "10px"
  pill: "999px"
spacing:
  gutter: "1.5rem"
  grid-gap: "1.2rem"
  card-pad: "1.4rem 1.6rem"
  terminal-pad: "1.3rem 1.4rem"
  section: "5rem 1.5rem 2rem"
  hero: "6rem 1.5rem 4rem"
  nav-height: "4.5rem"
components:
  button-primary:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.on-accent}"
    typography: "{typography.terminal}"
    rounded: "{rounded.btn}"
    padding: "0.7rem 1.4rem"
  button-primary-hover:
    backgroundColor: "{colors.purple-light}"
    textColor: "{colors.on-accent}"
  button-ghost:
    backgroundColor: "rgba(32, 94, 68, 0.12)"
    textColor: "{colors.green-bright}"
    typography: "{typography.terminal}"
    rounded: "{rounded.btn}"
    padding: "0.7rem 1.4rem"
  button-ghost-hover:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-accent}"
  chip:
    backgroundColor: "rgba(32, 94, 68, 0.16)"
    textColor: "{colors.green-bright}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.22rem 0.6rem"
  chip-hover:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-accent}"
  tag-now:
    backgroundColor: "{colors.green}"
    textColor: "#eafff4"
    rounded: "{rounded.tag}"
    padding: "0.1rem 0.5rem"
  private-tag:
    textColor: "{colors.text-dim}"
    rounded: "{rounded.nav}"
    padding: "0 0.4rem"
  attribute-badge:
    backgroundColor: "rgba(32, 94, 68, 0.15)"
    textColor: "{colors.green-bright}"
    rounded: "{rounded.nav}"
    padding: "0.3rem 0.7rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  skill-loop:
    backgroundColor: "#2b1440"
    textColor: "{colors.green-bright}"
    typography: "{typography.terminal}"
    padding: "0.6rem 0"
  content-link:
    textColor: "{colors.green-bright}"
  terminal-window:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.terminal}"
    rounded: "{rounded.window}"
    padding: "{spacing.terminal-pad}"
  terminal-bar:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-dim}"
    padding: "0.45rem 0.6rem"
  nav-link:
    textColor: "{colors.text-dim}"
    rounded: "{rounded.nav}"
    padding: "0.25rem 0.7rem"
  nav-link-active:
    backgroundColor: "rgba(32, 94, 68, 0.12)"
    textColor: "{colors.green-bright}"
  nav-cta:
    textColor: "{colors.purple-glow}"
    rounded: "{rounded.nav}"
    padding: "0.25rem 0.7rem"
  nav-cta-hover:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.on-accent}"
  dock:
    backgroundColor: "rgba(22, 16, 31, 0.85)"
    rounded: "{rounded.card}"
    padding: "0.4rem"
  dock-button:
    backgroundColor: "rgba(32, 94, 68, 0.12)"
    textColor: "{colors.green-bright}"
    rounded: "{rounded.btn}"
    size: "2.75rem"
  desktop-icon:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.green-bright}"
    rounded: "{rounded.card}"
    size: "5.5rem"
  gate-vignette:
    background: "radial-gradient(closest-side, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.9) 72%, transparent 100%)"
  gate-window:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.window}"
    width: "680px"
  letter-glitch:
    colors: ["{colors.green}", "{colors.green-bright}", "{colors.purple-glow}"]
    alpha: "0.55"
    glitchSpeed: "10"
    centerVignette: "radial-gradient(circle, rgba(0, 0, 0, 0.8) 0%, transparent 60%)"
    outerVignette: "radial-gradient(circle, transparent 60%, #000 100%)"
  hero-halo:
    textShadow: "2px solid #000 outline (offsets -2..2px, no blur), 0 0 4px #000, 0 0 8px rgba(0, 0, 0, 0.8)"
    targets: ["hero tagline", "Lattice Loader label"]
  editor-window:
    backgroundColor: "{colors.bg-alt}"
    treeWidth: "300px"
    syntaxKey: "{colors.purple-glow}"
    syntaxString: "{colors.text}"
    syntaxDate: "{colors.green-bright}"
    syntaxPunctuation: "{colors.text-dim}"
    maximizeScrim: "rgba(10, 6, 18, 0.55)"
    maximizeBlur: "6px"
  lattice-loader:
    working: "{colors.purple-glow}"
    done: "{colors.green-bright}"
    grid: "3x3"
    gap: "1px"
    idleOpacity: "0.15"
  dock-tip:
    backgroundColor: "{colors.surface}"
    keyColor: "{colors.green-bright}"
    rounded: "{rounded.btn}"
---

# Design System: Portfólio Vittorio Perotto

## Overview

**Creative North Star: "Cybercore Terminal"**

O site é um terminal que acordou de madrugada: fundo de ameixa quase preta, texto de fósforo
verde e neon roxo que nunca apaga de todo. Cada seção é um comando digitado, e o conteúdo é a
saída desse comando. `## experiencia/` vem acompanhado de `$ git log --carreira`, as skills são
listadas por `ls -la /usr/lib/vittorio/` e cada projeto roda numa janela de terminal com o nome dele
na barra de título. O visitante não
navega por um site sobre um terminal; ele está dentro da sessão de `viper@portfolio`.

O tom é o de um hacker lúdico. A personalidade é o ponto: uma porta de acesso (`acessar_portfolio.sh`)
sobre um terminal com defeito que abre uma sessão SSH, um campo de pontos que cintila atrás do nome,
glitch no nome, prompt que digita e apaga, letreiros neon que
piscam, scanlines por cima de tudo, uma dock com um terminal de verdade e janelas que minimizam
como arquivos de área de trabalho. O brilho
é atmosfera, não recompensa. O título já nasce com halo, a timeline já é um tubo de luz e o botão
principal já está aceso. A interação deixa tudo mais aceso, não acende algo que estava apagado.

Essa exuberância convive com dois limites fixos. O primeiro é a legibilidade: o texto do currículo
fica sempre estável e em contraste AA, e só as camadas decorativas piscam. O segundo é o movimento
reduzido: com `prefers-reduced-motion`, todo o teatro desliga sem esconder conteúdo. Cada
componente imita uma peça real de shell (janela com barra de título, prompt com `$`, flags, `exit 0`,
`dt = dd`), e esse realismo vem antes do efeito.

**Key Characteristics:**
- Escuro e de matiz único: todas as superfícies são a mesma ameixa violeta (hue ~300) em degraus
  de luminosidade.
- Dois neons que se complementam: Grape (roxo) para estrutura e ação, Phosphor (verde) para dado
  vivo e estado "atual".
- Iosevka em todo o site: a versão mono para a voz do terminal e a Aile (proporcional) para a prosa
  longa.
- O glow é parte do repouso e cresce na interação.
- A sintaxe de shell é ornamento tipográfico: `##`, `/`, `$`, `//`, `>`, `=`, `#`.

## Colors

Uma noite violeta monocromática, cortada por dois neons complementares: Grape e Phosphor.

### Primary
- **Grape Deep** (`purple`): preenchimento do botão principal e do CTA do menu no hover, botão
  "fechar" das janelas, trilho da barra de rolagem e, misturado a 55% com Void Plum, a fita dos loops
  de skills (`--ribbon-bg`, #2b1440). É a massa de cor roxa.
- **Grape** (`purple-light`): bordas de ação, borda esquerda dos cartões de experiência e formação,
  topo do gradiente da timeline, borda das janelas e dos cartões no hover e fundo da seleção de
  texto.
- **Grape Glow** (`purple-glow`): texto roxo que precisa ser lido, como o `##` dos títulos,
  empresas, chaves `dt` e `c-key`, nomes de projeto, categorias de skill, o host `portfolio`, o
  `$` do prompt, o `>` e o rótulo acima de cada link de projeto e o separador `✦` dos loops. Também é o anel de foco (2px, offset 2px). Contraste de 4,8:1 a 5,4:1.

### Secondary
- **Phosphor Deep** (`green`): fundo do selo `HEAD` / `EM CURSO`, preenchimento de chip e do botão
  ghost no hover, borda do item ativo do menu e dos badges de atributo.
- **Phosphor** (`green-light`): caminho `~` do prompt e o pé do gradiente da timeline.
- **Phosphor Bright** (`green-bright`): o dado vivo. Texto e ícone de chips, itens dos loops de
  skills, usuário `viper`, cursor `▊`, `/` final dos títulos, todos os links de conteúdo (sempre
  sublinhados), item ativo do menu, marcadores da timeline e glitch inferior do nome. Contraste de
  10,3:1 ou mais (9,5:1 sobre a fita dos loops).

### Tertiary
- **Sith Red** (`sith`): restrito ao tema Shadow Lord no card de projetos (letreiro neon e brilho do
  badge). Não é cor do sistema, é a identidade de um artefato do autor.
- **Grape Badge** (`--grape`, #852ffc) e **Sith Badge** (`--sith-badge`, #d90404): as cores dos
  próprios badges de downloads dos dois temas, usadas só no sublinhado tracejado sob cada badge
  (3,4:1 e 3,5:1 sobre Console Plum, elemento gráfico). Mesma regra do Sith Red: identidade de
  artefato, não acento de interface.

### Neutral
- **Void Plum** (`bg`): fundo do documento, da porta de acesso e do miolo dos marcadores da timeline.
- **Night Plum** (`bg-alt`): rodapé e trilho da barra de rolagem; um degrau quase imperceptível
  acima do fundo.
- **Console Plum** (`surface`): corpo de cartões e janelas de terminal.
- **Title Bar Plum** (`surface-2`): barra de título das janelas.
- **Grape Wire** (`border`): todo fio de 1px em repouso (cartões, janelas, menu, rodapé, divisórias
  do menu mobile).
- **Lavender Ash** (`text`): texto principal, nome do hero e cargos. Contraste de 12:1 ou mais.
- **Dim Lilac** (`text-dim`): texto secundário, como datas, leads `$ comando`, linhas `$ comando`
  das janelas, comentários `#`, saída de terminal, descrições e rodapé. Contraste de 4,8:1 a 5,5:1, o piso do sistema.
- **On Accent** (`on-accent`): texto sobre preenchimento Grape Deep ou Phosphor Deep em hover.

### Named Rules
**The Two Neons Rule.** Roxo é estrutura e ação: títulos, chaves, bordas, CTA. Verde é dado vivo e
presente: valores, tecnologias, cursor, item ativo, `HEAD`. Uma terceira cor só entra como
identidade de um artefato real (Sith Red), nunca como acento de interface.

**The Token-Alpha Rule.** Todo glow, véu e fundo translúcido é o RGB de um token com alfa:
`rgba(123, 63, 179, …)` é Grape, `rgba(47, 168, 118, …)` é Phosphor, `rgba(74, 222, 155, …)` é
Phosphor Bright, `rgba(32, 94, 68, …)` é Phosphor Deep, `rgba(160, 106, 224, …)` é Grape Glow e
`rgba(10, 6, 18, …)` é Void Plum. Um matiz que não seja de um token é defeito.

**The Steady Text Rule.** O texto legível nunca pisca, treme nem perde contraste. Flicker, glitch e
pulse ficam numa camada à parte (`::before`, `::after`, `box-shadow`) por cima do texto estável.

## Typography

**Display Font:** Iosevka (with ui-monospace, monospace)
**Body Font:** Iosevka Aile (with ui-sans-serif, sans-serif)
**Label/Mono Font:** Iosevka

**Character:** uma família só, em duas larguras. A Iosevka mono é a voz do terminal: comandos,
títulos, rótulos e tudo que o "sistema" diz. A Iosevka Aile é a mesma família com espaçamento
proporcional e assume a prosa que o visitante precisa ler de fato. O site soa técnico do começo ao
fim sem transformar parágrafos em código.

### Hierarchy
- **Display** (800, clamp(2.2rem, 7vw, 4.5rem), line-height 1.6, -0.02em): só o nome no hero, com
  halo Grape Glow permanente e glitch roxo e verde em fatias.
- **Headline** (700, clamp(1.5rem, 4vw, 2.1rem)): títulos de seção em mono, sempre no formato
  `## nome/`, com `##` em Grape Glow e `/` em Phosphor Bright. Os nomes vêm em minúsculas e sem
  acento, como nomes de diretório.
- **Title** (Aile 700, 1.15rem): cargo ou curso no topo de cada cartão.
- **Body** (Aile 400, 1rem, line-height 1.6): resumo do sobre e tagline do hero, que fica limitada
  a 560px. Descrições de cartão usam 0.95rem em Dim Lilac.
- **Terminal** (mono 400, 0.9rem; 0.82rem abaixo de 760px): corpo das janelas de terminal, linhas
  `$` e saídas.
- **Label** (mono 400, 0.75 a 0.85rem): datas `// MAR 2026 — JUL 2026` (0.78rem), chips (0.75rem),
  links do menu (0.85rem), leads de seção (0.85rem) e empresas (0.82rem).

### Named Rules
**The Who's Talking Rule.** Se quem fala é o sistema (comando, rótulo, data, chave, título de
seção), a fonte é mono. Se é o autor contando algo em frases (resumo, descrição de experiência ou
de projeto), a fonte é a Aile.

**The Shell Syntax Rule.** A pontuação de shell é ornamento oficial e sempre ganha cor de token:
`##` e `$` em Grape Glow, `/` final e `▊` em Phosphor Bright, `//` antes de datas, `=` em Dim Lilac
entre chave e valor. Ela é decoração e não pode substituir um rótulo acessível.

## Layout

Coluna única centralizada, com `max-width` de 1100px (`container-page`) e gutter lateral de 1.5rem.
O hero ocupa a viewport inteira (`min-height: 100vh`), com o conteúdo centralizado em 820px
(`container-hero`). Entre o fim do hero e o título do Sobre há meia tela vazia (`--hero-gap`,
50svh), onde o menu surge. As seções empilham com padding de 5rem no topo, 1.5rem nas laterais e 2rem
embaixo. O menu é fixo, com 4.5rem de altura, e o `scroll-padding-top` igual a essa altura faz as
âncoras pararem logo abaixo dele. Com JS, a dock fica fixa no centro de baixo, e o rodapé reserva o
espaço dela (`--dock-space`).

- **Experiência:** lista vertical com timeline à esquerda (recuo de 2rem, ou 1.6rem no mobile) e
  2rem entre os itens.
- **Skills:** uma sub-parte por grupo (`### linguagens_frameworks/` com o ícone Lucide do grupo),
  2.25rem entre elas, cada uma com o seu Skill Loop, cuja fita sai da coluna e vai de borda a borda
  da página. Não há faixa contínua nem grade de cartões.
- **Projetos:** um projeto por linha em todas as larguras, gap de 1.4rem. A partir de 900px a saída
  da janela tem duas colunas: à esquerda nome, propósito, `chave = valor` e stack (largura de
  leitura confortável); à direita, separados por um fio Grape Wire, os links. O rodapé `exit 0`
  ocupa a largura inteira. Depois da lista vêm as sub-partes (`### challenges/`, `### comunitario/`),
  pilhas de cartões de log; em desktop, cada challenge vira uma linha compacta com a data numa
  coluna de 6.5rem à esquerda.
- **Formação:** a janela de editor `~/formacao`; a pilha de cartões, com 1.2rem entre eles, é a visão
  maximizada, sem JS e impressa.
- **Sobre e Contato:** uma janela de terminal só. A do contato fica centralizada em 720px.

O único breakpoint é **760px**: o menu vira hambúrguer (só com JS), as janelas reduzem o padding e
a fonte e a timeline aperta. Sem
JavaScript, o menu volta ao fluxo normal com os links quebrando em linhas. Não há rolagem
horizontal a partir de 360px.

**The Directory Listing Rule.** Toda seção abre com o título `## secao/` e, quando faz sentido, um
lead `$ comando` em Dim Lilac a 2rem do conteúdo. Uma seção nova segue esse cabeçalho.

## Elevation & Depth

A profundidade é feita de luz, não de papel. As superfícies sobem por degraus tonais da mesma ameixa
(Void → Console → Title Bar) e se separam por fios Grape Wire de 1px. A luz é ambiente e
permanente: o hero tem duas nebulosas radiais (Grape Deep em 30%/20% e Phosphor Deep em 75%/80%) e,
com movimento, ganha por cima o Letter Glitch: uma grade de letras e símbolos em Phosphor Deep,
Phosphor Bright e Grape Glow que trocam sem parar, sob as duas vinhetas pretas do componente (a
central, pequena, no miolo, e a das bordas), com um halo preto justo nos textos que precisam dele; scanlines de 4px cobrem a página inteira. Não há mais a grade de quadrados. Atrás das seções não há imagem: o fundo é só Void Plum. Os glows de
repouso (halo do nome, tubo da timeline, marcadores, botão principal, pulso do `HEAD`) fazem parte
dessa atmosfera. Na interação, um glow da cor do token cresce e uma sombra preta funda segura as
janelas.

### Shadow Vocabulary
- **Window Drop** (`box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(123,63,179,0.08)`):
  repouso das janelas de terminal (projetos, sobre, contato).
- **Window Lit** (`box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 24px rgba(123,63,179,0.25)`): janela
  em hover ou foco, com a borda passando para Grape.
- **Card Slide** (`box-shadow: 0 4px 30px rgba(0,0,0,0.45), 0 0 20px rgba(47,168,118,0.18)`):
  cartão de experiência ou formação em hover ou foco.
- **Link Glow** (`text-shadow: 0 0 12px rgba(74,222,155,0.7)`, `--glow-link`): link de conteúdo em
  hover ou foco. No badge do Open VSX, que é imagem, o brilho é um `drop-shadow` na cor do tema.
- **Primary Ember** (`box-shadow: 0 0 18px rgba(70,32,102,0.55)`, que vai a `0 0 28px
  rgba(123,63,179,0.75)` no hover): o botão principal já nasce aceso.
- **Phosphor Flare** (`box-shadow: 0 0 14px rgba(47,168,118,0.55)` em chips, `0 0 22px
  rgba(47,168,118,0.5)` no botão ghost): elementos verdes em hover.
- **Name Halo** (`text-shadow: 0 0 30px rgba(160,106,224,0.35)`): o nome do hero, sempre.
- **Spotlight** (`--spotlight: rgb(160 106 224 / 0.18)`): o círculo de luz que segue o cursor nos
  cartões (SpotlightCard) e que o foco por teclado também acende.

### Named Rules
**The Glow Is Atmosphere Rule.** O brilho existe em repouso. Uma interação aumenta raio e alfa do
glow que já estava lá (ou adiciona um, na cor do token do elemento), mas nunca é a primeira e única
fonte de luz da página.

**The Light Not Paper Rule.** Não existem sombras cinza "de cartão" sozinhas. Sombra preta só
aparece embaixo de janela e sempre acompanhada de um fio ou halo colorido.

## Shapes

Geometria pequena e de máquina. Os raios crescem com o tamanho do objeto: selo `HEAD` com 3px,
links do menu e badges com 4px, botões com 6px, cartões com 8px e janelas com 10px. Chips são a
única pílula (999px), e os controles das janelas e os marcadores da timeline são os únicos círculos.

O fio de 1px é a moldura padrão. A exceção é a borda esquerda de 3px em Grape nos cartões de
experiência e formação, que vira Phosphor Bright no hover, como uma linha de log selecionada.

**The Scale-Matched Radius Rule.** Nada ganha raio maior que o do recipiente; o raio só passa de 10px
na pílula dos chips.

## Components

Cada componente é uma peça real de shell. O realismo vem antes do efeito: se o objeto não existiria
num terminal, ele precisa de um bom motivo para existir aqui.

### Buttons
- **Shape:** cantos levemente arredondados (6px), Iosevka a 0.92rem, padding de 0.7rem × 1.4rem.
  Os textos são comandos: `./ver_experiencia.sh`, `ping vittorio`.
- **Primary:** fundo Grape Deep, borda Grape, texto On Accent e brilho Primary Ember já em repouso.
- **Hover / Focus:** o fundo passa a Grape, o glow cresce e o botão sobe 2px, tudo em 0.25s.
- **Ghost:** véu de Phosphor Deep a 12%, borda Phosphor Deep e texto Phosphor Bright. No hover, o
  preenchimento fica sólido em Phosphor Deep, o texto vira On Accent, entra o Phosphor Flare e o
  botão sobe 2px.

### Chips
- **Style:** pílula mono de 0.75rem, texto Phosphor Bright, véu Phosphor Deep a 16% e borda
  Phosphor a 35%. Representa uma tecnologia e abre com o Tech Icon dela, à esquerda do nome.
- **State:** no hover o chip fica sólido em Phosphor Deep, o texto e o ícone viram On Accent, entra
  o glow verde e ele sobe 2px.
- **Tag Now (`HEAD`, `EM CURSO`, `EM DESENVOLVIMENTO`):** selo de 3px em Phosphor Deep com texto
  `#eafff4` a 0.7rem e um pulso de glow verde a cada 2.4s. Aparece só no que está realmente em
  andamento: vínculo, formação ou projeto (no projeto, sem data nem período, e sem quebrar linha).
- **Private Tag:** etiqueta `privado` em Dim Lilac a 0.72rem, caixa de 4px com fio Grape Wire,
  depois do cadeado e do caminho do repositório (ver Private Link).
- **Attribute Badge:** caixa de 4px com véu verde e borda Phosphor Deep para os atributos pessoais
  do `whois` (ícone mais rótulo).

### Cards / Containers
- **Corner Style:** 8px; janelas com 10px.
- **Background:** Console Plum, com o Spotlight seguindo o cursor.
- **Shadow Strategy:** ver Elevation & Depth (Card Slide, Window Drop e Window Lit).
- **Border:** Grape Wire de 1px; nos cartões de log, borda esquerda de 3px em Grape.
- **Internal Padding:** 1.4rem × 1.6rem nos cartões de log e 1.3rem × 1.4rem no corpo das janelas.
- **Variantes:**
  - `card` (experiência, formação, challenges e comunitário) desliza 6px para a direita no hover.
  - `window` só acende.

  As duas respondem igual a `:focus-within`. (A variante `skill` ficou sem uso quando as skills
  viraram loops.)

### Navigation
- **Style:** barra fixa com Void Plum a 85% e `backdrop-filter: blur(10px)`, fio inferior Grape
  Wire, com os links mono de 0.85rem em Dim Lilac centralizados. O prompt `viper@portfolio:~$` saiu
  daqui e mora na dock e no terminal.
- **Só depois do hero:** com JS, a barra fica escondida (deslocada para cima, transparente, sem
  clique) enquanto o hero está na tela, e entra em 0.25s quando ele sai, no espaço vazio de meia
  tela antes do Sobre. O foco por teclado e o menu do celular aberto a revelam; sem JS, ou se o JS
  principal falhar, ela fica sempre visível.
- **States:** no hover o texto fica Phosphor Bright com halo. O item ativo, com
  `aria-current="location"`, ganha caixa Phosphor (borda Phosphor Deep e véu de 12%). O último link
  (contato) é o CTA, com texto Grape Glow e borda Grape Deep, e no hover fica sólido em Grape Deep.
  Todos os links têm a mesma caixa de 1px (transparente quando inativa), para o destaque não mexer
  no layout.
- **Mobile (≤760px, com JS):** três barras Phosphor Bright que viram um X e uma gaveta que desce
  (max-height em 0.3s) com Void Plum a 97%. Fechada, a gaveta sai da ordem de tabulação.

### Terminal Window (signature)
É o recipiente-assinatura. Tem barra de título em Title Bar Plum com o título mono centralizado, que
é só o assunto da janela (`sobre.txt`, `contato.sh`, o nome do projeto; sem `bash —`), e, à
direita, os controles circulares de 20px (alvo de clique de 24px) com os ícones Lucide `minus`,
`maximize-2` e `x` de 12px (traço 2.5), centrados no círculo: minimizar e maximizar em Phosphor,
fechar em Grape Deep. Com JS, minimizar e fechar funcionam: a janela encolhe em 0.32s até um Desktop
Icon, partindo de onde estava, e o conteúdo abaixo sobe junto. Reaberta, cresce de volta; se tinha
sido fechada, cresce vazia (só a moldura) e então digita os comandos de novo, sem piscar o conteúdo.
O maximizar é desenho com aparência de desativado (opacidade 0.35, sem reação ao hover), exceto nas
Editor Windows, onde maximiza. O corpo é mono a 0.9rem. Dentro dele:
- `$ comando` aparece em Dim Lilac, como os comentários: é contexto, e o destaque é a saída. O `$`
  fica em Grape Glow. Os comandos são os da "aplicação" (`srg --status`), sem `./run`;
- a saída aparece em Dim Lilac, com `white-space: pre-line`; o texto de apresentação (o `cat sobre.txt`)
  e as descrições dos projetos são o conteúdo da janela e ficam em Lavender Ash;
- metadados vêm como pares `chave = valor`;
- comentários vêm como `# texto` em itálico;
- o rodapé é `[tag] exit 0`.

Usada em sobre, projetos, contato e nas Editor Windows.

**Digitação ao entrar na tela.** Quando a janela entra na tela (topo a 80% da altura da viewport),
cada `$ comando` é digitado caractere a caractere e a saída dele aparece depois (fade de 0.2s), em
até 2.2s por janela. O texto real nunca sai do lugar: o comando fica transparente sob uma cópia
`aria-hidden` que digita, e a saída fica com `opacity: 0`, então a janela não muda de tamanho e
leitores de tela leem tudo desde o início. Clique, toque ou foco do teclado na janela completam na
hora; a animação não se repete. Sem JS, com movimento reduzido ou impresso, a janela já está
completa. Janela visível quando a página fica interativa sem a capa da porta também fica completa.

### Editor Window (signature)
Experiência, Challenges, Comunitário e Educação são janelas de editor no estilo VS Code, uma por
seção (`~/carreira`, `~/projetos/challenges`, `~/projetos/comunitario`, `~/formacao`), dentro de uma
Terminal Window que digita `code <pasta>`; o editor é a saída do comando. O editor é um painel em
Void Plum Alt com fio Grape Wire e raio de cartão: faixa de abas em Title Bar Plum (a aba do arquivo
aberto em Console, sublinhada em Phosphor Bright); à esquerda (acima, abaixo de 760px) a árvore de
arquivos, o Branched Menu do Vue Bits com ramos em ângulo reto (radius 0), linhas Grape Deep,
arquivos em Dim Lilac e o aberto em Phosphor Bright com o ramo desenhado até ele; o nome que não
cabe na largura da árvore (no celular) termina em reticências, como no explorer do VS Code, nunca
cortado no meio da letra. À direita, o arquivo YAML do item (`AAAA-MM_slug.yml`; na formação, que só
tem anos, `AAAA_id.yml`, com `em_curso: true  # EM CURSO` só na formação em andamento e as fontes
numa lista `fontes:` de links) com números de linha em Dim Lilac e sintaxe Grape Glow (chaves),
Ghost Lilac (textos), Phosphor Bright (datas), Dim Lilac (pontuação e `# comentários` em itálico);
embaixo, o rodapé em maiúsculas pequenas com o caminho e a posição (`2 / 5`). Trocar de arquivo não
muda a altura (os arquivos ficam empilhados na mesma célula). Maximizada, a janela vai para o
`<body>`, cobre 95% da tela sobre a página desfocada (6px) e escurecida (Void Plum a 55%), e mostra
a árvore com os cartões de hoje no lugar do arquivo; escolher um arquivo rola até o cartão. Esc, o
`□` ou um clique fora restauram. Sem JS e na impressão, só os cartões.

### Section Title (signature)
`## nome/` em mono 700, seguido opcionalmente de `$ comando` como lead. É a assinatura de
navegação: cada seção é um diretório. Uma sub-parte de seção é um subdiretório: `### nome/` (mono
700, clamp(1.15rem, 3vw, 1.45rem), `SectionSubpart`) com lead opcional, ex.:
`$ ls -lt ~/projetos/challenges`, e ícone opcional entre o `###` e o nome (grupos de skills).

### Timeline (signature)
Trilho de 2px com gradiente vertical de Grape para Phosphor e halo roxo. Os marcadores são anéis
de 16px com borda Phosphor Bright de 3px, miolo Void Plum e halo verde permanente. A leitura é a de
um `git log` com o commit mais recente no topo.

### Hero Effects (signature)
- **Porta de acesso:** ver Access Gate abaixo. É a primeira tela; o hero só aparece depois dela.
- **Glitch:** o nome tem duas cópias recortadas por `clip-path`, Grape Glow em cima e Phosphor
  Bright embaixo, que saltam em `steps(1)` a cada ~3s.
- **Prompt digitado:** ciclo de frases com cursor `▊`.
- **Lattice Loader:** a primeira linha do hero é o Lattice Loader do Vue Bits (grade 3×3 de
  quadrados, gap 1px, brilho): Grape Glow com `Inicializando portfolio.service` enquanto o hero
  carrega (no mínimo 3s), ✓ Phosphor Bright com `portfolio.service carregado com sucesso!` quando
  ele termina, e some 3s depois, sem mover nada.
- **BlurText:** revela a tagline palavra a palavra em até 1.5s.
- **Ao fundo:** Letter Glitch do Vue Bits (canvas 2D num worker): letras de 16px em células de
  10×20px, nas três cores do tema a 55% de opacidade, trocando a cada quadro (Glitch Speed 10) com
  transição suave de cor, sob as duas vinhetas do componente: a central (preto 80% → transparente aos
  60% do raio) e a das bordas, que escurece os cantos. O `▼ scroll` usa Ghost Lilac (não Dim Lilac)
  porque fica onde a vinheta central não chega. Fora da tela ou com a aba oculta, para. Sem
  movimento ou sem JS, ficam as nebulosas estáticas.
- **Hero Halo** (`--hero-halo`): com o fundo animado, os textos que não chegam a 4,5:1 sobre as letras
  ganham um contorno preto sólido de 2px e um esfumado curto (4px e 8px) por fora, justo nas letras,
  sem faixa nem caixa atrás do bloco: hoje a tagline e o texto do Lattice Loader (≥ 4,6:1 medidos na
  vizinhança dos traços). O nome, o prompt e os botões passam sem halo; o `ping vittorio` ganha fundo
  opaco (o mesmo véu Phosphor Deep sobre Void Plum). Sem fundo animado e na impressão, sem halo.

### Private Link
Link para repositório privado, que pode abrir um 404 para o visitante. Cadeado Lucide em Dim Lilac
(`--icon-inline`, 1em), caminho `github.com/…` em Phosphor Bright e a Private Tag `privado`; o nome
acessível termina em "repositório privado, pode não abrir". Todo cartão com link privado fecha a
lista com o comentário `# repositório(s) privado(s): pode(m) abrir uma página de "não encontrado"…`.
A forma (cadeado e etiqueta), não a cor, é o que diferencia do link público.

### Skill Icon
Ícone Lucide (`@lucide/vue`, SVG inline no HTML pré-renderizado) entre o `###` e o nome de cada
sub-parte de skills, em Phosphor Bright via `currentColor`, com `--icon-skill` (1.4rem) e
`aria-hidden`. Os dados guardam só o nome do ícone (`code-xml`, `globe`, `database`, `workflow`,
`server-cog`); o registro nome → componente fica em `src/lib/icons.ts`.

### Tech Icon
Logotipo da tecnologia à esquerda do nome, nos chips e nos loops de skills, com `--icon-tech` (1em,
a altura do texto) e `aria-hidden`. Uma cor só, a do texto (`currentColor`), nunca a cor da marca. A
fonte segue a ordem devicon → vectorlogo.zone → Lucide pelo assunto (TDD → `flask-conical`); o
Valkey usa o logotipo do homarr-labs/dashboard-icons, por pedido do autor; logotipo com desenho branco sobre a forma (SAP, nginx) vira vazado. Todos vêm de
um sprite gerado por `tools/build-tech-icons.mjs` (`src/assets/tech-icons/`, licenças no
`NOTICE.md`), usado com `<use href>`: arquivo do próprio site, visível sem JS. O registro
tecnologia → ícone fica em `src/lib/tech-icons.ts`, e tecnologia sem ícone quebra o build.

### Skill Loop
Inspirado no Text Loop do Vue Bits, na forma "linha". Uma fita em `--ribbon-bg` com fios
`--ribbon-edge` em cima e embaixo atravessa a página de borda a borda. Sobre ela, os itens (Tech Icon
+ nome em mono 1.7rem Phosphor Bright, `--loop-font`, separados por `✦` em Grape Glow) correm a
40px/s, com as bordas esmaecidas: da direita para a esquerda, exceto em `conceitos_web` e
`desenho_de_processos`, que correm para a direita. O loop pausa com o ponteiro em cima e fica parado fora
da tela. Sem JS, com movimento reduzido, quando o JS principal falha ou na impressão, a fita vira uma
lista parada que quebra em linhas, com todas as skills. O leitor de tela recebe uma lista só; as
cópias que fazem a volta são `aria-hidden`. No alto contraste, a fita ganha borda CanvasText.

### Content Link
Todo link de conteúdo (projetos, challenges, comunitário, fontes da formação e contato) passa pelo
`ExternalLink` e tem, em repouso, um sublinhado tracejado de 1px na cor do link (Phosphor Bright). O
hover e o foco só acrescentam o Link Glow, sem mover o link. Nos links de projeto, o sublinhado fica
sob o caminho do repositório ou sob o badge, nunca sob o cadeado ou a etiqueta `privado`. O rótulo
`> nome` acima de cada link de projeto fica em Grape Glow, para o verde do link ser o destaque (os
Neon Signs dos temas mantêm a cor deles). Os badges de downloads dos temas são a exceção: o
sublinhado fica na cor do badge (Grape Badge, Sith Badge). Menu, botões, dock e "▼ scroll" são
controles de navegação e não levam o sublinhado.

### Dock
Barra fixa no centro de baixo da tela, só com JS e depois da porta de acesso: caixa Console Plum a 85% com
blur, fio Grape Wire e raio de cartão, com um botão de 2.75rem (ícone `SquareTerminal`, Phosphor Bright sobre véu Phosphor Deep; sólido no hover e no foco). Embaixo do ícone, um ponto
Phosphor Bright: cheio com o terminal aberto, vazado (só o contorno de 1px, 0.35rem) com ele
minimizado, e nenhum com ele fechado. O botão (e Ctrl+Alt+T) abre o terminal, minimiza e restaura,
como numa barra de tarefas. A dica é do site,
acima do botão: caixa Console Plum com fio Grape Wire, raio de botão e brilho Grape leve, com
`Ctrl + Alt + T` em teclas `kbd` Phosphor Bright sobre Title Bar Plum; aparece com o mouse parado
(150ms) ou com o foco do teclado, e some com Esc. O favicon é o mesmo ícone, em Phosphor Bright sobre
Void Plum, com um brilho Grape atrás (gerado dos tokens por `tools/build-favicon.mjs`).

### Dock Terminal (signature)
Uma Terminal Window de verdade que sobe da dock (0.2s; nenhum movimento com movimento reduzido), até
720px de largura e `min(50svh, 28rem)` de altura, com a barra `viper@portfolio: ~`, o `−` e o `✕`
funcionais. O `−` (e o botão da dock, e o Ctrl+Alt+T) minimiza: o terminal encolhe até o botão da dock
em 0.32s, como as janelas encolhem até o Desktop Icon, e fica guardado com a sessão inteira (saída,
histórico, prompt); restaurado, cresce de volta a partir do botão. Fechar (`✕`, `exit`, Esc) desce e
apaga a sessão. O prompt `viper@portfolio:~$` usa as cores de sempre e o cursor `▊` Phosphor Bright na
posição do cursor de texto; a conclusão única aparece em Dim Lilac depois do texto, e os candidatos
viram chips tocáveis. Comandos: `help`, `find <seção>`, `open <janela>`, `clear` e `exit`. O `open`
abre a janela de um projeto (pelo nome em slug: `srg`, `temas-vs-code`…) ou, maximizada, a de
`experiencia`, `challenges`, `comunitario` ou `educacao`, leva a página até ela e minimiza o terminal. A saída é um
`role="log"`.
Com foco, a borda acende em Grape.

### Desktop Icon
O que fica no lugar de uma janela minimizada ou fechada: um quadrado de 5.5rem (`--desktop-icon-size`)
em Console Plum com fio Grape Wire e raio de cartão, com um ícone Lucide de 2.5rem em Phosphor
Bright pelo tipo da janela (documento para `sobre.txt`, script para `contato.sh`, pasta de código
para os projetos), e o título embaixo em mono 0.8rem (até 2 linhas). No hover e no foco, o quadrado
acende em Grape e o ícone vira Grape Glow. Um clique, toque ou Enter abre a janela. O ícone fica à
esquerda, na borda do conteúdo da seção (também o do Contato, cuja janela aberta é centralizada).
Ícones de projetos minimizados em sequência ficam lado a lado, com 8px entre eles, e quebram de
linha conforme a largura (2 no celular de 320px, 5 com 768px, os 6 a partir de 1024px); uma janela
aberta ocupa a própria linha.

### Access Gate (signature)
A primeira tela, para todo visitante com JS: o Faulty Terminal do Vue Bits ao fundo (dígitos em
Phosphor Bright que acendem e falham; fundo liso com movimento reduzido ou sem WebGL) e, no centro,
só um Desktop Icon `acessar_portfolio.sh` (ícone de script, largo o bastante para o nome numa linha)
com a dica `# clique no ícone para conectar` em Dim Lilac embaixo (`toque` em tela de toque), sobre
uma vinheta preta no desenho da do Letter Glitch, centrada no nome e na dica e sumindo logo depois
(`--gate-vignette`; sem vinheta no fundo liso). A curvatura do Faulty Terminal é proporcional ao
formato da tela: 0.2 no desktop 16:9, só leve no celular. O foco começa no ícone, e a página atrás
fica `inert`.

Abrir o ícone faz crescer, em 0.32s, uma Terminal Window de 680px (`--gate-window-width`) e tamanho
fixo, só com minimizar e fechar, onde a sessão SSH é digitada pelo TextType do Vue Bits (cursor `▊`
Phosphor Bright só na linha em curso): `anon@<IP>:~$ ssh viper@portfolio`, `Conectando ao
portfolio...` em Dim Lilac, a senha em pontos, `Autenticado.` em Phosphor Bright com `Bem-vindo ao
Portfolio v2.5`, o `Last login` em Dim Lilac e `./iniciar_portfolio.sh` em Phosphor Bright. O IP é
o do visitante (ou `127.0.0.1`); a versão é a do `package.json`. A sessão leva 2.72s; no fim, a
porta some num fade de 0.5s. Minimizada, a sessão continua e a página abre do mesmo jeito; fechada,
a tentativa acaba e o ícone abre outra, do zero. Com movimento reduzido, nada anima: a sessão aparece
inteira e a página abre 1s depois. A página sempre abre no topo, no hero, mesmo recarregada depois de
rolar ou com âncora no endereço (que sai do endereço).

### Neon Sign
Letreiro para nomes de artefatos reais (os temas do Open VSX). O texto fica estável na cor do
artefato, e só a camada `::after` com `text-shadow` em quatro raios pisca (`neon-flicker`, ~3s).
Cada artefato traz o próprio par de cores: Grape Glass usa Phosphor e Grape, Shadow Lord usa Sith Red.

## Do's and Don'ts

### Do:
- **Do** tirar toda cor, fonte, raio e espaçamento de `src/styles/tokens.css` (`var(--…)` ou os
  utilitários do Tailwind `bg-surface`, `text-purple-glow`, `rounded-card`, `max-w-page`).
- **Do** escrever glows e véus como `rgba()` do RGB de um token (The Token-Alpha Rule) e manter o
  glow de repouso nos elementos que já o têm.
- **Do** dar a cada componente novo uma justificativa de terminal: janela, prompt, flag, `dt = dd`,
  `# comentário`, `exit 0`.
- **Do** abrir seções novas com `## nome/` e, se couber, `$ comando` (The Directory Listing Rule).
- **Do** usar mono para a voz do sistema e Aile para a prosa (The Who's Talking Rule).
- **Do** aplicar a `:focus-within` e `:focus-visible` o mesmo realce do hover, com anel Grape Glow
  de 2px e offset de 2px.
- **Do** fazer cada animação nova obedecer a `prefers-reduced-motion` e à classe `html.motion`. Se
  for decorativa, ela some na impressão (lista em `base.css`).
- **Do** manter o texto secundário em Dim Lilac ou mais claro: 4,8:1 é o piso medido sobre
  Title Bar Plum.
- **Do** sublinhar todo link de conteúdo em repouso (Content Link): o link se distingue do texto
  pela forma, também em telas de toque.

### Don't:
- **Don't** introduzir matiz novo. Sith Red é exceção de artefato, não precedente. Logotipos de
  tecnologia também não trazem a cor da marca.
- **Don't** pôr imagens decorativas atrás das seções; a atmosfera vem do hero (o campo de pontos) e
  das scanlines.
- **Don't** fazer piscar, tremer ou perder contraste o texto que o visitante precisa ler. O
  flicker vive numa camada sobreposta (The Steady Text Rule).
- **Don't** usar sombra cinza neutra sozinha em cartões (The Light Not Paper Rule).
- **Don't** passar de 10px de raio, exceto na pílula dos chips.
- **Don't** deixar o realce de hover ser o único meio de revelar uma informação; em tela de toque
  ele não existe.
- **Don't** deixar efeito algum (glitch, campo de pontos, scanlines) cobrir conteúdo por mais de 5s ou
  dificultar achar nome, cargo e contato. A única exceção é a porta de acesso: espera o clique, mas
  depois dele a página abre em até 4s, sempre com a sessão inteira, operável por teclado e leitor de
  tela, e sem animação com movimento reduzido (constituição v3.0.0).
- **Don't** escrever valores soltos de cor ou espaçamento em componentes quando existe um token
  equivalente.
