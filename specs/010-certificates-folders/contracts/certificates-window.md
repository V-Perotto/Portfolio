# Contrato: janela de Certificados, visualizador único e foto da Prime Control (feature 010)

O que os testes (Vitest e Playwright) podem esperar do DOM e do comportamento. Decisões em
[research.md](../research.md). Tipos em [data-model.md](../data-model.md).

## 1. Seção

```html
<section id="certificados" …>                         <!-- SectionShell -->
  <h2 …>certificados</h2>
  <p …>ls -R ~/certificados</p>                        <!-- linha de comando da seção (FR-001) -->
  <div class="desktop-window editor-window" data-editor="certificados" data-window-id="certificados">
    …                                                   <!-- EditorWindow + EditorFrame -->
  </div>
</section>
```

- Fica depois de `#educacao` e antes de `#contato`. O menu tem `~/certificados` nessa posição.
- Sem `certificatePlatforms`, não há a seção, o item do menu, a opção do `find` nem a do `open`.

## 2. Árvore (Branched Menu em modo exclusivo)

```html
<div class="editor-tree">
  <nav class="branched-menu" aria-label="Arquivos de ~/certificados" style="--bm-max-rows: 8; --bm-sections: 5; --bm-largest: 33; …">
    <div class="bm-section" data-open>                       <!-- a pasta aberta -->
      <button class="bm-head" aria-expanded="true">dio/</button>
      <div class="bm-fold">
        <div class="bm-fold-inner">                          <!-- rola por dentro, até 8 linhas (4 em < 760 px) -->
          <div class="bm-rows">
            <button class="bm-child" data-value="dio/empregotech-basico" aria-current="true" data-active>…</button>
            …                                                <!-- 33 -->
          </div>
        </div>
      </div>
    </div>
    <div class="bm-section">                                 <!-- fechada -->
      <button class="bm-head" aria-expanded="false">prime-academy/</button>
      <div class="bm-fold" inert>…</div>                     <!-- fora do Tab e do leitor de tela -->
    </div>
    …                                                        <!-- udemy/, senai/, promenady/ -->
  </nav>
</div>
```

Comportamento:

- Sempre há **exatamente uma** `.bm-section[data-open]`. Clicar (ou Enter/Espaço) numa `.bm-head`
  fechada a abre e fecha a anterior. Clicar na aberta não muda nada.
- Abrir a pasta `p` deixa ativo o 1º arquivo dela: `aria-current` no 1º `.bm-child`, o arquivo, a aba e o
  rodapé passam a ser os dele, e a lista começa no topo.
- A lista aberta rola dentro do `.bm-fold-inner` (`scrollHeight > clientHeight` na DIO e na Prime
  Academy). Rolar até o fim não rola a página (`window.scrollY` não muda). O `.bm-child` focado pelo Tab
  entra na área visível.
- Sem as props novas (`exclusive`, `maxRows`), o Branched Menu se comporta como na 008 (as outras 4
  janelas). A dobra fechada ganha `inert` em todas as janelas.
- A altura do `.editor-frame` é a mesma com qualquer pasta aberta e qualquer arquivo (± 0,5 px, SC-003).

## 3. Arquivo do certificado

```html
<article class="editor-file" data-file-id="dio/empregotech-basico" data-active aria-label="2020-07-29_empregotech-basico.yml">
  <ol class="editor-lines">
    <li class="editor-line">… # 1 / 33 · Programa EmpregoTech Curitiba - Básico</li>
    <li class="editor-line">… curso: Programa EmpregoTech Curitiba - Básico</li>
    <li class="editor-line">… plataforma: DIO</li>
    <li class="editor-line">… tipo: bootcamp</li>
    <li class="editor-line">… emitido: 29 JUL 2020</li>
    <li class="editor-line">… carga_horaria: 39 h</li>
    <li class="editor-line">… verificacao: <a class="tok tok-link" href="https://hermes.dio.me/certificates/207D7222.pdf" target="_blank" rel="noopener noreferrer">hermes.dio.me/certificates/207D7222.pdf</a></li>
  </ol>
  <figure class="zoom-figure editor-figure" data-placement="below">
    <a class="shot-link" href="/Portfolio/certificados/dio/2020-07-29_empregotech-basico-1200.webp" target="_blank" rel="noopener noreferrer" style="aspect-ratio: 1200 / 849">
      <img loading="lazy" decoding="async" width="1200" height="849" alt="Certificado da DIO: Programa EmpregoTech Curitiba - Básico, 39 h, 29/07/2020"
           sizes="(max-width: 760px) calc(100vw - 6rem), 20rem" srcset="…-640.webp 640w, …-1200.webp 1200w" src="…-640.webp">
      <span class="sr-only">(abre o certificado em tamanho real)</span>
    </a>
  </figure>
</article>
```

- Só o arquivo aberto e os já visitados têm o `<img>`. Nos outros, o `<a>` existe vazio, com a proporção
  reservada. Entrar na seção baixa no máximo 1 miniatura.
