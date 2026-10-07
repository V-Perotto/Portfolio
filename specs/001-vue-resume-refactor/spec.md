# Feature Specification: Refatoração do Portfólio para Vue 3 com Vue Bits e Tailwind

**Feature Branch**: `main` (nenhum branch criado — não há hook `before_specify` configurado)

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "Crie uma especificação SpecKit detalhada para refatorar meu currículo
estático (HTML/CSS) para Vue 3 com Vue-Bits e Tailwind CSS. Referências de design: career-ops.org
(estrutura de dados limpa, foco em impacto e métricas) e tavus.io (tema dark, iluminação no hover,
tipografia moderna e animações sutis). Requisitos técnicos: Vue 3 (Composition API com
`<script setup>`); Vue-Bits (SpotlightCard, TextGenerateEffect, InfiniteScroll); Tailwind CSS com
CSS Variables para a paleta dark; conteúdo separado da UI em `src/data/resume.ts`. Cobrir: Contexto,
Arquitetura de Componentes, Design System e Critérios de Aceite."

## Contexto

### Situação atual

O portfólio é uma página única estática (`index.html` + `css/style.css` + `js/main.js`, ~1.300
linhas) com tema de terminal/Linux: tela de boot SSH falsa, chuva "matrix" no hero, título com
glitch, janelas de terminal e tipografia Iosevka. Seções: hero, `sobre`, `experiencia` (timeline
estilo `git log`, 5 vínculos), `skills` (5 categorias), `projetos` (3 cards, um com badges de
downloads do Open VSX), `educacao` (3 formações) e `contato` (GitHub e LinkedIn).

O conteúdo do currículo está **misturado ao markup**: cada alteração de cargo, data ou projeto exige
editar HTML com classes de estilo, o que já gerou 8 planos de mudança manuais (`plans/`). Os links
de contato já são dados separados em `js/main.js` (`extraLinks`), o único trecho que segue o padrão
desejado.

### Objetivo

1. **Separar conteúdo de apresentação**: todo o texto do currículo passa a viver em uma única fonte
   de dados tipada; a interface apenas a renderiza.
2. **Modernizar a apresentação sem trocar a identidade de terminal**, absorvendo das referências:
   - **career-ops.org** — hierarquia limpa, blocos escaneáveis, credibilidade por especificidade
     (números reais, evidências públicas), grade de 2 colunas para cards.
   - **tavus.io** — iluminação/realce no hover, revelação de texto e animações discretas. Paleta,
     tipografia e elementos de terminal continuam os atuais (Clarifications).
3. **Manter a paridade de conteúdo** e os compromissos de acessibilidade e desempenho já existentes.

### Relação com a constituição (v1.0.0)

- **Princípio I (Fidelidade ao Currículo)** e **II (Projetos Demonstráveis)**: reforçados — a fonte
  de dados única facilita a conferência contra o currículo. O "foco em métricas" da referência
  career-ops só se aplica a números que o currículo sustenta (ver FR-006).
- **Princípio IV (Acessibilidade e Desempenho)**: mantido integralmente como requisito (FR-020 a
  FR-027 e FR-035 a FR-037).
- **Princípio III (Simplicidade Estática)**: **conflita** com a v1.0.0 — o princípio proíbe
  framework, bundler e etapa de build obrigatória. Decidido emendá-lo para permitir build com saída
  100% estática (v2.0.0); a emenda é pré-requisito do `/speckit-plan`. Ver *Dependências e Riscos*.
- **Princípio V (Identidade Visual Coerente)**: compatível — a metáfora de terminal é mantida
  integralmente (FR-030 a FR-034).

## Clarifications

### Session 2026-10-06

- Q: O Princípio III deve ser emendado ou a feature repensada sem framework? → A: Emendar para
  permitir etapa de build, desde que a saída publicada seja 100% estática (constituição v2.0.0).
- Q: A metáfora de terminal continua? → A: Sim, integralmente — boot SSH, chuva matrix, glitch,
  prompt e títulos `~/secao`, Iosevka e paleta atual são recriados em Vue; os efeitos das
  referências (realce no hover, revelação de texto, faixa contínua) entram por cima dela.
- Q: De onde vêm os efeitos que não existem no Vue Bits? → A: Só Vue Bits — `BlurText` para a
  revelação do texto do hero e `LogoLoop` para a faixa de tecnologias.

### Session 2026-10-07

- Q: Um projeto pode aparecer sem evidência pública só quando o trabalho é confidencial, ou também
  quando apenas não foi publicado? → A: Só quando é confidencial (Princípio II). O ItaliaMi é tratado
  como trabalho confidencial e o card diz isso, sem detalhes sigilosos.
- Q: O limite de 5s da tela de boot conta a partir de quando, e o fade de saída entra na conta? → A:
  Conta da abertura da página (início da navegação) e inclui o fade: em até 5s o conteúdo está
  totalmente descoberto, por mais que o JavaScript demore.
