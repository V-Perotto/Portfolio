# Feature Specification: Educação numa janela de editor, como Challenges e Comunitário

**Feature Branch**: `001-vue-resume-refactor` (nenhum branch criado: não há hook `before_specify`
configurado, e a 008 parte do estado da 007, que ainda não foi para a `main`)

**Created**: 2026-10-10

**Status**: Draft

**Input**: User description: um pedido do autor:

1. "Adicione os itens de educacao para serem no mesmo formato do comunitario e challenges"

## Contexto

### Situação atual

- **Seção Educação** (`#educacao`, título `educacao`, linha de comando
  `apt list --installed | grep formacao`): uma pilha de 4 cartões, da formação mais recente para a mais
  antiga (001 FR-004; no mesmo ano de início, a de término mais recente antes, 002 FR-024):
  Pós-Graduação em Cibersegurança (2025 — 2027, EM CURSO), Bacharelado em Sistemas de Informação
  (2020 — 2024), 1º Empregotech (2020 — 2020) e Técnico em Análise e Desenvolvimento de Sistemas
  (2018 — 2019). Cada cartão mostra o período (`// 2025 — 2027`), o selo `EM CURSO` quando a formação
  está em andamento, o curso, a instituição e o local; o 1º Empregotech mostra também uma observação e
  duas fontes (`fonte = overbr.com.br`, `fonte = curitiba.pr.gov.br`, 002 FR-021 a FR-023).
- **Challenges e Comunitário** (sub-partes de Projetos) **e Experiência** (seção) ficam em janelas de
  editor (006 FR-001 a FR-019): a janela digita `code <pasta>` e mostra, como saída, um editor no estilo
  VS Code, com a aba do arquivo aberto, a árvore de arquivos (Branched Menu com ramos em ângulo reto),
  o "arquivo" YAML do item escolhido, com números de linha e cores de sintaxe, e um rodapé com o caminho
  do arquivo e a posição dele na sequência (`2 / 7`). Ela minimiza e fecha até um ícone de pasta de
  código, e maximiza: cobre quase toda a tela, é um diálogo modal e mostra a árvore e os cartões de
  hoje. Sem JavaScript e na impressão, só os cartões aparecem.
- **Comando `open`** do terminal da dock (007): abre os 6 projetos e maximiza as três janelas de editor
  (`experiencia`, `challenges`, `comunitario`); são 9 opções. `open educacao` responde hoje
  "open: 'educacao': essa seção não abre com o open. Use: find educacao", e o `help` diz "projetos
  abrem; experiencia, challenges e comunitario abrem maximizados".
- **Versão**: `package.json` em `2.6.0` (exibida `v2.6` na sessão da porta, 005 FR-016).

### Relação com a constituição (v3.0.0)

- **Princípio I (Fidelidade ao Currículo)**: o arquivo de cada formação traz exatamente os fatos do
  cartão dela (curso, instituição, local, período, selo de em curso, observação e fontes), sem omitir
  nem acrescentar nada; o período continua no formato único da página (`2025 — 2027`) e só a formação
  realmente em andamento recebe o selo. Nenhum dado do currículo muda.
- **Princípio II (Projetos Demonstráveis)**: não se aplica diretamente (formação não é projeto); as
  fontes do 1º Empregotech continuam links externos com `target="_blank"` e `rel="noopener noreferrer"`.
- **Princípio III (Saída Estática)**: sem JavaScript, a seção continua mostrando todos os cartões, como
  hoje (006 FR-012); nenhum recurso novo de terceiros, nenhuma dependência nova.
- **Princípio IV (Acessibilidade e Desempenho)**: a janela reaproveita a de Challenges e Comunitário:
  árvore operável por teclado e leitor de tela, maximizada como diálogo modal, transições de no máximo
  400 ms e nenhuma com "reduzir movimento", sem rolagem horizontal de 320 px ao desktop.
- **Princípio V (Identidade Visual Coerente)**: reutiliza a janela de editor existente (componentes,
  cores de sintaxe e tokens); nenhuma cor nova.

### Requisitos de features anteriores que esta feature substitui

