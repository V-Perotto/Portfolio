# Feature Specification: Janelas de área de trabalho, dock com terminal e telas CRT

**Feature Branch**: `001-vue-resume-refactor` (nenhum branch criado: não há hook `before_specify`
configurado, e a 004 parte do estado da 003, que ainda não foi para a `main`)

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: quinze pedidos do autor, enviados de uma vez:

1. "Faça o botão de minimizar e fechar ser funcional, aonde a janela diminui para o tamanho de um
   quadrado com um ícone dentro desse quadrado e uma escrita embaixo, igual um arquivo da área de
   trabalho, a transição deve ter animação de crescimento e minimização.
   - Para o caso do minimizar, ao abrir, ele simplesmente cresce a janela com todos os conteúdos
     carregados.
   - Para o caso de fechar, ele deve "recarregar" os itens, como se fosse a primeira vez carregando
     quando passa com o scroll."
2. "O header deve aparecer somente quando sair da seção do hero, que deverá ter um espaçamento bem
   maior entre o hero e seção do sobre para ele poder aparecer"
3. "Centralize os itens do header e faça o viper@portfolio:~$▊ ficar na parte inferior central, como
   uma dock com um ícone de terminal, ao clicar o Ctrl + Alt + T ou clicar nesse ícone da dock, ele
   sobe o terminal e faz aparecer o viper@portfolio:~$▊ como terminal funcional (com autocomplete):
   - Deverá ter o comando help que terá a explicação do comando `find <OPTIONS>`, que funcionará para
     buscar e redirecionar para a página/seção correspondente (sobre, experiencia, skills, projetos,
     educacao)."
4. "Na tela de carregamento inicial, use do VueBits: Faulty Terminal — Scale = 3, Digit Size = 3,
   Speed = 1, Noise Amplitude = 0.5, Brightness = 0.5, Scanline Intensity = 1.4, Curvature = 0.2,
   Mouse React = off, Page Load Animation = on"
5. "Na tela de fundo do Hero, invés de usar aqueles quadrados padrão, use o CRT Warp com: Curvature =
   0.3, Scanline Strength = 1, Bloom radius = 3, Brightness = 1, Render Quality = Performance, Pointer
   Strength = 1.5, Wave Amount = 0, Scanline Density = 270, Noise = 0.125, RGB Shift = 0.01, Frame
   Rate = 24 fps, Pause = off, Speed = 0.3, Wave Density = 2.5, Bloom = 3, Vignette = 0.5, Pixel Size
   = Smooth, Ponter Warp = on. Ele deverá ter efeito com a as letras do Matrix"
6. "Altere os ícones do Matrix para serem letras (maiúsculas e minúsculas), números e caracteres
   especiais (*&%$#@ e por ai vai), invés de caracteres japoneses."
7. "No footer, deixe somente: `$ echo "© 2026 Vittorio Perotto"`"
8. "Invés de JSON de tema, deixe somente JSON"
9. "Deixe o sublinhado do Downloads do Grape Glass Theme e do Shadow Lord na respectiva cor deles"
10. "Para a logo do Valkey, use https://github.com/homarr-labs/dashboard-icons/blob/main/svg/valkey.svg"
11. "Conceitos web e desenho de processos podem ter as fitas do vuebits indo da esquerda para a
    direita invés da direita pra esquerda"
12. "Corrigir o carregamento para ele mostrar todo o processo até o final, excluindo a possibilidade
    de clicar para pular"
13. "As faixas da seção de skills deve ocupar toda a tela horizontalmente e deverá ter o dobro do
    tamanho do texto (está muito pequeno para enxergar)"
14. "Na janela do ItaliaMi, o papel deve ser: Autor e desenvolvedor."
15. "Atualize o package para as versões mais novas que o dependi diz."

## Contexto

### Situação atual

- **Janelas de terminal**: oito janelas (Sobre `sobre.txt`, os seis projetos e Contato `contato.sh`)
  têm na barra de título os três controles `−`, `□` e `✕`, que são só desenho: não reagem a clique e
  ficam fora da árvore de acessibilidade. Cada janela digita seus comandos na primeira vez que entra
  na tela (feature 002), uma vez por visita.
- **Navegação (header)**: fixa no topo desde o primeiro paint, inclusive sobre o hero. À esquerda,
  o logotipo-prompt `viper@portfolio:~$▊` (link para o topo); à direita, os seis links
  `~/sobre` … `~/contato`. Abaixo de 840px, os links ficam num menu recolhível. Sem JavaScript, a
  navegação fica no fluxo da página com os links expostos.
- **Hero → Sobre**: o hero ocupa a altura da tela, e a seção Sobre começa logo abaixo dele, só com o
  espaçamento normal de seção (5rem). Um link "▼ scroll" fica no centro da borda inferior do hero.
- **Tela de boot**: cobre a página desde o primeiro paint e simula uma sessão SSH digitada
  (`ssh viper@portfolio`, senha, "Autenticado", "Last login", `./iniciar_portfolio.sh`) sobre o fundo
  liso da página. Qualquer tecla ou clique pula o boot, e a dica "[ pressione qualquer tecla para
  pular ]" fica no rodapé da tela. Não aparece com "reduzir movimento" nem sem JavaScript.
- **Boot cortado**: a sequência digitada dura ~4,0 s a partir do momento em que o JavaScript monta a
  tela, mas o prazo do boot é 3,9 s contados do início da navegação (feature 002, research R13). Como
  a montagem nunca acontece no instante zero, **toda** visita corta o fim da sequência: a linha
  `./iniciar_portfolio.sh` não chega a ser digitada inteira.
- **Fundo do hero**: degradês radiais roxo e verde sobre o fundo da página, uma grade de quadrados
  de 48px esmaecida nas bordas (os "quadrados padrão") e, com movimento, a chuva Matrix num canvas a
  35% de opacidade, com katakana (`アイウエオカキクケコ`), dígitos `0` e `1` e símbolos.
- **Rodapé**: `$ echo "© 2026 Vittorio Perotto — feito com Vue, Tailwind e Vue Bits"` e, abaixo,
  `process finished with exit code 0`. O ano é o corrente.
- **Temas VS Code**: a stack mostra o chip `JSON de tema`. Os badges de downloads do Grape Glass e do
  Shadow Lord têm um sublinhado tracejado verde (a cor dos links), igual nos dois.
- **Valkey**: chip e item do loop de skills usam um ícone genérico de banco de dados (Lucide), porque
  o devicon e o vectorlogo.zone não têm o logotipo (feature 003).
- **Loops de skills**: cada um dos 5 grupos corre da direita para a esquerda numa fita roxa contida
  na largura da página (até 1100px), com o texto em 0,85rem.
