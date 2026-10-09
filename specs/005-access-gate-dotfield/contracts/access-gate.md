# Contrato: porta de acesso e sessão SSH

**Feature**: `005-access-gate-dotfield` | Requisitos: FR-001 a FR-021 | Pesquisa: R1–R4, R7, R8

O que os testes (e o visitante) podem observar. Nomes de classe e de atributo são estáveis: os e2e
dependem deles.

## 1. Classes no `<html>` (script inline de `index.html` + `AccessGate`)

| Classe | Quem põe | Quando | Quem tira |
|--------|----------|--------|-----------|
| `js` | script inline | sempre que o JS roda | — |
| `motion` | script inline | sem `prefers-reduced-motion: reduce` | `useMotion` (ao vivo) |
| `booting` | script inline | **sempre com JS** (com ou sem movimento) | script aos 2055 ms sem `app-loaded`; script aos 3900 ms com `app-loaded` e sem `gate`; `AccessGate` ao montar tarde (> 2055 ms) ou no fim do acesso |
| `app-loaded` | `main.ts` | o app rodou | — |
| `app-failed` | script inline | 3900 ms sem `app-loaded` | — |
| `gate` | `AccessGate` | a porta está na tela | `AccessGate`, no fim do acesso, junto com `booting` |

Não existe mais nenhum prazo de 7000 ms no script inline.

## 2. DOM da porta (só no cliente; nada disto no HTML pré-renderizado)

```html
<div class="access-gate [gate-leaving] [gate-still]" role="dialog" aria-modal="true"
     aria-label="Acesso ao portfólio" data-gate-state="idle|open|minimized|done">
  <!-- só com movimento e WebGL -->
  <div class="faulty-terminal gate-bg" aria-hidden="true">…</div>
  <div class="gate-stage">
    <div class="gate-launcher">                       <!-- oculto com a janela aberta -->
      <button class="desktop-icon gate-icon" aria-label="Abrir acessar_portfolio.sh"
              aria-describedby="gate-hint">
        <span class="desktop-icon-square">…FileTerminal…</span>
        <span class="desktop-icon-label mono">acessar_portfolio.sh</span>
      </button>
      <p id="gate-hint" class="gate-hint mono"># clique no ícone para conectar</p>
    </div>
    <div class="gate-window">                         <!-- display:none fora de open/animação -->
      <div class="terminal-window">
        <div class="terminal-bar">
          <span class="terminal-title mono">acessar_portfolio.sh</span>
          <div class="t-controls">
            <button class="t-btn t-min" aria-label="Minimizar acessar_portfolio.sh">svg</button>
            <button class="t-btn t-close" aria-label="Fechar acessar_portfolio.sh">svg</button>
          </div>                                        <!-- sem .t-max -->
        </div>
        <div class="terminal-body mono gate-session" aria-hidden="true">
          <p class="boot-line [boot-pending]">…</p>   <!-- 6 linhas, sempre no DOM -->
        </div>
      </div>
    </div>
  </div>
  <p class="sr-only" role="status">Conectando ao portfólio…</p>
</div>
```

- Enquanto `.access-gate` existe, todos os outros filhos de `#app` têm o atributo `inert`.
- `.boot-pending` = linha ainda não visível (`visibility: hidden`), que ocupa o espaço final.
- A dica em telas de toque (`(hover: none) and (pointer: coarse)`): `# toque no ícone para conectar`.
- `.gate-still` = sem movimento: sem Faulty Terminal, sem transições, sem fade.

## 3. Textos da sessão (FR-013)

Com o IP simulado dos e2e (`203.0.113.7`), versão `2.4.0` e `lastLogin = 09/10/2026, 10:00:00`, o
texto das linhas no fim da sessão é exatamente:

```text
anon@203.0.113.7:~$ ssh viper@portfolio
Conectando ao portfolio...
viper@portfolio password: ••••••••
Autenticado. Bem-vindo ao Portfolio v2.4
Last login: 09/10/2026, 10:00:00 from 203.0.113.7
viper@portfolio:~$ ./iniciar_portfolio.sh
```

Com o ipify falhando, `203.0.113.7` vira `127.0.0.1` nas duas posições. O cursor `▊` (classe
`cursor`) existe só na linha em curso (FR-018); com movimento reduzido, não pisca.

## 4. Tempos

| Medida | Valor | Requisito |
|--------|-------|-----------|
| Abrir / minimizar / fechar a janela | 320 ms (≤ 400 ms) | FR-004, FR-007, FR-008 |
| Sessão (primeiro caractere → fim da pausa final) | 2720 ms (≤ 2900 ms) | FR-020 |
| Saída (fade) | 550 ms (≤ 600 ms) | FR-009 |
| Clique → página descoberta | ~3590 ms (≤ 4000 ms) | SC-002, constituição v3.0.0 |
| Movimento reduzido: clique → página descoberta | ~1000 ms (≤ 1200 ms) | FR-012, SC-002 |
| Montagem do app depois da qual não há porta | 2055 ms do início da navegação | FR-011 |

## 5. Foco e anúncios (FR-003, FR-007 a FR-009, R7)

| Momento | Foco | `role="status"` |
|---------|------|-----------------|
| Porta aparece | ícone | — |
| Janela abre | "Minimizar acessar_portfolio.sh" | "Conectando ao portfólio…" |
| Minimizar | ícone | — |
| Fechar | ícone | "Conexão encerrada" |
| Fim do acesso | alvo de `location.hash` (com `tabindex="-1"` temporário); sem âncora, o início do documento (`body`), e o primeiro Tab chega à navegação | — |

## 6. Página depois do acesso

- Sem `booting`, `gate` nem `inert`; a dock aparece (`useBootDone`); o hero começa o Dot Field.
- Com âncora no endereço, a seção da âncora está no topo, abaixo do header.

## 7. Controles das janelas (FR-022 a FR-024)

Em todo `.terminal-bar` (pré-renderizado e no cliente): `.t-min` com o SVG `lucide-minus`, `.t-max`
com `lucide-maximize-2` (exceto na porta), `.t-close` com `lucide-x`. Cada SVG tem 12 × 12 px, e o
centro dele fica a ≤ 0,5 px do centro do círculo de 20 px. Os nomes acessíveis dos botões funcionais
não mudam. O contêiner decorativo continua `aria-hidden`.
