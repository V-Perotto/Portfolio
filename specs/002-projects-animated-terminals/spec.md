# Feature Specification: Projetos ampliados, terminais animados e ícones nas skills

**Feature Branch**: `001-vue-resume-refactor` (nenhum branch criado: não há hook `before_specify`
configurado, e a 002 parte do estado da 001, que ainda não foi para a `main`)

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: nove pedidos do autor, enviados de uma vez:

1. "Conforme for sendo feito o scroll, os terminais deverão ser animados, com os comandos sendo
   escritos e, assim que finalizarem, demonstrarem o texto."
2. "Sobre o ItaliaMi, use os seguintes links para poder redirecionar o usuário, mesmo que os links
   retornem um 404, porque estão privados: ItaliaMi-Back, ItaliaMi-Front, ItaliaMi-BOT."
3. "Adicione também nos projetos, indicando também que é um projeto privado mas que teve relevância
   com a Quadritech, o projeto de leitura de Prontuários Civil e Criminal via OCR (OCR_Para_BR)
   [...] Além disso, também relacionado com a Quadritech, [...] um bot que analisa e coleta os dados
   das aulas realizadas para cada CFC registrado (QClass-BOT)."
4. "Para a aba de projetos acho relevante que sejam separados um por um na linha invés de três, e
   com cada um tendo seu link para acesso."
5. "Nas skills, invés de tentar criar do jeito que já está, use os ícones do lucide.dev/icons."
6. "Nos projetos, um deles você deve adicionar como uma sub-parte, sendo Challenges, que sim,
   deverão também ter links e essas estão públicas, insira cada uma baseado na data de criação:"
   AxyaTest_API, RPA_Challenge-NY_Times, teste-pandavideo, executiva-service-tech-challenge,
   econet-challenge, mobiis-challenge e cieepr-challenge.
7. "Como outro projeto pessoal que estou desenvolvendo, o SRG-Project, indique que eu estou
   desenvolvendo (parecido com o que tinha antes na parte de experiência ativa)." Links: SRG-Vue,
   SRG-Admin, SRG-Node, SRG-Core e SRG-DEVOPS.
8. "Na parte de Educação, depois de Técnico em Análise e Desenvolvimento de Sistemas, coloque que
   fiz o 1º Empregotech em Curitiba de 2020 até 2020, além disso, indique que por conta desse curso,
   foi possível eu entrar na Prime Control, uma das patrocinadoras do evento", com duas notícias
   como fonte (overbr.com.br e curitiba.pr.gov.br).
9. "Em uma subparte do Projetos, adicione que fiz um projeto comunitário promovido pela PUC-PR",
   com a notícia da PUC-PR sobre a gincana junina em escola municipal de Curitiba.

As URLs completas estão nos requisitos (FR-007 a FR-024).

## Contexto

### Situação atual

A seção `projetos` tem 3 cartões em grade (até 3 por linha): ItaliaMi (marcado como confidencial,
sem link), Monitor de Curso (acadêmico, sem link) e Temas VS Code (dois links para o Open VSX). As
janelas de terminal (Sobre, cada projeto e Contato) aparecem prontas: o comando e a saída já estão
lá quando a janela entra na tela. Os grupos de skills usam caracteres soltos como ícone (`</>`,
`⌁`, `▤`, `⬡`, `⚙`). A seção `educacao` tem 3 formações.

### Fatos levantados em 2026-10-08

- **Repositórios privados**: os 5 do SRG, os 3 do ItaliaMi, o OCR_Para_BR e o QClass-BOT respondem
  "não encontrado" para quem não é o autor. Os links levam a uma página de erro para o visitante, e
  o autor pediu que fiquem assim mesmo.
- **Challenges**: os 7 repositórios são públicos. Datas de criação no GitHub: AxyaTest_API
  (JUL 2023), RPA_Challenge-NY_Times (JAN 2024), teste-pandavideo (OUT 2024),
  executiva-service-tech-challenge (OUT 2025), econet-challenge (JAN 2026), mobiis-challenge
  (FEV 2026) e cieepr-challenge (SET 2026).
- **SRG**: sistema de demonstrativo de aluguéis (imóveis, inquilinos, despesas e resultados) com
  console de administração, em desenvolvimento ativo (último commit em SET 2026).
- **1º Empregotech**: programa "Meu Primeiro Emprego em Tecnologia" da Prefeitura de Curitiba
  (Agência Curitiba, FAS e Assespro-PR), aberto em 16 FEV 2020 com seminário na Ópera de Arame,
  com 4 meses de curso. A Prime Control consta entre as empresas apoiadoras.
