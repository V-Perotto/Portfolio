# Contrato: janela do DebianServer, visualizador da captura e challenge Bom Jesus (FAE)

**Feature**: `009-homeserver-bomjesus-challenge` | Requisitos: FR-001 a FR-024 | Pesquisa: R2, R4–R9

Estende o contrato das janelas de projeto (002, 004, 005) e o da janela de editor (006, 008). Tudo o que
eles dizem (DOM, classes, nomes acessíveis, minimizar, fechar, digitação, sem JS, impressão) vale aqui;
abaixo, só o que muda.

## 1. DOM da janela do DebianServer (pré-renderizado)

```html
<li>                                                     <!-- 2º item de .projects-grid -->
  <div class="desktop-window" data-window-state="open|minimized|closed">
    … <span class="terminal-title mono">DebianServer</span>
    <p class="t-line" data-t-cmd>…$ debianserver --status</p>
    <div class="project-body">
      <div class="project-info">
        <h3 class="t-output project-name">
          <span class="hl-purple">DebianServer</span> — Meu homeserver
          <span class="tag-now">EM PRODUÇÃO</span>
        </h3>
        <p class="t-output t-desc">Servidor caseiro self-hosted …</p>
        <dl class="project-meta">
          <div><dt>papel</dt><dd>Autor: instalação, configuração e manutenção</dd></div>
          <div><dt>tipo</dt><dd>side-project</dd></div>
          <div><dt>desde</dt><dd>01 OUT 2026</dd></div>
          <div><dt>hardware</dt><dd>Notebook reaproveitado: …</dd></div>
          <div><dt>sistema</dt><dd>CasaOS sobre Debian 13, …</dd></div>
          <div><dt>acesso</dt><dd>Tailscale (VPN) …</dd></div>
        </dl>
        <ul class="chips project-stack" aria-label="Stack"> <!-- 6 TagChip: Debian … Samba --> </ul>
        <p class="t-output apps-title" aria-hidden="true"># apps</p>
        <ul class="project-apps" aria-label="Apps do servidor">
          <li>
            <span class="app-name hl-purple"><svg class="tech-icon" aria-hidden="true">…</svg>Ente Photos</span>
            <span class="app-desc">Backup automático …</span>
          </li>
          … <!-- OpenWebUI, Kiwix, Syncthing, SearXNG, Watchtower -->
        </ul>
      </div>
      <div class="project-links">
        <p class="t-output no-evidence"># sem acesso público: a evidência é a captura do painel</p>
        <figure class="project-shot">
          <a class="shot-link" href="/Portfolio/projetos/debianserver/painel-2026-10-20-1396.webp"
             target="_blank" rel="noopener noreferrer">
            <!-- `loading` antes de `src`: o Vue aplica os atributos nessa ordem quando cria a imagem no
                 cliente, e um `src` antes do `lazy` baixaria a imagem na hora -->
            <img loading="lazy" decoding="async" width="1396" height="809"
                 alt="Painel do CasaOS do DebianServer em 20/10/2026: …"
                 sizes="(min-width: 900px) 24rem, calc(100vw - 4rem)"
                 srcset="…-800.webp 800w, …-1396.webp 1396w"
                 src="/Portfolio/projetos/debianserver/painel-2026-10-20-800.webp">
            <span class="sr-only">(abre a captura em tamanho real)</span>
          </a>
          <figcaption class="t-output"># painel do CasaOS do DebianServer · OUT 2026</figcaption>
        </figure>
      </div>
    </div>
    <p class="t-line project-footer"><span class="hl-green">[side-project]</span> <span class="t-exit">exit 0</span></p>
  </div>
</li>
```

- Projetos sem os campos novos: **HTML idêntico ao de hoje** (sem `desde`, sem `# apps`, sem figura).
- Ordem do `dl`: `papel`, `tipo`, `desde`, `contexto` (se houver), `details` na ordem dos dados.
- Abaixo de 900 px, `.project-links` vem depois de `.project-info` (já é assim); a figura ocupa a
  largura da janela. Abaixo de 600 px, `.app-desc` vai para a linha de baixo de `.app-name`.

