<!--
Sync Impact Report
- Version change: 2.0.0 → 2.1.0 (MINOR: exceção do Princípio II ampliada — experiência acadêmica
  sem artefato público passa a poder aparecer sem evidência, com aviso explícito)
- Modified principles:
  - II. Projetos Demonstráveis (exceção à evidência pública: "trabalho confidencial" →
    "trabalho confidencial ou experiência acadêmica sem artefato público")
- Added sections: none
- Removed sections: none
- Templates: not modified by this command (dependent templates read the constitution at runtime)
- Dependent artifacts: specs/001-vue-resume-refactor/spec.md (FR-010, US2 cenário 4, Key Entities)
  e o tipo `Project` (contracts/resume.schema.ts, src/types/resume.ts) precisam aceitar a nova
  exceção — feito na T095 do /speckit-implement em andamento
- Origem: decisão do autor em 2026-10-07 (projeto "Monitor de Curso", PUC-PR)
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

- Cada projeto exibido MUST informar: nome, problema resolvido ou propósito, stack utilizada e o
  papel do autor.
- Cada projeto MUST ter ao menos uma evidência pública acessível (repositório, demo, página em
  marketplace ou equivalente), com duas exceções, que MUST ficar explícitas no próprio projeto:
  trabalho confidencial (sem expor nenhum detalhe sigiloso) e experiência acadêmica sem artefato
  público (ex.: monitoria de disciplina).
- Links externos MUST abrir com `target="_blank"` e `rel="noopener noreferrer"`; indicadores
  dinâmicos (badges de downloads, estrelas etc.) MUST ter texto alternativo descritivo.
- Projetos são ordenados por relevância para o posicionamento profissional atual, não por data.

**Racional**: o objetivo é que o visitante possa comprovar o trabalho, não apenas ler sobre ele.

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

- Respeitar `prefers-reduced-motion`: animações decorativas (boot, matrix, glitch, digitação)
  MUST ser desativadas ou reduzidas quando o usuário pedir.
- Animações de entrada MUST ser puláveis e nunca bloquear o conteúdo por mais de 5 segundos.
- Navegação MUST funcionar por teclado; elementos interativos MUST ter rótulos acessíveis;
  imagens informativas MUST ter `alt` e imagens decorativas MUST usar `alt=""`/`aria-hidden`.
- Layout MUST funcionar em mobile e desktop sem rolagem horizontal.
- Assets MUST ser otimizados: imagens em formato moderno com `loading="lazy"` fora da dobra,
  fontes com subset e pré-carregadas apenas quando usadas acima da dobra.
- O console do navegador MUST ficar sem erros.

**Racional**: a estética de terminal é um diferencial, mas não pode custar o acesso ao conteúdo
que o visitante veio ver.

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

**Version**: 2.1.0 | **Ratified**: 2026-10-06 | **Last Amended**: 2026-10-07
