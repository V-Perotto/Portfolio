# Research: certificados em pastas por plataforma e a foto do 1º dia na Prime Control (feature 010)

Decisões técnicas da fase 0. Cada uma resolve um ponto do plano. Tudo foi conferido em 2026-10-20:

- os 62 arquivos de `/home/viper/Documents/certificados` (texto dos PDFs com `pdftotext`, as imagens e os
  PDFs sem texto renderizados com `pdftoppm` e lidos um a um);
- os links de verificação, com `curl` e com o navegador do Playwright;
- o layout das janelas de editor, medido no build de `9dd2d52` servido em `localhost:4173`;
- o peso das imagens, estimado com libwebp (Pillow, `method=6`).

---

## R1. A árvore com uma pasta por plataforma: o Branched Menu em modo acordeão

**Decision**: a janela de Certificados usa o mesmo `EditorFrame` e o mesmo `BranchedMenu` das outras
janelas. A árvore passa de uma seção (a pasta raiz) para **uma seção por plataforma**: `dio/`,
`prime-academy/`, `udemy/`, `senai/` e `promenady/`. O Branched Menu já aceita várias seções com filhos,
cada uma com o botão da pasta (`aria-expanded`) e a dobra. O componente vendorizado ganha três mudanças
locais, registradas no cabeçalho dele:

1. **`exclusive`** (prop booleana): abrir uma seção fecha as outras, e clicar na seção já aberta não a
   fecha (FR-004). Sem a prop, o comportamento de hoje fica igual (as outras 4 janelas não mudam).
2. **`maxRows`** (prop numérica, só com `exclusive`): a dobra aberta tem altura máxima de
   `maxRows × rowHeight + 12 px` e rola por dentro (`overflow-y: auto`, `overscroll-behavior: contain`),
   pela roda, pelo toque e pelo teclado (FR-005). O número vira a variável CSS `--bm-max-rows`, que o
   `EditorFrame` troca abaixo de 760 px. Medido: cabeça da pasta e linha de arquivo com 36 px cada.
   Ficam **8 linhas no desktop** e **4 no celular**.
3. **`inert` na dobra fechada**: os arquivos de uma pasta fechada saem da árvore de acessibilidade e do
   Tab (hoje eles só têm `tabindex="-1"` e continuam sendo lidos pelo leitor de tela). Nas janelas de uma
   pasta só, isso só muda alguma coisa se o visitante fechar a pasta raiz, e aí também é o certo.

