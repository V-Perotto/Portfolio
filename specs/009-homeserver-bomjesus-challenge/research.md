# Research: challenge Bom Jesus (FAE) e o side-project DebianServer (feature 009)

Decisões técnicas da fase 0. Cada uma resolve um ponto do plano. As fontes de ícones foram consultadas em
2026-10-20 (jsDelivr e vectorlogo.zone). Os tamanhos da captura foram medidos em 2026-10-20 com a captura
original (`tools/source/debianserver/painel-casaos-2026-10-20.png`, 1396 × 809, PNG de 883 KB, sem
metadados).

---

## R1. Dados do DebianServer: uma variante nova de `Project`

**Decision**: o DebianServer é mais um item de `projects` em `src/data/resume.ts`, logo depois do SRG
(a ordem do arquivo é a de relevância, Q2). O tipo `Project` (`src/types/resume.ts`) muda assim:

- `ProjectKind` ganha `'side-project'` (FR-008); o `KIND_LABEL` do `ProjectCard` mostra `side-project`.
- `ProjectBase` ganha três campos **opcionais**, que nenhum outro projeto usa hoje (FR-021):
  - `inProductionSince?: YearMonthDay` (`'2026-10-01'`): o selo `EM PRODUÇÃO` e a linha
    `desde = 01 OUT 2026`, com o dia (FR-007; pedido do autor depois da implementação);
  - `details?: NonEmpty<Detail>`: linhas extras do `dl` da janela (`hardware`, `sistema`, `acesso`;
    FR-010), com o rótulo e o valor nos dados;
  - `apps?: NonEmpty<ServerApp>`: a lista de apps (FR-012, FR-013).
- A união `Project` ganha uma 4ª variante, a da exceção nova do Princípio II (v3.1.0):
  `ProjectBase & { kind: 'side-project'; evidence: []; screenshot: Screenshot; confidential?: never;
  noEvidenceReason?: never }`. As outras três variantes ganham `screenshot?: never`.

O formato exato está em [data-model.md](data-model.md).

**Rationale**: o `satisfies Project` de cada item já quebra o build quando falta um campo; a variante
nova impede, em tempo de compilação, uma captura num projeto com links, ou um side-project sem evidência
nenhuma. Os rótulos de `details` ficam nos dados (`hardware`, `sistema`, `acesso`) porque são conteúdo,
como os valores; o componente só desenha `rótulo = valor`, igual a `papel` e `tipo`.

**Alternatives considered**:

- Campos fixos `hardware`, `system`, `access` no `ProjectBase`: três campos que só um projeto usa, e o
  componente com três rótulos escritos à mão. `details` serve a qualquer projeto futuro.
- Pôr o DebianServer numa seção nova ("side-projects"): o autor pediu que ficasse em Projetos.
- Reaproveitar `inProgress` com outro texto: os dois selos têm significados opostos (em construção ×
  em uso) e a data só existe no de produção.

## R2. Challenge Bom Jesus (FAE): só dados

**Decision**: um item novo em `challenges`, com `id: 'bomjesus-challenge'`, `name: 'Bom Jesus (FAE)'`
(clarify), `created: '2026-10'`, o resumo de FR-002 e `stack: ['Java', 'Spring Boot', 'Vue 3',
'TypeScript', 'H2', 'Docker']`. O `challengeFolder` já gera o arquivo: `slugify('Bom Jesus (FAE)')` é
`bom-jesus-fae`, então o arquivo é `2026-10_bom-jesus-fae.yml` (25 caracteres), o 1º de 8 pela data.

**Rationale**: a 006 fez a janela de Challenges gerar arquivos e cartões dos dados; um challenge novo não
pede código. As únicas peças novas são as tecnologias `Spring Boot` e `H2` (R3).

**Alternatives considered**: nenhuma; é o caminho previsto no guia de edição de `resume.ts`.

## R3. Ícones das 13 tecnologias novas

