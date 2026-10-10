# Feature Specification: Comando `open`, terminal da dock minimizável, vinheta original do Letter Glitch e ajustes de texto

**Feature Branch**: `001-vue-resume-refactor` (nenhum branch criado: não há hook `before_specify`
configurado, e a 007 parte do estado da 006, que ainda não foi para a `main`)

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: cinco pedidos do autor, enviados de uma vez:

1. "Adicione um novo comando, o `open <OPTIONS>`, com ele, será possível abrir e ser redirecionado
   para a opção em específico. Somente será possível abrir os itens de projetos, experiencia
   (maximizados), challenges (maximizadas), comunitario (maximizados)"
2. "Adiciona a opção de minimizar no terminal da dock"
3. "Use a vinheta do centro original do Letter Glitch para o hero, a que foi colocada extrapola o
   aceitável e não deveria ter passado."
4. "A descrição do Sobre (Analista de ...) está com a cor de comentário, adicionar a cor branca padrão
   de escrita, igual nos outros terminais."
5. "Mude o texto 'Transformando processos em sistemas escaláveis — de APIs a agentes de IA.' para
   'Transformando processos em sistemas escaláveis'"

## Contexto

### Situação atual

- **Terminal da dock** (004 FR-017 a FR-027): aceita `help`, `find <OPTIONS>`, `clear` e `exit`. O
  `find` leva a página até uma das seções do menu (`sobre`, `experiencia`, `skills`, `projetos`,
  `educacao`, `contato`) e o terminal continua aberto, com o foco no prompt. Tab completa comandos e
  opções do `find`; ↑ e ↓ percorrem os comandos já digitados.
- **Fechar o terminal**: `exit`, o ✕, Esc, Ctrl+Alt+T e um novo clique no botão da dock fecham o
  terminal, que desce até a dock, e o foco volta ao botão da dock. Fechar apaga a sessão: ao abrir de
  novo, a saída e o histórico de comandos estão vazios. O `−` da barra de título é só desenho (o
  terminal não minimiza), e o `□` aparece desativado (006 FR-025). Enquanto o terminal está aberto, o
  botão da dock mostra um ponto embaixo.
- **Janelas da página**: Sobre (`sobre.txt`), os 6 projetos (uma janela por projeto, com o nome dele
  no título: SRG, Temas VS Code, ItaliaMi, OCR de Prontuários, QClass-BOT, Monitor de Curso) e Contato
  (`contato.sh`) minimizam e fecham até um ícone de área de trabalho (004). As três janelas de editor,
  Experiência (`~/carreira`), Challenges (`~/projetos/challenges`) e Comunitário
  (`~/projetos/comunitario`), também maximizam (006): maximizada, a janela cobre quase toda a tela, é um
  diálogo modal (a página, a dock e o terminal da dock ficam desfocados e inalcançáveis), mostra a
  árvore e os cartões da seção, e Esc, o `□` ou um clique fora a restauram, com o foco no `□`.
- **Hero**: fundo Letter Glitch (006) com as letras a 55% de opacidade e a vinheta central calibrada
  pela 006 (preto a 96% no centro, 90% até 40% do raio, transparente aos 80%), mais escura e maior que
  a do componente (preto a 80% no centro, transparente aos 60% do raio). A vinheta das bordas é a do
  componente. O pior texto do hero ficou em 5,4:1 (a tagline). Pela conta da 006 (research R12), com a
  vinheta central do componente, a tagline (Dim Lilac) cairia para ~2:1 sobre uma letra verde perto da
  borda do bloco de texto.
- **Tagline do hero**: "Transformando processos em sistemas escaláveis — de APIs a agentes de IA.", em
  Dim Lilac, revelada aos poucos depois da porta de acesso.
- **Sobre**: o texto que `cat sobre.txt` mostra ("Analista de Sistemas e Desenvolvedor Fullstack. …")
  é saída de comando na cor esmaecida (Dim Lilac, a mesma dos comentários `#` e das linhas de comando,
  003 FR-004), com "TypeScript" e "Vue" em verde. Nas janelas de projeto, a descrição do projeto está
  na cor padrão do texto (o branco do tema).
- **Versão**: `package.json` em `2.5.0` (exibida `v2.5` na sessão da porta, 005 FR-016).

### Relação com a constituição (v3.0.0)