- Q: No teste de 5 segundos do SC-003, quando começa a contagem, já que o boot sozinho pode levar
  até 5s? → A: Depois que a tela de boot some (sozinha ou pulada), como no SC-004.
- Q: Todas as seções aparecem sempre, ou só quando têm conteúdo? → A: Hero, Sobre e Contato sempre;
  Experiência, Skills, Projetos e Educação só com ao menos um item, junto com o link no menu.
- Q: Como alguém para o movimento contínuo (matrix, prompt digitando, faixa de tecnologias) sem ter
  ativado "reduzir movimento" no sistema? → A: Um controle de movimento alcançável por teclado (na
  navegação) que leva ao mesmo estado final do movimento reduzido; a escolha fica lembrada por
  visitante (FR-035).
- Q: Quais itens da revisão do `checklists/ux.md` viram mudança na spec? → A: 33 dos 40 (CHK001–006,
  008, 009, 011–019, 021, 025–029, 031–040), com a redação proposta na revisão; CHK007, 010, 020,
  022, 023, 024 e 030 ficam como estão.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recrutador avalia o perfil rapidamente (Priority: P1)

Uma pessoa recrutadora abre o portfólio a partir do currículo ou do LinkedIn e, sem rolar muito,
precisa entender quem é o autor, o posicionamento atual, a stack principal e a trajetória recente,
com impacto concreto de cada experiência.

**Why this priority**: é o motivo de existir do portfólio; sem isso nada mais importa. Esta história
sozinha (hero + sobre + experiência + contato) já é um MVP publicável.

**Independent Test**: abrir a página em desktop e em mobile e verificar que nome, cargo, resumo,
as 5 experiências e os canais de contato aparecem com o mesmo conteúdo factual da versão atual.

**Acceptance Scenarios**:

1. **Given** um visitante em desktop, **When** a página carrega, **Then** nome, título profissional,
   frase de posicionamento e um CTA para experiência e outro para contato ficam visíveis sem rolagem.
2. **Given** a seção de experiência, **When** o visitante a percorre, **Then** cada vínculo mostra
   cargo, empresa (ou "Empresa de Tecnologia (Confidencial)"), cidade, período, descrição de impacto
   e tecnologias, do mais recente para o mais antigo.
3. **Given** um vínculo encerrado, **When** exibido, **Then** o período aparece como intervalo
   fechado (ex.: `MAR 2026 — JUL 2026`) e sem selo de "atual".
4. **Given** um visitante em celular (largura 360px), **When** navega por todas as seções, **Then**
   não há rolagem horizontal e o menu de navegação abre, fecha e leva a cada seção.

---

### User Story 2 - Visitante comprova os projetos (Priority: P2)

Um visitante técnico quer verificar o trabalho do autor: o que cada projeto resolve, com qual stack,
qual o papel do autor e onde ver a evidência (repositório, demo, marketplace).

**Why this priority**: os projetos são o núcleo do portfólio (Princípio II), mas dependem do
esqueleto entregue pela P1.

**Independent Test**: abrir a seção de projetos e, para cada projeto, conferir propósito, stack,
papel e evidência; clicar em cada link externo e confirmar que abre em nova aba no destino correto.

**Acceptance Scenarios**:

1. **Given** a seção de projetos, **When** exibida, **Then** cada projeto mostra nome, propósito,
   stack, papel do autor e um rótulo de tipo (pessoal, acadêmico, open source).
2. **Given** um projeto com evidência pública, **When** o visitante ativa o link (mouse ou teclado),
   **Then** o destino abre em nova aba, sem dar à página aberta acesso à janela de origem.
3. **Given** o projeto "Temas VS Code", **When** o serviço de badges está fora do ar, **Then** o card
   continua legível, com o nome de cada tema e o link para o Open VSX funcionando.
4. **Given** um projeto confidencial sem evidência pública, **When** exibido, **Then** o card informa
   claramente que o trabalho é confidencial, em vez de mostrar link quebrado.

---

### User Story 3 - Autor atualiza o currículo editando só os dados (Priority: P2)

O autor precisa adicionar uma experiência, encerrar um vínculo, incluir um projeto ou ajustar uma
skill sem tocar em nenhum componente visual.

**Why this priority**: elimina a principal fonte de retrabalho atual e torna viável cumprir o
Princípio I a cada atualização do currículo.

**Independent Test**: adicionar uma experiência fictícia apenas na fonte de dados, gerar o site e
verificar que ela aparece na posição correta, com o mesmo estilo das demais; remover e confirmar que
some sem resíduos.

**Acceptance Scenarios**:

1. **Given** a fonte de dados do currículo, **When** o autor adiciona um item em qualquer coleção
   (experiência, projeto, skill, formação, contato), **Then** ele aparece no site sem alteração em
   nenhum outro arquivo.
