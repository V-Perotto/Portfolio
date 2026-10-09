<!--
Sync Impact Report
- Version change: 2.3.0 → 3.0.0 (MAJOR: a exceção da tela de boot no Princípio IV é redefinida de
  forma incompatível — deixa de garantir a página descoberta sem ação do visitante em até 7 s e de
  ser omitida com movimento reduzido; vira uma porta de acesso que espera o visitante)
- Modified principles:
  - IV. Acessibilidade e Desempenho (exceção da tela de boot: "não pulável, página descoberta em
    ≤ 7 s do início da navegação, omitida com movimento reduzido e sem JavaScript" passa a "porta de
    acesso: a página só é descoberta depois de uma ação do visitante, sem teto para essa ação;
    depois dela, ≤ 4 s; operável por teclado e leitor de tela; fechar só encerra a tentativa; sem
    JavaScript, sem porta; com movimento reduzido, porta sem nenhuma animação"; a lista de
    animações decorativas troca "boot, matrix" por "porta de acesso, fundos animados")
- Added sections: none
- Removed sections: none
- Templates: not modified by this command (dependent templates read the constitution at runtime)
- Dependent artifacts: specs/005-access-gate-dotfield (FR-001 a FR-012, FR-019, FR-020) aplica a
  exceção nova; o FR-032 e o FR-033 da 004 e o FR-031 da 001, quanto ao boot, ficam substituídos
  pela 005 — a cargo do /speckit-plan e do /speckit-implement da 005 (script inline de `index.html`
  e tela de boot). Princípio III sem mudança de texto: a consulta do IP do visitante é uma exceção
  justificada já permitida, registrada no plano da 005.
- Origem: decisão do autor em 2026-10-09 (feature 005, item 1 "fazendo com que o usuário tenha que
  clicar"; specify Q1: emendar, porta sem teto; clarify: porta também com movimento reduzido, sem
  animação)
- Follow-up TODOs: none
-->

# Portfólio Vittorio Perotto Constitution

## Core Principles

### I. Fidelidade ao Currículo

O portfólio existe para demonstrar os projetos e as informações relevantes do currículo do autor.
O currículo vigente é a fonte da verdade para todo o conteúdo factual.

- Todo cargo, empresa, período, formação, certificação e tecnologia exibido MUST corresponder ao
  currículo vigente; divergências são defeitos e MUST ser corrigidas no portfólio.
- É proibido inventar ou inflar métricas, resultados, cargos ou tecnologias que o currículo não
  sustente.