O `EditorFrame` escuta o `toggle` do menu: abrir a pasta `i` abre o 1º arquivo dela (FR-004, "o arquivo
aberto é sempre de um certificado da pasta aberta").

**Altura fixa da janela (FR-015, SC-003)**: a altura da árvore muda de pasta para pasta (SENAI: 1 linha;
DIO: 8, com rolagem). Com `exclusive`, o menu reserva `min-height` para a maior pasta:
`5 cabeças × 36 px + min(maxRows, 33) × 36 px + 12 px` (o cálculo é em CSS, com as variáveis
`--bm-sections`, `--bm-largest` e `--bm-max-rows`, para o celular trocar só o `--bm-max-rows`). Durante a
dobra, a pasta que abre e a que fecha usam a mesma curva e a mesma duração, então a soma das duas nunca
passa da maior. Maximizada, a reserva sai (`min-height: auto`): ali a árvore rola por inteiro (no celular
ela tem `max-height: 30vh`, que perderia para um `min-height` maior).

**Rationale**: o pedido ("visualizar e passar por scroll na aba lateral, mas somente dentro da pasta,
sendo necessário clicar em outra pasta") é um acordeão. Com 33 certificados na DIO, a lista sem limite
teria 1.200 px de altura. O Branched Menu já desenha várias pastas, com os ramos e o marcador, então
ganhar o modo exclusivo é menor que escrever outra árvore (Princípio V).

**Alternatives considered**:

- Uma árvore nova só para os certificados: duplicaria os ramos, o marcador, o foco e o "reduzir
  movimento" do Branched Menu.
- Árvore sem limite de altura, com a janela inteira rolando: o visitante perderia o arquivo de vista, e
  o pedido diz que a rolagem é só dentro da pasta.
- `<details name="…">` (acordeão nativo): perde o desenho dos ramos e o marcador das outras janelas.

## R2. Dados: `certificatePlatforms` em `resume.ts`

**Decision**: o `Resume` ganha `certificatePlatforms: CertificatePlatform[]`, na ordem das pastas (a do
pedido do autor). Cada plataforma tem `id` (o nome da pasta), `name` (o nome exibido), `image` (as
dimensões do tamanho real, iguais em toda a plataforma) e `certificates`. Cada certificado tem `id` (o
slug curto do arquivo), `title` (como impresso), `issued` (`AAAA-MM-DD`), `hours`, `kind?`
(`'bootcamp'`), `syllabus?` e `verification?`. O formato exato e os 61 itens estão em
[data-model.md](data-model.md).

- **Ordem**: dentro da pasta, o mais recente primeiro pela data. No mesmo dia, vale a ordem dos dados
  (ordenação estável).
- **Caminhos das imagens**: são derivados, não ficam nos dados:
  `certificados/<plataforma>/<AAAA-MM-DD>_<slug>-640.webp` (miniatura) e `-<largura>.webp` (tamanho real).
  Escrever os 122 caminhos à mão pesaria ~1 KB comprimido a mais no JS, e um caminho errado só apareceria
  no navegador. Um teste de unidade confere que todo arquivo derivado existe em `public/` e tem as
  dimensões dos dados.
- **Slugs**: até 20 caracteres, únicos na pasta. O nome inteiro (`2020-07-29_empregotech-basico.yml`) tem
  no máximo 35 caracteres. Na árvore do desktop, o rótulo cabe ~31 caracteres (300 px − recuo e ícone);
  o que não cabe termina em reticências (008 FR-020).

**Rationale**: o mesmo caminho das outras coleções. O conteúdo fica só em `resume.ts`, o `satisfies`
quebra o build com campo faltando, e a janela, os cartões e o `open` saem dos dados.

**Alternatives considered**:

- Uma lista plana com `platform` em cada certificado: repetiria o nome da plataforma 61 vezes e
  espalharia a ordem das pastas.
- O tamanho da imagem em cada certificado: igual dentro de cada plataforma (todos os PNGs da Prime Academy
  têm 1039 × 717; as páginas dos PDFs da DIO, do SENAI e da Promenady são A4; as da Udemy, 1600 × 1190
  pt).

## R3. O arquivo YAML e o cartão do certificado

**Decision**: `certificateFolder()` em `src/lib/editor-files.ts` gera um `EditorFolder` com `groups` (uma
pasta por plataforma). Os arquivos de cada grupo têm a posição **dentro da pasta**. As linhas:

```yaml
# 1 / 33 · Programa EmpregoTech Curitiba - Básico
curso: Programa EmpregoTech Curitiba - Básico
plataforma: DIO
tipo: bootcamp
emitido: 29 JUL 2020
carga_horaria: 39 h
verificacao: hermes.dio.me/certificates/207D7222.pdf
```

- `tipo` só nos dois bootcamps da DIO: o certificado diz "concluiu o bootcamp", e o título não diz. Os
  webinars já têm "Webinar –" no título.
- `ementa: [Inteligência Artificial, Aprendizagem de máquina, …]` só no SENAI, numa lista na linha, como
  `stack:`. Com 10 itens, a lista quebra em ~3 linhas. Uma lista com um item por linha teria 11 linhas e
  faria o SENAI o arquivo mais alto, e a janela inteira cresceria por causa dele.
- Verificação (R5): `verificacao:` como link (DIO, Udemy, Promenady), `codigo:` como texto (Prime
  Academy) ou o comentário `# código omitido por privacidade` (SENAI).
- Abaixo das linhas, a miniatura (R6).

O cartão (`CertificateCard.vue`) segue o padrão dos cartões de challenge: `// 29 JUL 2020 · 39 h` no
estilo `card-date`, o título num `h4`, `DIO · bootcamp` quando houver tipo, a ementa como texto, a
verificação e o link `ver certificado` (FR-013). A seção agrupa os cartões por plataforma
(`<section data-card-group="dio">` com o título `h3` `DIO · 33 certificados`), na ordem das pastas.

**Rationale**: as mesmas chaves em português, sem acento, e as mesmas cores de sintaxe das outras janelas
(006 FR-007). O cartão fica compacto porque são 61, mas tem todos os fatos do arquivo (FR-013).

## R4. As imagens: um script novo, com `pdftoppm` e o canvas do Chromium

**Decision**: um script novo, `tools/build-certificates.mjs`, gera todas as imagens da feature em
`public/`:

- **certificados**: `public/certificados/<plataforma>/<AAAA-MM-DD>_<slug>-640.webp` (miniatura) e
  `-<largura>.webp` (tamanho real);
- **foto**: `public/carreira/prime-control/integracao-2020-10-15-512.webp` e `-1024.webp`.

Como funciona:

1. A lista de certificados vem do próprio `src/data/resume.ts`: o Node 24 executa TypeScript com tipos
   apagados, e o `resume.ts` só importa tipos. O script não repete os dados.
2. Ele tem um manifesto com o arquivo de origem de cada certificado (`dio/postgresql` → `1D1848C9.pdf`),
   as edições (R5) e a qualidade de cada plataforma.
3. A pasta de origem é `~/Documents/certificados` (ou `CERTIFICADOS_DIR`), **fora do repositório**: os
   PDFs não são versionados (`*.pdf` no `.gitignore`, pela constituição), e o certificado do SENAI e a foto
   originais não podem ir para um repositório público (FR-010, FR-020).
4. PDF: `pdftoppm -f 1 -l 1 -scale-to-x 1200 -scale-to-y -1 -png` (poppler-utils, ferramenta do sistema,
   pedida só para regerar as imagens). PNG e JPEG: lidos como estão.
5. O Chromium do Playwright (já usado pelo `build-screenshots.mjs`) desenha a imagem num `<canvas>`,
   aplica as edições **antes** de qualquer redução, reduz para cada largura com `imageSmoothingQuality:
   'high'` e exporta WebP. O `stripMetadata` do 009 (tira `ICCP`/`EXIF`/`XMP `) passa para
   `tools/lib/webp.mjs` e é usado pelos dois scripts.
6. Falha se um arquivo passar do teto (SC-011), se faltar `pdftoppm` ou se faltar um arquivo de origem.

Larguras e pesos (estimados com libwebp; o Chromium dá números parecidos):

| Imagem | Miniatura | Tamanho real | Estimado |
|--------|-----------|--------------|----------|
| DIO, Promenady, SENAI (A4) | 640 × 453, q 0,80 | 1200 × 849, q 0,80 | 16–24 KB / 41–56 KB |
| Prime Academy (PNG 1039 × 717) | 640 × 442, q 0,80 | 1039 × 717 (original), q 0,80 | 20–22 KB / 37–39 KB |
| Udemy (borda de guilhoché) | 640 × 476, **q 0,70** | 1200 × 893, q 0,80 | ~38 KB / ~160 KB |
| Foto (JPEG 1024 × 768) | 512 × 384, q 0,80 | 1024 × 768 (original), q 0,80 | ~30 KB / ~79 KB |

Tetos (SC-011): miniatura ≤ 40 KB, tamanho real ≤ 200 KB, foto exibida ≤ 60 KB, foto real ≤ 150 KB.
Total no repositório: ~4,3 MB em 124 arquivos. Nada entra no carregamento inicial.

**Medido na T008 (2026-10-20, Chromium)**, todas as alturas iguais às dos dados:

| Plataforma | Miniatura (640 px) | Tamanho real |
|------------|--------------------|--------------|
| DIO (33) | 17,7–28,9 KB | 41,6–66,2 KB (1200 × 849) |
| Prime Academy (20) | 19,8–22,4 KB | 38,1–43,1 KB (1039 × 717) |
| Udemy (2) | 35,8–36,0 KB (q 0,70) | 146,2–146,7 KB (1200 × 893) |
| SENAI (1) | 16,9 KB | 39,2 KB (1200 × 849) |
| Promenady (5) | 15,9–16,1 KB | 39,1–39,7 KB (1200 × 849) |
| Foto | 29,4 KB (512 × 384) | 77,3 KB (1024 × 768) |

Total: 4,33 MB em `public/certificados/` e 107 KB em `public/carreira/`. Na inspeção visual, as 5 tarjas
do SENAI cobrem inteiras a cidade e a UF, o RG, o CPF, a data de nascimento e o código, nas duas
larguras. Na foto, os 5 rostos de terceiros ficaram irreconhecíveis com o desfoque retangular (18 px, 3
passadas), e o rosto do autor ficou nítido. Os retângulos de data-model §5 não precisaram de ajuste.

**Rationale**: WebP sem metadados, gerado sem dependência nova no `package.json` (Princípio III), pelo
mesmo caminho da 009. As edições no canvas, antes da redução, garantem que nenhuma versão publicada tem o
dado original.

**Alternatives considered**:

- `pdf.js` no `package.json`: dependência nova para renderizar 41 páginas uma vez.
- O Chromium abrindo o PDF: o visualizador de PDF não funciona em modo headless.
- Versionar PNGs intermediários em `tools/source/` (como a 009): ~30 MB no git, e as versões sem edição
  do SENAI e da foto iriam junto.
- Miniatura de 704 px (2 × 352): a da Udemy passaria de 40 KB. Com 640 px, a miniatura de 20rem (320 px)
  fica nítida a 2×.
- Publicar os PDFs: os da DIO têm 3,7 MB cada.

## R5. Privacidade e verificação

**Decision**:

- **SENAI, tarja preta** (clarify): retângulos pretos opacos, em coordenadas da página do PDF (pt), sobre
  a cidade com a UF da naturalidade, o número do RG com a UF, o número do CPF, a data de nascimento e o
  **código de identificação** do rodapé (plano, C2). Medidos com `pdftotext -bbox-layout` e conferidos
  numa prévia: o código leva à página de validação do Sistema Fiep, que pode mostrar o certificado inteiro,
  com os documentos. Os rótulos ("natural de", "RG", "CPF", "nascido(a) em") ficam à vista. Só a 1ª página
  é publicada; a ementa (2ª página) vira texto (R3).
- **SENAI, nada em texto**: o arquivo, o cartão e o texto alternativo não têm o código, só
  `# código omitido por privacidade`. O nome da cidade não aparece em nenhum arquivo do repositório (nem
  nos testes): o teste de privacidade procura padrões (CPF, RG, data de nascimento) e confere os pixels
  das tarjas.
- **Foto, desfoque** (Q2, C1): a foto tem 6 pessoas. Os rostos das 5 outras recebem um desfoque forte
  (`ctx.filter = 'blur(…)'` sobre o recorte de cada rosto, com margem, mais de uma passada), em
  coordenadas do original de 1024 × 768. O rosto do autor (ponta direita da mesa, de frente) fica nítido.
  A conferência é visual, na miniatura e no tamanho real, por mim e pelo autor (quickstart).
- **Verificação** (FR-008, conferida em 2026-10-20):

| Plataforma | Endereço impresso | Situação | No site |
|------------|-------------------|----------|---------|
| DIO | código de 8 caracteres | `https://hermes.dio.me/certificates/<CÓDIGO>.pdf` devolve o mesmo PDF do autor (33 de 33 com o mesmo tamanho em bytes) | `verificacao:` link |
| Prime Academy | `academy.primecontrol.com.br/certificates/<hash>/` | domínio sem DNS (fora do ar) | `codigo: <hash>` (C3) |
| Udemy | `ude.my/UC-…` | o Cloudflare recusa o curl e o navegador automatizado (403) | `verificacao:` link, conferido pelo autor (C4) |
| SENAI | código no rodapé | expõe os documentos | omitido (C2) |
| Promenady | código + "e-certificado.com" | `https://e-certificado.com/login/autenticar?c=<código>` mostra "Certificado Autêntico", com o nome e o curso (5 de 5) | `verificacao:` link |

  O texto do link é o endereço sem protocolo, como o `repositorio` dos challenges. Para a Promenady, que
  tem um endereço longo, o texto é `e-certificado.com · <código>`.

**Conferido de novo na implementação (T035, 2026-10-20)**: os 33 `hermes.dio.me/certificates/<CÓDIGO>.pdf`
com o mesmo `content-length` dos PDFs de origem, e os 5 códigos da Promenady com "Certificado Autêntico"
no e-certificado. Os 2 da Udemy foram abertos pelo autor num navegador comum e conferidos (V18, T036).

**Rationale**: a tarja da clarify só protege os documentos se o código que leva a eles também for
coberto. Os links que funcionam viram evidência. O que não funciona fica como código, que o visitante
pode comparar com a imagem.

## R6. A miniatura no arquivo: `ZoomFigure`, só a do arquivo aberto

**Decision**: um componente base novo, `src/components/base/ZoomFigure.vue`, desenha a figura: um
`<a href="<tamanho real>" target="_blank" rel="noopener noreferrer">` com o `<img>`, o texto `.sr-only`
que diz que abre em tamanho real, e a legenda opcional. Com JavaScript, o clique abre o visualizador (R7).
Ele vem do `ProjectScreenshot` da 009, que passa a usá-lo.

- **No arquivo** (`EditorFile.figure`, `placement: 'below'`): abaixo das linhas, com
  `width: min(100%, 20rem)`, `sizes="(max-width: 760px) calc(100vw - 6rem), 20rem"` e
  `srcset="640w, <largura>w"`.
- **Só a miniatura do arquivo aberto é baixada** (FR-009): os arquivos ficam empilhados na mesma célula,
  e os fechados só ficam invisíveis (`visibility: hidden`). Eles continuam no layout, então um
  `loading="lazy"` baixaria as 61 miniaturas assim que a janela chegasse perto da tela. O `EditorFrame`
  só põe o `<img>` no arquivo aberto e nos já visitados. Nos outros, a figura é a caixa vazia com a
  proporção reservada (`aspect-ratio` da largura × altura). A altura não muda (SC-003).
- No HTML pré-renderizado só vai o 1º arquivo (como hoje), com a miniatura dele preguiçosa.

**Medido** (1366 px): painel do arquivo com ~680 px na janela de Certificados. O arquivo mais alto tem
~9 linhas × 23 px + a miniatura de 226 px. O total, ~470 px, fica abaixo da reserva da árvore (~504 px).
A janela não cresce por causa do arquivo.

## R7. O visualizador: um só, no `<body>`, para todas as imagens

**Decision**: o `<dialog>` da 009 sai do `ProjectScreenshot` e vira um **visualizador único**:

- `src/lib/image-viewer.ts`: estado reativo (`{ image, trigger } | null`) e `openViewer(image, trigger)`;
- `src/components/base/ImageViewer.vue`: montado uma vez no `App.vue`, só no cliente, por `<Teleport
  to="body">`, **fora do `#app`**. A janela maximizada torna o `#app` inerte, e um `<dialog>` dentro dele
  ficaria inerte também. As classes (`.shot-viewer`, `.shot-full`, `.shot-close`) e o comportamento da 009
  ficam iguais.

Todas as figuras (captura do DebianServer, miniaturas, foto) e os links `ver certificado` chamam o
mesmo visualizador. Com 61 certificados, um `<dialog>` por figura seriam 61 elementos a mais no DOM.

Ajustes que o uso dentro da janela maximizada pede:

- O `onKeydown` do `EditorFrame` (captura no `document`) ignora o evento quando há um `<dialog>` aberto.
  Senão, o Esc restauraria a janela em vez de fechar o visualizador, e o laço de Tab brigaria com o
  diálogo.
- A classe `window-maximized` do `<html>`: o visualizador só a tira ao fechar se foi ele que a pôs. Com a
  janela maximizada por baixo, a página continua travada.
- Ao fechar, o foco volta ao elemento que abriu (`trigger`), sem rolar (`preventScroll`).

**Alternatives considered**: um `<dialog>` por figura, como na 009: 61 diálogos e o problema do `#app`
inerte.

## R8. A foto na Experiência

**Decision**: `Experience.photo?: Photo` (só a Prime Control). O `experienceFolder()` põe a foto no
arquivo como `figure` com `placement: 'side'`, e o `ExperienceCard` a mostra no cartão (janela
maximizada, sem JS, impressão), com a mesma legenda: `# 1º dia na Prime Control · 15 OUT 2020`
(`formatDate`).

- **≥ 900 px**: o arquivo vira uma grade de 2 colunas, as linhas e a foto
  (`width: clamp(10rem, 36%, 16rem)`, `sizes="16rem"`).
- **< 900 px**: a foto vai para baixo das linhas, com `width: min(100%, 20rem)`.

**Medido** (build de `9dd2d52`, 1366 e 1920 px): janela de Experiência com 453 px; arquivos com 231 px
(10 linhas de 23 px); painel com 721 px. Com a foto de 256 px ao lado, a coluna das linhas fica com
~450 px. O resumo da Prime Control (~230 caracteres) passa de 3 para 4 linhas, e o arquivo, para ~254 px:
**+1 linha** (FR-017 permite 2). **Medido na T028**: o resumo passou para 5 linhas (as continuações têm
recuo de 2 colunas), o arquivo para 277 px, e a janela para **499 px, +46 px = 2 linhas**, o limite do
FR-017, em 1366 e 1920 px. Com a foto de 14rem, a altura era a mesma, então ficou a de 16rem. A legenda
quebra equilibrada (`text-wrap: balance`), sem partir a data. Em 900–1100 px, a foto encolhe até 10rem, e a janela pode crescer
mais. A spec só limita 1366 e 1920 px. No celular (390 px), a foto embaixo acrescenta ~220 px a todos os
arquivos da janela, porque eles ficam empilhados. É o custo de mostrar a foto no arquivo (Q3).

## R9. A janela maximizada: só os cartões da pasta aberta

**Decision**: o slot `cards` do `EditorFrame` passa a receber `{ openGroup }`: `null` fora da janela
maximizada, ou o id da pasta aberta quando ela está maximizada. O `CertificatesSection` põe `hidden` nos
grupos de outras pastas só quando `openGroup` não é nulo. No HTML pré-renderizado e sem JS, o valor é
`null` e todos os 61 cartões aparecem (FR-014). Abrir outra pasta maximizada troca os cartões e volta a
lista ao topo. Escolher um certificado rola até o cartão dele (`revealCard`, que procura `h3, h4`).

**Rationale**: o cartão continua com um HTML só (Princípio III). Só o JavaScript esconde, e só na visão
maximizada.

## R10. Seção, menu, `find` e `open`

**Decision**:

- `SectionId` e a ordem ganham `certificados`, entre `educacao` e `contato`. Com
  `certificatePlatforms` vazio, a seção, o item do menu e a opção do `find` somem.
- `openTargets` ganha `editorTarget('certificados', '~/certificados')` depois de `educacao`: 12 opções. O
  apelido é `certificados` (o caminho sem `~/` é igual ao nome).
- A linha de modos do `help` já é gerada dos alvos: "projetos abrem; experiencia, challenges,
  comunitario, educacao e certificados abrem maximizados".
- Menu: 7 itens. O `AppNav` já quebra para o menu compacto abaixo de 840 px. O `header.spec.ts` confere
  que os 7 cabem a partir de 841 px sem rolagem horizontal.
- `open cert` + Tab: nenhuma outra opção começa com `cert`.

## R11. Peso

**Decision**: a linha de base é o total do `weight.spec.ts` no build de `9dd2d52`. A 009 mediu
115.268 B; **medido de novo na T001 (2026-10-20): 115.332 B** (HTML 26.186, JS 74.963, CSS 14.183). O
teto é **+10 KB** gzip (SC-007).

Estimativa: +7–10 KB.

- Dados dos 61 certificados no JS: ~10,7 KB crus, ~2,5 KB comprimidos.
- 61 cartões no HTML pré-renderizado: ~30 KB crus, ~3,5 KB comprimidos.
- O 1º arquivo YAML pré-renderizado: ~0,3 KB.
- JS do `CertificatesSection`, do `CertificateCard`, do `ZoomFigure`, do visualizador único, do
  acordeão e dos grupos: ~1,5 KB (o diálogo sai do `ProjectScreenshot`).
- CSS: ~0,5 KB.

Se passar de 10 KB, o primeiro corte é o HTML dos cartões: tirar as classes repetidas e deixar o estilo
no `ol`.

**Medido na implementação (T034, 2026-10-20)**: na 1ª medida, **+14.743 B** (HTML +8,9 KB, JS +5,4 KB, CSS
+0,4 KB). Os cortes:

- o HTML pré-renderizado da árvore passou a ter só as 5 pastas, sem os 61 arquivos com os ramos e os
  ícones (−2,5 KB): sem JS a árvore não aparece, e os arquivos entram na montagem, como os YAML;
- o cartão de certificado ficou sem o `BaseCard` (o brilho do SpotlightCard), com a mesma borda (−0,4 KB).

Depois deles: **127.545 B, +12.213 B** (HTML 32.487, +6,3 KB; JS 80.412, +5,4 KB; CSS 14.646, +0,5 KB). No
JS, ~3 KB são só os dados dos 61 certificados, que a hidratação precisa. Como na 006 e na 009, o teto foi
revisto: de +10 para **+13 KB** (SC-007). O carregamento inicial continua muito abaixo dos 500 KB (~128 KB),
e as 124 imagens ficam fora dele. **Final, com a foto da US2 (T034)**: **128.292 B, +12.960 B** (HTML 32.925,
+6,7 KB; JS 80.619, +5,7 KB; CSS 14.748, +0,6 KB), abaixo do teto de +13 KB.

## R12. Versão

**Decision**: `2.9.0` no `package.json` e no lockfile (sessão da porta `v2.9`, 005 FR-016).

## R13. Testes

**Decision**:

- **Unidade** (`resume.data.spec.ts`): 5 plataformas na ordem; 61 certificados (33/20/2/1/5); datas
  `AAAA-MM-DD` válidas, não futuras; slugs únicos na plataforma, em kebab-case, com ≤ 20 caracteres;
  `hours > 0`; verificação com `https://`; todas as imagens derivadas existem em `public/`, e as
  dimensões do cabeçalho do WebP batem com as dos dados; o SENAI sem verificação; nenhum padrão de CPF
  (`\d{3}\.?\d{3}\.?\d{3}-?\d{2}`), de RG, nem "natural de" nos dados.
- **Unidade** (`editor-files.spec.ts`): `certificateFolder` (5 grupos, posição na pasta, nomes, linhas
  de DIO, Prime, Udemy, SENAI e Promenady, ordem no mesmo dia) e `experienceFolder` (figura só na Prime
  Control). Também `sections.spec.ts` (7 seções, 12 alvos), `terminal.spec.ts` (help, Tab
  `open cert`), `version.spec.ts` (2.9.0) e um teste do WebP sem metadados para todos os arquivos de
  `public/`.
- **Componente**: `BranchedMenu.spec.ts` (`exclusive`, `maxRows`, `inert`; sem as props, igual a hoje),
  `CertificateCard.spec.ts` (novo), `ExperienceCard.spec.ts` (foto), `ZoomFigure.spec.ts` (novo) e
  `ProjectScreenshot.spec.ts` (ajustado ao visualizador único), `EditorWindow.spec.ts` (grupos).
- **e2e**: um `certificates.spec.ts` novo, com:
  - a árvore, o acordeão, a rolagem só dentro da pasta (a página parada);
  - a altura fixa (SC-003);
  - os fatos de 1 certificado por plataforma;
  - a miniatura preguiçosa (só a do arquivo aberto) e o visualizador;
  - a janela maximizada só com a pasta aberta;
  - 320/390/768/1366/1920 px.
  
  E mais:
  - `privacy` (as tarjas do SENAI conferidas nos pixels e os padrões de documentos no `dist/`);
  - `editor-windows` (foto da Prime Control, +≤ 2 linhas);
  - `open-command` (12 opções);
  - `no-js` (61 cartões em 5 grupos; `ver certificado` como link);
  - `a11y` (cada pasta, maximizada, visualizador);
  - `reduced-motion`, `weight` (teto e nenhum WebP no hero), `header` (7 itens), `screenshot-viewer`
    (sem mudança de comportamento).

## R14. Documentação

**Decision**:

- `DESIGN.md`: a árvore com várias pastas (acordeão, rolagem só dentro da pasta), o cartão de certificado,
  a miniatura no arquivo, a foto ao lado das linhas e o visualizador único.
- O guia de edição no topo de `resume.ts`: como acrescentar um certificado ou uma plataforma, rodar
  `node tools/build-certificates.mjs` e a regra da privacidade.
- `README.md`: o script novo, a pasta de origem fora do repositório e o `pdftoppm`.

## R15. Correções na spec achadas no plano

Registradas em Clarifications, "Session 2026-10-20 (plan)":

- **C1**: a foto tem 6 pessoas (o autor e mais 5), não 7.
- **C2**: o código do SENAI também fica sob tarja e não é publicado.
- **C3**: o domínio da Prime Academy está fora do ar.
- **C4**: os links da Udemy são conferidos pelo autor.