2. **Given** um item com campo obrigatório ausente ou com tipo errado, **When** o site é gerado,
   **Then** a geração falha com uma mensagem que identifica o item e o campo.
3. **Given** um item opcional ausente (ex.: projeto sem métricas), **When** renderizado, **Then** o
   bloco correspondente simplesmente não aparece — sem rótulos vazios, "undefined" ou espaços órfãos.

---

### User Story 4 - Experiência visual moderna e discreta (Priority: P3)

O visitante percebe um site escuro, polido, com cards que se iluminam sob o cursor, título com
revelação animada e uma faixa contínua de tecnologias — sem que nada atrapalhe a leitura.

**Why this priority**: diferencia o portfólio, mas é refinamento sobre conteúdo já entregue.

**Independent Test**: navegar com mouse, com teclado e com a preferência de movimento reduzido
ativada; conferir efeitos, foco visível e ausência de movimento quando reduzido.

**Acceptance Scenarios**:

1. **Given** um cartão de experiência, projeto, skill ou formação, **When** o cursor se move sobre ele,
   **Then** um realce luminoso acompanha a posição do cursor e desaparece ao sair.
2. **Given** um cartão de projeto com links, **When** um desses links recebe foco via teclado,
   **Then** o cartão mostra o mesmo realce do hover e o link tem anel de foco visível.
3. **Given** o hero, **When** a página carrega, **Then** o texto de posicionamento é revelado
   progressivamente em até 1,5s e fica totalmente legível depois disso.
4. **Given** a seção de skills, **When** exibida, **Then** uma faixa com as tecnologias principais
   rola continuamente, pausa no hover e não duplica a leitura para leitores de tela.
5. **Given** a preferência "reduzir movimento" ativa, **When** a página carrega, **Then** todos os efeitos
   da lista do FR-020 ficam desligados e o conteúdo aparece no estado final.
6. **Given** a primeira renderização, **When** a tela de boot SSH aparece, **Then** ela some sozinha,
   com o fade de saída concluído, em no máximo 5s contados da abertura da página, ou antes, a
   qualquer tecla ou clique.
7. **Given** o hero, **When** carregado, **Then** o nome tem efeito glitch, o prompt
   `viper@portfolio:~$` digita e apaga em loop as frases atuais (`whoami`, cargos e o `echo` da stack)
   e a chuva matrix roda ao fundo, como hoje.
8. **Given** os efeitos em execução e "reduzir movimento" desligado no sistema, **When** o visitante
   aciona o controle de movimento por teclado, toque ou mouse, **Then** matrix, glitch, digitação e
   faixa param no mesmo estado final do movimento reduzido, e a escolha vale nas visitas seguintes.

---

### Edge Cases

- JavaScript desabilitado ou falho: o conteúdo do currículo MUST continuar legível (ver FR-012 e
  FR-018).
- Serviço externo de badges indisponível ou lento: o card de projeto mantém layout e links.
- Textos longos (nome de tema "Shadow Lord - Son of Dathomir Theme", empresas longas) não quebram o
  layout em 360px.
- Coleção vazia (ex.: nenhuma formação): a seção correspondente não é renderizada nem aparece no
  menu (FR-008).
- Vínculo em andamento (ex.: pós-graduação "EM CURSO"): selo de "atual" aparece só nesses itens.
- Dispositivos de toque: o realce dos cartões não aparece (FR-014) e nenhuma informação depende
  dele.
- Âncoras diretas (`/#projetos`) compartilhadas por link: a página abre na seção certa, com o título
  visível abaixo da navegação fixa (FR-008). Com a tela de boot, ela aparece normalmente e, ao
  terminar, a página já está na seção da âncora.
- Impressão da página: o conteúdo sai legível em fundo claro, sem animações.

## Requirements *(mandatory)*

### Functional Requirements

**Conteúdo e dados**

- **FR-001**: Todo o conteúdo textual do currículo (perfil, resumo, atributos pessoais, idiomas,
  experiências, skills, projetos, formação, contatos, metadados de SEO) MUST vir de uma única fonte
  de dados, separada dos componentes de interface.
- **FR-002**: A fonte de dados MUST ser tipada; campos obrigatórios ausentes ou de tipo errado MUST
  impedir a geração do site com erro que aponte o item e o campo.
- **FR-003**: A primeira versão MUST ter paridade de conteúdo com a página atual: as 5 experiências,
  5 categorias de skills, 3 projetos, 3 formações, 5 atributos pessoais e todos os canais de contato,
  com texto factual idêntico (ajustes de redação só com conferência contra o currículo).
- **FR-004**: Experiências e formações MUST ser ordenadas da mais recente para a mais antiga a
  partir das datas nos dados, não da ordem de declaração.