- Empregadores sob confidencialidade MUST permanecer anonimizados (ex.: "Empresa de Tecnologia
  Confidencial"), sem detalhes que permitam identificá-los.
- Períodos MUST usar um formato único em toda a página; vínculos encerrados MUST aparecer como
  intervalo fechado, e só vínculos realmente em andamento recebem selo de "atual".

**Racional**: recrutadores cruzam o portfólio com o currículo; qualquer inconsistência destrói a
credibilidade que o site deveria construir.

### II. Projetos Demonstráveis

Os projetos são o núcleo do portfólio e MUST ser apresentados de forma verificável.

- Cada projeto exibido MUST informar: nome, problema resolvido ou propósito e o papel do autor.
  Projeto técnico MUST informar também a stack utilizada; projeto não técnico (ex.: projeto
  comunitário ou de extensão) dispensa a stack.
- Cada projeto MUST ter ao menos uma evidência pública acessível (repositório, demo, página em
  marketplace ou equivalente), com três exceções, que MUST ficar explícitas no próprio projeto:
  trabalho confidencial (sem expor nenhum detalhe sigiloso), experiência acadêmica sem artefato
  público (ex.: monitoria de disciplina) e código em repositório privado. Na última, o projeto
  MUST ter link para o repositório, e cada link privado MUST avisar, antes do clique, que o
  repositório é privado e pode não abrir para o visitante.
- Links externos MUST abrir com `target="_blank"` e `rel="noopener noreferrer"`; indicadores
  dinâmicos (badges de downloads, estrelas etc.) MUST ter texto alternativo descritivo.
- Projetos são ordenados por relevância para o posicionamento profissional atual, não por data.

**Racional**: o objetivo é que o visitante possa comprovar o trabalho, não apenas ler sobre ele.
Quando o código é privado, o link avisado mostra que o repositório existe sem fingir que é público.

### III. Saída Estática

Framework, bundler e etapa de build são permitidos como ferramentas de desenvolvimento, desde que o
que é publicado continue sendo um site estático.

- A saída publicada MUST ser 100% composta por arquivos estáticos (HTML, CSS, JS e assets),
  servível por qualquer hospedagem estática, sem servidor de aplicação, funções serverless ou
  renderização em tempo de requisição.
- Todo o conteúdo do currículo MUST estar presente no HTML publicado (pré-renderizado no build): com
  JavaScript desativado, a página MUST exibir todo o conteúdo e a navegação por âncoras MUST
  funcionar. JavaScript só pode acrescentar comportamento (animações, efeitos, menu), nunca conteúdo.
- O build MUST ser reproduzível a partir do repositório com um único comando documentado e
  dependências travadas (lockfile versionado). A pasta de saída do build não é versionada; assets
  gerados por `tools/` (ex.: fontes com subset) continuam versionados.
- Nenhum recurso MUST ser carregado de terceiros em tempo de execução, exceto exceções justificadas
  (ex.: badges externos), que MUST degradar com elegância se o serviço estiver fora do ar.
- Cada dependência nova (framework, biblioteca de UI, plugin de build) MUST ser justificada no plano
  da mudança, com seu impacto no peso final da página.

**Racional**: um framework facilita separar conteúdo de apresentação e manter componentes, mas o
portfólio continua precisando ser barato de hospedar, indexável, legível sem JavaScript e
resistente ao tempo; a saída estática preserva esses ganhos da versão anterior.

### IV. Acessibilidade e Desempenho

O conteúdo MUST ser acessível a qualquer visitante, em qualquer dispositivo.

- Respeitar `prefers-reduced-motion`: animações decorativas (porta de acesso, fundos animados,
  glitch, digitação) MUST ser desativadas ou reduzidas quando o usuário pedir.
- Animações de entrada MUST ser puláveis e nunca bloquear o conteúdo por mais de 5 segundos, com uma
  exceção, que MUST ficar explícita na especificação: a tela de boot pode ser uma porta de acesso,
  que só descobre a página depois de uma ação do visitante (abrir um ícone), sem teto de tempo para
  essa ação, desde que:
  - depois da ação, a sessão exibida na porta termine e a página fique totalmente descoberta em no
    máximo 4 segundos; a sessão não é pulável e nunca aparece cortada;
  - a porta seja operável por teclado e por leitor de tela (foco inicial no controle de acesso,
    controles com nome acessível) e, enquanto ela estiver ativa, o resto da página fique
    inalcançável;
  - fechar a porta só encerre a tentativa: o visitante MUST poder tentar de novo sem recarregar a
    página;
  - sem JavaScript não haja porta, e, se o JavaScript chegar tarde demais, ela não apareça (a porta
    nunca cobre de repente uma página que já estava visível);
  - com movimento reduzido, a porta continue existindo, mas sem nenhuma animação (fundo estático,
    sem transições, sessão exibida de uma vez).
- Navegação MUST funcionar por teclado; elementos interativos MUST ter rótulos acessíveis;
  imagens informativas MUST ter `alt` e imagens decorativas MUST usar `alt=""`/`aria-hidden`.
- Layout MUST funcionar em mobile e desktop sem rolagem horizontal.
- Assets MUST ser otimizados: imagens em formato moderno com `loading="lazy"` fora da dobra,
  fontes com subset e pré-carregadas apenas quando usadas acima da dobra.
- O console do navegador MUST ficar sem erros.

**Racional**: a estética de terminal é um diferencial, mas não pode custar o acesso ao conteúdo
que o visitante veio ver. A tela de boot é a assinatura do portfólio, e a porta de acesso faz do
primeiro clique parte da metáfora; o teto de 4 s depois da ação, o acesso por teclado e por leitor
de tela, a nova tentativa sem recarregar e a versão sem animação limitam o custo para quem só quer
o conteúdo. Sem JavaScript, o conteúdo continua aberto (Princípio III).

### V. Identidade Visual Coerente

O portfólio segue uma metáfora de terminal/Linux (prompt `viper@portfolio`, `~/secoes`,
`git log`, janelas de terminal) com tipografia Iosevka.

- Novas seções MUST reutilizar os componentes, padrões visuais e classes existentes antes de criar
  novos.
- O idioma da interface é português do Brasil (`lang="pt-BR"`); termos técnicos podem permanecer
  em inglês quando forem o uso corrente.
- Cores, fontes e espaçamentos MUST vir de um único arquivo central de tokens (CSS Variables) do
  projeto; valores soltos nos componentes são defeitos.
- A metáfora MUST servir ao conteúdo: nenhum elemento temático pode tornar uma informação do
  currículo mais difícil de encontrar ou ler.

**Racional**: consistência visual comunica cuidado técnico, que é exatamente o que o portfólio
quer demonstrar.

## Restrições de Conteúdo e Tecnologia

- Stack: HTML5 semântico, CSS e JavaScript/TypeScript; framework, biblioteca de UI e ferramentas de
  build são permitidos nos termos do Princípio III, e a stack em uso é registrada no plano de cada
  feature.
- Dados pessoais exibidos limitam-se aos que o autor escolheu tornar públicos (nome, cidade,
  canais de contato profissionais). Telefone, endereço completo e documentos não são publicados.
- O PDF do currículo é a referência de conteúdo e não é versionado (`*.pdf` no `.gitignore`).
- Metadados de SEO (`<title>`, `meta description`) MUST refletir o posicionamento profissional
  atual descrito no currículo.

## Fluxo de Trabalho e Verificação

- Toda mudança não trivial começa com um plano escrito (em `plans/` ou nos artefatos do Spec Kit)
  com contexto, mudanças por arquivo e passos de verificação.
- Mudanças de conteúdo MUST ser conferidas contra o currículo vigente antes do commit (Princípio I).
- Mudanças visuais MUST ser verificadas no build de produção servido localmente, inspecionando
  desktop e mobile (ex.: screenshots via Playwright), com o console sem erros.
- Mudanças que afetam estrutura ou conteúdo MUST ser verificadas também com JavaScript desativado
  (Princípio III).
- Mudanças que afetam animações MUST ser verificadas também com `prefers-reduced-motion: reduce`.
- Commits são pequenos e descritivos, um assunto por commit.

## Governance

Esta constituição prevalece sobre preferências pontuais de implementação. Toda especificação,
plano e tarefa gerados para o projeto MUST passar por uma checagem de conformidade com os
princípios acima; violações MUST ser corrigidas ou justificadas explicitamente no plano.

- **Emendas**: propostas via `/speckit-constitution`, registradas neste arquivo com o Sync Impact
  Report e acompanhadas de commit dedicado.
- **Versionamento** (SemVer): MAJOR para remoção ou redefinição incompatível de princípios; MINOR
  para novo princípio/seção ou ampliação material de orientação; PATCH para esclarecimentos e
  ajustes de redação.
- **Revisão de conformidade**: a cada nova feature e sempre que o currículo for atualizado, o
  conteúdo do site MUST ser revisado contra os Princípios I e II.

**Version**: 3.0.0 | **Ratified**: 2026-10-06 | **Last Amended**: 2026-10-09
