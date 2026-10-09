# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Quem recruta** (público principal): chega a partir do CV ou do LinkedIn, no Brasil e no
  exterior. Quem recruta no exterior lê em inglês. Precisa entender em segundos quem é o autor, o
  posicionamento atual, a stack principal, a trajetória recente e como entrar em contato, e costuma
  cruzar o site com o PDF do currículo.
- **Quem avalia a parte técnica** (tech lead, dev da equipe): quer comprovar o trabalho. Procura o
  que cada projeto resolve, a stack, o papel do autor e onde está a evidência pública.
- **O autor** (Vittorio Perotto, desenvolvedor full-stack em Curitiba-PR): atualiza o currículo
  editando só os dados, sem mexer em componentes.

## Product Purpose

Portfólio pessoal de página única que mostra os projetos e as informações relevantes do currículo
de Vittorio Perotto, publicado em https://v-perotto.github.io/Portfolio/.

O site funciona quando quem recruta acha nome, cargo e contato em até 5 segundos (SC-003 do spec
001), quem avalia a parte técnica consegue verificar cada projeto e o visitante entra em contato
pelo LinkedIn ou pelo GitHub. Uma inconsistência com o currículo conta como falha, mesmo que a
página esteja bonita.

## Positioning

A tese é **desenvolvedor full-stack TypeScript / Vue** (confirmado em 2026-10-07). O que sustenta
essa tese é uma trajetória que vem de processos para sistemas: RPA com Python e OCR, consultoria
funcional SAP SD, arquitetura do sistema policial ABIS e agentes de IA com LLMs. O autor desenha o
processo e também constrói o sistema.

Diferencial verificável: dois temas de VS Code de autoria própria, publicados no Open VSX, com
contagem pública de downloads.

## Operating Context

- Quem recruta abre o site pelo link no CV ou no perfil do LinkedIn, em desktop ou no celular
  (a partir de 360px), muitas vezes ao lado do PDF do currículo.
- Âncoras diretas (`/#projetos`) circulam como links compartilhados.
- O visitante pode estar com JavaScript desativado, com "reduzir movimento" ativo, navegando só
  pelo teclado ou imprimindo a página.

## Capabilities and Constraints

- Seções: hero, `sobre`, `experiencia`, `skills`, `projetos`, `educacao` e `contato`. Uma coleção
  vazia some da página e do menu.
- Todo o conteúdo vem de `src/data/resume.ts`, que é tipado. Se faltar um campo obrigatório, o
  build falha.
- A saída é 100% estática (Vue 3 + vite-ssg) e publicada no GitHub Pages em `/Portfolio/`. Todo o
  conteúdo fica legível sem JavaScript, e o JS só acrescenta comportamento.
- Não há recursos de terceiros em tempo de execução, exceto os badges do shields.io, que precisam
  degradar com elegância.
- Não são publicados telefone, endereço completo nem documentos. Empregadores sob
  confidencialidade continuam anonimizados ("Empresa de Tecnologia (Confidencial)").
- Links externos abrem em nova aba com `rel="noopener noreferrer"`.
- **Versão em inglês planejada.** Hoje a constituição (Princípio V) exige interface só em pt-BR,
  então a versão em inglês depende de emendar a constituição. Ainda não está decidido como ela
  fica: rota, seletor de idioma ou estrutura dos dados.
- **Decisões em aberto sobre fidelidade ao CV** (Princípio I: o currículo é a fonte da verdade):
  - O CV de 2026-04-21 destaca Java (Quarkus) e Python. Ele precisa ser atualizado para a tese
    TypeScript / Vue.
  - Angular e Valkey aparecem nas skills do site, mas não estão no CV.
  - O CV ainda diz MAR 2026–PRESENTE, enquanto o site mostra o vínculo encerrado em JUL 2026.

## Brand Commitments

Estes compromissos são vinculantes pela constituição v2.0.0:

- A metáfora de terminal/Linux: prompt `viper@portfolio:~$`, títulos `~/secao`, timeline no estilo
  `git log`, janelas de terminal, tela de boot SSH, chuva matrix e glitch no nome.
- A tipografia Iosevka.
- O handle "viper" e o nome "Vittorio Perotto".
- A metáfora serve ao conteúdo: nenhum elemento temático pode dificultar encontrar ou ler uma
  informação do currículo.

## Evidence on Hand

- 5 experiências, 5 grupos de skills, 3 projetos, 3 formações e 5 atributos pessoais, todos em
  `src/data/resume.ts`.
- Os temas no Open VSX: Grape Glass Theme e Shadow Lord - Son of Dathomir Theme (publisher
  DistroLinux), com badges de downloads.
- Contatos: GitHub (`V-Perotto`) e LinkedIn (`vittorioperotto`).
- Imagens decorativas em `src/assets/img/`.
- **Coisas que não existem e não podem ser inventadas:**
  - depoimentos, clientes nomeados, estudos de caso e métricas de impacto (os `highlights`
    estão vazios);
  - código público do ItaliaMi (é privado);
  - artefato público da monitoria na PUC-PR.

## Product Principles

1. **O currículo manda.** Cada fato do site precisa corresponder ao CV vigente. Uma métrica ou
   tecnologia que o CV não sustente é defeito.
2. **Verificável vence declarado.** Todo projeto mostra evidência pública ou diz com clareza por
   que não tem.
3. **Cinco segundos para o essencial.** Nome, cargo e contato aparecem antes de qualquer efeito.
4. **Dados separados da apresentação.** Atualizar o conteúdo nunca exige mexer na interface.
5. **Estático, leve e durável.** O site é barato de hospedar, indexável e legível sem JavaScript.

## Accessibility & Inclusion

- Respeitar `prefers-reduced-motion`. Com ele ativo, não há boot, matrix, glitch, digitação nem
  animações de entrada.
- A tela de boot pode ser pulada e some em no máximo 5 segundos.
- Navegação completa por teclado, com foco visível. O realce de hover nunca é o único meio de
  revelar uma informação.
- Rótulos acessíveis em tudo que é interativo. `alt` descritivo nas imagens informativas e nos
  badges; imagens decorativas com `alt=""`/`aria-hidden`.
- Sem rolagem horizontal a partir de 360px e console sem erros. Os testes e2e verificam isso com
  axe.