- **FR-005**: Períodos MUST ser exibidos num formato único (`MMM AAAA — MMM AAAA`, em pt-BR); itens
  sem data de término MUST exibir "PRESENTE"/"EM CURSO" com selo de atual.
- **FR-006**: Cada experiência e projeto MAY declarar destaques de impacto (métrica + rótulo, ex.:
  "-40% tempo de pesquisa"); quando declarados, MUST ser exibidos logo após a descrição, com o valor em `--green-bright` peso
  700 e o rótulo em `--text-dim`. Nenhuma
  métrica MUST ser inventada para preencher o layout (Princípio I).
- **FR-007**: Empregadores marcados como confidenciais MUST ser exibidos com nome anonimizado.

**Seções e navegação**

- **FR-008**: O site MUST conter as seções Hero, Sobre e Contato sempre, e as seções Experiência,
  Skills, Projetos e Educação sempre que a coleção correspondente tiver ao menos um item (vazia → a
  seção e o link do menu não aparecem); cada seção exibida é acessível por âncora estável
  (`#sobre`, `#experiencia`, `#skills`, `#projetos`, `#educacao`, `#contato`) para não quebrar
  links já compartilhados. Ao abrir uma âncora, o título da seção MUST aparecer abaixo da navegação
  fixa, nunca coberto por ela.
- **FR-009**: A navegação MUST permanecer visível ao rolar e indicar a seção ativa, de forma visual
  e anunciada a tecnologias assistivas como item atual. Em telas estreitas, MUST recolher-se em menu
  acionável por toque e teclado, com estado aberto/fechado anunciado; Esc fecha o menu e devolve o
  foco ao botão, escolher um item fecha o menu, e o foco não fica preso dentro dele.
- **FR-010**: Cada projeto MUST exibir nome, propósito, stack, papel do autor, tipo e as evidências
  públicas. Só projetos confidenciais MAY não ter evidência pública; nesse caso o card MUST dizer que
  o trabalho é confidencial, sem detalhes sigilosos (Princípio II). Projeto não confidencial sem
  evidência não é exibido.
- **FR-011**: Links externos MUST abrir em nova aba de forma isolada da página de origem, com
  indicação visual e um texto para tecnologias assistivas ("abre em nova aba"). Badges dinâmicos
  MUST ter texto alternativo descritivo e espaço reservado de tamanho fixo; se a imagem falhar ou
  demorar, o layout não se desloca, nenhum ícone de imagem quebrada aparece e o nome e o link da
  evidência continuam visíveis.
- **FR-012**: O conteúdo textual MUST estar presente no HTML entregue (pré-renderizado), para
  funcionar sem JavaScript, ser indexável e permitir leitura imediata.
- **FR-013**: O rodapé MUST exibir o ano corrente e o crédito de autoria.

**Efeitos visuais**

- **FR-014**: Cartões de experiência, projeto, skill e formação MUST ter realce luminoso que segue o
  cursor no hover. Cartões que contêm elemento focável (links) MUST mostrar realce equivalente (o
  mesmo brilho, na mesma cor, centralizado no cartão) quando esse elemento recebe foco por teclado;
  cartões sem elemento interativo não entram na ordem de tabulação (research R8). Em telas de toque
  (sem ponteiro com hover), o realce não aparece.
- **FR-015**: O texto de posicionamento do hero MUST ter revelação progressiva (palavra a palavra)
  concluída em no máximo 1,5s no total, qualquer que seja o número de palavras (o intervalo entre
  palavras se ajusta ao tamanho da frase).
- **FR-016**: A seção de skills MUST ter uma faixa de tecnologias em rolagem contínua, com
  velocidade constante de no máximo 60 px/s, alimentada pela mesma fonte de dados, que pausa no
  hover, para com o controle do FR-035 e é ignorada por leitores de tela e pela ordem de tabulação
  (a lista acessível é a das categorias).
- **FR-017**: Seções MAY ter animação de entrada ao rolar, com duração entre 300ms e 800ms e
  deslocamento máximo de 24px.
- **FR-018**: Nenhum efeito MUST esconder conteúdo de forma permanente: se a animação não rodar, o
  conteúdo aparece no estado final. Se o script inicial rodar mas o JavaScript principal falhar ou
  não carregar, o conteúdo MUST aparecer no estado final em no máximo 5s do início da navegação.
- **FR-019**: Efeitos baseados em hover MUST ser decorativos; nenhuma informação pode depender deles.

**Acessibilidade e desempenho** (Princípio IV)

- **FR-020**: Com "reduzir movimento" ativo, MUST não haver: tela de boot, animações de entrada ao
  rolar, revelação de texto do hero, digitação do prompt, glitch, chuva matrix, rolagem da faixa de
  tecnologias, cursor piscando nem transições de hover/foco; o conteúdo aparece no estado final.
  Esta é a lista única de efeitos desligados; os demais trechos da spec remetem a ela. Mudar a
  preferência no sistema durante a visita MUST ter efeito imediato.