- **Projeto comunitário**: notícia da PUC-PR de 30 JUN 2023. Estudantes da PUC-PR promoveram uma
  gincana junina na Escola Municipal Professora Nansyr Cecato Cavichiolo (Parolin, Curitiba). O
  autor é citado como estudante de Sistemas de Informação.

### Relação com a constituição (v2.1.0)

- **Princípio I (Fidelidade ao Currículo)**: nenhum dos itens novos (SRG, OCR, QClass, challenges,
  projeto comunitário, Empregotech) está no PDF do currículo de 2026-04-21. A fonte é o próprio
  autor, como já aconteceu com os Temas VS Code ([cv-outdated-vs-site]): o site passa a ser o
  correto e o autor atualiza o PDF. As stacks dos projetos novos vêm dos próprios repositórios, nada
  é inventado.
- **Princípio II (Projetos Demonstráveis)**: **conflita** com a v2.1.0 em dois pontos. (a) Um link
  para repositório privado não é "evidência pública acessível", e as duas exceções atuais
  (confidencial e acadêmica) não cobrem um projeto pessoal com código privado, como o SRG. (b) O
  projeto comunitário não tem stack de software, e o princípio exige stack para todo projeto.
  Decidido emendar a constituição para a v2.2.0 (Clarifications); a emenda é pré-requisito do
  `/speckit-plan`. A regra "projetos ordenados por relevância" vale para a lista principal; a ordem
  por data dentro dos challenges é pedido explícito do autor e só vale dentro daquela sub-parte.
- **Princípio III (Saída Estática)**: o conteúdo novo e os ícones MUST estar no HTML pré-renderizado.
  A animação dos terminais só acrescenta comportamento: sem JavaScript, tudo aparece pronto.
- **Princípio IV (Acessibilidade e Desempenho)**: a digitação nos terminais é uma animação
  decorativa e de entrada: precisa respeitar "reduzir movimento", ser pulável e não esconder
  conteúdo por mais de 5 s.
- **Princípio V (Identidade Visual Coerente)**: os terminais animados reforçam a metáfora; os
  ícones novos usam as cores dos tokens.

## Clarifications

### Session 2026-10-08 (specify)

- Q: Links para repositórios privados não são evidência pública, e o SRG não cabe em nenhuma
  exceção do Princípio II; o projeto comunitário não tem stack. Como conciliar? → A: Emendar a
  constituição para a v2.2.0: "código em repositório privado" vira exceção, dita no cartão e com
  link para o repositório; projeto não técnico (comunitário) dispensa stack.
- Q: Qual stack exibir para o OCR_Para_BR e o QClass-BOT? → A: Python nos dois (o de prontuários
  com OCR); papel "Autor e desenvolvedor".

### Session 2026-10-08 (clarify)

- Q: Em que posição o 1º Empregotech aparece na lista de educação? → A: Pela data, como as demais:
  Pós → Bacharelado (2020–2024) → Empregotech (2020–2020) → Técnico (2018–2019). Empate no ano de
  início desempata pelo ano de término, do mais recente para o mais antigo.
- Q: Em que ordem aparecem os projetos principais? → A: SRG → Temas VS Code → ItaliaMi → OCR de
  prontuários → QClass-BOT → Monitor de Curso.
- Q: Os challenges vão do mais recente ou do mais antigo? → A: Do mais recente (cieepr-challenge,
  SET 2026) para o mais antigo (AxyaTest_API, JUL 2023).
- Q: O SRG mostra um período (ex.: "NOV 2024 — PRESENTE") além do selo de andamento? → A: Não, só
  o selo "EM DESENVOLVIMENTO", sem data de início.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Projetos um por linha, cada um com seu link (Priority: P1)

*Item 4 do autor.* Quem visita a seção de projetos lê um projeto por vez, de cima para baixo, em
cartões de largura inteira, e cada projeto tem à vista o link para acessá-lo.

**Why this priority**: é a mudança de estrutura que acomoda todo o conteúdo novo (itens 2, 3, 6, 7
e 9). Sem ela, os cartões novos se espremem em colunas estreitas.

**Independent Test**: abrir a seção de projetos em 1440px, 768px e 320px e verificar que há um só
projeto por linha em todas as larguras e que todo projeto com link mostra o link no próprio cartão.