- **Princípio I (Fidelidade ao Currículo)**: a tagline não é cargo, empresa, período, formação nem
  tecnologia; encurtá-la não inventa nem infla nada. Nenhum outro dado muda.
- **Princípio II (Projetos Demonstráveis)**: o `open` só abre e mostra janelas que já existem; links,
  evidências e a ordem dos projetos não mudam.
- **Princípio III (Saída Estática)**: o terminal da dock continua só existindo com JavaScript
  (004 FR-026); sem JavaScript, nada desta feature aparece, exceto a cor do Sobre e a tagline, que estão
  no HTML. Nenhum recurso novo de terceiros.
- **Princípio IV (Acessibilidade e Desempenho)**: o `open` e o minimizar são operáveis por teclado e
  leitor de tela; as transições duram no máximo 400 ms e não existem com "reduzir movimento"; a
  janela maximizada pelo `open` segue as regras de diálogo modal da 006. O texto do hero continua com
  contraste mínimo de 4,5:1 (005 FR-032, 006 FR-032) com a vinheta central original (FR-021).
- **Princípio V (Identidade Visual Coerente)**: o Sobre passa a usar a cor padrão de texto dos outros
  terminais; nenhuma cor nova fora dos tokens.

### Requisitos de features anteriores que esta feature substitui

- **004 FR-019**: o `−` do terminal da dock passa a minimizar (FR-010); com o terminal aberto, o botão
  da dock e o Ctrl+Alt+T minimizam em vez de fechar (FR-016, Q2). `exit`, o ✕ e Esc continuam
  fechando (FR-014).
- **004 FR-021 a FR-024** e o contrato `terminal-commands.md` da 004: o `help` e o autocompletar passam
  a incluir o `open` (FR-007, FR-008).
- **004 FR-022** (o terminal continua aberto depois do `find`): continua valendo para o `find`; depois
  do `open`, o terminal minimiza sozinho (FR-004, FR-005, clarify).
- **006 FR-025**, quanto ao terminal da dock: o `−` deixa de ser desenho; o `□` continua desativado.
- **006 FR-032**, quanto à vinheta central: volta à do componente (FR-018); o contraste passa a vir de
  um halo justo nas letras do texto do hero (FR-021, Q3), e as letras do fundo ficam como estão.
- **003 FR-004**, quanto ao texto do Sobre: a saída de `cat sobre.txt` sai do Dim Lilac (FR-022).
- **006 FR-045**: a versão sobe para `2.6.0` (FR-026).

## Clarifications

### Session 2026-10-09 (specify)

- Q1: No `open`, o que conta como opção para experiência, challenges e comunitário? → A: Só as três
  janelas: `open experiencia`, `open challenges` e `open comunitario` abrem a janela de editor
  maximizada, no item já aberto; os itens de dentro delas não são opções. Projetos: uma opção por
  janela de projeto. São 9 opções hoje.
- Q2: Com o terminal da dock aberto, o que o clique no botão da dock e o Ctrl+Alt+T fazem? → A:
  Minimizam, como numa barra de tarefas, guardando a sessão; o próximo clique ou atalho restaura. Fechar
  (e apagar a sessão) fica com o ✕, o `exit` e o Esc.
- Q3: Com a vinheta central original, como manter o contraste de 4,5:1 do texto do hero? → A: Um halo
  escuro justo em volta das letras do texto do hero (sombra do texto), sem faixa nem caixa escura; as
  letras do fundo continuam com a opacidade de hoje.

### Session 2026-10-09 (clarify)

- Q: Depois de um `open`, o terminal da dock continua aberto (como depois do `find`) ou minimiza sozinho
  para mostrar a janela aberta? → A: Minimiza sozinho, guardando a sessão; o foco vai para a janela
  aberta (no editor maximizado, para dentro do diálogo, e ao restaurar ele volta ao `□`, como na 006).
  Para voltar ao terminal, o visitante usa a dock ou o Ctrl+Alt+T.
- Q: Como o botão da dock mostra que o terminal está minimizado? → A: Com o mesmo ponto de "aberto", só
  que vazado (só o contorno) ou esmaecido; aberto, o ponto verde cheio de hoje; fechado, sem ponto.