- **FR-021**: Todo elemento interativo MUST ser alcançável e operável por teclado, com foco visível
  de contraste mínimo 3:1 contra `--bg`, `--bg-alt`, `--surface` e `--surface-2`.
- **FR-022**: Texto MUST ter contraste mínimo de 4.5:1; só títulos com 24px ou mais já no menor
  tamanho (em 360px de largura) MAY usar 3:1. Vale sobre todos os fundos em que o texto aparece,
  incluindo a área iluminada pelo realce dos cartões e o interior dos chips e da faixa de
  tecnologias.
- **FR-023**: A página MUST usar estrutura semântica (um `h1`, hierarquia de títulos sem saltos,
  landmarks de navegação, conteúdo principal e rodapé) e `lang="pt-BR"`.
- **FR-024**: Imagens decorativas MUST ser ocultadas de tecnologias assistivas; imagens
  informativas MUST ter texto alternativo.
- **FR-025**: O layout MUST funcionar a partir de 320px de largura (equivalente a zoom de 400% em
  1280px) sem rolagem horizontal; acima de 1920px o conteúdo fica centralizado na largura máxima do
  container. Com texto ampliado em 200% ou espaçamento de texto aumentado (altura de linha 1.5,
  parágrafos 2×, letras 0.12em, palavras 0.16em), nenhum conteúdo é cortado nem sobreposto.
- **FR-026**: O console do navegador MUST ficar sem erros nem avisos em produção.
- **FR-027**: A versão impressa MUST sair em fundo claro, sem animações e com todos os links
  visíveis como texto.
- **FR-035**: A navegação MUST ter um controle de movimento, operável por teclado e toque, com
  estado (ligado/desligado) anunciado a tecnologias assistivas. Desligado, a página fica no mesmo
  estado do FR-020 para os efeitos contínuos (chuva matrix, glitch, digitação, faixa de
  tecnologias, cursor piscando). A escolha MUST ser lembrada por visitante entre visitas; com "reduzir movimento"
  ativo no sistema, o movimento já começa desligado. Sem JavaScript, o controle não aparece.
- **FR-036**: Os enfeites de terminal (`##` e `/` dos títulos, `$` e `>` dos prompts) MUST ficar
  ocultos de tecnologias assistivas, para que cada título seja lido só com o nome da seção; os
  comandos de abertura continuam legíveis. A tela de boot MUST ficar oculta de tecnologias
  assistivas e não mover o foco, nem durante nem depois dela. Leitores de tela leem só a frase
  estática do prompt do hero (cargo principal); a digitação fica oculta deles.
- **FR-037**: No modo de alto contraste do sistema (forced colors), anel de foco, bordas de cartões e
  selos MUST continuar visíveis; scanlines e chuva matrix não aparecem.

**Entrega e SEO**

- **FR-028**: O resultado final MUST ser um conjunto de arquivos estáticos servível por qualquer
  hospedagem estática, sem servidor de aplicação.
- **FR-029**: Título, descrição, idioma e metadados de compartilhamento (Open Graph) MUST vir da
  fonte de dados.

**Identidade visual**

- **FR-030**: O novo visual MUST manter integralmente a metáfora de terminal atual (Princípio V):
  logo-prompt `viper@portfolio:~$` com cursor, links `~/secao`, títulos `## secao/`, linhas de
  comando de abertura por seção (`$ git log …`, `$ ls -la …`), janelas de terminal com barra e
  controles, chips, overlay de scanlines, paleta roxo + verde e tipografia Iosevka.
- **FR-031**: A tela de boot SSH MUST ser preservada: pulável por qualquer tecla ou clique e omitida
  com movimento reduzido. O conteúdo MUST ficar totalmente descoberto (fade de saída concluído) em no
  máximo 5s contados do início da navegação, independentemente de quando o JavaScript carrega; se o
  JavaScript chegar tarde demais para cumprir isso, o boot não aparece.
- **FR-032**: O hero MUST preservar o título com glitch, o prompt que digita e apaga frases em loop
  (lista vinda da fonte de dados) e a chuva matrix ao fundo. Com movimento reduzido (FR-020), o
  prompt exibe o cargo principal, estático. O glitch MUST piscar no máximo 3 vezes por segundo.
- **FR-033**: Os textos temáticos de terminal (comandos de abertura, títulos de janela, `exit 0`,
  rodapé "process finished") são rótulos de interface, não conteúdo do currículo, e MAY ficar nos
  componentes; o crédito do rodapé MUST refletir a nova stack.
- **FR-034**: Os efeitos novos (FR-014 a FR-016) MUST usar as cores da paleta de terminal: o realce
  do hover no roxo de destaque e a faixa de tecnologias no estilo dos chips atuais.