## 2. Visualizador (só com JavaScript, depois da hidratação)

```html
<dialog class="shot-viewer" aria-labelledby="shot-viewer-caption-debianserver">
  <!-- preguiçosa: com o diálogo fechado, não é baixada; só ao abrir -->
  <img class="shot-full" loading="lazy" decoding="async" width="1396" height="809" alt="Painel do CasaOS …"
       src="/Portfolio/projetos/debianserver/painel-2026-10-20-1396.webp">
  <p id="shot-viewer-caption-debianserver" class="shot-caption"># painel do CasaOS do DebianServer · OUT 2026</p>
  <button type="button" class="shot-close" aria-label="Fechar a captura"><!-- ícone x do Lucide, 20px --></button>
</dialog>
```

| Ação | Resultado |
|------|-----------|
| clique, toque ou Enter no `.shot-link` (sem modificador; o Espaço não, como em todo link) | `preventDefault`; tira o foco do link e guarda o `scrollY`; `showModal()`; `html.window-maximized`; foco no ✕; animação ≤ 200 ms (nenhuma com "reduzir movimento") |
| Ctrl/⌘/Shift + clique, botão do meio | nada é interceptado: o navegador abre a imagem em nova aba/janela |
| Esc, ✕, clique no fundo (fora da imagem) | fecha (≤ 200 ms); tira `window-maximized`; volta ao `scrollY` guardado; foco no `.shot-link`, sem rolar |
| Ctrl+Alt+T com o visualizador aberto | nada (regra existente da dock para `window-maximized`) |
| Tab / Shift+Tab | ficam dentro do diálogo (comportamento nativo do `showModal()`) |

- A imagem cabe inteira: `max-width: min(1396px, 100%)` (o diálogo tem 1rem de respiro), `max-height: calc(100dvh - 7rem)`,
  `object-fit: contain`; nenhuma rolagem, de 320 a 1920 px.
- O ✕ tem alvo ≥ 44 × 44 px.
- `::backdrop`: o mesmo escurecimento e `blur(var(--maximize-blur))` do `.maximize-backdrop`.
- Sem JavaScript e na impressão, o `<dialog>` não existe no HTML.

## 3. Challenge Bom Jesus (FAE)

- Árvore de `~/projetos/challenges`: 8 arquivos; o 1º é `2026-10_bom-jesus-fae.yml`, aberto, rodapé
  `~/projetos/challenges/2026-10_bom-jesus-fae.yml` · `1 / 8`.
- Conteúdo do arquivo (formato da 006):

```yaml
# 1/8 · Bom Jesus (FAE)
nome: Bom Jesus (FAE)
criado: OUT 2026
resumo: >
  Gestão acadêmica: API REST e interface web para cadastrar, consultar, atualizar e excluir alunos e professores de uma instituição de ensino.
stack: [Java, Spring Boot, Vue 3, TypeScript, H2, Docker]
repositorio: github.com/V-Perotto/bomjesus-challenge      # link, nova aba, noopener noreferrer
```

(O formato exato das linhas, inclusive a lista `stack`, é o que o `challengeFolder` já gera para os
outros challenges; o exemplo acima só fixa os valores.)

- Cartão (janela maximizada, sem JS, impressão): o 1º dos 8, `// OUT 2026`, `Bom Jesus (FAE)`, resumo, 6
  chips com ícone, `> github.com/V-Perotto/bomjesus-challenge`.

## 4. Comando `open`

- Opções (saída do `open` sem opção, opção inválida, `help`, Tab, atalhos de toque), na ordem da página:
  `experiencia`, `srg`, **`debianserver`**, `temas-vs-code`, `italiami`, `ocr-de-prontuarios`,
  `qclass-bot`, `monitor-de-curso`, `challenges`, `comunitario`, `educacao` (11).
- `open debianserver` (e o apelido `projetos/debianserver`): saída `→ ~/projetos/debianserver`, terminal
  minimizado, página até a janela, janela aberta (reabre se minimizada ou fechada), foco nela.
- `open deb` + Tab → `open debianserver`.