- **006 FR-001** (três janelas de editor: Experiência, Challenges e Comunitário): passam a ser quatro,
  com a de Educação (FR-001).
- **006 FR-006** (os fatos de cada tipo de arquivo): acrescenta os da formação (FR-005).
- **006 FR-012** e **006 FR-019**: valem também para a janela de Educação (FR-011, FR-012).
- **001 FR-004 / 002 FR-024** (ordem da Educação): a mesma ordem passa a valer para a árvore (FR-003).
- **007 FR-001 a FR-008** (opções do `open`), **007 SC-001** e **007 SC-002**: `educacao` passa a ser a
  10ª opção do `open`, que maximiza a janela de Educação (FR-015 a FR-018, Q1); as seções que não são
  opção passam a ser 4 (`sobre`, `skills`, `projetos`, `contato`).
- **006 FR-003 e FR-011**, quanto aos nomes da árvore: nas 4 janelas de editor, o nome de arquivo que
  não cabe na largura da árvore passa a terminar em reticências, em vez de ser cortado no meio de uma
  letra, como acontece hoje no celular com os Challenges (FR-020, analyze).
- **007 FR-026**: a versão sobe para `2.7.0` (FR-019).

## Clarifications

### Session 2026-10-10 (specify)

- Q1: A janela de Educação vira opção do `open` do terminal da dock? → A: Sim, maximizada, como
  `experiencia`, `challenges` e `comunitario`: `open educacao` leva à seção, minimiza o terminal e abre a
  janela maximizada; a opção entra no `help` e no Tab depois de `comunitario` (10 opções).
- Q2: Qual pasta a janela de Educação abre? → A: `~/formacao`, que casa com o
  `apt list --installed | grep formacao` da seção, como `~/carreira` na Experiência: título
  `~/formacao`, comando `code ~/formacao`.

### Session 2026-10-10 (clarify)

- Q: Como nomear os arquivos da árvore de Educação, já que a formação só tem anos? → A: Ano de início +
  slug curto fixo nos dados, como o id da Experiência: `2025_ciberseguranca.yml`,
  `2020_sistemas-de-informacao.yml`, `2020_empregotech.yml`, `2018_tecnico-ads.yml`.
- Q: Como o arquivo YAML mostra o selo EM CURSO do cartão? → A: `em_curso: true  # EM CURSO`, só na
  formação em andamento, como o `atual: true  # HEAD` da Experiência; as concluídas não ganham a linha.
- Q: Como as fontes aparecem no arquivo YAML? → A: Sempre uma lista, mesmo com uma fonte só: `fontes:`
  e, abaixo, com recuo, uma linha `- <rótulo>` por fonte, cada uma um link (como o `resultados:` da
  Experiência).

### Session 2026-10-10 (analyze)

- Q: No celular, a árvore corta no meio da letra os nomes que não cabem (medido no build da 007: hoje já
  corta `2025-10_executiva-service.yml` e `2024-01_ny-times-rpa.yml` em 320 px; na Educação cortaria
  vários nomes; na implementação, medido o rótulo: ~18 caracteres em 320 px e ~28 em 390 px). Como
  tratar? → A: Reticências nas 4 janelas de editor: o nome que
  não cabe termina em `…`, como no explorer do VS Code; o nome inteiro fica no nome acessível do arquivo e
  no rodapé ao abrir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Educação numa janela de editor (Priority: P1)

*Item 1 do autor.* A seção Educação deixa de ser uma pilha de cartões e passa a ser uma janela de
editor igual às de Challenges e Comunitário: a janela digita o comando que abre a pasta da formação e,
como saída, mostra a árvore com uma formação por arquivo, o arquivo YAML da formação escolhida e o
rodapé com o caminho e a posição. Escolher outra formação na árvore troca o arquivo, na mesma janela.
A janela minimiza, fecha e maximiza como as outras; maximizada, mostra a árvore e os cartões de hoje.

**Why this priority**: é o pedido inteiro; o resto da feature (o `open` e a versão) decorre dele.

**Independent Test**: na seção Educação, percorrer as 4 formações pela árvore (mouse e teclado),
conferir o conteúdo de cada arquivo contra o cartão dela, minimizar, fechar, reabrir, maximizar e
restaurar; repetir no celular de 320 px, com "reduzir movimento", sem JavaScript e na impressão.