- Q: Que nomes os projetos têm como opções do `open`? → A: O nome exibido do projeto em slug (minúsculas,
  sem acentos, hífen no lugar de espaços e símbolos): `srg`, `temas-vs-code`, `italiami`,
  `ocr-de-prontuarios`, `qclass-bot`, `monitor-de-curso`; gerados dos dados, sem lista escrita à mão.
- Q: Como o terminal da dock some ao minimizar? → A: Encolhe até o botão da dock e entra nele, como as
  janelas da página encolhem até o ícone; ao restaurar, cresce a partir do botão. Fechar continua com a
  descida curta de hoje.
- Q: O halo escuro vai em todo texto do hero ou só onde a medição exigir? → A: Só nos textos que, medidos
  sem halo, ficam abaixo de 4,5:1 (provavelmente a tagline e a linha do prompt); o nome com glitch e os
  botões ficam como estão.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir uma janela pelo terminal com `open` (Priority: P1)

*Item 1 do autor.* No terminal da dock, o visitante digita `open` e o nome de um projeto, ou
`experiencia`, `challenges` ou `comunitario`. A página vai até a janela pedida e a abre: a janela de um
projeto aparece aberta (mesmo se estava minimizada ou fechada); a janela de editor da Experiência, dos
Challenges ou do Comunitário abre maximizada. Outras seções não são abertas pelo `open` (para elas
existe o `find`).

**Why this priority**: é o único pedido que acrescenta uma função nova; os outros são ajustes.

**Independent Test**: no terminal da dock, rodar `open` com cada opção, a partir de qualquer ponto da
página, com a janela aberta, minimizada e fechada; conferir onde a página para, o estado da janela, a
saída do terminal e o foco; repetir com `open` sem opção, com opção inválida e com uma seção que não é
opção; repetir no celular e com "reduzir movimento".

**Acceptance Scenarios**:

1. **Given** o terminal da dock aberto no hero, **When** o visitante roda `open italiami`, **Then** a
   saída mostra para onde foi, o terminal minimiza sozinho (guardando a sessão), a página rola até a
   janela do ItaliaMi, com a barra de título dela logo abaixo do header, e o foco vai para a janela.
2. **Given** a janela de um projeto minimizada ou fechada, **When** o visitante roda `open` com esse
   projeto, **Then** a janela reabre como se o ícone tivesse sido clicado (minimizada: completa;
   fechada: digita os comandos de novo, sem piscar) e a página rola até ela.
3. **Given** o terminal da dock aberto, **When** o visitante roda `open experiencia`, **Then** a página
   vai até a seção Experiência, o terminal minimiza sozinho, e a janela de editor dela abre maximizada
   (árvore e cartões da seção), com a página por trás desfocada e inalcançável e o foco dentro dela; ao
   restaurar (Esc, `□`, clique fora), a janela volta ao lugar dela, a página continua na seção
   Experiência, o foco fica no `□` (006 FR-017) e o terminal continua minimizado, com a sessão
   guardada.
4. **Given** a janela de editor dos Challenges fechada, **When** o visitante roda `open challenges`,
   **Then** ela reabre já completa e maximizada, sem digitar o comando de novo.
5. **Given** o terminal da dock, **When** o visitante roda `open sobre` (ou `skills`, `projetos`,
   `educacao`, `contato`), **Then** nada abre, e a saída explica que essa seção não é aberta pelo `open`
   e sugere o `find`.
6. **Given** o terminal da dock, **When** o visitante digita `open it` e aperta Tab, **Then** a linha é
   completada para `open italiami`; `help` lista o `open` e as opções dele.

---

### User Story 2 - Minimizar o terminal da dock sem perder a sessão (Priority: P1)

*Item 2 do autor.* O `−` da barra do terminal da dock passa a funcionar: o terminal encolhe até o botão
da dock e some, guardando tudo o que estava nele. Ao restaurar, o visitante encontra a saída, o
histórico de comandos e o que estava digitando, exatamente como deixou.

**Why this priority**: completa a metáfora de janela do terminal (as outras janelas já minimizam) e é a
forma de tirar o terminal da frente sem perder a sessão, o que o `open` torna mais frequente.

**Independent Test**: abrir o terminal, rodar alguns comandos, deixar um comando pela metade, minimizar,
restaurar (pela dock e pelo atalho) e conferir saída, histórico (↑/↓), texto digitado e foco; depois
fechar e reabrir e conferir que a sessão começa vazia.