- **ItaliaMi**: papel = "Automatizou o processo de agendamento do passaporte italiano".
- **Dependências**: o projeto declara 5 dependências e 15 dependências de desenvolvimento. Há dois
  lockfiles versionados: `package-lock.json` (o do comando de build documentado e da publicação) e
  `pnpm-lock.yaml`.

### Fatos levantados em 2026-10-08

- **Faulty Terminal** (Vue Bits, `Backgrounds/FaultyTerminal`): fundo animado de uma grade de
  "dígitos" que acendem e apagam com ruído, com scanlines, curvatura de tubo e cintilação. A animação
  de carregamento acende as células aos poucos ao longo de 2 s. A cor ("Tint Color") não foi
  informada pelo autor; o padrão do demo é um verde claro.
- **CRT Warp** (Vue Bits, `Backgrounds/CRTWarp`): simula uma tela de tubo (curvatura, scanlines,
  brilho difuso "bloom", aberração cromática "RGB Shift", ruído, vinheta e deformação que segue o
  ponteiro) sobre uma onda de plasma. Com **Wave Amount = 0**, a onda some e a tela fica com um brilho
  uniforme: tudo o que o efeito mostra passa a ser o que estiver "dentro" da tela. Daí o pedido de o
  efeito valer **sobre as letras do Matrix**: a chuva Matrix vira a imagem exibida pelo tubo. As
  cores ("Phosphor Color", "Background") não foram informadas pelo autor.
- **Rótulos do demo → configuração**: "Render Quality = Performance" é a resolução de renderização
  a 0,75× da tela; "Pixel Size = Smooth" é sem pixelização; "Frame Rate = 24 fps" é o teto de quadros
  por segundo.
- **Licença do Vue Bits**: MIT + Commons Clause, que permite usar os componentes como parte de um
  site, sem vendê-los nem redistribuí-los avulsos (o mesmo regime do `SpotlightCard` e do `BlurText`
  já vendorizados).
- **Logotipo do Valkey** (homarr-labs/dashboard-icons, `svg/valkey.svg`, licença Apache-2.0): um
  único caminho vetorial, de uma cor só (azul-marinho), que funciona reduzido à cor do texto.
- **Ctrl+Alt+T**: no Ubuntu e em outros ambientes Linux esse atalho abre o terminal do sistema e não
  chega ao navegador; no Windows e no macOS ele chega à página.
- **Versões mais novas (registro npm, 2026-10-08)** — o que o Dependi aponta:

  | Pacote | Hoje | Mais nova | Observação |
  |--------|------|-----------|------------|
  | @playwright/test | 1.63.0 | 1.64.0 | menor |
  | happy-dom | 20.14.5 | 20.14.6 | correção |
  | vite | 8.3.3 | 8.3.4 | correção |
  | @unhead/vue | 2.1.17 | 3.4.2 | **major**; o gerador estático em uso (vite-ssg 28.3.0, a versão mais nova) depende de @unhead/vue ^2 |
  | beasties | 0.3.5 | 0.5.4 | **major** (0.x); o vite-ssg 28.3.0 declara compatibilidade só com ^0.3.5 |
  | typescript | 6.0.3 | 7.0.2 | **major**; o TypeScript 7 (compilador nativo) não traz mais a API em JavaScript que o checador de tipos dos componentes Vue (vue-tsc 3.3.12, o mais novo) usa |

  As demais já estão na versão mais nova.

### Relação com a constituição (v2.2.0 → v2.3.0)

- **Princípio I (Fidelidade ao Currículo)**: o papel no ItaliaMi muda por decisão do autor, que
  vale sobre o PDF do currículo (o site está certo quando os dois divergem; o autor atualiza o PDF).
  Nenhum outro dado factual muda: "JSON" é a grafia da tecnologia, e o rodapé continua com o nome.
- **Princípio II (Projetos Demonstráveis)**: minimizar ou fechar uma janela de projeto é uma escolha
  do visitante e é reversível; a janela começa aberta em toda visita.
- **Princípio III (Saída Estática)**: o terminal, os fundos animados e as janelas que minimizam só
  acrescentam comportamento. Sem JavaScript, todo o conteúdo e a navegação por âncoras continuam
  como hoje. O logotipo do Valkey MUST estar nos arquivos do site, sem pedir nada ao repositório
  de origem durante a visita. Toda dependência nova MUST ser justificada no plano, com o peso.
- **Princípio IV (Acessibilidade e Desempenho)**: o item 12 **conflita** com "Animações de entrada
  MUST ser puláveis e nunca bloquear o conteúdo por mais de 5 segundos". Por decisão do autor (Q1),
  a constituição foi emendada para a v2.3.0 antes do plano: a tela de boot deixa de ser pulável e
  ganha um teto próprio de 7 s; ela continua omitida com "reduzir movimento" e sem JavaScript, e as demais
  animações de entrada seguem puláveis e com o teto de 5 s. Os fundos animados respeitam "reduzir
  movimento", e o hero continua legível sobre o fundo CRT. O terminal da dock e os controles das
  janelas precisam funcionar por teclado e com leitor de tela.
- **Princípio V (Identidade Visual Coerente)**: a dock, o terminal e os ícones de área de trabalho
  estendem a metáfora de terminal/Linux. As cores dos fundos animados, do terminal e dos
  sublinhados vêm dos tokens.

### Requisitos de features anteriores que esta feature substitui

- **001 FR-009** ("A navegação MUST permanecer visível ao rolar"): passa a valer só depois do hero
  (FR-012 desta spec).
- **001 FR-013 / FR-033** (crédito do rodapé refletindo a stack; rodapé "process finished"): o
  rodapé passa a ter só o `echo` com o copyright (FR-040).
- **001 FR-030** (logo-prompt `viper@portfolio:~$` na navegação): o prompt passa para a dock e para o
  terminal (FR-017).
- **001 FR-031** (boot pulável por qualquer tecla ou clique; página descoberta em até 5 s) e o prazo
  de 3,9 s da feature 002 (research R13): ver FR-031 e FR-032 desta spec.
- **001 FR-032** (chuva Matrix ao fundo do hero): a chuva continua, agora dentro da tela CRT e com
  caracteres latinos (FR-034, FR-037).
- **003 FR-021** (loops correndo da direita para a esquerda): dois grupos passam a correr da esquerda
  para a direita (FR-046).

## Clarifications

### Session 2026-10-08 (specify)