**Acceptance Scenarios**:

1. **Given** a página com JavaScript, **When** o visitante chega à seção Educação, **Then** vê, sob o
   título `educacao` e a linha de comando `apt list --installed | grep formacao` (que não mudam), uma
   janela de editor onde o comando `code ~/formacao` é digitado; terminado o comando, aparece o
   editor: a aba do arquivo aberto, a árvore com as 4 formações (da mais recente para a mais antiga), o
   arquivo da Pós-Graduação em Cibersegurança aberto, com números de linha, e o rodapé com o caminho
   dele e `1 / 4`.
2. **Given** a janela de Educação, **When** o visitante escolhe o 1º Empregotech na árvore (clique,
   toque, Enter ou Espaço), **Then** o arquivo, a aba e o rodapé (`3 / 4`) passam a ser os dele, o
   arquivo mostra o curso, a instituição, o local, o período, a observação e as duas fontes como links
   que abrem em nova aba, e a janela não muda de tamanho.
3. **Given** a janela de Educação, **When** o visitante abre o arquivo da Pós-Graduação, **Then** ele
   tem a linha `em_curso: true  # EM CURSO` logo depois do período; os arquivos das formações
   concluídas não têm essa linha nem outro selo, como os cartões delas.
4. **Given** a janela de Educação, **When** o visitante clica em maximizar, **Then** a janela cobre a
   maior parte da tela, a página por trás fica desfocada e inalcançável, a árvore continua à esquerda e,
   no lugar do arquivo, aparecem todos os cartões de formação de hoje (4); escolher uma formação na árvore rola até o
   cartão dela; Esc, o `□` ou um clique fora restauram, com o foco no `□`.
5. **Given** a janela de Educação, **When** o visitante minimiza ou fecha, **Then** ela encolhe até o
   ícone de pasta de código, como as outras janelas de editor, e o ícone a reabre (fechada: digita o
   comando de novo, sem piscar).
6. **Given** um celular de 320 px, **When** o visitante vê a janela de Educação, **Then** a árvore fica
   acima do arquivo, nada exige rolagem horizontal (as linhas longas quebram dentro do painel), e os
   nomes de arquivo que não cabem na árvore terminam em reticências; ao abrir um deles, o rodapé mostra o
   caminho inteiro.
7. **Given** a página sem JavaScript (ou impressa), **When** o visitante chega à seção Educação,
   **Then** os 4 cartões estão visíveis e legíveis, como hoje, cada conteúdo uma vez só.

---

### User Story 2 - Abrir a Educação pelo terminal da dock (Priority: P2)

*Decorre do item 1 (Q1).* Como as outras janelas de editor, a de Educação passa a ser
opção do `open`: `open educacao` leva a página até a seção Educação, minimiza o terminal e abre a janela
maximizada.

**Why this priority**: mantém a regra da 007 (todas as janelas de editor abrem pelo `open`); sem ela, a
janela nova seria a única janela de editor fora do `open`, mas o conteúdo continua acessível pelo menu e
pelo `find`.

**Independent Test**: no terminal da dock, rodar `open educacao` (e o apelido `formacao`) a
partir do hero, com a janela aberta, minimizada e fechada; conferir o estado da janela, a saída, o
`help`, o Tab e o foco.

**Acceptance Scenarios**:

1. **Given** o terminal da dock aberto no hero, **When** o visitante roda `open educacao` (ou
   `open formacao`, o apelido), **Then** a saída mostra `→ ~/formacao`, o terminal minimiza sozinho, a página vai até a seção Educação e a
   janela abre maximizada, com o foco dentro dela; ao restaurar, a página continua na seção Educação.
2. **Given** a janela de Educação fechada, **When** o visitante roda `open educacao`, **Then** ela reabre
   já completa e maximizada, sem digitar o comando de novo.
3. **Given** o terminal da dock, **When** o visitante roda `help`, **Then** a explicação do `open` diz
   que a educação também abre maximizada, e `educacao` aparece na lista de opções, na ordem da página
   (depois de `comunitario`).