**Acceptance Scenarios**:

1. **Given** o terminal aberto com comandos já rodados e um comando pela metade, **When** o visitante
   clica no `−`, **Then** o terminal encolhe até o botão da dock e some dentro dele, o foco vai para o
   botão da dock, e o botão indica que há um terminal minimizado (ponto vazado ou esmaecido).
2. **Given** o terminal minimizado, **When** o visitante clica no botão da dock ou aperta Ctrl+Alt+T,
   **Then** o terminal cresce de volta a partir do botão, com a mesma saída, o mesmo histórico de
   comandos e o mesmo texto pela metade, com o foco no prompt.
3. **Given** o terminal aberto, **When** o visitante roda `exit`, clica no ✕ ou aperta Esc, **Then** o
   terminal fecha como hoje, e a próxima abertura começa com a sessão vazia.
4. **Given** o terminal aberto, **When** o visitante clica no botão da dock ou aperta Ctrl+Alt+T,
   **Then** o terminal minimiza, guardando a sessão (FR-016, Q2), e o próximo clique ou atalho o
   restaura.
5. **Given** "reduzir movimento", **When** o visitante minimiza ou restaura o terminal, **Then** a troca
   é imediata, sem animação.

---

### User Story 3 - Vinheta central original do Letter Glitch no hero (Priority: P2)

*Item 3 do autor.* A vinheta central do fundo do hero volta a ser a do Letter Glitch original, menor e
menos escura que a atual, deixando o glitch aparecer mais perto do texto, sem perder a legibilidade do
texto do hero.

**Why this priority**: é a primeira tela depois da porta, e o autor considera a vinheta atual
inaceitável; mas o conteúdo do hero já é legível hoje.

**Independent Test**: abrir o hero com movimento, comparar a vinheta central com a do componente (mesmo
tamanho e mesma intensidade), medir o contraste de todo texto do hero em vários quadros, em desktop e
celular.

**Acceptance Scenarios**:

1. **Given** um visitante com movimento, **When** a página é descoberta, **Then** o fundo do hero tem a
   vinheta central do Letter Glitch original (preto a 80% no centro, sumindo até 60% do raio) e a
   vinheta das bordas original, e as letras aparecem em volta do bloco de texto bem mais perto do
   centro do que hoje; o texto do hero tem um halo escuro justo em volta das letras, sem faixa nem
   caixa escura atrás dele (Q3).
2. **Given** o hero animado, **When** se amostra qualquer quadro, **Then** todo texto do hero mantém
   contraste mínimo de 4,5:1 (FR-021).
3. **Given** "reduzir movimento" ou sem JavaScript, **When** se observa o hero, **Then** o fundo
   continua o estático de hoje, sem mudança.

---

### User Story 4 - Texto do Sobre na cor padrão (Priority: P3)

*Item 4 do autor.* O texto do Sobre ("Analista de Sistemas e Desenvolvedor Fullstack. …") passa da cor
de comentário para o branco padrão do texto, como as descrições dos outros terminais.

**Why this priority**: ajuste de cor pequeno e independente.

**Independent Test**: comparar a cor do texto do Sobre com a da descrição de uma janela de projeto, com
e sem JavaScript.

**Acceptance Scenarios**:

1. **Given** a seção Sobre, **When** o visitante lê o texto de `cat sobre.txt`, **Then** ele está na
   mesma cor da descrição dos projetos (o branco do tema), com "TypeScript" e "Vue" ainda em verde, e as
   linhas de comando (`$ cat sobre.txt`, `$ whois vittorio --info`) continuam esmaecidas.

---

### User Story 5 - Tagline mais curta (Priority: P3)

*Item 5 do autor.* A tagline do hero passa a ser "Transformando processos em sistemas escaláveis".

**Why this priority**: troca de texto pequena e independente.

**Independent Test**: ler a tagline no hero com movimento, com "reduzir movimento" e sem JavaScript.

**Acceptance Scenarios**:

1. **Given** o hero, **When** a tagline termina de aparecer, **Then** o texto é exatamente
   "Transformando processos em sistemas escaláveis", sem o trecho "— de APIs a agentes de IA." e sem
   ponto final, em todos os modos.

### Edge Cases