**Acceptance Scenarios**:

1. **Given** uma tela larga (desktop), **When** o visitante chega à seção de projetos, **Then** cada
   projeto ocupa uma linha inteira e o seguinte vem abaixo dele, nunca ao lado.
2. **Given** qualquer projeto que tenha link, **When** o cartão é exibido, **Then** o link aparece
   no próprio cartão, abre em nova aba e diz para onde leva (nome do repositório ou da página).
3. **Given** um projeto sem nenhum link (exceção permitida pela constituição), **When** exibido,
   **Then** o cartão diz explicitamente por que não há link.

---

### User Story 2 - ItaliaMi com links para os repositórios privados (Priority: P1)

*Item 2 do autor.* O cartão do ItaliaMi deixa de dizer "sem link público" e passa a ter três
links (back-end, front-end e bot), cada um avisando que o repositório é privado.

**Why this priority**: pedido direto do autor sobre um projeto que já está no site, e o currículo
cita o ItaliaMi como projeto relevante.

**Independent Test**: abrir o cartão do ItaliaMi e verificar os três links, o aviso de privado em
cada um e que o clique abre a URL pedida em nova aba.

**Acceptance Scenarios**:

1. **Given** o cartão do ItaliaMi, **When** exibido, **Then** mostra três links (ItaliaMi-Back,
   ItaliaMi-Front e ItaliaMi-BOT) para as URLs pedidas pelo autor.
2. **Given** qualquer um desses links, **When** o visitante o vê (antes de clicar), **Then** fica
   claro que o repositório é privado e pode não abrir para ele.

---

### User Story 3 - Projetos privados ligados à Quadritech (Priority: P1)

*Item 3 do autor.* Dois projetos novos aparecem em projetos: a leitura de prontuários civil e
criminal via OCR (OCR_Para_BR) e o bot que coleta e analisa os dados das aulas realizadas por CFC
registrado (QClass-BOT). Os dois dizem que são privados e que tiveram relevância para a Quadritech.

**Why this priority**: mostram trabalho real ligado a uma experiência profissional do currículo, o
que reforça a credibilidade da experiência na Quadritech.

**Independent Test**: verificar os dois cartões novos com propósito, stack, papel, a menção à
Quadritech, o aviso de privado e o link de cada um.

**Acceptance Scenarios**:

1. **Given** a seção de projetos, **When** o visitante a percorre, **Then** encontra o projeto de
   OCR de prontuários e o QClass-BOT, cada um com propósito, stack, papel e link.
2. **Given** um desses dois cartões, **When** exibido, **Then** diz que o projeto é privado e que
   está relacionado à Quadritech Tecnologia, sem nenhum detalhe sigiloso além do que o autor
   forneceu.

---

### User Story 4 - SRG-Project em desenvolvimento (Priority: P1)

*Item 7 do autor.* O SRG aparece como projeto pessoal em andamento, com um selo de "em
desenvolvimento" no mesmo espírito do selo que marcava o vínculo atual na experiência, e com
links para os cinco repositórios.

**Why this priority**: é o trabalho atual do autor e o que melhor mostra a tese TypeScript/Vue do
portfólio (`PRODUCT.md`).

**Independent Test**: verificar o cartão do SRG com o selo de andamento, propósito, stack, papel e
os cinco links marcados como privados.

**Acceptance Scenarios**:

1. **Given** o cartão do SRG, **When** exibido, **Then** tem o selo "EM DESENVOLVIMENTO", sem data,
   e só ele tem esse selo.
2. **Given** o cartão do SRG, **When** exibido, **Then** mostra cinco links (SRG-Vue, SRG-Admin,
   SRG-Node, SRG-Core e SRG-DEVOPS), cada um marcado como repositório privado.
3. **Given** um leitor de tela, **When** chega ao cartão do SRG, **Then** o estado "em
   desenvolvimento" é anunciado em texto, não só pela cor do selo.

---

### User Story 5 - Sub-parte de Challenges (Priority: P2)

*Item 6 do autor.* Dentro de projetos há uma sub-parte "Challenges" com os 7 desafios técnicos
públicos, cada um com data, descrição curta, stack e link, em ordem de data de criação.

**Why this priority**: são evidências públicas e verificáveis da prática recente do autor, mas
secundárias diante dos projetos principais.

**Independent Test**: verificar que a sub-parte lista os 7 challenges na ordem das datas de criação,
cada um com link público que abre em nova aba.