- Q1: O item 12 tira o pulo do boot, o que conflita com o Princípio IV ("Animações de entrada MUST
  ser puláveis e nunca bloquear o conteúdo por mais de 5 segundos"). Como resolver? → A: Boot sem
  pulo e com teto maior: emendar o Princípio IV tirando o pulo da tela de boot e subindo o teto dela
  acima de 5 s, mantendo o ritmo atual da digitação. (O valor do teto, 7 s, saiu do clarify.)
- Q2: Três das versões mais novas (TypeScript 7, @unhead/vue 3 e beasties 0.5) são incompatíveis com
  o checador de tipos e com o gerador estático em uso, que já estão na versão mais nova. Qual
  política? → A: Atualizar tudo para a versão mais nova; esses três ficam na última versão
  compatível (TypeScript 6.x, @unhead/vue 2.x, beasties 0.3.x), com o motivo registrado no plano, a
  revisitar quando o gerador estático e o checador de tipos aceitarem as versões novas.
- Q3: O `find` listado não tem contato. Contato fica de fora? → A: Não: as opções são as 6 seções do
  menu (sobre, experiencia, skills, projetos, educacao e contato).

### Session 2026-10-09 (clarify)

- Q: Qual deve ser o teto do boot, contado do início da navegação até a página ficar descoberta? →
  A: 7 s. O boot aparece quando o JavaScript monta a tempo de a sequência inteira e a saída caberem
  nos 7 s (montagem em até ~2,1 s, research R4); a capa sem JavaScript sai sozinha no mesmo teto.
- Q: Quanto espaço vazio deve haver entre o fim do hero e o título da seção Sobre? → A: Meia tela:
  cerca de 50% da altura da janela do navegador, no lugar do espaçamento atual.
- Q: Ctrl+Alt+T é capturado pelo Ubuntu e por outros Linux; o terminal do site ganha um segundo
  atalho? → A: Não, só Ctrl+Alt+T. (O autor sugeriu Ctrl+Esc, desde que nenhum sistema o usasse;
  como o Windows e o KDE Plasma o capturam, ficou só o atalho original.) Onde o sistema captura o
  atalho, a dock é o caminho.
- Q: Que ícone vai dentro do quadrado da janela minimizada ou fechada? → A: Pelo tipo de arquivo,
  como numa área de trabalho: documento para `sobre.txt`, script para `contato.sh` e pasta de código
  para as janelas de projeto.
- Q: Depois de um `find <seção>`, o terminal fecha ou continua aberto? → A: Continua aberto, com o
  foco no prompt. Para fechar, o comando `exit` ou o botão ✕ do terminal, com o mouse (além de Esc,
  do ícone da dock e de Ctrl+Alt+T).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Boot completo sobre o Faulty Terminal (Priority: P1)

*Itens 4 e 12 do autor.* A tela de carregamento passa a ter o fundo animado Faulty Terminal, com os
parâmetros do autor, e a sessão SSH digitada aparece **inteira**, até o `./iniciar_portfolio.sh`, sem
que um clique a interrompa.

**Why this priority**: é a primeira coisa que todo visitante vê, e hoje ela termina cortada em toda
visita.

**Independent Test**: carregar a página várias vezes em desktop e celular (inclusive com a CPU
desacelerada) e verificar o fundo Faulty Terminal, todas as linhas da sessão digitadas até o fim, o
clique sem efeito e a página descoberta dentro do teto de tempo; repetir com "reduzir movimento" e
sem JavaScript e verificar que não há boot.

**Acceptance Scenarios**:

1. **Given** uma visita com movimento permitido, **When** a tela de boot aparece, **Then** o fundo é
   o Faulty Terminal, que acende aos poucos, e o texto da sessão fica legível por cima dele.
2. **Given** o boot em andamento, **When** a sequência termina, **Then** todas as linhas foram
   exibidas, incluindo `./iniciar_portfolio.sh` digitado até o último caractere, antes de a tela
   sair.
3. **Given** o boot em andamento, **When** o visitante clica ou toca na tela, **Then** nada muda: a
   sequência continua até o fim.
4. **Given** o boot, **When** exibido, **Then** não há dica de "pressione qualquer tecla para pular".
5. **Given** um JavaScript que chega tarde demais para a sequência caber inteira no teto, **When** a
   página carrega, **Then** o boot não aparece (nunca aparece cortado).
6. **Given** "reduzir movimento" ativo ou JavaScript desativado, **When** a página carrega, **Then**
   não há tela de boot nem fundo animado, como hoje.

---

### User Story 2 - Terminal funcional na dock (Priority: P1)

*Item 3 do autor.* O prompt `viper@portfolio:~$▊` sai do header e vira uma dock fixa no centro da
parte de baixo da tela, com um ícone de terminal. Clicar no ícone ou apertar Ctrl+Alt+T sobe um
terminal com o prompt, onde o visitante digita comandos com autocompletar: `help` explica o
`find <OPTIONS>`, e `find <seção>` leva até a seção. Os itens do header ficam centralizados.

**Why this priority**: é a maior interação nova do site e reforça a tese do portfólio (um
desenvolvedor que constrói uma interface de terminal de verdade).

**Independent Test**: com mouse, teclado e toque, abrir o terminal pela dock e pelo atalho, rodar
`help`, completar `find pro` com Tab e ir até Projetos; fechar com Esc; verificar foco, leitor de
tela e ausência do terminal sem JavaScript.

**Acceptance Scenarios**:

1. **Given** qualquer ponto da página depois do boot, **When** exibida, **Then** a dock aparece fixa
   no centro inferior da tela, com um ícone de terminal, e o header não tem mais o prompt.
2. **Given** a dock, **When** o visitante clica no ícone ou aperta Ctrl+Alt+T, **Then** um terminal
   sobe a partir da dock, com `viper@portfolio:~$▊` e o cursor de digitação já no prompt.
3. **Given** o terminal aberto, **When** o visitante digita `help` e Enter, **Then** a saída lista os
   comandos e explica `find <OPTIONS>`, com todas as opções aceitas.
4. **Given** o terminal aberto, **When** o visitante digita `find projetos` e Enter, **Then** a página
   rola até a seção Projetos, com o título visível abaixo do header e acima do terminal, e o
   terminal continua aberto, com o foco no prompt.
5. **Given** o prompt com `find pro`, **When** o visitante aperta Tab (ou toca na sugestão), **Then**
   o texto vira `find projetos`; com mais de uma possibilidade, as opções aparecem listadas.
6. **Given** um comando desconhecido ou uma opção inválida, **When** executado, **Then** o terminal
   responde com uma mensagem de erro no estilo de shell e indica o `help`.
7. **Given** o terminal aberto, **When** o visitante digita `exit`, clica no botão ✕ da barra do
   terminal, aperta Esc ou Ctrl+Alt+T ou clica no ícone da dock, **Then** o terminal desce e o foco
   volta ao ícone da dock.
8. **Given** o header visível, **When** exibido em desktop, **Then** os links das seções ficam
   centralizados horizontalmente.
9. **Given** JavaScript desativado, **When** a página é exibida, **Then** não há dock nem terminal, e
   a navegação por âncoras do header continua funcionando.

---

### User Story 3 - Header só depois do hero (Priority: P1)

*Item 2 do autor.* Enquanto o hero está na tela, não há header. Ao rolar para fora do hero, o header
aparece; ao voltar para o hero, ele some. Entre o fim do hero e a seção Sobre há um espaço vazio de
cerca de meia tela, onde o header surge antes de o conteúdo chegar ao topo.

**Why this priority**: muda a primeira dobra de toda visita (o hero fica limpo) e depende do
espaçamento novo para não cobrir o título da seção Sobre.

**Independent Test**: rolar devagar do topo até a seção Sobre e de volta, em desktop e celular, e
verificar quando o header aparece e some; navegar por Tab desde o topo e verificar que o header
aparece quando recebe foco; repetir sem JavaScript.

**Acceptance Scenarios**:

1. **Given** o topo da página, **When** o hero está na tela, **Then** o header não aparece nem pode
   ser clicado.
2. **Given** a rolagem para baixo, **When** o hero sai da tela, **Then** o header aparece com uma
   transição curta, centralizado.
3. **Given** a rolagem de volta ao hero, **When** o hero volta a aparecer, **Then** o header some.
4. **Given** o fim do hero, **When** a rolagem continua, **Then** há um espaço vazio de cerca de meia
   tela antes do título da seção Sobre, e o header surge nesse espaço, sem cobrir o título.
5. **Given** um visitante de teclado no topo, **When** ele navega por Tab até um link do header,
   **Then** o header aparece enquanto tiver o foco.
6. **Given** um link `#secao` (dos botões do hero, do terminal ou de um endereço com âncora), **When**
   a página chega à seção, **Then** o header está visível e o título da seção não fica coberto.
7. **Given** JavaScript desativado, **When** a página é exibida, **Then** a navegação aparece como
   hoje, no fluxo da página.

---

### User Story 4 - Janelas que minimizam e fecham como ícones de área de trabalho (Priority: P2)

*Item 1 do autor.* Os botões `−` (minimizar) e `✕` (fechar) das janelas de terminal passam a
funcionar: a janela encolhe, com animação, até virar um quadrado com um ícone dentro e o nome da
janela embaixo, como um arquivo na área de trabalho. Ao abrir o ícone, a janela cresce de volta com
animação. Se foi minimizada, volta com tudo já exibido; se foi fechada, volta "recarregando", com a
digitação dos comandos de novo, como na primeira vez.

**Why this priority**: dá vida aos controles que hoje são só desenho, mas não muda o conteúdo.

**Independent Test**: em cada tipo de janela (Sobre, um projeto, Contato), minimizar, reabrir,
fechar e reabrir, com mouse, toque e teclado; verificar animações, estado do conteúdo, foco e
leitura por leitor de tela; repetir com "reduzir movimento".

**Acceptance Scenarios**:

1. **Given** uma janela aberta, **When** o visitante aciona `−`, **Then** a janela encolhe com
   animação até virar um ícone quadrado, no lugar onde ela estava, com o nome da janela embaixo.
2. **Given** uma janela minimizada, **When** o visitante abre o ícone, **Then** a janela cresce com
   animação de volta ao tamanho normal, com todo o conteúdo já exibido, sem digitar de novo.
3. **Given** uma janela aberta, **When** o visitante aciona `✕`, **Then** a janela encolhe até o
   mesmo tipo de ícone.
4. **Given** uma janela fechada, **When** o visitante abre o ícone, **Then** a janela cresce de volta
   e os comandos são digitados de novo, com a saída aparecendo depois de cada um, como na primeira
   entrada na tela.
5. **Given** um visitante de teclado, **When** foca os controles da janela ou o ícone, **Then** cada
   um tem nome acessível (ex.: "Minimizar SRG", "Fechar SRG", "Abrir SRG") e responde a Enter e
   Espaço; depois de minimizar ou fechar, o foco vai para o ícone; depois de abrir, para a janela.
6. **Given** "reduzir movimento" ativo, **When** a janela minimiza, fecha ou abre, **Then** a troca
   acontece sem animação, e uma janela fechada reabre completa, sem digitação.
7. **Given** JavaScript desativado, **When** a página é exibida, **Then** todas as janelas ficam
   abertas, e os controles continuam só desenho.

---

### User Story 5 - Fundo CRT com a chuva Matrix no hero (Priority: P2)

*Itens 5 e 6 do autor.* A grade de quadrados sai do fundo do hero. No lugar, uma tela de tubo (CRT
Warp, com os parâmetros do autor) exibe a chuva Matrix, que passa a usar letras maiúsculas e
minúsculas, números e caracteres especiais em vez de katakana. O tubo deforma levemente seguindo o
ponteiro.

**Why this priority**: é o visual mais marcante da primeira dobra, mas o conteúdo do hero não muda.

**Independent Test**: abrir o hero em desktop e celular e verificar a chuva com caracteres latinos
dentro do efeito de tubo (curvatura, scanlines, brilho, vinheta), a deformação com o ponteiro e o
texto do hero legível; repetir com "reduzir movimento", sem JavaScript e com WebGL indisponível.

**Acceptance Scenarios**:

1. **Given** o hero com movimento permitido, **When** exibido, **Then** o fundo é uma tela de tubo
   com curvatura, scanlines, brilho difuso, ruído e vinheta, mostrando a chuva Matrix, sem a grade de
   quadrados.
2. **Given** a chuva, **When** observada, **Then** só aparecem letras latinas maiúsculas e
   minúsculas, algarismos e caracteres especiais (ex.: `*&%$#@`), sem katakana.
3. **Given** um ponteiro (mouse) sobre o hero, **When** ele se move, **Then** o tubo deforma
   suavemente na direção do ponteiro.
4. **Given** o fundo animado, **When** o texto do hero é lido, **Then** nome, prompt e tagline mantêm
   contraste mínimo de 4,5:1 em qualquer quadro, e o contorno dos botões não fica menos visível que
   sobre o fundo estático.
5. **Given** "reduzir movimento", JavaScript desativado ou navegador sem WebGL, **When** o hero é
   exibido, **Then** o fundo é estático (os degradês atuais, sem a grade), sem erro no console.
6. **Given** o hero fora da tela ou a aba em segundo plano, **When** o visitante está em outra
   seção, **Then** o fundo não anima.

---

### User Story 6 - Faixas de skills largas e legíveis (Priority: P2)

*Itens 11 e 13 do autor.* As fitas dos loops de skills passam a atravessar a tela inteira, de borda
a borda, com o texto e os ícones no dobro do tamanho. Os grupos `conceitos_web` e
`desenho_de_processos` correm da esquerda para a direita; os outros continuam da direita para a
esquerda.

**Why this priority**: o texto atual é pequeno demais para ler em movimento.

**Independent Test**: abrir a seção de skills em 320, 768, 1440 e 1920px e verificar as fitas de
borda a borda, sem rolagem horizontal, o texto no dobro do tamanho e a direção de cada grupo;
repetir com "reduzir movimento" e sem JavaScript.

**Acceptance Scenarios**:

1. **Given** a seção de skills em qualquer largura, **When** exibida, **Then** cada fita vai da borda
   esquerda à borda direita da janela do navegador, sem criar rolagem horizontal; o título de cada
   sub-parte continua alinhado ao conteúdo da página.
2. **Given** os itens dos loops, **When** exibidos, **Then** o texto e os ícones têm o dobro do
   tamanho atual.
3. **Given** os loops em movimento, **When** observados, **Then** `conceitos_web` e
   `desenho_de_processos` correm da esquerda para a direita, e os demais da direita para a esquerda.
4. **Given** "reduzir movimento", JavaScript desativado ou impressão, **When** a seção é exibida,
   **Then** todas as skills aparecem paradas e completas, no tamanho novo, quebrando em linhas dentro
   da fita.

---

### User Story 7 - Ajustes de conteúdo e acabamento (Priority: P3)

*Itens 7, 8, 9, 10 e 14 do autor.* O rodapé fica só com `$ echo "© 2026 Vittorio Perotto"`; o chip
`JSON de tema` vira `JSON`; o sublinhado do badge de downloads de cada tema VS Code fica na cor
daquele tema; o Valkey ganha o próprio logotipo; o papel no ItaliaMi vira "Autor e desenvolvedor".

**Why this priority**: são correções pontuais de texto e cor, sem risco para o resto da página.

**Independent Test**: conferir o rodapé, o cartão dos Temas VS Code (chip e sublinhados), o ícone do
Valkey no chip do SRG e no loop de `devops_qualidade`, e o papel no cartão do ItaliaMi.

**Acceptance Scenarios**:

1. **Given** o rodapé, **When** exibido, **Then** contém só `$ echo "© 2026 Vittorio Perotto"` (com o
   ano corrente), sem o crédito da stack nem a linha `process finished with exit code 0`.
2. **Given** o cartão dos Temas VS Code, **When** exibido, **Then** a stack mostra o chip `JSON`.
3. **Given** os badges de downloads, **When** exibidos, **Then** o sublinhado do Grape Glass está na
   cor do Grape Glass e o do Shadow Lord no vermelho do Shadow Lord.
4. **Given** o chip Valkey (projeto SRG) e o item Valkey do loop `devops_qualidade`, **When**
   exibidos, **Then** mostram o logotipo do Valkey na cor do texto, no lugar do ícone genérico.
5. **Given** o cartão do ItaliaMi, **When** exibido, **Then** `papel = Autor e desenvolvedor`.

---

### User Story 8 - Dependências nas versões mais novas (Priority: P3)

*Item 15 do autor.* As dependências do projeto passam para as versões mais novas publicadas (as que
o Dependi aponta), com os dois lockfiles atualizados, sem quebrar o build, os testes nem o site.

**Why this priority**: manutenção, invisível para o visitante.

**Independent Test**: comparar cada dependência declarada com a versão mais nova do registro, rodar
o build e todos os testes, e comparar o site publicado com o anterior.

**Acceptance Scenarios**:

1. **Given** a lista de dependências, **When** comparada com o registro, **Then** cada uma está na
   versão mais nova, exceto TypeScript, @unhead/vue e beasties, que ficam na última versão
   compatível, cada uma com o motivo registrado.
2. **Given** as dependências atualizadas, **When** o build e todos os testes rodam, **Then** passam,
   e o HTML publicado continua com todo o conteúdo e os mesmos metadados.

---

### Edge Cases

- **Ctrl+Alt+T capturado pelo sistema** (Ubuntu e outros Linux): o atalho não chega à página; o ícone
  da dock continua abrindo o terminal. Por decisão do autor, não há segundo atalho, e o site não
  tenta disputar o atalho com o sistema.
- **Atalho com o foco num campo de texto**: o único campo da página é o do próprio terminal; dentro
  dele, Ctrl+Alt+T também fecha o terminal.
- **Terminal aberto e mudança de seção** (pela rolagem ou por `find`): o terminal continua aberto até
  o visitante fechá-lo (`exit`, ✕, Esc, Ctrl+Alt+T ou dock).
- **`find` com variações de escrita**: `find Experiência`, `find experiencia` e `find ~/experiencia`
  levam à mesma seção (sem diferenciar maiúsculas, acentos nem o prefixo `~/` do menu).
- **`find` sem opção**: mostra o uso (`find <OPTIONS>`) e as opções.
- **Linha vazia**: Enter só mostra um novo prompt.
- **Saída longa no terminal** (vários `help`): a área de saída rola por dentro e não cresce além da
  altura máxima do terminal.
- **Celular**: o terminal ocupa a largura da tela; o teclado virtual não cobre a linha do prompt;
  Tab não existe, então a sugestão de autocompletar pode ser tocada.
- **Dock sobre o conteúdo**: a dock nunca cobre de forma permanente o fim da página: o rodapé e o
  último conteúdo ficam visíveis acima dela ao rolar até o fim. O "▼ scroll" do hero não fica sob a
  dock.
- **Dock durante o boot**: não aparece enquanto a tela de boot está ativa.
- **Janela minimizada e link de âncora**: navegar até uma seção cuja janela está minimizada mostra o
  ícone no lugar dela; a janela não abre sozinha.
- **Janela fechada antes de terminar a digitação**: ao reabrir, a digitação recomeça do início.
- **Minimizar durante a digitação**: ao reabrir, a janela volta completa (a digitação é concluída).
- **Clique repetido durante a animação** de minimizar ou abrir: a animação em curso termina no estado
  pedido por último, sem quebrar o layout.
- **Recarregar a página**: todas as janelas voltam abertas (o estado não é guardado entre visitas).
- **Grade dos projetos com uma janela minimizada**: o ícone ocupa o lugar da janela, e as janelas
  seguintes sobem; nada se sobrepõe.
- **Impressão**: janelas minimizadas ou fechadas saem completas no papel; a dock e o terminal não
  são impressos; o header não é impresso fixo.
- **Rolagem até o meio da página e recarga**: o header aparece se o hero não está na tela no
  carregamento.
- **Menu aberto no celular e volta ao hero**: o menu fecha junto com o header.
- **WebGL indisponível ou contexto perdido** (Faulty Terminal ou CRT): o fundo cai para o estático,
  sem erro no console; o boot continua com o fundo liso.
- **Celular lento**: o fundo CRT respeita o teto de 24 quadros por segundo e a resolução reduzida;
  o boot continua dentro do teto de tempo.
- **Toque no hero** (sem ponteiro): o tubo fica na posição neutra; a deformação não segue o dedo.
- **"Reduzir movimento" ligado no meio da visita**: fundos animados param e caem para o estático;
  terminal e janelas passam a abrir e fechar sem animação.
- **Fita de skills em 320px com texto dobrado**: os itens continuam numa linha só com movimento; sem
  movimento, quebram em linhas sem cortar nenhum nome.
- **Logotipo do Valkey indisponível na fonte**: não se aplica durante a visita, porque o arquivo é
  copiado para o site no build (Princípio III).

## Requirements *(mandatory)*

### Functional Requirements

**Janelas que minimizam e fecham (item 1)**

- **FR-001**: Em toda janela de terminal (Sobre, os seis projetos e Contato), os controles `−`
  (minimizar) e `✕` (fechar) MUST ser botões funcionais, com nome acessível que inclui o título da
  janela ("Minimizar sobre.txt", "Fechar SRG"). O controle `□` continua decorativo.
- **FR-002**: Minimizar ou fechar MUST encolher a janela, com animação, até um ícone de área de
  trabalho no lugar dela: um quadrado com um ícone dentro e, embaixo, o título da janela. O ícone
  segue o tipo da janela: documento em `sobre.txt`, script em `contato.sh` e pasta de código nas
  janelas de projeto. O espaço
  que a janela ocupava MUST ser liberado (o conteúdo seguinte sobe).
- **FR-003**: Abrir o ícone (clique, toque, Enter ou Espaço) MUST fazer a janela crescer, com
  animação, de volta ao tamanho normal no mesmo lugar.
- **FR-004**: Uma janela que foi **minimizada** MUST reabrir com todo o conteúdo já exibido, sem
  digitação; se estava digitando ao minimizar, reabre completa.
- **FR-005**: Uma janela que foi **fechada** MUST reabrir "recarregando": os comandos são digitados
  de novo e cada saída aparece depois do seu comando, com o mesmo ritmo e o mesmo teto de tempo da
  primeira entrada na tela (feature 002).
- **FR-006**: As animações de encolher e de crescer MUST durar no máximo 400 ms cada.
- **FR-007**: Depois de minimizar ou fechar, o foco MUST ir para o ícone; depois de abrir, para a
  janela (o primeiro controle dela). O ícone MUST ser um botão com nome acessível ("Abrir SRG").
- **FR-008**: Com "reduzir movimento", minimizar, fechar e abrir MUST acontecer sem animação, e uma
  janela fechada MUST reabrir completa, sem digitação.
- **FR-009**: Sem JavaScript, as janelas MUST ficar sempre abertas, e os controles continuam
  decorativos (fora da árvore de acessibilidade).
- **FR-010**: Toda visita MUST começar com todas as janelas abertas; o estado de minimizada ou
  fechada não é guardado.
- **FR-011**: Na impressão, toda janela MUST sair aberta e completa.

**Header só depois do hero (item 2)**

- **FR-012**: Com JavaScript, o header MUST ficar oculto (invisível e sem poder ser clicado; os links
  continuam alcançáveis pelo Tab, e o foco revela o header, FR-013) enquanto o hero está na tela, e MUST aparecer, com uma transição de no máximo
  300 ms, assim que o hero sai da tela; ao voltar ao hero, MUST sumir.
- **FR-013**: Se um elemento do header receber foco pelo teclado com o header oculto, o header MUST
  aparecer enquanto o foco estiver nele.
- **FR-014**: Entre o fim do hero e o título da seção Sobre MUST haver um espaço vazio de cerca de
  metade da altura da janela do navegador (50%, ±5%), no lugar do espaçamento atual, para o header
  surgir sem cobrir o título da seção Sobre. Vale com e sem JavaScript.
- **FR-015**: Ao chegar a uma seção por âncora (botões do hero, terminal, endereço com `#secao`), o
  título da seção MUST ficar visível abaixo do header.
- **FR-016**: Sem JavaScript, a navegação MUST ficar como hoje (no fluxo, com os links expostos);
  com "reduzir movimento", o header aparece e some sem transição.

**Header centralizado, dock e terminal (item 3)**

- **FR-017**: O prompt `viper@portfolio:~$▊` MUST sair do header. Os links das seções MUST ficar
  centralizados no header em todas as larguras; abaixo de 840px, o botão do menu também fica no
  centro.
- **FR-018**: Com JavaScript, uma dock MUST ficar fixa no centro da parte inferior da tela, depois do
  boot, com um botão de ícone de terminal ("Abrir terminal", com o atalho no nome acessível ou na
  dica).
- **FR-019**: Clicar no ícone da dock ou apertar Ctrl+Alt+T MUST abrir o terminal, subindo a partir
  da dock com animação (sem animação com "reduzir movimento"), e pôr o foco no prompt. O terminal
  MUST ter uma barra de título com um botão ✕ ("Fechar terminal"). Rodar `exit`, clicar no ✕,
  apertar Esc, apertar Ctrl+Alt+T ou clicar de novo no ícone da dock MUST fechar o terminal,
  descendo até a dock, e devolver o foco ao ícone da dock.
- **FR-020**: O terminal MUST exibir o prompt `viper@portfolio:~$▊` e aceitar comandos digitados; a
  saída de cada comando aparece acima do prompt seguinte, como num shell. A área de saída MUST rolar
  por dentro e ser anunciada a leitores de tela.
- **FR-021**: O comando `help` MUST listar os comandos disponíveis e explicar o `find <OPTIONS>`: o
  que ele faz e a lista de opções aceitas.
- **FR-022**: O comando `find <opção>` MUST levar a página até a seção correspondente, com as opções
  `sobre`, `experiencia`, `skills`, `projetos`, `educacao` e `contato` (as seções do menu), e
  mostrar na saída para onde foi. O terminal MUST continuar aberto, com o foco no prompt, e o título
  da seção MUST ficar visível entre o header e o terminal. A opção MUST ser reconhecida sem
  diferenciar maiúsculas, acentos nem o prefixo `~/`. Seção que não existe na página (coleção vazia)
  não é opção.
- **FR-023**: `find` sem opção MUST mostrar o uso e as opções; opção inválida e comando desconhecido
  MUST mostrar uma mensagem de erro no estilo de shell que indica o `help`.
- **FR-024**: O terminal MUST autocompletar comandos e opções do `find`: Tab completa quando há uma
  só possibilidade e lista as possibilidades quando há várias; enquanto o visitante digita, a
  sugestão aparece e MUST poder ser aceita com Tab ou por toque.
- **FR-025**: O terminal MUST aceitar também `clear` (limpa a saída) e `exit` (fecha o terminal), e
  as setas ↑/↓ MUST percorrer os comandos já digitados na visita.
- **FR-026**: Sem JavaScript, a dock e o terminal MUST não existir no HTML visível. Na impressão,
  MUST não aparecer.
- **FR-027**: A dock e o terminal MUST nunca cobrir de forma permanente conteúdo do currículo: ao
  rolar até o fim, o rodapé fica inteiro acima da dock; o "▼ scroll" do hero fica acima da dock.

**Boot com Faulty Terminal e sem pulo (itens 4 e 12)**

- **FR-028**: A tela de boot MUST ter ao fundo o Faulty Terminal do Vue Bits com: Scale 3, Digit Size
  3, Speed 1, Noise Amplitude 0,5, Brightness 0,5, Scanline Intensity 1,4, Curvature 0,2, reação ao
  mouse desligada e animação de carregamento ligada. A cor vem dos tokens do tema.
- **FR-029**: O texto da sessão SSH MUST ficar legível sobre o Faulty Terminal (contraste mínimo de
  4,5:1 com o fundo imediato do texto).
- **FR-030**: A sessão MUST ser exibida inteira, até `./iniciar_portfolio.sh` digitado por completo,
  em toda visita em que o boot aparece; o boot MUST nunca sair no meio da sequência.
- **FR-031**: Nenhum gesto (clique, toque ou tecla) MUST pular o boot, e a dica "pressione qualquer
  tecla para pular" MUST sair. A sequência MUST manter o ritmo atual de digitação e de pausas.
- **FR-032**: A página MUST ficar totalmente descoberta (saída do boot concluída) em no máximo
  7 s contados do início da navegação. Se o
  JavaScript chegar tarde demais para a sequência caber inteira nesse teto, o boot MUST não aparecer
  (a página aparece direto); se o JavaScript não rodar, a capa MUST sair sozinha dentro do mesmo
  teto (na prática, assim que o boot já não cabe, ~2,1 s depois do início da navegação).
- **FR-033**: Com "reduzir movimento", sem JavaScript ou sem WebGL: sem boot nos dois primeiros
  casos (como hoje); sem WebGL, o boot aparece com o fundo liso.

**Fundo CRT com a chuva Matrix (itens 5 e 6)**

- **FR-034**: A grade de quadrados MUST sair do fundo do hero, em todos os modos.
- **FR-035**: Com movimento e WebGL, o fundo do hero MUST ser o CRT Warp do Vue Bits exibindo a chuva
  Matrix como a imagem da tela, com: Curvature 0,3, Scanline Strength 1, Bloom 3, Bloom Radius 3,
  Brightness 1, resolução de renderização 0,75× (Performance), Pointer Warp ligado com força 1,5,
  Wave Amount 0, Wave Density 2,5, Scanline Density 270, Noise 0,125, RGB Shift 0,01, teto de 24
  quadros por segundo, sem pausa, Speed 0,3, Vignette 0,5 e sem pixelização (Smooth).
- **FR-036**: As cores do fundo CRT e da chuva MUST vir dos tokens do tema (a chuva continua
  alternando o verde e o roxo atuais sobre o fundo da página).
- **FR-037**: A chuva Matrix MUST usar só letras latinas maiúsculas e minúsculas, algarismos de 0 a 9
  e caracteres especiais do teclado (ex.: `* & % $ # @ ! ? + = - < > [ ] { } / \ | ~ ^ ;`), sem
  katakana nem outro alfabeto.
- **FR-038**: O texto do hero (inclusive o rótulo dos botões) MUST manter contraste mínimo de 4,5:1
  sobre o fundo CRT, em qualquer quadro, e o contorno dos botões MUST ficar pelo menos tão visível
  quanto sobre o fundo estático (o rótulo de texto é o que identifica o botão; o contorno do botão
  principal já tinha 2,9:1 sobre o fundo liso, research R13).
- **FR-039**: O fundo CRT MUST não animar com o hero fora da tela ou com a aba em segundo plano; com
  "reduzir movimento" (inclusive se ligado no meio da visita), sem JavaScript ou sem WebGL, o fundo
  MUST ser estático (os degradês atuais), sem erro no console.

**Rodapé (item 7)**

- **FR-040**: O rodapé MUST conter só a linha `$ echo "© <ano corrente> Vittorio Perotto"` (em 2026:
  `© 2026 Vittorio Perotto`), com o `$` como nos demais prompts.

**Chip JSON (item 8)**

- **FR-041**: A tecnologia `JSON de tema` MUST passar a se chamar `JSON` em todos os lugares em que
  aparece, mantendo o ícone atual.

**Sublinhado dos badges (item 9)**

- **FR-042**: O sublinhado tracejado sob o badge de downloads do Grape Glass Theme MUST usar o roxo do
  tema Grape Glass, e o do Shadow Lord o vermelho do tema Shadow Lord, ambos vindos dos tokens;
  se o badge não carregar, o domínio exibido no lugar recebe o mesmo sublinhado colorido.

**Logotipo do Valkey (item 10)**

- **FR-043**: O ícone do Valkey (chips e loop de skills) MUST ser o logotipo do arquivo
  `svg/valkey.svg` do repositório homarr-labs/dashboard-icons, numa cor só (a do texto), seguindo as
  regras de ícone da feature 003 (arquivo no próprio site, decorativo, mesma altura do texto). A
  origem e a licença (Apache-2.0) MUST ficar registradas junto às dos demais ícones.

**Loops de skills (itens 11 e 13)**

- **FR-044**: Cada fita de loop MUST ocupar a largura inteira da janela do navegador, de borda a
  borda, sem criar rolagem horizontal; os títulos das sub-partes continuam alinhados ao conteúdo da
  página.
- **FR-045**: O texto e o ícone de cada item dos loops MUST ter o dobro do tamanho atual (de 0,85rem
  para 1,7rem), com e sem movimento, mantendo o contraste.
- **FR-046**: Os loops de `conceitos_web` e `desenho_de_processos` MUST correr da esquerda para a
  direita; os demais continuam da direita para a esquerda. A direção de cada grupo MUST ser definida
  junto aos dados do grupo. Os demais comportamentos (pausa com o ponteiro, só animar na tela, lista
  única para leitor de tela, versão parada) não mudam.

**Papel no ItaliaMi (item 14)**

- **FR-047**: O papel do projeto ItaliaMi MUST ser "Autor e desenvolvedor".

**Dependências (item 15)**

- **FR-048**: Cada dependência declarada do projeto MUST estar na versão mais nova publicada no
  registro na data da implementação. Quando a mais nova for incompatível com o resto da stack (hoje:
  TypeScript 7, @unhead/vue 3 e beasties 0.5), a dependência MUST ficar na última versão compatível,
  com o motivo e a condição para revisitar registrados no plano. O `package-lock.json` e o
  `pnpm-lock.yaml` MUST ficar atualizados e coerentes entre si.
- **FR-049**: Depois da atualização, o build, os testes unitários, de componente e e2e MUST passar, e
  o site publicado MUST manter conteúdo, metadados e comportamento.

**Gerais**

- **FR-050**: Nenhum recurso novo MUST ser carregado de terceiros durante a visita (fundos animados,
  terminal e logotipo do Valkey vêm dos arquivos do site).
- **FR-051**: Todo efeito novo MUST respeitar "reduzir movimento", inclusive quando a preferência
  muda no meio da visita, e o console MUST ficar sem erros em todos os modos.

### Key Entities

- **Janela de terminal**: título, tipo (documento, script ou projeto, que escolhe o ícone de área de
  trabalho), estado (aberta, minimizada, fechada) e
  se a próxima abertura digita de novo.
- **Comando do terminal**: nome, descrição para o `help`, opções aceitas (no `find`, as seções da
  página) e a resposta.
- **Seção navegável**: identificador (`sobre`, `experiencia` …), rótulo do menu (`~/sobre`) e se
  existe na página; é a mesma lista do header e das opções do `find`.
- **Grupo de skills**: ganha a direção do loop (da direita para a esquerda, padrão, ou da esquerda
  para a direita).
- **Tecnologia**: `JSON de tema` passa a `JSON`; Valkey passa a ter ícone de logotipo próprio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das visitas com boot (20 recargas em desktop e 20 em celular com CPU 4× mais
  lenta), a sessão SSH aparece inteira até o último caractere de `./iniciar_portfolio.sh`, e a página
  fica descoberta em até 7 s contados do início da navegação (FR-032).
- **SC-002**: Um visitante chega a qualquer seção pelo terminal com no máximo 3 ações depois de abri-lo
  (digitar o começo da seção, Tab, Enter), e o `help` basta para descobrir o `find` sem nenhuma
  outra instrução.
- **SC-003**: O header nunca está visível com qualquer parte do hero na tela, e aparece em até 300 ms
  depois que o hero sai; no instante em que ele aparece, o título da seção Sobre está inteiro abaixo
  dele (o header surge no espaço vazio, não sobre o título).
- **SC-004**: Minimizar, fechar e abrir uma janela levam no máximo 400 ms cada; a janela minimizada
  reabre 100% completa na hora, e a fechada termina de digitar em até 2,5 s.
- **SC-005**: Em 10 quadros amostrados do hero animado, em desktop e celular, todo texto do hero tem
  contraste ≥ 4,5:1, e o contorno dos botões tem contraste ≥ 95% do que tem sobre o fundo estático.
- **SC-006**: O carregamento inicial continua ≤ 500 KB (badges externos excluídos), o elemento de
  maior conteúdo do hero continua no tempo atual (±10%), e nada é pedido a terceiros por causa dos
  recursos novos.
- **SC-007**: O texto dos loops de skills mede o dobro do atual, e as fitas cobrem 100% da largura da
  janela do navegador de 320px a 1920px, sem rolagem horizontal.
- **SC-008**: Zero violações na auditoria automática de acessibilidade e zero erros no console, nos
  modos normal, "reduzir movimento", sem JavaScript e sem WebGL, com o terminal aberto e com janelas
  minimizadas.
- **SC-009**: 100% das dependências estão na versão mais nova publicada ou numa exceção registrada
  com motivo, e 100% dos testes passam depois da atualização.

## Assumptions

- **Numeração**: esta feature é a 004. O boot dentro de um dispositivo (`specs/insumos/
  002-boot-dispositivo.md`, plano 09), que estava reservado como 004, passa a ser a 005, e terá de
  ser revisto à luz desta feature (fundo Faulty Terminal e boot sem pulo).
- **Ícone de área de trabalho**: aparece no lugar exato da janela, alinhado ao início do espaço que
  ela ocupava, com um único clique (ou toque) para abrir, como se espera na web (clique duplo não
  existe no toque). Os ícones do quadrado (documento, script, pasta de código) vêm do conjunto já usado
  no site (Lucide), e o nome embaixo é o título da janela (`sobre.txt`, `SRG`, `contato.sh`).
- **Minimizar e fechar** produzem o mesmo ícone; só a reabertura difere (FR-004 × FR-005).
- **`□` (maximizar)** não foi pedido e continua decorativo.
- **Header**: "sair do hero" é o momento em que a borda inferior do hero passa da borda inferior do
  header (o header nunca se sobrepõe ao hero). Vale também no celular.
- **Dock**: só o ícone de terminal; o texto `viper@portfolio:~$` aparece no terminal e na dica do
  ícone. A dock fica visível também sobre o hero.
- **Cores não informadas**: o Faulty Terminal usa o verde do tema (o demo usa um verde claro); o CRT
  usa o fundo da página e as cores atuais da chuva (verde e roxo). Os valores vêm dos tokens.
- **"Efeito com as letras do Matrix"**: a chuva Matrix é a imagem que o tubo CRT exibe; o efeito do
  tubo (curvatura, scanlines, bloom, RGB shift, ruído, vinheta e deformação pelo ponteiro) se aplica
  às letras.
- **Ano do rodapé**: continua o ano corrente (hoje 2026), como no FR-013 da 001.
- **Cor do Grape Glass**: o roxo do badge do tema (o roxo de destaque do site), e não o verde do nome
  com neon: o sublinhado de hoje já é verde, e o pedido implica mudar as duas cores.
- **Mudança no papel do ItaliaMi**: decisão do autor; o PDF do currículo é atualizado por ele (regra combinada
  com o autor em 2026-10-07: quando divergem, o site está certo).
- **Dependências**: "as versões mais novas que o Dependi diz" são as versões mais novas publicadas no
  registro npm (o que a extensão Dependi mostra), consultadas no dia da implementação.
- **Sem JavaScript**: nada desta feature existe; a página é a de hoje, sem a grade do hero, com o
  rodapé novo, o chip JSON, os sublinhados coloridos, o logotipo do Valkey, o papel do ItaliaMi e as
  fitas largas com texto maior.
