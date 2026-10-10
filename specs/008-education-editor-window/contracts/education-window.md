# Contrato: janela de editor da Educação e opção `educacao` do `open`

**Feature**: `008-education-editor-window` | Requisitos: FR-001 a FR-018 | Pesquisa: R1–R8

Estende o contrato da 006 ([editor-window.md](../../006-editor-windows-letterglitch/contracts/editor-window.md))
e o da 007 ([terminal-open.md](../../007-open-command-dock-minimize/contracts/terminal-open.md)). Tudo o que
eles dizem das janelas de editor (DOM, classes, nomes acessíveis, maximizar, minimizar, fechar, digitação,
sem JS, impressão) vale para esta janela; abaixo, só o que é dela.

## 1. DOM (pré-renderizado)

```html
<section id="educacao">                                         <!-- SectionShell: título e lead inalterados -->
  <h2 …>educacao</h2> <p …>apt list --installed | grep formacao</p>
  <div class="desktop-window editor-window" data-window-state="open|minimized|closed" data-editor="formacao">
    <div class="editor-frame" data-editor-view="file|cards">
      … <span class="terminal-title mono">~/formacao</span>
      … <button class="t-btn t-min" aria-label="Minimizar ~/formacao">
      … <button class="t-btn t-max" aria-label="Maximizar ~/formacao|Restaurar ~/formacao">
      … <button class="t-btn t-close" aria-label="Fechar ~/formacao">
      <p class="t-line" data-t-cmd>…$ code ~/formacao</p>
      <div class="editor">
        <span class="editor-tab is-active">2025_ciberseguranca.yml</span>
        <nav class="branched-menu" aria-label="Arquivos de ~/formacao">
          <button aria-expanded="true">formacao/</button>
          <button class="bm-child" data-value="ciberseguranca" aria-current="true">2025_ciberseguranca.yml</button>
          <button class="bm-child" data-value="sistemas-de-informacao">2020_sistemas-de-informacao.yml</button>
          <button class="bm-child" data-value="empregotech">2020_empregotech.yml</button>
          <button class="bm-child" data-value="tecnico-ads">2018_tecnico-ads.yml</button>
        </nav>
        <article class="editor-file" data-file-id="ciberseguranca" data-active aria-label="2025_ciberseguranca.yml">…</article>
        <!-- no HTML pré-renderizado, só o 1º arquivo; os outros 3 entram na hidratação (006 R17) -->
        <div class="editor-cards" [tabindex="0" role="region" aria-label="Cartões de ~/formacao"]>  <!-- só maximizada -->
          <ol class="edu-list">
            <li data-card-id="ciberseguranca"> <article class="base-card base-card--card">…<h3>Pós-Graduação em Cibersegurança</h3>…</article></li>
            <li data-card-id="sistemas-de-informacao">…</li>
            <li data-card-id="empregotech">…</li>
            <li data-card-id="tecnico-ads">…</li>
          </ol>
        </div>
        <footer class="editor-footer mono">
          <span class="editor-path">~/formacao/2025_ciberseguranca.yml</span><span class="editor-pos">1 / 4</span>
        </footer>
      </div>
    </div>
  </div>
</section>
```

- Minimizada ou fechada: o ícone de pasta de código (`DesktopIcon kind="project"`), com `~/formacao`
  embaixo e o nome acessível `Abrir ~/formacao`.
- Os `<li>` dos cartões não têm `v-reveal` (research R6).
- Nas 4 janelas de editor, o `.bm-label` que não cabe na árvore termina em reticências
  (`text-overflow: ellipsis`, FR-020, research R13); o texto do rótulo (e o nome acessível do botão) é o
  nome inteiro.

## 2. Conteúdo dos arquivos

Ver [data-model.md §3](../data-model.md). Texto corrido de cada arquivo (`fileText`):

```text
2025_ciberseguranca.yml                 2020_empregotech.yml
# 1 / 4 · Pós-Graduação em Cibersegurança   # 3 / 4 · 1º Empregotech
curso: Pós-Graduação em Cibersegurança      curso: 1º Empregotech
instituicao: PUC-PR                         instituicao: Prefeitura de Curitiba
local: Curitiba - PR                        local: Curitiba - PR
periodo: 2025 — 2027                        periodo: 2020 — 2020
em_curso: true  # EM CURSO                  observacao: >
                                              Programa de capacitação em tecnologia para jovens. …
                                            fontes:
                                              - overbr.com.br
                                              - curitiba.pr.gov.br
```

- `overbr.com.br` e `curitiba.pr.gov.br` são `<a class="tok tok-link" href="<url>" target="_blank"
  rel="noopener noreferrer">`.
- As formações concluídas não têm `em_curso` nem outra linha de situação.

## 3. `open educacao`

| Entrada | Saída | Ação |
|---------|-------|------|
| `open educacao`, `open Educação`, `open formacao`, `open ~/formacao` | `→ ~/formacao` | minimiza o terminal; rola até a janela; reabre completa e sem crescer se minimizada ou fechada; maximiza; foco no `□` (007 FR-005) |
| `open sobre`, `skills`, `projetos`, `contato` | `open: '<texto>': essa seção não abre com o open. Use: find <seção>` | nenhuma (007 FR-006, sem mudança) |

Lista de opções (na saída de `open` sem opção, de opção inválida e no `help`):

```text
OPTIONS: experiencia | srg | temas-vs-code | italiami | ocr-de-prontuarios | qclass-bot | monitor-de-curso | challenges | comunitario | educacao
```

Bloco do `open` no `help` (a 2ª linha passa a ser gerada dos alvos maximizados, research R8):

```text
open <OPTIONS>
  projetos abrem; experiencia, challenges, comunitario e educacao abrem maximizados
  OPTIONS: experiencia | srg | … | comunitario | educacao
  exemplo: open srg
```

Autocompletar: `open ed` + Tab → `open educacao`; `open e` + Tab → sugestões `experiencia  educacao`
(no toque, os dois atalhos `.dt-chip`).