**Acceptance Scenarios**:

1. **Given** a seção de projetos, **When** o visitante passa pelos projetos principais, **Then**
   encontra a sub-parte de challenges com título próprio, abaixo deles.
2. **Given** a sub-parte de challenges, **When** exibida, **Then** os 7 aparecem do mais recente para
   o mais antigo pela data de criação, cada um com a data (mês e ano), nome, descrição, stack e
   link.

---

### User Story 6 - Sub-parte de projeto comunitário (Priority: P2)

*Item 9 do autor.* Dentro de projetos há uma sub-parte de projetos comunitários com a gincana
junina promovida por estudantes da PUC-PR numa escola municipal de Curitiba, com link para a
notícia da PUC-PR.

**Why this priority**: mostra trabalho em equipe e envolvimento social, mas não é técnico.

**Independent Test**: verificar a sub-parte com o projeto comunitário, a data, o papel do autor e o
link para a notícia.

**Acceptance Scenarios**:

1. **Given** a seção de projetos, **When** o visitante chega ao fim dela, **Then** encontra a
   sub-parte de projetos comunitários com a gincana junina da PUC-PR.
2. **Given** o item da gincana, **When** exibido, **Then** mostra o que foi feito, onde, quando
   (JUN 2023), o papel do autor e o link para a notícia da PUC-PR.

---

### User Story 7 - 1º Empregotech na formação (Priority: P2)

*Item 8 do autor.* A seção de educação ganha o 1º Empregotech (Curitiba, 2020), com a observação de
que o curso abriu a porta para a Prime Control, uma das empresas que patrocinaram o programa, e com
as duas notícias como fonte.

**Why this priority**: explica a entrada do autor na primeira experiência da carreira e liga
formação e experiência.

**Independent Test**: verificar a formação nova com período, a observação sobre a Prime Control, os
dois links de fonte e a posição pedida pelo autor.

**Acceptance Scenarios**:

1. **Given** a seção de educação, **When** exibida, **Then** o 1º Empregotech aparece com o período
   `2020 — 2020`, cidade e instituição, entre o Bacharelado e o Técnico (ordem por data).
2. **Given** a formação do Empregotech, **When** exibida, **Then** traz a observação de que o curso
   levou à Prime Control, uma das patrocinadoras, e dois links de fonte que abrem em nova aba.

---

### User Story 8 - Terminais que digitam ao rolar (Priority: P2)

*Item 1 do autor.* Quando uma janela de terminal entra na tela durante a rolagem, os comandos dela
são digitados caractere a caractere e, ao fim de cada comando, a saída daquele comando aparece. Vale
para todas as janelas de terminal das seções (Sobre, projetos e Contato).

**Why this priority**: reforça a identidade de terminal, que é o diferencial do portfólio, mas é
efeito, não conteúdo.

**Independent Test**: rolar a página devagar e verificar que cada janela digita seus comandos e só
então mostra a saída; repetir com "reduzir movimento" ativo e com JavaScript desativado e
verificar que tudo aparece pronto.

**Acceptance Scenarios**:

1. **Given** movimento permitido, **When** uma janela de terminal entra na tela, **Then** o primeiro
   comando é digitado, a saída dele aparece em seguida e o mesmo vale para os próximos comandos da
   janela, em ordem.
2. **Given** uma janela que já terminou a animação, **When** o visitante rola para longe e volta,
   **Then** ela continua completa; a animação não se repete.
3. **Given** uma janela em animação, **When** o visitante clica ou toca nela, ou leva o foco do
   teclado para dentro dela, **Then** a janela se completa na hora.
4. **Given** "reduzir movimento" ativo ou JavaScript desativado, **When** a página é exibida,
   **Then** todas as janelas aparecem completas, sem digitação.
5. **Given** um leitor de tela, **When** chega a uma janela, **Then** lê o conteúdo completo, nunca
   um comando pela metade.
6. **Given** uma janela em animação, **When** a saída aparece, **Then** nada abaixo dela muda de
   lugar: o espaço da janela já é o final desde o início.

---

### User Story 9 - Ícones de verdade nos grupos de skills (Priority: P3)

*Item 5 do autor.* Cada grupo de skills troca o caractere improvisado por um ícone desenhado do
conjunto Lucide, escolhido pelo assunto do grupo.

**Why this priority**: melhora o acabamento visual, sem mudar conteúdo.