4. **Given** o terminal da dock, **When** o visitante digita `open ed` e aperta Tab, **Then** a linha é
   completada para `open educacao`.

---

### Edge Cases

- **Formação sem observação nem fontes** (3 das 4): o arquivo não tem as chaves de observação e fontes,
  como o cartão não tem as linhas delas.
- **Formação com várias fontes** (1º Empregotech, 2): todas aparecem na lista `fontes:`, cada uma como
  link, na ordem dos dados; com uma fonte só, a lista tem um item (não vira `fonte:`).
- **Mesmo ano de início** (Bacharelado e 1º Empregotech, 2020): a ordem é a da seção (a de término mais
  recente antes); os slugs são diferentes (`2020_sistemas-de-informacao.yml`, `2020_empregotech.yml`), e
  dois slugs iguais nos dados são um erro.
- **Uma formação só** (dados futuros): a janela funciona com um arquivo, como a do Comunitário hoje.
- **Nenhuma formação**: a seção some da página e do menu, como hoje (001), e não há janela nem opção do
  `open`.
- **Formação nova nos dados**: vira um arquivo da árvore e um cartão sozinha; o único texto novo que ela
  pede é o slug curto do nome do arquivo.
- **Âncora `#educacao`**, menu e `find educacao`: levam à seção, como hoje; a janela aparece no lugar dos
  cartões.
- **Janela maximizada e o terminal da dock**: valem as regras da 006 e da 007 (a página, o header e a
  dock ficam inalcançáveis enquanto ela está maximizada).
- **Nomes longos** (Técnico em Análise e Desenvolvimento de Sistemas): no arquivo, o texto quebra dentro
  do painel; na árvore, o nome do arquivo que não cabe (em 320 px, onde o rótulo tem ~18 caracteres, os 4
  nomes de formação; em 390 px, ~28 caracteres, só `2020_sistemas-de-informacao.yml`) termina em
  reticências, sem empurrar a janela nem criar rolagem horizontal (FR-020).

## Requirements *(mandatory)*

### Functional Requirements

**Janela de editor da Educação**

- **FR-001**: A seção Educação MUST ser apresentada numa janela de editor igual às de Challenges e
  Comunitário (006 FR-001 a FR-019), no lugar da pilha de cartões, sob o título e a linha de comando da
  seção, que não mudam.
- **FR-002**: A pasta da janela MUST ser `~/formacao` (Q2): é o título da janela, o comando digitado
  (`code ~/formacao`), a raiz da árvore (`formacao/`) e o começo do caminho no rodapé.
- **FR-003**: A árvore MUST ter um arquivo por formação, na ordem da seção: da mais recente para a mais
  antiga pelo ano de início e, no mesmo ano, a de término mais recente antes. Na primeira exibição, o
  arquivo da primeira formação está aberto.
- **FR-004**: O nome de cada arquivo MUST ser `AAAA_<slug>.yml` (clarify): o ano de início (a formação
  não tem mês) e um slug curto, fixo nos dados de cada formação (como o id da Experiência), em
  minúsculas, sem acentos, com hífen: `2025_ciberseguranca.yml`, `2020_sistemas-de-informacao.yml`,
  `2020_empregotech.yml`, `2018_tecnico-ads.yml`. Os nomes MUST ser únicos na pasta e ter no máximo 31
  caracteres; o que não couber na largura da árvore termina em reticências (FR-020).
- **FR-005**: O arquivo de cada formação MUST trazer todos os fatos do cartão dela, sem omitir nem
  acrescentar nada (Princípio I): curso, instituição, local, período (no formato único da página,
  `2025 — 2027`), o selo de formação em curso só quando ela está em andamento (a linha
  `em_curso: true  # EM CURSO`, logo depois do período, como o `atual: true  # HEAD` da Experiência;
  clarify), e, quando existirem, a observação e todas as fontes. A situação "concluído" não aparece no
  arquivo, como não aparece no cartão.
- **FR-006**: O conteúdo MUST seguir o formato YAML das outras janelas (006 FR-007): a 1ª linha é um
  comentário com a posição e o nome da formação; uma chave por fato, em português e sem acento; textos
  longos (a observação) como texto corrido que quebra na largura do painel; as mesmas cores de sintaxe.
