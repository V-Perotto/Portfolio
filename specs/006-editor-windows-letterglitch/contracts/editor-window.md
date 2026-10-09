# Contrato: janelas de editor (Experiência, Challenges, Comunitário)

**Feature**: `006-editor-windows-letterglitch` | Requisitos: FR-001 a FR-019, FR-023, FR-025 |
Pesquisa: R1–R7, R9

O que os testes (e o visitante) podem observar. Nomes de classe e de atributo são estáveis: os e2e
dependem deles.

## 1. DOM (pré-renderizado; o mesmo HTML com e sem JS)

`EditorWindow` (a janela de área de trabalho) envolve o `EditorFrame` (o editor e o maximizar): o
`EditorFrame` fica dentro do slot do `DesktopWindow` para receber os controles dele e repassá-los ao
terminal com o maximizar.

```html
<section id="experiencia">                                  <!-- SectionShell: título e lead inalterados -->
  <div class="desktop-window editor-slot" data-window-state="open|minimized|closed" data-editor="carreira">
    <div class="desktop-window-frame">
      <!-- Teleport to="body" :disabled="!maximized" -->
      <div class="editor-frame" data-editor-view="file|cards"
           [role="dialog" aria-modal="true" aria-label="~/carreira (maximizada)"]>  <!-- só maximizada -->
        <div class="base-card base-card--window">
          <div class="terminal-window">
            <div class="terminal-bar">
              <span class="terminal-title mono">~/carreira</span>
              <div class="t-controls">
                <button class="t-btn t-min" aria-label="Minimizar ~/carreira">…</button>
                <button class="t-btn t-max" aria-label="Maximizar ~/carreira|Restaurar ~/carreira">
                  …maximize-2|minimize-2…</button>
                <button class="t-btn t-close" aria-label="Fechar ~/carreira">…</button>
              </div>
            </div>
            <div class="terminal-body mono">
              <p class="t-line" data-t-cmd>…$ code ~/carreira</p>
              <div class="editor">                        <!-- saída do comando -->
                <div class="editor-tabs" role="presentation">
                  <span class="editor-tab is-active">2026-03_confidencial.yml</span>
                </div>
                <nav class="branched-menu editor-tree" aria-label="Arquivos de ~/carreira">
                  <button aria-expanded="true">carreira/</button>
                  <button class="bm-child" data-value="confidencial-2026" aria-current="true">…2026-03_confidencial.yml</button>
                  <button class="bm-child" data-value="osuper">…2025-04_osuper.yml</button>
                  …
                </nav>
                <div class="editor-pane">
                  <div class="editor-files">
                    <article class="editor-file" data-file-id="confidencial-2026" [data-active]
                             aria-label="2026-03_confidencial.yml">
                      <ol class="editor-lines">
                        <li class="editor-line"><span class="editor-ln" aria-hidden="true">1</span>
                          <span class="tok tok-comment"># 1 / 5 · Programador Full-Stack</span></li>
                        <li …><span class="tok tok-key">cargo</span><span class="tok tok-punct">: </span>
                          <span class="tok tok-str">Programador Full-Stack</span></li>
                        …
                      </ol>
                    </article>
                    …                                       <!-- um por item, só o ativo visível -->
                  </div>
                  <div class="editor-cards">                <!-- slot: os cartões de hoje -->
                    <ol class="timeline">…ExperienceCard…</ol>
                  </div>
                </div>
                <footer class="editor-footer mono">
                  <span class="editor-path">~/carreira/2026-03_confidencial.yml</span>
                  <span class="editor-pos">1 / 5</span>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- DesktopIcon quando minimizada ou fechada (004) -->
  </div>
</section>
<!-- maximizada: no <body>, fora de #app -->
<div class="maximize-backdrop" aria-hidden="true"></div>
```