### Key Entities *(include if feature involves data)*

- **Perfil**: nome, título profissional, frases do prompt digitado do hero e qual delas fica
  estática com movimento reduzido, frase de posicionamento, resumo ("sobre", com trechos
  destacados), atributos pessoais (localização, cidadania, idiomas com nível), metadados de SEO.
- **Experiência**: cargo, empresa, flag de confidencialidade, cidade/UF, início, término (opcional),
  descrição, destaques de impacto (opcional, lista de métrica + rótulo), tecnologias.
- **Categoria de Skill**: identificador, título, ícone opcional, lista de tecnologias; um subconjunto
  marcado como "principal" alimenta a faixa contínua.
- **Projeto**: identificador, nome, subtítulo, linha de comando temática, propósito, stack, papel do
  autor, tipo (pessoal, acadêmico, open source, profissional), rótulo de rodapé, destaques de
  impacto (opcional), evidências ou, só se confidencial, o motivo da ausência delas.
- **Evidência**: rótulo, URL, tipo (repositório, demo, marketplace, artigo), badge dinâmico
  opcional (URL da imagem + texto alternativo) e cor de destaque opcional. Pertence a um Projeto.
- **Formação**: curso, instituição, cidade/UF, ano de início, ano de término (opcional), status.
- **Contato**: canal (hoje GitHub e LinkedIn), rótulo exibido, URL.

Os campos exatos, tipos e regras de validação estão em [data-model.md](data-model.md).

## Arquitetura de Componentes

> Esta seção registra **restrições técnicas definidas pelo usuário** (Vue 3, Vue Bits, Tailwind,
> arquivo de dados em `src/data/resume.ts`). Elas são o ponto de partida obrigatório para
> `/speckit-plan`, que detalhará versões, build e testes.

### Princípios de composição

- Vue 3 com Composition API, exclusivamente via `<script setup lang="ts">`.
- **Dados → seções → componentes base**: componentes de seção recebem fatias tipadas de
  `src/data/resume.ts` por props; nenhum componente contém texto do currículo hard-coded (apenas
  rótulos de interface, como "Ver projeto").
- Componentes de terceiros (Vue Bits e equivalentes) são encapsulados em componentes base do
  projeto, para que a troca de biblioteca não afete as seções e para centralizar o tratamento de
  movimento reduzido.

### Árvore de componentes

A árvore completa e vinculante, com testes e arquivos de configuração, está em
[plan.md](plan.md) (*Project Structure*). Resumo:

```text
src/
├── data/resume.ts           # fonte única de conteúdo (satisfies Resume)
├── types/resume.ts          # tipos (= contracts/resume.schema.ts)
├── lib/                     # period.ts (FR-005), sort.ts (FR-004), sections.ts
├── composables/             # useMotion, useActiveSection (FR-009), useHeadFromResume (FR-029)
├── directives/reveal.ts     # v-reveal: entrada ao rolar (FR-017)
├── components/
│   ├── vendor/vue-bits/     # SpotlightCard, BlurText, LogoLoop (código copiado)
│   ├── base/                # BaseCard (FR-014), RevealText (FR-015), TechMarquee (FR-016),
│   │                        # TagChip, MetricBadge (FR-006), ExternalLink (FR-011), RichText
│   ├── terminal/            # BootScreen, MatrixRain, GlitchTitle, TypedPrompt, PromptLogo,
│   │                        # TerminalWindow, TerminalLine, Scanlines (FR-030 a FR-033)
│   ├── layout/              # AppNav, SectionShell, AppFooter
│   └── sections/            # Hero, About, Experience(+Card), Skills(+SkillGroupCard),
│                            # Projects(+ProjectCard, EvidenceLink), Education(+Card), Contact
├── styles/                  # tokens.css, fonts.css, base.css, main.css
├── App.vue                  # compõe as seções na ordem do FR-008
└── main.ts                  # ViteSSG single page
```

### Mapeamento dos componentes de UI solicitados

Verificado no repositório do Vue Bits (`DavidHDev/vue-bits`) em 2026-10-06:

| Solicitado | Existe no Vue Bits? | Uso nesta feature | Alternativa |
|------------|---------------------|-------------------|-------------|
| `SpotlightCard` | Sim (`Components/SpotlightCard`) | `BaseCard.vue` em experiência, projeto, skill e formação | — |
| `TextGenerateEffect` | **Não** (é do Aceternity; a versão Vue está no Inspira UI) | `RevealText.vue` na frase do hero | **Decidido**: Vue Bits `BlurText` |
| `InfiniteScroll` | **Não** (existia no React Bits; o Vue Bits não portou) | `TechMarquee.vue` em skills | **Decidido**: Vue Bits `LogoLoop` |

