# Research: Educação numa janela de editor (feature 008)

Decisões técnicas da fase 0. Cada uma resolve um ponto do plano. O peso foi **medido** em 2026-10-10 no
build de produção do commit `894c8be` (estado da 007), com o mesmo cálculo do `weight.spec.ts`.

---

## R1. Reaproveitar a janela de editor da 006

**Decision**: a seção Educação passa a usar o `EditorWindow` (e, dentro dele, o `EditorFrame`) exatamente
como a Experiência: `EducationSection.vue` monta `<EditorWindow v-reveal :folder window-id="educacao">` e
põe os cartões de hoje no slot `#cards`. `EditorWindow`, `DesktopWindow` e `BranchedMenu` **não mudam**; o
`EditorFrame` só ganha a regra de CSS das reticências (R13, decidida no analyze).

**Rationale**: tudo o que a janela faz (digitar `code <pasta>`, árvore, arquivos empilhados na mesma
célula, maximizar como diálogo modal, minimizar/fechar até o ícone, três visões no mesmo HTML, sem JS e
impressão só com os cartões, hidratação só do 1º arquivo) é genérico: recebe um `EditorFolder` e um slot.
Nada no CSS ou no script depende do nome da pasta (`data-editor` é só um gancho dos testes). O FR-001 da
spec pede "igual às de Challenges e Comunitário"; reaproveitar garante isso e herda as correções da 006 e
da 007 (região focável da lista maximizada, laço de Tab, reabrir sem piscar).

**Alternatives considered**:

- Um componente `EducationWindow` próprio: duplicaria o que a 006 já resolveu, contra o Princípio V
  ("reutilizar antes de criar").
- Pôr a Educação como sub-parte de Projetos (como Challenges e Comunitário): o pedido é sobre o formato,
  não a posição (Assumptions da spec); mudaria a ordem da página, o menu e o `find`.

## R2. A pasta: `~/formacao`

**Decision**: `educationFolder(education)` em `src/lib/editor-files.ts` devolve
`{ label: 'formacao', path: '~/formacao', files }` (Q2 do specify). Título da janela, comando digitado
(`code ~/formacao`), raiz da árvore (`formacao/`), começo do caminho no rodapé e nome sob o ícone de pasta
saem daí. O título da seção (`educacao`) e a linha de comando (`apt list --installed | grep formacao`)
ficam como estão.

**Rationale**: casa com o `grep formacao` da linha da seção, como `~/carreira` casa com o
`git log --carreira` da Experiência.

## R3. Identidade da formação: um `id` novo nos dados, que é também o slug do arquivo

**Decision**: `Education` ganha `id: string`, obrigatório, que é o slug curto do nome do arquivo (clarify):

| Formação | `id` | Arquivo |
|----------|------|---------|
| Pós-Graduação em Cibersegurança | `ciberseguranca` | `2025_ciberseguranca.yml` |
| Bacharelado em Sistemas de Informação | `sistemas-de-informacao` | `2020_sistemas-de-informacao.yml` |
| 1º Empregotech | `empregotech` | `2020_empregotech.yml` |
| Técnico em Análise e Desenvolvimento de Sistemas | `tecnico-ads` | `2018_tecnico-ads.yml` |

- O `id` é a chave do arquivo (`data-file-id`), do cartão (`data-card-id`, que o maximizar usa para rolar
  até ele) e do `v-for` (hoje a chave é o `course`).
- Regras, verificadas no `resume.data.spec.ts`: único na coleção; `^[a-z0-9]+(-[a-z0-9]+)*$`; nome do
  arquivo com no máximo 31 caracteres (FR-004; o maior de hoje, `2020_sistemas-de-informacao.yml`, tem 31).
- O nome do arquivo é `${startYear}_${id}.yml`: o slug é o próprio `id`, sem o sufixo de ano que a
  Experiência tira do dela (`confidencial-2026` → `confidencial`).

**Rationale**: as outras três coleções já têm `id`; o slug gerado do nome do curso passaria de 50
caracteres (`tecnico-em-analise-e-desenvolvimento-de-sistemas`), e o autor escolheu um slug curto fixo nos
dados (clarify). Um campo só cumpre os dois papéis.

**Alternatives considered**: um campo `slug` separado do `id` (dois nomes para a mesma coisa); slug
gerado do curso (nomes longos demais para a árvore, rejeitado no clarify).

## R4. O arquivo YAML de uma formação

**Decision**: chaves na ordem do arquivo da Experiência (o que é, onde, quando, situação, texto, extras):

```yaml
# 3 / 4 · 1º Empregotech
curso: 1º Empregotech
instituicao: Prefeitura de Curitiba
local: Curitiba - PR
periodo: 2020 — 2020
observacao: >
  Programa de capacitação em tecnologia para jovens. Foi por meio dele que entrou na Prime Control, …
fontes:
  - overbr.com.br
  - curitiba.pr.gov.br
```