- **`open` de um projeto que já está aberto e na tela**: a página rola só se o topo da barra de título
  dele não estiver entre a base do header e a metade da tela; a janela não muda.
- **`open` de um projeto no meio da animação de minimizar ou fechar**: a animação termina na hora, e a
  janela reabre como pelo ícone.
- **`open` de uma janela de editor minimizada ou fechada**: ela abre já completa (sem digitar o
  `code …`), porque a visão maximizada mostra os cartões, e então maximiza.
- **`open` de uma janela de editor**: o item aberto na árvore continua o que estava (o primeiro, se o
  visitante nunca escolheu outro); a lista de cartões já abre nele.
- **Projeto perto do fim da página** (a página não rola o bastante para pôr a janela no topo): a página
  rola até o fim, e a janela fica o mais alto possível.
- **Celular com o teclado virtual aberto**: o `open` funciona igual; o terminal minimiza, o foco sai do
  prompt, e o teclado virtual fecha.
- **Vários `open` seguidos**: depois de cada `open`, o terminal minimiza; o visitante o restaura (dock
  ou Ctrl+Alt+T) e roda o próximo, com a sessão (saída e histórico) preservada. Com uma janela
  maximizada, o terminal só pode ser restaurado depois de restaurá-la (Ctrl+Alt+T não tem efeito, e a
  dock fica inalcançável).
- **`open` que só mostra erro** (sem opção, opção inválida, seção que não é opção): o terminal continua
  aberto, com o foco no prompt; ele só minimiza quando algo é aberto.
- **Ctrl+Alt+T com uma janela maximizada**: continua sem efeito (006), com o terminal aberto,
  minimizado ou fechado.
- **Opção do `open` com maiúsculas, acentos ou `~/`** (`open ~/Experiência/`): reconhecida como no
  `find`.
- **Seção sem conteúdo** (ex.: nenhum challenge): a opção correspondente não existe.
- **Recarregar com o terminal minimizado**: toda visita começa com o terminal fechado e a sessão vazia.
- **Minimizar com o foco num botão de sugestão do autocompletar ou no `−`**: o foco vai para o botão da
  dock do mesmo jeito.
- **Dica da dock** (006 FR-026, FR-027): com o terminal minimizado, ela volta a aparecer no hover e no
  foco, como com o terminal fechado.
- **Tagline mais curta no celular de 320 px**: cabe sem rolagem horizontal; o espaço do hero se ajusta
  sem deslocar o resto além do texto que encolheu.
- **Impressão**: sem terminal e sem dock (como hoje); o Sobre e a tagline saem com o texto e a cor da
  impressão.

## Requirements *(mandatory)*

### Functional Requirements

**Comando `open` (item 1)**

- **FR-001**: O terminal da dock MUST aceitar o comando `open <OPTIONS>`, que abre uma janela da página
  e leva a página até ela. O comando é reconhecido sem diferenciar maiúsculas.
- **FR-002**: As opções do `open` MUST ser só estas: cada um dos projetos (um por janela de projeto, na
  ordem da página) e `experiencia`, `challenges` e `comunitario`, cada uma a janela de editor inteira da
  seção (Q1). Os itens de dentro das janelas de editor (vínculos, challenges, projetos comunitários),
  Sobre, Skills, Educação, Contato e a seção Projetos como um todo MUST não ser opções. As opções MUST
  vir dos dados da página: um projeto novo vira opção sem mudar o terminal, e uma seção sem conteúdo não
  tem opção.
- **FR-003**: O nome da opção de um projeto MUST ser gerado do nome exibido dele (o título da janela),
  em minúsculas, sem acentos, com hífen no lugar de espaços e símbolos (clarify): hoje `srg`,
  `temas-vs-code`, `italiami`, `ocr-de-prontuarios`, `qclass-bot` e `monitor-de-curso`. Os nomes MUST
  ser únicos entre si e diferentes de `experiencia`, `challenges` e `comunitario` (a verificação dos
  dados acusa a colisão). A opção digitada MUST ser reconhecida com a mesma normalização do `find` (sem
  diferenciar maiúsculas e acentos, sem o prefixo `~/` ou `/` e sem `/` no fim).