**Decision**: 13 nomes novos em `TechName` (e em `TECH_ICONS`): `Spring Boot`, `H2`, `Debian`,
`CasaOS`, `Tailscale`, `Ollama`, `Samba` (chips) e `Ente Photos`, `OpenWebUI`, `Kiwix`, `Syncthing`,
`SearXNG`, `Watchtower` (apps, R6). Os ícones seguem a regra da 003 ("logotipo da marca quando existir;
senão, um ícone pelo assunto"), com a fonte escolhida assim:

| Tecnologia | Fonte | Símbolo | Observação |
|------------|-------|---------|------------|
| Spring Boot | devicon v2.17.0 | `devicon-spring` (`original`) | não existe `plain`; a folha do Spring é o símbolo do Spring Boot |
| Debian | devicon v2.17.0 | `devicon-debian` (`plain`) | |
| H2 | simple-icons 15.22.0 | `simpleicons-h2database` | fonte nova (ver abaixo) |
| Tailscale | simple-icons | `simpleicons-tailscale` | |
| Ollama | simple-icons | `simpleicons-ollama` | |
| Ente Photos | simple-icons | `simpleicons-ente` | o logotipo da Ente, a empresa do Ente Photos |
| Kiwix | simple-icons | `simpleicons-kiwix` | |
| Syncthing | simple-icons | `simpleicons-syncthing` | |
| SearXNG | simple-icons | `simpleicons-searxng` | |
| Watchtower | simple-icons | `simpleicons-watchtower` | |
| CasaOS | dashboard-icons | `dashboard-casaos` | 3 círculos com `opacity`: numa cor só, a silhueta de nuvem; conferir na prévia |
| OpenWebUI | dashboard-icons | `dashboard-open-webui` | `<circle>` + "OI" branco: vira recorte (`evenodd`), como o SAP e o nginx |
| Samba | dashboard-icons | `dashboard-samba-server` | um `<path>` com degradê: tirar `<defs>`/`<style>` antes do svgo e pintar com `currentColor` |

**Fonte nova: simple-icons** (https://simpleicons.org, jsDelivr `simple-icons@15.22.0`, licença CC0-1.0).
Nenhum dos 11 logotipos sem devicon existe no vectorlogo.zone (todos 404 em 2026-10-20). Os do
simple-icons são desenhados para **uma cor só** (um `<path>` por ícone, grade de 24), exatamente o que o
sprite faz com `currentColor`; os do dashboard-icons são coloridos e, sem tratamento, viram borrões.
Ordem final: devicon → vectorlogo.zone → simple-icons → dashboard-icons (com tratamento por ícone) →
Lucide pelo assunto.

**Reserva**: se, na prévia (`node tools/build-tech-icons.mjs --preview`), algum ícone virar borrão a
16 px, ele passa para o Lucide pelo assunto: CasaOS → `house`, OpenWebUI → `message-square`, Samba →
`folder-tree`. A troca é só no manifesto e em `TECH_ICONS`; os testes não mudam.

**Rationale**: mantém "todo chip tem ícone, na cor do texto" (decisão da 003) e o logotipo real sempre
que existe. O sprite continua um arquivo externo, fora do peso inicial (o `weight.spec.ts` só soma
HTML, CSS e JS); o script continua precisando de rede só quando o manifesto muda.

**Alternatives considered**:

- Tudo do dashboard-icons (ele tem Tailscale, Ollama, Kiwix, Syncthing, SearXNG e Watchtower): ícones
  coloridos com várias camadas; cada um pediria um tratamento como o do SAP. Não tem Ente Photos nem H2.
- Tudo pelo Lucide: perde o logotipo das marcas que existem, contra a regra da 003.
- Logotipos coloridos na lista de apps: recusado no clarify (ícone na cor do texto).

## R4. Arquivos da captura: WebP em duas larguras, gerados por um script

**Decision**: um script novo, `tools/build-screenshots.mjs`, lê
`tools/source/debianserver/painel-casaos-2026-10-20.png` e grava em
`public/projetos/debianserver/`:

- `painel-2026-10-20-800.webp`: 800 × 464, qualidade 0,85 (exibida na janela);
- `painel-2026-10-20-1396.webp`: 1396 × 809, qualidade 0,9 (tamanho real, visualizador e sem JS).

O script abre o Chromium do Playwright (já é dependência de desenvolvimento, como no
`tools/build-favicon.mjs`), desenha o PNG num `<canvas>` com `imageSmoothingQuality: 'high'` e exporta
com `canvas.toBlob('image/webp', q)`. Os dois WebP são versionados (Princípio III: assets gerados por
`tools/` ficam no git), e o PNG original também, como fonte.

Medido com libwebp (Pillow, `method=6`), como estimativa: 700 px ≈ 12–17 KB (800 px, por interpolação,
≈ 16–22 KB), 1396 px ≈ 34–60 KB.
As metas do SC-003 são 120 KB e 300 KB.

**Rationale**: WebP é "formato moderno" (Princípio IV) e todo navegador evergreen o lê; o canvas não
copia metadados (EXIF, ICC, nome do arquivo), o que cumpre o FR-019 e o FR-020 sem passo extra. O nome
dos arquivos tem a data da captura: trocar a captura troca o nome, e nenhum cache serve a antiga.

**Alternatives considered**:

- `sharp` ou `squoosh` no `package.json`: dependência nova e binário nativo para dois arquivos.
- AVIF: o canvas do Chromium não codifica AVIF, e o ganho sobre um WebP de 14 KB é irrelevante.
- `src/assets/` com import do Vite (nome com hash): o caminho entraria no `resume.ts` por import de
  imagem, que os testes de unidade e o `satisfies` teriam de tratar; em `public/`, os dados guardam um
  caminho relativo ao `base` do site, como o `Seo.ogImage` já faz.
- Uma largura só (1396): o celular a 3× usaria de qualquer jeito; o desktop, que mostra a captura com
  ~360 px, baixaria 4× mais que o necessário.
- 700 px (o plano antes do analyze, I2): a 2× a coluna pede ~722–768 px, e o navegador cairia na de
  1396 px; 800 px cobre o desktop a 1× e a 2×.

## R5. A captura na janela: `<figure>` com `srcset`, carregamento preguiçoso e espaço reservado

**Decision**: um componente novo, `src/components/sections/ProjectScreenshot.vue`, ocupa a coluna de
evidências do `ProjectCard` quando o projeto tem `screenshot` (FR-015). Ele desenha:

- `<figure>` com um `<a href="<tamanho real>" target="_blank" rel="noopener noreferrer">`, que contém o
  `<img>` e um texto `.sr-only` "(abre a captura em tamanho real)" (FR-018: nome acessível = texto
  alternativo + aviso);
- `<img src=800 srcset="800w, 1396w" sizes="(min-width: 900px) 24rem, calc(100vw - 4rem)"
  width="1396" height="809" loading="lazy" decoding="async" alt="…">`: `width`/`height` reservam a
  proporção (deslocamento 0, SC-003); `height: auto` e `max-width: 100%` no CSS;
- `<figcaption>` no estilo dos comentários (`t-output`, `--text-dim`):
  `# painel do CasaOS do DebianServer · OUT 2026` (FR-016).

Borda `1px solid var(--border)` e o raio da janela (tokens existentes, Princípio V).

**Rationale**: a coluna da direita a partir de 900 px já existe (R7 da 002) e é onde ficam as evidências;
abaixo de 900 px ela já desce para depois das informações. O `sizes` diz ao navegador que, no desktop, a
imagem tem ~24rem (~384 px; a coluna mede ~360 px em 1366 px): com densidade 1× ele escolhe a de 800 px, e
com 2× também (384 × 2 = 768 ≤ 800; analyze I2: com 700 px, o 2× pediria 768 px e baixaria a de 1396);
no celular, a de 1396 px, que pesa ~60 KB (dentro dos 120 KB).

**Alternatives considered**:

- `<picture>` com PNG de reserva: todos os navegadores-alvo leem WebP.
- A captura abaixo do texto também no desktop: a janela ficaria mais alta à toa, e a coluna de
  evidências ficaria vazia.

## R6. A lista de apps: `TechIcon` + nome + explicação

**Decision**: no `ProjectCard`, depois dos chips de stack, um comentário `# apps` (`t-output`,
`--text-dim`) e uma `<ul class="project-apps" aria-label="Apps do servidor">`, um `<li>` por app: o
`TechIcon` do app (decorativo, `aria-hidden`), o nome em `hl-purple` e a explicação em `--text` na
`--font-sans`, como o propósito. Abaixo de 600 px, a explicação vai para a linha de baixo do nome; acima,
fica ao lado, em grade de duas colunas (nome | explicação), alinhada.

`ServerApp.name` é um `TechName` (R3): o ícone sai do mesmo `TECH_ICONS`, e o teste do sprite cobre os
6 apps sem teste novo.

**Rationale**: o clarify pediu ícone na cor do texto, como os chips; reaproveitar o `TechIcon` e o
registro mantém uma fonte só de ícones (Princípio V). A lista é texto puro, pré-renderizada (FR-013).

**Alternatives considered**:

- Os apps como chips (`TagChip`): o chip não tem lugar para a explicação de uma linha.
- Os apps no YAML de uma janela de editor: o pedido é que o side-project fique em Projetos, como janela
  de projeto.

## R7. O visualizador: `<dialog>` nativo, só no cliente, com as regras da janela maximizada

**Decision**: dentro do `ProjectScreenshot`, depois da hidratação (`v-if="hydrated"`, como o
`EditorFrame` faz com os arquivos), um `<dialog class="shot-viewer" aria-labelledby>` com a imagem de
1396 px, a legenda e um botão ✕ (`t-btn t-close`, `aria-label="Fechar a captura"`). Comportamento
(FR-018, SC-009):

- **Abrir**: o clique (ou Enter) no link da captura chama `preventDefault()` e `dialog.showModal()`.
  Clique com Ctrl/⌘/Shift/botão do meio passa direto (abre em nova aba, como o navegador faria).
- **Página inalcançável**: o `showModal()` põe o diálogo na camada do topo e torna todo o resto inerte
  (página, header e dock), com o foco dentro dele. O `html` ganha a classe `window-maximized`, a mesma
  da janela maximizada: a página não rola, e o atalho Ctrl+Alt+T da dock já não abre o terminal por cima
  (`AppDock.onKeydown` testa essa classe).
- **Fechar**: Esc (evento `cancel`, nativo), o ✕ e o clique no fundo (clique cujo alvo é o próprio
  `<dialog>`, fora da imagem). No `close`, tira a classe e devolve o foco ao link
  (`focus({ preventScroll: true })`): a página fica onde estava.
- **Animação**: abrir e fechar com `opacity` + `scale(0.96 → 1)` em 200 ms pela WAAPI, só quando
  `canAnimate()` (`src/lib/flip.ts`) permite; com "reduzir movimento", troca direta. O fundo
  (`::backdrop`) usa o mesmo escurecimento e o mesmo `blur(var(--maximize-blur))` da janela maximizada.
- **Tamanho**: a imagem com `max-width: min(1396px, 100vw - 2rem)` e `max-height: calc(100dvh - 7rem)`
  (lugar para a legenda e o ✕), `object-fit: contain`: inteira, sem rolagem, de 320 px a 1920 px. O ✕
  com alvo de 44 × 44 px.
- **Sem JavaScript e na impressão**: não existe diálogo; o link abre o arquivo em nova aba (FR-018).

**Rationale**: o `<dialog>` modal nativo já faz o que a janela maximizada da 006 faz à mão (inércia do
resto, foco preso, Esc) e é lido como diálogo pelo leitor de tela; reaproveitar a classe
`window-maximized` herda o bloqueio de rolagem e a regra da dock sem tocar nelas. Renderizar só no
cliente mantém o HTML pré-renderizado sem a imagem repetida (SC-006, "uma vez só") e sem peso.

**Alternatives considered**:

- Copiar o padrão do `EditorFrame` (Teleport + `#app.inert` + laço de Tab manual): mais código para o
  mesmo resultado; a dock fica fora do `#app`, e o `showModal()` a cobre sem regra extra.
- Biblioteca de lightbox: dependência nova para uma imagem (Princípio III).
- `@starting-style` + `transition-behavior: allow-discrete` para a animação de fechar: o suporte no
  Firefox ainda é parcial; a WAAPI funciona em todos e já é usada no projeto (`flip.ts`).

## R8. A janela do DebianServer no `ProjectCard`

**Decision**: o `ProjectCard` passa a desenhar, além do que já desenha:

- o selo `EM PRODUÇÃO` (classe `tag-now`, a do `EM DESENVOLVIMENTO`) quando há `inProductionSince`;
- no `dl`: `papel`, `tipo`, **`desde`** (`formatYearMonth`), `contexto` (se houver) e as linhas de
  `details`, nessa ordem;
- depois dos chips: a lista de apps (R6);
- na coluna de evidências, quando há `screenshot`: a linha `# sem acesso público: a evidência é a captura
  do painel` (gerada, no estilo `.no-evidence` do aviso de privado; analyze C1) e o `ProjectScreenshot`;
  senão, os links ou o `noEvidenceReason`, como hoje.

O comando é `debianserver --status` (FR-022), nos dados. O rodapé `[side-project]` vem do `tag`.

**Rationale**: um projeto sem os campos novos renderiza exatamente o HTML de hoje (FR-021); o teste de
componente do `ProjectCard` confere isso com o SRG.

## R9. Ordem, `open` e ícones minimizados: o que já sai dos dados

**Decision**: nenhuma mudança de código em `openTargets`, no `help` ou no Tab: o alvo `debianserver`
(`projectWindowId('DebianServer')` = `projetos/debianserver`) sai da ordem dos dados, depois de `srg`
(FR-023). Os testes que listam as opções passam de 10 para 11.

Ícones minimizados (FR-024), calculados com os tokens de hoje (ícone = `--desktop-icon-size` + 2,5rem =
128 px; espaço 8 px; seção com 24 px de cada lado; 7 ícones = 944 px):

| Largura | Por linha | Linhas (7 ícones) | Antes (6) |
|---------|-----------|-------------------|-----------|
| 320 px | 2 | 4 | 3 |
| 768 px | 5 | 2 | 2 |
| 1024 px | 7 (976 px úteis) | 1 | 1 |

Nenhum CSS muda; o `minimized-layout.spec.ts` passa a esperar 4 / 2 / 1 linhas, com o título "sete
projetos".

## R10. Peso

**Decision**: a linha de base é o total do `weight.spec.ts` medido no build de `965f4ee` (estado da
008), no início da implementação: **110.149 B** (medido em 2026-10-20, T001); teto **+6 KB** gzip
(SC-004), revisado na implementação (o plano dizia +4 KB).

**Medido na implementação (T036, 2026-10-20)**: **115.268 B, +5.119 B** (HTML 23.666 → 26.183, +2.517;
JS 72.758 → 74.901, +2.143; CSS 13.725 → 14.184, +459). A estimativa abaixo esqueceu que o texto do
DebianServer (propósito, detalhes, os 6 apps, o texto alternativo) e o do challenge vão no HTML
pré-renderizado **e** de novo nos dados do JS que hidrata a página. Como na 006 (SC-011 revisada,
research R17 da 006), o teto passou de +4 para +6 KB; o carregamento inicial continua muito abaixo dos
500 KB, e as imagens e o sprite seguem fora dele. Estimativa: +2,5–3,5 KB (HTML da janela
do DebianServer com o texto dos 6 apps, dos detalhes e o texto alternativo ≈ 1,3 KB; HTML do challenge
novo: o 1º arquivo YAML pré-renderizado passa a ser o dele e ganha um cartão ≈ 0,4 KB; JS do
`ProjectScreenshot` e do visualizador ≈ 0,8 KB; CSS ≈ 0,5 KB). As imagens não contam (carregamento
preguiçoso) e o sprite também não (arquivo externo), mas um e2e confere que **nenhum WebP é pedido**
antes de a janela do DebianServer chegar perto da tela.

## R11. Privacidade (FR-020, SC-008)

**Decision**: três verificações:

1. **Revisão da captura** (feita em 2026-10-20): mostra relógio, data, CPU/RAM/disco, a interface
   `enp1s0` e os ícones dos apps; não mostra IP, domínio, porta, usuário, nome do tailnet nem nome de
   rede Wi-Fi. A interface de rede é um nome genérico do Linux e fica.
2. **Metadados**: os WebP saem do canvas, sem EXIF/XMP/ICC; um teste de unidade lê os primeiros bytes
   dos dois arquivos e confere que só há os blocos `VP8`/`VP8L`/`VP8X` sem `EXIF` nem `XMP `.
3. **Conteúdo publicado**: um e2e varre o HTML do build (`dist/index.html`) e falha se encontrar um IPv4
   privado ou de CGNAT (`10.`, `172.16–31.`, `192.168.`, `100.64–127.`), `.ts.net` ou `tailscale.com/`
   além do nome da tecnologia. O IP do visitante (005) é buscado em tempo de execução e não está no HTML.

## R12. Versão

**Decision**: `package.json` (e o lockfile) em `2.8.0`; a sessão da porta mostra `v2.8` (005 FR-016).
Ajustam-se `tests/unit/version.spec.ts` e o teste de componente da porta.

## R13. Testes

**Decision**:

- **Unidade** (`resume.data.spec.ts`): inventário (7 projetos na ordem nova, 8 challenges); regra (6)
  aceita `side-project` com `screenshot` como exceção; novas regras: `inProductionSince` e `inProgress`
  nunca juntos; `details[].label` em minúsculas sem acento; caminhos da captura relativos (sem `/` no
  começo, sem protocolo) e existentes em `public/`; `alt` e `caption` não vazios.
- **Unidade** (`editor-files.spec.ts`, `sections.spec.ts`, `terminal.spec.ts`, `tech-icons.spec.ts`,
  `version.spec.ts`): 8 arquivos com `2026-10_bom-jesus-fae.yml` em 1º; 11 opções do `open`; os 13
  ícones novos no sprite (o teste existente já cobre); `2.8.0`.
- **Componente** (`ProjectCard.spec.ts`): o DebianServer (selo, `desde`, detalhes, apps com ícone,
  captura no lugar dos links) e o SRG com o HTML de antes; `ProjectScreenshot.spec.ts` novo (abre e fecha
  o diálogo, clique com modificador não abre, foco volta ao link, sem `hydrated` não há diálogo).
- **e2e**: `projects.spec.ts` (ordem, fatos, rodapé, celular, sem rolagem horizontal), `editor-windows`
  (8 arquivos, fatos do Bom Jesus), `open-command` (11 opções, `open debianserver`),
  `minimized-layout` (4/2/1 linhas), `no-js` (janela completa, link da captura), `a11y` (DebianServer
  aberto, minimizado, visualizador aberto), `reduced-motion`, `weight` (teto novo e WebP preguiçoso),
  um `screenshot-viewer.spec.ts` novo (FR-018, SC-009: tempos, imagem inteira em 4 larguras, foco, Esc,
  ✕, fundo, Ctrl+Alt+T bloqueado) e a varredura de privacidade (R11).

## R14. Documentação

**Decision**: `DESIGN.md` registra a captura na janela de projeto, o visualizador (diálogo nativo, fundo
igual ao da janela maximizada), a lista de apps com ícones e o tipo `side-project`; o guia de edição no
topo de `resume.ts` ganha as regras de `inProductionSince`, `details`, `apps` e `screenshot` (e como
gerar os WebP); o `README.md` cita o `tools/build-screenshots.mjs` e a fonte nova de ícones; o
`NOTICE.md` do sprite ganha a seção do simple-icons (gerada pelo script).