**Independent Test**: verificar que os 5 grupos têm um ícone Lucide coerente com o assunto, nas
cores do tema, e que os ícones aparecem também sem JavaScript.

**Acceptance Scenarios**:

1. **Given** a seção de skills, **When** exibida, **Then** cada grupo tem um ícone Lucide diferente,
   ligado ao assunto (código, web, dados, processos, DevOps).
2. **Given** um leitor de tela, **When** passa pelos grupos, **Then** os ícones são ignorados
   (decorativos) e o nome do grupo é lido normalmente.

---

### Edge Cases

- **Link privado clicado**: o visitante cai numa página "não encontrado" do GitHub. O aviso de
  privado precisa estar visível antes do clique, para isso não parecer link quebrado.
- **Projeto sem link nenhum (Monitor de Curso)**: continua sem link, com o motivo dito no cartão; o
  item 4 ("cada um tendo seu link") não se aplica a ele.
- **Visitante chega por âncora** (`#contato`, `#projetos`): as janelas que já estão na tela começam a
  digitar assim que a tela de boot some. Se a página ficar interativa só depois de a capa de boot
  sair (rede lenta), janelas que já estavam visíveis continuam completas: esconder texto já lido
  faria a janela piscar.
- **Tela de boot ativa**: janelas visíveis atrás da capa de boot só começam depois que ela some.
- **Rolagem rápida até o fim**: janelas que passaram pela tela sem parar podem ter terminado ou não;
  nenhuma fica incompleta por mais do que a própria duração da animação, e todas terminam sozinhas.
- **Foco por teclado num link dentro de uma saída que ainda não apareceu** (links de evidência,
  links de contato): a janela se completa antes de o foco chegar ao link, e o anel de foco fica
  visível.
- **Busca na página (Ctrl+F)** por um texto ainda não revelado: a janela se completa ao receber foco
  ou ao ser rolada para a tela pela busca, e o texto continua encontrável.
- **"Reduzir movimento" ligado no meio da visita**: janelas em animação se completam na hora.
- **Impressão**: todas as janelas saem completas.
- **Tela de 320px**: cartões de largura inteira, links e nomes longos de repositório quebram sem
  rolagem horizontal.
- **Challenges com mesma data de criação**: não há empate hoje; se houver, vale a ordem alfabética
  do nome.

## Requirements *(mandatory)*

### Functional Requirements

**Estrutura da seção de projetos (item 4)**

- **FR-001**: A seção de projetos MUST exibir um projeto por linha em todas as larguras de tela,
  com cartões de largura inteira.
- **FR-002**: Todo projeto com link MUST exibi-lo no próprio cartão, com o nome do destino (nome do
  repositório ou da página) como texto do link, ou um badge cujo texto alternativo nomeie o destino
  (caso dos Temas VS Code), abrindo em nova aba de forma isolada da página.
- **FR-003**: A seção de projetos MUST ter, nesta ordem: a lista principal de projetos, a sub-parte
  de challenges e a sub-parte de projetos comunitários, cada sub-parte com título próprio na
  hierarquia de títulos da página.
- **FR-004**: A lista principal MUST seguir a ordem de relevância definida pelo autor (Princípio II):
  SRG, Temas VS Code, ItaliaMi, OCR de prontuários, QClass-BOT e Monitor de Curso.

**Links para repositórios privados (itens 2, 3 e 7)**

- **FR-005**: Um link para repositório privado MUST ter um aviso visível, junto ao link e antes do
  clique, de que o repositório é privado e pode não abrir para o visitante (constituição v2.2.0); o
  mesmo aviso MUST estar no nome acessível do link. Vale para todo link privado, inclusive num
  cartão que também tenha links públicos.
- **FR-006**: O aviso de privado MUST diferenciar o link de um link público na forma (texto ou
  ícone), não só na cor.

**ItaliaMi (item 2)**

- **FR-007**: O cartão do ItaliaMi MUST ter três links privados:
  `https://github.com/V-Perotto/ItaliaMi-Back`, `https://github.com/V-Perotto/ItaliaMi-Front` e
  `https://github.com/V-Perotto/ItaliaMi-BOT`.
- **FR-008**: O cartão do ItaliaMi MUST deixar de dizer "Projeto confidencial, sem link público" e
  manter propósito, stack e papel atuais.

**Projetos ligados à Quadritech (item 3)**