- **FR-007**: As fontes MUST aparecer sempre como lista (clarify), mesmo quando há uma só: a chave
  `fontes:` e, abaixo, com recuo, uma linha `- <rótulo da fonte>` por fonte, na ordem dos dados (como o
  `resultados:` da Experiência). Cada rótulo MUST ser um link de verdade para a fonte, que abre em nova
  aba com `rel="noopener noreferrer"`, com o mesmo estilo dos links das outras janelas de editor
  (006 FR-008).
- **FR-008**: O rodapé MUST mostrar à esquerda o caminho do arquivo aberto e à direita a posição dele
  (`1 / 4`).
- **FR-009**: Maximizada, a janela MUST mostrar a árvore e a lista com todos os cartões de formação
  (hoje 4) como são hoje (período, selo, curso, instituição · local, observação e fontes), com rolagem dentro da janela;
  escolher uma formação na árvore rola até o cartão dela (006 FR-016). Valem as regras de diálogo modal
  da 006 (FR-017, FR-018).
- **FR-010**: Minimizar, fechar e reabrir MUST funcionar como nas outras janelas de editor (006 FR-014):
  o ícone é o de pasta de código, com o nome da pasta.
- **FR-011**: A janela MUST digitar `code <pasta>` ao entrar na tela, com as mesmas regras das outras
  janelas de editor (006 FR-019): completa na hora com clique, toque ou foco; janela já vista acima da
  dobra fica completa; teto de 2,5 s; sem animação com "reduzir movimento" e sem JavaScript; fechar e
  reabrir digita de novo sem piscar.
- **FR-012**: Sem JavaScript e na impressão, a seção MUST mostrar todos os cartões de formação (hoje 4),
  visíveis e legíveis, sem depender de clique e cada conteúdo uma vez só (006 FR-012).
- **FR-013**: Abaixo de 760 px, a árvore MUST ficar acima do conteúdo, e nada na janela MUST exigir
  rolagem horizontal de 320 px ao desktop (006 FR-011).
- **FR-014**: Os arquivos e a árvore MUST ser gerados dos mesmos dados dos cartões, sem texto escrito à
  mão além do slug de cada formação (FR-004): uma formação nova nos dados vira arquivo e cartão sozinha.

**Comando `open`**

- **FR-015**: `educacao` MUST ser opção do `open` (Q1): `open educacao` e o apelido `open formacao` (o
  caminho sem `~/`, aceito mas fora da lista e do Tab, como `carreira`) maximizam a janela de Educação
  como as outras janelas de editor (007 FR-003 a FR-005): a saída mostra `→ ~/formacao`, o terminal
  minimiza sozinho guardando a sessão, a página vai até a seção Educação, a janela reabre já completa se
  estava minimizada ou fechada, e o foco vai para dentro dela; ao restaurar, a página continua na seção.
- **FR-016**: A lista de opções do `open` (na saída de `open` sem opção, de uma opção inválida e do
  `help`), o Tab e os atalhos de toque MUST incluir `educacao` na ordem da página, depois de
  `comunitario`, gerada dos dados: sem formações, não há a opção.