O projeto usa uma única biblioteca de UI (Vue Bits). Os wrappers em `components/base/` isolam a
dependência. Os efeitos de terminal (boot, matrix, glitch, digitação) já existem em JS puro e são
portados como componentes próprios; o `/speckit-plan` pode avaliar `GlitchText` e `TextType` do
Vue Bits como substitutos, desde que o resultado visual seja o atual.

### Contrato da fonte de dados (`src/data/resume.ts`)

- Exporta um objeto `resume` com as coleções das *Key Entities*; os tipos ficam em
  `src/types/resume.ts` (contrato em `contracts/resume.schema.ts`, campos em `data-model.md`).
- Datas como strings ISO parciais (`"2026-03"`); a formatação de exibição fica em `src/lib/period.ts`.
- O único lugar a editar para o fluxo da User Story 3; a tipagem cumpre o FR-002 na geração.

## Design System

### Tokens (CSS Variables → Tailwind)

As cores ficam em CSS Variables em `:root` (`src/styles/tokens.css`) com nomes curtos
(`--surface`), e o tema do Tailwind as expõe com o prefixo `--color-` (`--color-surface:
var(--surface)`), o que gera as classes semânticas (`bg-surface`). Os componentes usam essas classes
ou `var(--surface)`, e a paleta muda em um único lugar.

A paleta é a atual de `css/style.css`, migrada sem mudança de valores (FR-030). Só o realce do
SpotlightCard é novo:

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#0a0612` | fundo da página |
| `--bg-alt` | `#0d0a16` | fundo alternado de seção |
| `--surface` | `#16101f` | cards e janelas de terminal |
| `--surface-2` | `#1c1428` | barra de janela, menu mobile |
| `--border` | `#2c1d40` | bordas e divisores |
| `--purple` / `--purple-light` / `--purple-glow` | `#462066` / `#7b3fb3` / `#a06ae0` | destaques, links, foco, glitch |
| `--green` / `--green-light` / `--green-bright` | `#205e44` / `#2fa876` / `#4ade9b` | prompt, CTA, selo "atual", métricas |
| `--text` / `--text-dim` | `#d8d2e4` / `#8a819e` | texto principal / secundário |
| `--spotlight` *(novo)* | `rgb(160 106 224 / 0.18)` | realce do SpotlightCard |

Todos os pares texto/fundo MUST ser validados contra o FR-022 antes do merge.

### Tipografia

- Escala de títulos (valores atuais, fluidos): `h1` `clamp(2.2rem, 7vw, 4.5rem)`, `h2`
  `clamp(1.5rem, 4vw, 2.1rem)`, prompt do hero `clamp(0.95rem, 2.4vw, 1.25rem)`; demais tamanhos
  conforme `legacy/css/style.css`.
- Altura de linha: 1.1 em títulos, 1.6 no corpo; largura máxima de parágrafo de ~70 caracteres.
- Famílias: Iosevka (mono) para prompt, navegação, títulos de seção, datas e janelas de terminal;
  Iosevka Aile para corpo. Os `.woff2` com subset (`fonts/`, gerados por `tools/build-fonts.sh`)
  são reaproveitados com os mesmos pesos (400, 600, 700, 800 / Aile 400, 700) e o mesmo preload.

### Espaçamento, forma e layout

- Escala do Tailwind (base de 4px) para espaçamentos internos; seções com `padding`
  `5rem 1.5rem 2rem` e hero com `6rem 1.5rem 4rem` (valores atuais, tokens `--section-pad` e
  `--hero-pad`).
- Container de no máximo 1100px (`--container-page`), conteúdo do hero com no máximo 820px, margem
  lateral de 1.5rem.
- Grade: 1 coluna < 768px; 2 colunas para projetos e skills ≥ 768px; timeline de experiência em
  coluna única com marcador lateral.
- Raio (valores atuais): 10px em janelas de terminal, 8px em cards (sobrescreve o `rounded-3xl`
  padrão do SpotlightCard), 6px em botões, 4px em links da navegação, 3px em selos, 999px em chips.
- Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

### Movimento

- Hover/foco: 150–250ms, `ease-out`.
- Entrada de seção: 300–800ms, deslocamento ≤ 24px, disparada uma vez por seção.
- Revelação do hero: ≤ 1,5s no total.
- Faixa contínua: velocidade constante de no máximo 60 px/s, pausa no hover.
- Movimento reduzido ou controle de movimento desligado: vale a lista do FR-020 (e do FR-035 para
  o controle).

### Estados

Cada componente interativo define: padrão, hover, foco visível (anel de 2px em `--purple-glow`
com afastamento de 2px), ativo e, para links externos, um indicador visual de "abre em nova aba"
com texto equivalente para tecnologias assistivas (FR-011).

## Success Criteria *(mandatory)*

### Measurable Outcomes (Critérios de Aceite)