- **FR-009**: A lista principal MUST incluir o projeto de leitura de prontuários civil e criminal
  via OCR, com link privado para `https://github.com/V-Perotto/OCR_Para_BR`, e o bot de coleta e
  análise das aulas realizadas por CFC registrado, com link privado para
  `https://github.com/V-Perotto/QClass-BOT`. Os dois MUST dizer que são privados e que estão
  relacionados à Quadritech Tecnologia.
- **FR-010**: Projetos cujos links são todos privados MUST se apoiar na exceção "código em
  repositório privado" do Princípio II (constituição v2.2.0), dita explicitamente no cartão. Um
  projeto sem link nenhum continua restrito às exceções de trabalho confidencial e de experiência
  acadêmica.
- **FR-011**: O projeto de OCR e o QClass-BOT MUST exibir propósito, stack e papel do autor: stack
  Python nos dois (o de prontuários com OCR) e papel "Autor e desenvolvedor".

**SRG-Project (item 7)**

- **FR-012**: A lista principal MUST incluir o SRG como projeto pessoal, com propósito (sistema de
  demonstrativo de aluguéis com console de administração), stack e papel do autor, e links privados
  para `https://github.com/V-Perotto/SRG-Vue`, `https://github.com/V-Perotto/SRG-Admin`,
  `https://github.com/V-Perotto/SRG-Node`, `https://github.com/V-Perotto/SRG-Core` e
  `https://github.com/V-Perotto/SRG-DEVOPS`.
- **FR-013**: Projetos em andamento MUST exibir o selo "EM DESENVOLVIMENTO" no visual do selo de
  vínculo atual da experiência (`HEAD`), sem data de início nem período, com o estado também em
  texto para tecnologias assistivas. O selo vem de um campo do projeto, não de regra fixa no
  componente.

**Challenges (item 6)**

- **FR-014**: A sub-parte de challenges MUST listar os 7 repositórios públicos:
  `https://github.com/V-Perotto/AxyaTest_API`, `https://github.com/V-Perotto/RPA_Challenge-NY_Times`,
  `https://github.com/V-Perotto/teste-pandavideo`,
  `https://github.com/V-Perotto/executiva-service-tech-challenge`,
  `https://github.com/V-Perotto/econet-challenge`, `https://github.com/V-Perotto/mobiis-challenge` e
  `https://github.com/V-Perotto/cieepr-challenge`.
- **FR-015**: Os challenges MUST aparecer ordenados pela data de criação do repositório, do mais
  recente para o mais antigo; a ordem MUST ser calculada a partir das datas nos dados, não da ordem
  em que foram escritos.
- **FR-016**: Cada challenge MUST exibir data de criação (`MMM AAAA`, mesmo formato dos períodos),
  nome, descrição curta do que o desafio pede, stack e link público.
- **FR-017**: A sub-parte de challenges MUST caber na tela de forma compacta: os 7 itens juntos não
  podem ocupar mais altura que 3 cartões da lista principal em desktop.

**Projeto comunitário (item 9)**

- **FR-018**: A sub-parte de projetos comunitários MUST conter a gincana junina promovida por
  estudantes da PUC-PR na Escola Municipal Professora Nansyr Cecato Cavichiolo (Curitiba), com data
  (`JUN 2023`), descrição do que foi feito, papel do autor e link para
  `https://www.pucpr.br/noticias/estudantes-da-pucpr-promovem-gincana-junina-em-escola-municipal-de-curitiba/`.
- **FR-019**: O projeto comunitário MUST ser identificado como projeto de extensão da PUC-PR, não
  como projeto de software, e por isso dispensa stack (constituição v2.2.0).

**Educação: 1º Empregotech (item 8)**

- **FR-020**: A seção de educação MUST incluir o 1º Empregotech, em Curitiba - PR, com período
  `2020 — 2020`.
- **FR-021**: A formação do Empregotech MUST trazer a observação de que o curso possibilitou a
  entrada do autor na Prime Control, uma das empresas patrocinadoras do programa.
- **FR-022**: A formação do Empregotech MUST ter dois links de fonte, abrindo em nova aba:
  `https://overbr.com.br/educacao/1o-empregotech-em-curitiba-capacita-300-jovens` e
  `https://www.curitiba.pr.gov.br/noticias/1empregotech-comeca-no-domingo-com-seminario-na-opera-de-arame/54852`.
- **FR-023**: Observações e fontes MUST ser opcionais para qualquer formação; formações sem elas
  continuam com o visual atual.