- **FR-004**: `open <projeto>` MUST: (a) se a janela do projeto estiver minimizada ou fechada, reabri-la
  como o ícone dela reabre (minimizada: completa; fechada: digita os comandos de novo, sem piscar, 006
  FR-023); (b) rolar a página até a janela, com a barra de título dela visível logo abaixo do header,
  isto é, com o topo dela entre a base do header e a metade da altura da tela (sem rolar se ela já
  estiver assim); (c) mostrar na saída o caminho da janela (`→ ~/projetos/<opção>`); (d) minimizar o
  terminal sozinho, guardando a sessão (FR-012), e pôr o foco na janela do projeto (no primeiro controle
  da barra de título, como quando o ícone a reabre) (clarify).
- **FR-005**: `open experiencia`, `open challenges` e `open comunitario` MUST: (a) levar a página até a
  janela de editor da seção; (b) se ela estiver minimizada ou fechada, reabri-la já completa, sem
  digitar o comando de novo; (c) maximizá-la como o `□` maximiza (006 FR-015 a FR-017: cobre quase toda
  a tela, árvore e cartões, página e dock desfocadas e inalcançáveis), com o item aberto na árvore
  mantido e a lista de cartões já nele; (d) mostrar na saída o caminho da janela (`→ ~/carreira`, `→
  ~/projetos/challenges`, `→ ~/projetos/comunitario`); (e) minimizar o terminal sozinho, guardando a
  sessão (FR-012), antes de maximizar (clarify). Ao restaurar a janela (Esc, `□`, clique fora), ela
  volta ao lugar dela, a página continua na seção dela, e o foco fica no `□` (006 FR-017); o terminal
  continua minimizado até o visitante restaurá-lo.
- **FR-006**: `open` sem opção MUST mostrar `uso: open <OPTIONS>` e a linha com as opções; uma opção que
  não existe MUST mostrar um erro no estilo de shell (`open: '<texto digitado>': não encontrado`), a
  linha com as opções e a dica do `help`; uma seção da página que não é opção (`sobre`, `skills`,
  `projetos`, `educacao`, `contato`) MUST mostrar que ela não é aberta pelo `open` e sugerir o
  `find <seção>`. Nenhum desses casos abre nem rola nada.
- **FR-007**: O `help` MUST listar o `open <OPTIONS>` com o que ele faz (abre um projeto ou, maximizadas,
  as janelas da experiência, dos challenges e do comunitário), as opções aceitas e um exemplo, no mesmo
  formato do bloco do `find`.
- **FR-008**: O autocompletar (004 FR-024) MUST valer também para o `open`: o comando na primeira
  palavra e as opções do `open` depois dele, com Tab, texto fantasma, → e as sugestões tocáveis.
- **FR-009**: Com "reduzir movimento", a rolagem do `open` MUST ser instantânea e a janela MUST abrir e
  maximizar sem animação (como já fazem o `find`, o ícone e o `□`).

**Minimizar o terminal da dock (item 2)**

- **FR-010**: O `−` da barra de título do terminal da dock MUST ser um botão funcional, com o nome
  acessível "Minimizar terminal", com a mesma aparência e o mesmo hover do `−` das outras janelas. O
  `□` continua desativado (006 FR-025) e o ✕ continua fechando.
- **FR-011**: Minimizar MUST esconder o terminal encolhendo-o até o botão da dock, como as janelas da
  página encolhem até o ícone (clarify), em no máximo 400 ms, e pôr o foco no botão da dock. Restaurar
  MUST fazer o caminho inverso: o terminal cresce a partir do botão. Fechar continua com a animação de
  hoje (desce um pouco e some, 004 FR-019), para que minimizar e fechar se distingam. Com "reduzir
  movimento", minimizar, restaurar e fechar são imediatos.
- **FR-012**: Minimizar MUST guardar a sessão inteira: a saída (comandos e respostas), o histórico de
  comandos percorrido por ↑/↓, o texto que estava no prompt (com a posição do cursor) e a rolagem da
  saída.
- **FR-013**: Com o terminal minimizado, o botão da dock MUST mostrar que há um terminal minimizado: o
  mesmo ponto de "aberto", no mesmo lugar, mas vazado (só o contorno) ou esmaecido, e sem ponto com o
  terminal fechado (clarify); o ponto de "minimizado" MUST ter contraste mínimo de 3:1 sobre o fundo da
  dock. O botão MUST ter o nome acessível "Restaurar terminal (Ctrl+Alt+T)". Clicar no botão ou apertar
  Ctrl+Alt+T MUST restaurar o terminal (FR-011), com a sessão como estava e o foco no prompt.