| Seção | `data-editor` | Título/pasta | Comando | Cartões (`.editor-cards`) |
|-------|---------------|--------------|---------|---------------------------|
| `#experiencia` | `carreira` | `~/carreira` | `code ~/carreira` | `ol.timeline` com `ExperienceCard` |
| `#projetos` › `challenges/` | `challenges` | `~/projetos/challenges` | `code ~/projetos/challenges` | `ol.subpart-list` com `ChallengeCard` |
| `#projetos` › `comunitario/` | `comunitario` | `~/projetos/comunitario` | `code ~/projetos/comunitario` | `ul.subpart-list` com `CommunityCard` |

## 2. Visibilidade por modo (R2)

| Modo | `.editor-tabs`, `.editor-tree`, `.editor-footer` | `.editor-files` | `.editor-cards` |
|------|---------------------------------------------------|-----------------|-----------------|
| sem JS (`html:not(.js)`) ou JS principal falho (`html.app-failed`) | `display: none` | `display: none` | visível |
| JS, `data-editor-view="file"` | visíveis | visível; só `[data-active]` com `visibility: visible` | `display: none` |
| JS, `data-editor-view="cards"` (maximizada) | visíveis | `display: none` | visível, rolando por dentro |
| impressão | `display: none` | `display: none` | visível |

## 3. Interação

| Ação | Resultado |
|------|-----------|
| clique, toque, Enter ou Espaço num arquivo da árvore | `data-active` e `aria-current` passam ao arquivo; aba, `.editor-path` e `.editor-pos` mudam; altura do `.editor-frame` igual (±0 px); o foco fica no botão do arquivo |
| idem, maximizada | o `.editor-cards` rola até o cartão do item (topo do cartão a ≤ 16 px do topo do painel), a menos que o título já esteja à vista |
| `.t-max` (normal) | maximiza em ≤ 400 ms (sem animação com movimento reduzido); `html.window-maximized`; `#app[inert]`; `.maximize-backdrop` presente; foco no `.t-max` ("Restaurar …") |
| `.t-max`, Esc ou clique no `.maximize-backdrop` (maximizada) | restaura em ≤ 400 ms, no mesmo lugar e na mesma rolagem; desfaz `inert` e a classe; foco no `.t-max` ("Maximizar …") |
| Tab / Shift+Tab (maximizada) | o foco circula dentro do `.editor-frame` |
| Ctrl+Alt+T (maximizada) | nada |
| `.t-min` / `.t-close` (maximizada) | restaura sem animação e então minimiza/fecha até o ícone (004) |
| entrar na tela (com movimento) | o comando é digitado; o `.editor` fica `opacity: 0` (`data-t-state="pending"`) até o fim, sem mudar a altura |
| fechar e reabrir | cresce com o `.editor` já `pending`; digita depois (R7) |

## 4. Geometria

- Normal, ≥ 760 px: árvore à esquerda (`max-width: var(--editor-tree-width)`), painel à direita; < 760
  px: árvore acima do painel. Sem rolagem horizontal da página de 320 px em diante; linhas longas
  quebram com recuo; a numeração conta linhas lógicas.
- Maximizada: `position: fixed`, `inset: max(2.5vh, 0.75rem) max(2.5vw, 0.75rem)` (≥ 760 px) ou
  `0.5rem` (< 760 px), `z-index: 901`; backdrop `z-index: 900`, `backdrop-filter: blur(var(--maximize-blur))`.
- O lugar da janela na página mantém a altura medida enquanto ela está maximizada.

## 5. Controles das outras janelas (FR-025)

| Janela | `.t-max` |
|--------|----------|
| Sobre, 6 projetos, Contato, terminal da dock | `<span class="t-btn t-max t-btn--disabled" aria-hidden="true">`: `opacity` ≤ 0,4; o mesmo desenho com e sem hover; `cursor: default` |
| `acessar_portfolio.sh` | ausente |
| janelas de editor, com JS | `<button>` funcional |
| qualquer janela, sem JS | desenho desativado |