- **FR-024**: As formações MUST continuar ordenadas do ano de início mais recente para o mais
  antigo; com o mesmo ano de início, a de término mais recente vem antes. Resultado: Pós →
  Bacharelado → Empregotech → Técnico.

**Terminais animados (item 1)**

- **FR-025**: Toda janela de terminal das seções (Sobre, cada projeto e Contato) MUST, ao entrar na
  tela pela primeira vez, digitar cada comando caractere a caractere e exibir a saída daquele
  comando só depois que ele termina de ser digitado, seguindo a ordem dos comandos da janela.
- **FR-026**: A animação de uma janela MUST terminar em até 2,5 s a partir do início, qualquer que
  seja o tamanho dos comandos; comandos longos digitam mais rápido.
- **FR-027**: A animação MUST acontecer uma vez por visita; janelas já completas continuam completas
  ao sair e voltar à tela.
- **FR-028**: A animação MUST ser pulável: clique, toque ou foco do teclado dentro da janela a
  completa na hora.
- **FR-029**: Sem JavaScript, com "reduzir movimento" ativo (inclusive se ativado no meio da
  visita) e na impressão, todas as janelas MUST aparecer completas, sem digitação.
- **FR-030**: Tecnologias assistivas MUST receber sempre o conteúdo completo de cada janela; o texto
  parcial da digitação MUST ficar fora da árvore de acessibilidade.
- **FR-031**: A animação MUST não mudar a altura da janela nem deslocar o conteúdo abaixo dela.
- **FR-032**: Janelas cobertas pela tela de boot MUST começar a animar só depois que ela some.
- **FR-033**: Nenhum conteúdo MUST ficar escondido pela animação por mais de 5 s depois de a
  janela entrar na tela (Princípio IV).

**Ícones das skills (item 5)**

- **FR-034**: Cada grupo de skills MUST exibir um ícone do conjunto Lucide (lucide.dev) no lugar do
  caractere atual, escolhido pelo assunto do grupo.
- **FR-035**: Os ícones MUST estar no HTML pré-renderizado, sem nenhum carregamento de terceiros
  durante a visita, e MUST ser decorativos (ocultos de tecnologias assistivas).
- **FR-036**: A cor e o tamanho dos ícones MUST vir dos tokens do tema, e os ícones MUST continuar
  visíveis no modo de alto contraste do sistema.

**Transversais**

- **FR-037**: Todo o conteúdo novo (projetos, challenges, projeto comunitário, Empregotech, avisos
  de privado, selo de andamento) MUST estar no HTML pré-renderizado e legível sem JavaScript.
- **FR-038**: Todo o conteúdo novo MUST viver na fonte de dados única do currículo; nenhum texto do
  currículo dentro dos componentes.
- **FR-039**: O layout MUST continuar sem rolagem horizontal a partir de 320px, e o console MUST
  continuar sem erros nem avisos.
- **FR-040**: Os novos elementos interativos (links de projetos, challenges, fontes) MUST ser
  alcançáveis por teclado, com foco visível e contraste mínimo de 4,5:1.

### Key Entities