- **FR-014**: `exit`, o ✕ e Esc MUST continuar fechando o terminal e encerrando a sessão: a próxima
  abertura começa com a saída e o histórico vazios (como hoje).
- **FR-015**: Toda visita MUST começar com o terminal fechado e a sessão vazia; recarregar a página com
  o terminal minimizado não o restaura.
- **FR-016**: Com o terminal aberto, clicar no botão da dock ou apertar Ctrl+Alt+T MUST minimizar o
  terminal (FR-011, FR-012), como numa barra de tarefas (Q2), e não mais fechá-lo. O nome acessível do
  botão MUST dizer o que o clique faz: "Abrir terminal (Ctrl+Alt+T)" com ele fechado, "Minimizar
  terminal (Ctrl+Alt+T)" com ele aberto e "Restaurar terminal (Ctrl+Alt+T)" com ele minimizado.
- **FR-017**: A dica do botão da dock (006 FR-026, FR-027) MUST aparecer com o terminal minimizado como
  aparece com ele fechado.

**Vinheta do Letter Glitch no hero (item 3)**

- **FR-018**: A vinheta central do Letter Glitch do hero MUST voltar a ser a do componente original:
  circular, preto a 80% no centro, sumindo até transparente aos 60% do raio. A vinheta das bordas
  continua a do componente.
- **FR-019**: Os demais parâmetros do Letter Glitch definidos pela 006 (FR-030, FR-031: Glitch Speed 10,
  transição suave, cores do tema) continuam; o comportamento sem movimento, sem JavaScript, fora da tela
  e com a aba em segundo plano não muda (006 FR-033, FR-034).
- **FR-020**: Nenhuma outra penumbra ou faixa escura MUST cobrir o fundo do hero no lugar da vinheta
  calibrada da 006 (a penumbra `--hero-scrim` da 005 continua fora).
- **FR-021**: Todo texto do hero (o loader, o nome, a linha do prompt, a tagline, os rótulos dos botões
  e o `▼ scroll`) MUST manter contraste mínimo de 4,5:1 em qualquer quadro, com a vinheta original, em
  desktop e celular. Para isso, os textos do hero que, medidos sem halo sobre o fundo animado, ficam
  abaixo de 4,5:1 MUST ganhar um halo escuro justo em volta das próprias letras (Q3), e só eles (clarify):
  pela medição do plano, a tagline e o texto do loader (research R7); o nome com glitch e os demais textos
  que passam sem halo ficam como estão. O halo só existe com o fundo animado (sem ele, o hero fica como
  hoje); fica fora dos traços, sem faixa, caixa ou penumbra atrás do bloco de texto (FR-020); e MUST não
  mudar a cor, o peso nem o tamanho das letras, nem a opacidade das letras do fundo (006 FR-031,
  `--glitch-alpha`). Os botões ficam sem halo; o `ping vittorio`, cujo fundo é translúcido e deixa o
  glitch aparecer atrás do rótulo, MUST ganhar, só com o fundo animado, um fundo opaco da mesma cor que
  ele tem sobre o fundo liso.

**Texto do Sobre (item 4)**

- **FR-022**: O texto mostrado por `cat sobre.txt` MUST usar a cor padrão do texto do site, a mesma da
  descrição das janelas de projeto (o branco do tema), em todos os modos (com e sem JavaScript); os
  trechos em destaque ("TypeScript", "Vue") continuam em verde.
- **FR-023**: As linhas de comando do Sobre (`$ cat sobre.txt`, `$ whois vittorio --info`) e os selos
  de atributos MUST continuar como estão (003 FR-004).

**Tagline do hero (item 5)**

- **FR-024**: A tagline do hero MUST ser exatamente "Transformando processos em sistemas escaláveis"
  (sem o trecho "— de APIs a agentes de IA." e sem ponto final), na revelação animada, com "reduzir
  movimento", sem JavaScript e na impressão.
- **FR-025**: Os metadados de SEO (`<title>`, `meta description`) MUST continuar como estão: eles não
  usam a tagline.

**Versão**