- **FR-017**: O `help` MUST citar a educação entre as janelas que abrem maximizadas (hoje: "projetos
  abrem; experiencia, challenges e comunitario abrem maximizados").
- **FR-018**: `open educacao` MUST deixar de responder "essa seção não abre com o open"; essa mensagem
  continua para `sobre`, `skills`, `projetos` e `contato` (007 FR-006).

**Versão**

- **FR-019**: Esta feature MUST levar a versão do `package.json` a `2.7.0` (exibida `v2.7` na sessão da
  porta), como manda o 005 FR-016.

**Nomes longos na árvore (analyze)**

- **FR-020**: Em todas as janelas de editor (Experiência, Challenges, Comunitário e Educação), o nome de
  arquivo que não couber na largura da árvore MUST terminar em reticências (`…`), sem letra cortada ao
  meio e sem rolagem horizontal na árvore; os que cabem ficam inteiros. O nome inteiro MUST continuar
  sendo o nome acessível do arquivo na árvore e aparecer no rodapé (que quebra a linha) quando o arquivo
  está aberto. Nenhum outro parâmetro da árvore muda (006 FR-003).

### Key Entities

- **Formação**: curso, instituição, local, ano de início e de término, situação (concluída ou em curso),
  observação (opcional), fontes (opcional, uma ou mais) e, novo, um slug curto único (`ciberseguranca`),
  que identifica o arquivo da árvore e o cartão da lista. É a mesma entidade dos cartões.
- **Arquivo de formação**: nome (`.yml`), caminho na pasta, posição na sequência e as linhas YAML com os
  fatos da formação.
- **Pasta da Educação**: o nome da pasta (`formacao`), o caminho exibido (`~/formacao`) e os arquivos, na
  ordem da seção.
- **Opção `educacao` do `open`**: o nome digitável, o apelido (`formacao`), a janela de Educação como
  alvo, o caminho `~/formacao` mostrado na saída e o modo maximizado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 320, 768, 1366 e 1920 px de largura, a janela de Educação mostra 100% das formações na
  árvore e, para cada uma, 100% dos fatos do cartão dela no arquivo (e nenhum fato que o cartão não
  tenha), sem rolagem horizontal da página; em 320 e 390 px, em todas as janelas de editor, nenhum nome de
  arquivo da árvore aparece cortado no meio de uma letra (o que não cabe termina em reticências, dentro da
  árvore).
- **SC-002**: Trocar de formação na árvore não muda a altura da janela (0 px de diferença, com tolerância
  de subpixel de 0,5 px, como na 006).
- **SC-003**: Maximizar e restaurar levam no máximo 400 ms cada; maximizada, a janela cobre pelo menos
  90% da tela no desktop e 95% no celular, e mostra todos os cartões de formação (hoje 4).
- **SC-004**: Sem JavaScript e na impressão, 100% do conteúdo dos cartões de formação (hoje 4) está visível,
  cada um uma vez só.
- **SC-005**: As 2 fontes do 1º Empregotech são links que abrem em nova aba com
  `rel="noopener noreferrer"`, no arquivo e no cartão.
- **SC-006**: Com a janela de Educação aberta, minimizada ou fechada, em 1366 × 768 e 390 × 844, em
  100% das execuções `open educacao` deixa a janela maximizada em até 1 s (cobrindo ≥ 90% da tela no
  desktop e ≥ 95% no celular), com o terminal minimizado e o foco dentro da janela; para as 4 seções que
  não são opção, nada abre nem rola.
- **SC-007**: O carregamento inicial continua ≤ 500 KB (badges externos excluídos), e o HTML, o CSS e o
  JavaScript iniciais crescem no máximo 2 KB comprimidos em relação à 007; nenhum pedido novo a
  terceiros.
- **SC-008**: Zero violações na auditoria automática de acessibilidade e zero erros do site no console,
  com a janela de Educação aberta, maximizada, minimizada, com "reduzir movimento" e sem JavaScript.

## Assumptions

- **Numeração**: esta feature é a 008. O boot dentro de um dispositivo (`specs/insumos/
  002-boot-dispositivo.md`, plano 09), que estava reservado como 008, passa a ser a 009.
- **"Mesmo formato do comunitário e challenges"**: a janela de editor da 006 (a mesma que a Experiência
  também usa), não a posição: a Educação continua sendo uma seção própria, depois de Projetos, e não vira
  sub-parte de Projetos.
- **Título e linha de comando da seção** (`educacao`, `apt list --installed | grep formacao`) ficam como
  estão, como os de Experiência, Challenges e Comunitário ficaram na 006.
- **Cartões de formação**: continuam como são hoje (conteúdo e aparência); só passam a ser vistos na
  janela maximizada, sem JavaScript e na impressão.
- **Comportamento da janela**: o mesmo das outras janelas de editor (digitação, maximizar, minimizar,
  fechar, laço de foco), sem regra nova; o que a 006 e a 007 corrigiram nelas vale para esta.
- **Menu e `find`**: não mudam; `find educacao` continua levando à seção.
- **Validação com GPU real e celular físico** fica com o autor (quickstart), como nas features
  anteriores.