- Prime Academy: `codigo: <hash>` (texto, `tok-str`). SENAI: `ementa: [...]` e a linha de comentário
  `# código omitido por privacidade`. Promenady: o link com o texto `e-certificado.com · <código>`.
- Rodapé: `.editor-path` = `~/certificados/dio/2020-07-29_empregotech-basico.yml`, `.editor-pos` =
  `1 / 33`.

## 4. Cartões (janela maximizada, sem JS, impressão)

```html
<div class="editor-cards">
  <section class="cert-group" data-card-group="dio">                    <!-- hidden quando maximizada em outra pasta -->
    <h3 class="cert-group-title">DIO · 33 certificados</h3>
    <ol class="cert-list">
      <li data-card-id="dio/empregotech-basico">
        <article class="cert-card">
          <p class="card-date mono">// 29 JUL 2020 · 39 h</p>
          <h4 class="cert-title">Programa EmpregoTech Curitiba - Básico</h4>
          <p class="cert-meta mono">DIO · bootcamp</p>
          <p class="cert-links mono">
            <a href="https://hermes.dio.me/certificates/207D7222.pdf" target="_blank" rel="noopener noreferrer">hermes.dio.me/certificates/207D7222.pdf</a>
            <a class="cert-view" href="/Portfolio/certificados/dio/…-1200.webp" target="_blank" rel="noopener noreferrer">ver certificado<span class="sr-only"> Programa EmpregoTech Curitiba - Básico</span></a>
          </p>
        </article>
      </li>
      …
    </ol>
  </section>
  …                                                                    <!-- 5 grupos, 61 cartões -->
</div>
```

- Sem JavaScript e na impressão: os 5 grupos e os 61 cartões estão visíveis, cada um uma vez.
- Maximizada: só o grupo da pasta aberta fica visível (os outros com `hidden`). Abrir outra pasta troca o
  grupo e volta a rolagem ao topo.
- O link `ver certificado`, com JavaScript, abre o visualizador. Com modificador (Ctrl/⌘/Shift/Alt ou
  botão do meio), segue o link. O cartão não tem miniatura.

## 5. Visualizador único

```html
<!-- filho direto do <body>, fora do #app, criado só no cliente -->
<dialog class="shot-viewer" aria-labelledby="image-viewer-caption" open>
  <img class="shot-full" width="…" height="…" alt="…" src="…">
  <p id="image-viewer-caption" class="shot-caption">…</p>
  <button class="shot-close" aria-label="Fechar a imagem">✕</button>
</dialog>
```

- Um `dialog.shot-viewer` na página inteira, para a captura do DebianServer, as miniaturas, os links
  `ver certificado` e a foto. As regras da 009 continuam: `showModal()`, `html.window-maximized`,
  ✕ de 44 × 44 px, abrir e fechar em ≤ 400 ms, sem animação com "reduzir movimento", e Esc, ✕ ou clique
  no fundo fecham. Ao fechar, o foco volta ao elemento que o abriu, e a página fica na mesma posição.
- Legendas: captura `# painel do CasaOS do DebianServer · OUT 2026` (como hoje); certificado
  `# DIO · Programa EmpregoTech Curitiba - Básico · 29 JUL 2020`; foto
  `# 1º dia na Prime Control · 15 OUT 2020`.
- Aberto por cima da janela maximizada: o Esc fecha só o visualizador, a janela continua maximizada, o
  `html.window-maximized` continua, e o foco volta ao link dentro dela.

## 6. Foto da Prime Control

- No arquivo `~/carreira/2020-10_prime-control.yml`: `article.editor-file.has-figure` com
  `figure.zoom-figure.editor-figure[data-placement="side"]`. A partir de 900 px, a figura fica à direita
  das linhas. Abaixo disso, fica embaixo delas. Legenda `# 1º dia na Prime Control · 15 OUT 2020`.
- No cartão (`ExperienceCard`): a mesma figura, depois dos chips, com a mesma legenda.
- Alt de data-model §4. `width` × `height` 1024 × 768; `srcset` 512w e 1024w.
- As outras 4 experiências não têm figura. A janela de Experiência tem a mesma altura nos 5 arquivos, e
  em 1366 e 1920 px ela fica no máximo 2 linhas do editor (46 px) mais alta que na 009 (453 px medidos).

## 7. Terminal da dock

| Entrada | Saída e ação |
|---------|--------------|
| `open certificados` (ou o apelido `open certificados`) | `→ ~/certificados`; minimiza o terminal, rola até `#certificados` e maximiza a janela, com o foco dentro |
| `open` | `OPTIONS: experiencia \| srg \| debianserver \| … \| educacao \| certificados` (12) |
| `help` | `projetos abrem; experiencia, challenges, comunitario, educacao e certificados abrem maximizados` |
| `open cert` + Tab | `open certificados` |
| `find certificados` | rola até `#certificados` |