- **Projeto** (lista principal): nome, subtítulo, comando temático, propósito, stack, papel, tipo,
  rodapé, links (públicos ou privados), relação com empresa (opcional, ex.: "Quadritech
  Tecnologia"), estado de andamento (opcional) e motivo da falta de link (só nas exceções).
- **Link de projeto**: rótulo, URL, tipo (repositório, demo, página de marketplace, artigo) e
  visibilidade (público ou privado). Links privados levam o aviso do FR-005.
- **Challenge**: nome, data de criação do repositório (mês e ano), descrição curta, stack e link
  público. Pertence à sub-parte de challenges.
- **Projeto comunitário**: nome, instituição promotora, local, data (mês e ano), descrição, papel do
  autor e link para a fonte (notícia).
- **Formação**: curso, instituição, cidade, ano de início e fim, situação e, agora, observação
  opcional e links de fonte opcionais.
- **Grupo de skills**: passa a referenciar um ícone do conjunto Lucide no lugar do caractere.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 1440px, 768px e 320px, a seção de projetos mostra exatamente 1 projeto por linha
  (0 linhas com 2 ou mais projetos lado a lado).
- **SC-002**: 100% dos projetos da lista principal, exceto os da exceção acadêmica, têm ao menos um
  link no próprio cartão; 100% dos challenges e do projeto comunitário têm link.
- **SC-003**: 100% dos links privados (10 no total) exibem o aviso de privado antes do clique; numa
  rodada com 3 pessoas, nenhuma descreve um link privado como "link quebrado do site" depois de
  ler o aviso.
- **SC-004**: Os 7 challenges aparecem na ordem das datas de criação; trocar a ordem deles nos dados
  não muda a ordem exibida.
- **SC-005**: Cada janela de terminal fica completa em até 2,5 s depois de começar a animar, e
  nenhum conteúdo fica escondido por mais de 5 s depois de a janela entrar na tela.
- **SC-006**: Com JavaScript desativado, com "reduzir movimento" ativo e na impressão, 100% do texto
  das janelas de terminal e de todo o conteúdo novo aparece completo na primeira exibição.
- **SC-007**: A animação dos terminais não causa nenhum deslocamento de layout medível (0 de
  deslocamento acumulado atribuído às janelas).
- **SC-008**: Os 5 grupos de skills exibem um ícone Lucide; a página faz 0 requisições a terceiros
  por causa dos ícones.
- **SC-009**: A auditoria automática de acessibilidade continua com 0 violações, e o console com 0
  erros e 0 avisos, em desktop e mobile.
- **SC-010**: O peso da página entregue (HTML, CSS e JS iniciais) cresce no máximo 15 KB comprimidos
  em relação à versão anterior a esta feature.

## Assumptions

- **Escopo**: uma só feature cobre os 9 itens, com uma história de usuário por item e a
  rastreabilidade abaixo. Os itens mexem nos mesmos dados e na mesma seção de projetos, e separá-los
  em 9 features geraria conflito entre elas.
- **Animação dirigida pelo tempo**: a rolagem só dispara a animação (quando a janela entra na tela);
  a digitação corre no tempo, não acompanha a posição da rolagem. Segue a decisão do autor para o
  boot em dispositivo (plano 09).
- **Janelas animadas**: Sobre, cada cartão de projeto da lista principal e Contato. Challenges e o
  projeto comunitário são listas compactas, não janelas, e não digitam. O hero mantém seu prompt
  próprio, que já digita (FR-032 da 001).
- **Cliente do SRG**: o README do SRG cita a empresa que usa o sistema. O site não cita o cliente,
  porque o autor apresenta o SRG como projeto pessoal.
- **Stack do SRG**: vem dos repositórios locais (Vue 3, TypeScript, NestJS, PostgreSQL, Prisma,
  Valkey, Docker, Nginx). A do ItaliaMi continua a atual (Angular, C#, .NET).
- **Instituição do Empregotech**: "Prefeitura de Curitiba" (o programa é da Agência Curitiba com a
  FAS e a Assespro-PR). O termo "patrocinadoras" é o do autor; a notícia da prefeitura fala em
  "apoio" das empresas.
- **Papel no projeto comunitário**: "um dos estudantes organizadores", como na notícia da PUC-PR.
- **Ícones**: os 5 grupos de skills recebem ícone, além do cadeado dos links privados (FR-006). O
  Lucide não tem logotipos de marcas (Python, Vue etc.), então os chips de tecnologia continuam só
  com texto.
- **PDF do currículo**: o autor atualiza o PDF com os itens novos, fora do repositório.
- **Dependência**: o pacote de ícones Lucide para Vue entra como dependência nova, justificada no
  plano com o impacto no peso (Princípio III).
- **Pré-requisito**: emenda da constituição para a v2.2.0 (Princípio II), feita com
  `/speckit-constitution` antes do `/speckit-plan`.

## Rastreabilidade

| Item do autor | História | Requisitos |
|---|---|---|
| 1. Terminais animados ao rolar | US8 | FR-025 a FR-033 |
| 2. Links do ItaliaMi | US2 | FR-005 a FR-008 |
| 3. OCR e QClass (Quadritech) | US3 | FR-005, FR-006, FR-009 a FR-011 |
| 4. Um projeto por linha, cada um com link | US1 | FR-001 a FR-004 |
| 5. Ícones Lucide nas skills | US9 | FR-034 a FR-036 |
| 6. Sub-parte de challenges | US5 | FR-003, FR-014 a FR-017 |
| 7. SRG em desenvolvimento | US4 | FR-005, FR-006, FR-012, FR-013 |
| 8. 1º Empregotech na educação | US7 | FR-020 a FR-024 |
| 9. Projeto comunitário da PUC-PR | US6 | FR-003, FR-018, FR-019 |

[cv-outdated-vs-site]: decisão do autor de 2026-10-07 (site correto, PDF a atualizar)