- **FR-026**: Esta feature MUST levar a versão do `package.json` a `2.6.0` (exibida `v2.6` na sessão da
  porta), como manda o 005 FR-016.

### Key Entities

- **Opção do `open`**: o nome digitável, o alvo (a janela de um projeto ou uma das três janelas de
  editor), o caminho mostrado na saída e o modo em que a janela abre (aberta ou maximizada).
- **Sessão do terminal da dock**: a saída, o histórico de comandos, o texto do prompt e a rolagem; o
  estado do terminal (fechado, aberto ou minimizado). Fechar apaga a sessão; minimizar a guarda.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para cada opção do `open` (os 6 projetos e as 3 janelas de editor), com a janela aberta,
  minimizada ou fechada, em 1366 × 768 e 390 × 844: em 100% das execuções, em até 1 s, a janela do
  projeto fica aberta e com a barra de título visível logo abaixo do header, ou a janela de
  editor fica maximizada (cobrindo ≥ 90% da tela no desktop e ≥ 95% no celular).
- **SC-002**: Para as 5 seções que não são opção, para `open` sem opção e para 3 textos inválidos, em
  100% das execuções nada abre nem rola, e a saída tem a mensagem do FR-006.
- **SC-003**: Depois de cada `open` válido, em 100% das execuções o terminal fica minimizado, o foco
  fica na janela aberta (dentro do diálogo, no editor maximizado), e restaurar o terminal mostra a
  sessão intacta, com o comando `open` e a saída dele.
- **SC-004**: Minimizar e restaurar o terminal preserva 100% das linhas da saída, 100% do histórico
  (↑/↓) e o texto do prompt; cada transição dura no máximo 400 ms; fechar e reabrir começa com 0 linhas.
- **SC-005**: No hero, a vinheta central medida por pixel corresponde à do componente original (80% de
  escurecimento no centro, 0% a partir de 60% do raio, com tolerância de 2 pontos percentuais), e há
  letras visíveis a menos de 60% do raio do centro. O halo do texto vai no máximo 10 px além dos traços
  das letras: a 12 px ou mais de qualquer texto, o fundo do hero é o mesmo com e sem halo.
- **SC-006**: Em 10 quadros amostrados do hero animado, em 1366 × 800 e 390 × 844, todo texto do hero
  tem contraste ≥ 4,5:1.
- **SC-007**: A cor calculada do texto do Sobre é igual à da descrição das janelas de projeto, com e sem
  JavaScript, e o contraste dela sobre o fundo da janela é ≥ 4,5:1.
- **SC-008**: O texto da tagline no HTML publicado e no hero, depois da revelação, é exatamente
  "Transformando processos em sistemas escaláveis".
- **SC-009**: O carregamento inicial continua ≤ 500 KB (badges externos excluídos), e o HTML, o CSS e o
  JavaScript iniciais crescem no máximo 3 KB comprimidos em relação à 006; nenhum pedido novo a
  terceiros.
- **SC-010**: Zero violações na auditoria automática de acessibilidade e zero erros do site no console,
  nos modos: terminal aberto, terminal minimizado, janela de editor maximizada pelo `open`, "reduzir
  movimento" e sem JavaScript.

## Assumptions

- **Numeração**: esta feature é a 007. O boot dentro de um dispositivo (`specs/insumos/
  002-boot-dispositivo.md`, plano 09), que estava reservado como 007, passa a ser a 008.
- **"Ser redirecionado para a opção"**: a página rola até a janela aberta; para as janelas de editor,
  a página vai até a seção antes de maximizar, para que, ao restaurar, o visitante esteja nela.
- **Terminal minimiza depois do `open`** (clarify), ao contrário do `find`, que o mantém aberto (clarify
  da 004): o `open` leva o visitante para uma janela, e o terminal cobriria boa parte dela.
- **Caminho na saída do `open`**: `~/projetos/<opção>` para os projetos, seguindo a metáfora das seções
  e o caminho das janelas de editor (`~/projetos/challenges`).
- **Esc** continua fechando o terminal (não minimiza), como hoje.
- **O botão da dock é o "ícone" do terminal minimizado**, como numa dock de sistema; não há um ícone de
  área de trabalho para ele.
- **"Branco padrão de escrita"**: a cor `--text` do tema, a mesma da descrição das janelas de projeto.
- **Tagline sem ponto final**, como o autor escreveu.