- `periodo`: `formatYears(startYear, endYear)`, como no cartão (`2025 — 2027`), com o tipo de trecho `date`.
- `em_curso: true  # EM CURSO`, logo depois do `periodo`, só com `status === 'em-curso'` (clarify), com os
  mesmos trechos do `atual: true  # HEAD` da Experiência (`key`, `punct`, `str`, `comment`). Concluída:
  sem a linha (o cartão não mostra "concluído").
- `observacao`: bloco `>` de uma linha lógica (o `block` que o `resumo` já usa); só se houver `note`.
- `fontes`: só se houver `sources`; sempre lista (clarify), uma linha por fonte com recuo 1:
  `t('punct', '- ')` + `t('link', source.label, source.url)`. O `ExternalLink` do `EditorFrame` já desenha
  o trecho `link` com `target="_blank"` e `rel="noopener noreferrer"` (FR-007).
- 1ª linha: o `header` comum (`# <posição> / <total> · <curso>`).

**Rationale**: o teste de fatos do e2e (`editor-windows.spec.ts`, V2) compara cada texto visível do cartão
com o texto do arquivo: `2025 — 2027`, `EM CURSO`, curso, instituição, local, observação, `fonte` (contido
em `fontes`) e os rótulos das fontes estão todos no arquivo; nada além do cartão (Princípio I).

## R5. Ordem e geração

**Decision**: `educationFolder` ordena com o `byStartYearDesc` de hoje (`src/lib/sort.ts`: ano de início
decrescente; empate pelo término mais recente) e passa pelo `folder()` comum (posição, total, caminho,
cabeçalho). `EducationSection` usa a mesma ordem para os cartões. Uma formação nova nos dados vira arquivo
e cartão sozinha; o único texto novo é o `id` (FR-014).

## R6. Cartões dentro da janela: sem `v-reveal` por cartão

**Decision**: o `v-reveal` passa do `<li>` de cada cartão para a janela (como na Experiência). Os `<li>`
ganham `:data-card-id="edu.id"` e `:key="edu.id"`; a lista continua `<ol class="edu-list">` com o
espaçamento de hoje (1,2 rem).

**Rationale**: dentro da janela, os cartões ficam escondidos (`display: none`) até maximizar; um
`v-reveal` neles seria observado escondido e poderia deixar o cartão com `reveal-pending` (invisível) na
lista maximizada. Nenhuma outra janela de editor revela cartão por cartão.

## R7. O `open educacao`

**Decision**: em `openTargets` (`src/lib/sections.ts`), depois de `comunitario`:
`...(resume.education.length ? [editorTarget('educacao', '~/formacao')] : [])` → `{ name: 'educacao',
windowId: 'educacao', path: '~/formacao', alias: 'formacao', mode: 'maximize' }`. O `window-id` da janela
é `educacao`.

- `runOpen` já procura primeiro nos alvos e só depois nas seções: `open educacao` passa a maximizar sem
  mudar o motor; `open sobre|skills|projetos|contato` continuam com a mensagem do 007 FR-006.
- `openWindow` (`src/lib/windows.ts`) não muda: `scrollIntoView` da janela, reabre completa e sem crescer
  se preciso, maximiza.
- Tab: `open ed` → `open educacao`; `open e` mostra `experiencia  educacao` (duas sugestões, como o `find e`
  já mostra).

## R8. O `help` gerado dos alvos

**Decision**: a linha "projetos abrem; experiencia, challenges e comunitario abrem maximizados" deixa de ser
texto fixo e passa a ser gerada dos alvos `maximize`, juntados à portuguesa (`a, b, c e d`):
"projetos abrem; experiencia, challenges, comunitario e educacao abrem maximizados" (FR-017).

**Rationale**: o texto fixo já ficaria errado sem comunitário ou sem challenges nos dados; gerar mantém o
`help` fiel à lista de opções, que já é gerada (007 R1). Sem projetos, a linha começa direto pelos editores
("experiencia … abrem maximizados"); sem editores, só "projetos abrem".

**Alternatives considered**: trocar só o texto fixo (mais simples, mas repete o defeito para a próxima
coleção).

## R9. Peso

**Decision**: linha de base **109.532 B** (HTML + CSS + JS iniciais, gzip 9, sem workers; commit
`894c8be`), teto **+2 KB** (SC-007). Estimativa: +0,6–0,9 KB, quase tudo HTML (a moldura do editor, a
árvore e o 1º arquivo da Educação pré-renderizados; os outros 3 arquivos só entram na hidratação, 006
R17) e ~0,2 KB de JS (`educationFolder` e o alvo do `open`). CSS novo: só a regra das reticências (R13).

**Medido na implementação** (2026-10-10, `weight.spec.ts`): **110.149 B**, **+617 B** sobre a 007 (teto
+2.048 B); carregamento inicial 321,1 KB (≤ 500 KB).

## R10. Versão

**Decision**: `package.json` (e o lockfile) em `2.7.0`; a sessão da porta mostra `v2.7` (005 FR-016). Os
testes que fixam `v2.6` (`version.spec.ts`, `session.spec.ts`, `AccessGate.spec.ts`) passam a `v2.7`.

## R11. Testes afetados