- **SC-001**: 100% dos itens factuais da página atual (5 experiências, 5 categorias de skills,
  3 projetos, 3 formações, 5 atributos, todos os contatos) aparecem na nova versão com o mesmo
  conteúdo, conferidos item a item.
- **SC-002**: Adicionar, alterar ou remover uma experiência ou projeto exige editar exatamente
  1 arquivo e leva menos de 5 minutos.
- **SC-003**: Em 5 segundos após a tela de boot sumir (sozinha ou pulada), um visitante identifica
  nome, cargo e como entrar em contato. Teste com ao menos 3 pessoas que não conhecem o autor, ao
  menos uma em celular; acertar = dizer o nome, o cargo e um canal de contato; todas precisam
  acertar.
- **SC-004**: O conteúdo principal fica visível em menos de 2,5s numa conexão 4G simulada, e o
  layout não se desloca de forma perceptível durante o carregamento (deslocamento acumulado < 0,1).
  Medido com Lighthouse em perfil móvel, emulando "reduzir movimento" (sem a tela de boot, que é
  pulável e tem seu próprio teto no FR-031).
- **SC-005**: Zero violações críticas ou sérias no axe e nota de acessibilidade ≥ 95 no
  Lighthouse, em celular e desktop.
- **SC-006**: Todas as seções, links e o menu são operáveis só com teclado, com foco sempre visível.
- **SC-007**: Com "reduzir movimento" ativo, ou depois de desligar o controle de movimento (FR-035),
  nenhum elemento se move sozinho, sem interação do visitante: o cursor não pisca; o realce sob o
  ponteiro continua permitido.
- **SC-008**: Nenhuma rolagem horizontal em 320px, 360px, 768px, 1280px e 1920px de largura.
- **SC-009**: Console do navegador sem erros nem avisos em desktop e mobile.
- **SC-010**: Todas as âncoras atuais (`#sobre` … `#contato`) continuam levando à seção correta.
- **SC-011**: Com o serviço de badges bloqueado, todos os cards de projeto continuam legíveis e com
  os links funcionando.
- **SC-012**: O peso total transferido no carregamento inicial, sem rolar a página, não ultrapassa
  500 KB (excluindo badges externos).

## Assumptions

- O idioma do site continua apenas pt-BR; versão em inglês fica fora do escopo.
- A nova versão substitui a atual no mesmo repositório; a versão HTML/CSS/JS permanece no histórico
  do git, e os assets reaproveitáveis (fontes com subset, imagens `.webp`) migram para o novo
  projeto.
- Hospedagem segue estática; a etapa de build roda na máquina do autor ou em CI, nunca no servidor.
- O conteúdo atual não tem métricas de impacto; os campos de métrica (FR-006) nascem vazios e o
  autor os preenche só com números que o currículo sustente.
- A tela de boot SSH aparece em toda visita, como hoje; mostrá-la só na primeira visita fica fora do
  escopo.
- Componentes do Vue Bits são copiados para o projeto pelo CLI oficial (jsrepo) e passam a ser
  código do projeto, versionado e ajustável: raio, cores, duração e estado inicial podem ser
  alterados no código copiado (ex.: `rounded-3xl` → 8px; texto da revelação visível no HTML
  pré-renderizado).
- Termos técnicos em inglês de uso corrente (`whoami`, nomes de tecnologias, comandos) ficam sem
  marcação de idioma própria, sob o `lang="pt-BR"` da página (Princípio V).
- Os destinos dos links atuais (GitHub `V-Perotto`, LinkedIn `vittorioperotto`, Open VSX
  `DistroLinux`) continuam válidos.

## Dependências e Riscos

- **Emenda constitucional (bloqueante)**: o Princípio III da v1.0.0 proíbe framework, bundler e
  build obrigatório. Decidido emendá-lo para permitir build com saída 100% estática (MAJOR →
  v2.0.0) via `/speckit-constitution`; o `/speckit-plan` só deve rodar depois dessa emenda.
- **Bibliotecas de UI**: só Vue Bits. `TextGenerateEffect` e `InfiniteScroll` não existem nele e são
  substituídos por `BlurText` e `LogoLoop`.
- **Peso dos efeitos de terminal**: a chuva matrix em canvas e o boot precisam manter o custo
  atual; recriá-los em Vue não pode piorar o SC-004 nem o SC-012.
- **Peso**: bibliotecas de animação (GSAP, motion) podem estourar o SC-012; o plano deve medir.
- **SEO/sem JS**: um app Vue renderizado só no cliente violaria o FR-012; o plano precisa prever
  pré-renderização.

## Fora de Escopo

- Blog, CMS, painel administrativo ou edição de conteúdo pelo navegador.
- Formulário de contato com envio pelo servidor.
- Internacionalização (i18n) e alternância de tema claro/escuro na interface.
- Download do PDF do currículo (o PDF não é versionado).
- Analytics e cookies.