| Arquivo | Mudança |
|---------|---------|
| `tests/unit/editor-files.spec.ts` | `educationFolder`: chaves (`curso`, `instituicao`, `local`, `periodo`, `em_curso`, `observacao`, `fontes`), fatos de cada cartão, `# EM CURSO` só na em curso, fontes como links, nomes `AAAA_<id>.yml`, ordem, caminho `~/formacao` |
| `tests/unit/resume.data.spec.ts` | `id` único, em slug e com nome de arquivo ≤ 31 caracteres |
| `tests/unit/sections.spec.ts` | 10 alvos; `educacao` → `~/formacao`, alias `formacao`, `maximize`; sem formações, sem alvo |
| `tests/unit/terminal.spec.ts` | `help` gerado; `open educacao` vira alvo; `open ed` + Tab |
| `tests/unit/sort.spec.ts`, `tests/component/EducationCard.spec.ts` | helpers com `id` |
| `tests/e2e/editor-windows.spec.ts` | `formacao` na lista `EDITORS` (`#educacao`, 4); a ordem pela data do nome compara o prefixo antes do `_` (o ano da formação tem 4 caracteres, não 7) |
| `tests/e2e/open-command.spec.ts` | `educacao` nas 10 opções (V4/SC-001), na saída do `help`, fora dos casos de erro; maximizada pelo `open` |
| `tests/e2e/projects.spec.ts` | o teste do 1º Empregotech olha os cartões na janela maximizada (com JS, a lista fica escondida no modo arquivo, e `#educacao ol > li` pegaria as linhas do editor) |
| `tests/e2e/a11y.spec.ts` | `formacao` na auditoria das janelas de editor: normal, maximizada e minimizada, com o console sem erros (SC-008) |
| `tests/e2e/reduced-motion.spec.ts` | a janela `formacao` já completa, sem digitação, e maximizar sem animação (FR-011) |
| `tests/e2e/no-js.spec.ts` | 12 `.desktop-window` (eram 11) |
| `tests/e2e/weight.spec.ts` | linha de base 109.532 B, teto +2 KB |
| `version.spec.ts`, `session.spec.ts`, `AccessGate.spec.ts` | `v2.7` |

## R12. Documentação

**Decision**: `DESIGN.md` (seção das janelas de editor: quatro, com a de Formação; layout: "Formação" deixa
de ser só uma pilha de cartões) e `README.md` (lista das janelas de editor e do `open`). Feito no fim, como
nas features anteriores.

## R13. Nomes da árvore que não cabem: reticências (analyze, FR-020)

**Medido** em 2026-10-10 no build da 007, Chromium, "reduzir movimento": abaixo de 760 px a árvore fica
acima do arquivo, com 236 px de largura em 320 px e 306 px em 390 px; o rótulo começa a 94 px da borda
da árvore (recuo da árvore + recuo do Branched Menu, 40 px, + ícone + espaço) e a Iosevka da árvore tem
7 px por caractere. Cabem ~20 caracteres em 320 px e ~30 em 390 px pela borda da árvore; **medido na
implementação**, o rótulo em si (o `.bm-child` tem 194 px em 320 px, menos o recuo de 40 px, o ícone e o
espaço) tem no máximo **130 px em 320 px (~18 caracteres) e 200 px em 390 px (~28)**: em 320 px, os 4
nomes da Educação e 4 dos 7 dos Challenges terminam em reticências; em 390 px, só
`2020_sistemas-de-informacao.yml` e `2025-10_executiva-service.yml`. O `.bm-fold-inner` do componente tem
`overflow: hidden` e o `.bm-label`, `white-space: nowrap`: hoje o que passa é **cortado no meio da letra**
(`2025-10_executiva-s`, `2024-01_ny-times-rp` em 320 px).

**Decision**: no `EditorFrame`, uma regra só para a árvore das janelas de editor:
`.editor-tree :deep(.bm-label) { min-width: 0; overflow: hidden; text-overflow: ellipsis; }` (o `.bm-child`
já é `display: flex` com `width: 100%`). O texto do rótulo não muda: o nome acessível do botão continua
sendo o nome inteiro; o rodapé (`.editor-path`, `overflow-wrap: anywhere`) mostra o caminho inteiro do
arquivo aberto, e a aba já usa reticências. O vendorizado `BranchedMenu.vue` não muda (fica fiel ao Vue
Bits), nem os parâmetros dele (006 FR-003).

**Rationale**: é o que o explorer do VS Code faz, a referência da metáfora; corrige o corte das 4 janelas
de uma vez, com uma regra; não muda nada no desktop, onde a coluna da árvore já tem a largura dos nomes.

**Alternatives considered** (no analyze, com o autor): recuo menor no celular (foge dos parâmetros
padrão do componente e ainda cortaria o nome de 31 caracteres em 320 px); slugs mais curtos (muda o
clarify e não corrige os Challenges); deixar como está.

**Teste**: em 320 e 390 px, em cada janela, todo `.bm-label` tem `text-overflow: ellipsis` computado e a
borda direita dentro da árvore (`.editor-tree`); os que cabem têm `scrollWidth ≤ clientWidth` (inteiros).
