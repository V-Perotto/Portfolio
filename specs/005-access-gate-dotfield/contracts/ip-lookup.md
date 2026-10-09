# Contrato: consulta do IP do visitante

**Feature**: `005-access-gate-dotfield` | Requisitos: FR-014, FR-015 | Pesquisa: R5

## Pedido

```text
GET https://api.ipify.org?format=json
credentials: omit         (sem cookies)
referrerPolicy: no-referrer (o serviço não recebe a página de origem)
cache: no-store
signal: AbortController, abortado em 5000 ms
```

- Feito **uma vez por carga**, quando a porta aparece (não no build, não antes do app montar, não
  sem a porta).
- Sem JavaScript, com JavaScript atrasado (sem porta) ou na impressão: nenhum pedido.

## Resposta aceita

```json
{"ip":"203.0.113.7"}
```

- `ip` MUST casar com IPv4: quatro octetos decimais de 0 a 255, sem zeros à esquerda além do próprio
  `0`. Qualquer outra coisa (IPv6, texto, JSON inválido, `status ≠ 200`) é tratada como falha.

## Interface no código

```ts
// src/lib/visitor-ip.ts
export const IP_SERVICE_URL = 'https://api.ipify.org?format=json'
export function isIPv4(value: unknown): value is string
export function lookupVisitorIp(timeoutMs = 5000): Promise<string | null> // nunca rejeita
```

## Uso

- O `AccessGate` guarda o valor quando a promessa resolve.
- No **início de cada sessão**, usa o valor guardado ou `FALLBACK_IP = '127.0.0.1'`, sem esperar.
- O mesmo IP vale nas linhas 1 e 5 e não muda durante a sessão.

## Falhas e console

- Erro de rede, bloqueio, tempo esgotado e resposta inválida resolvem `null`. O código do site não
  chama `console.*` e não lança.
- O navegador pode registrar a falha de rede por conta própria (ex.: `net::ERR_BLOCKED_BY_CLIENT`):
  isso não é erro do site, e os e2e que bloqueiam o serviço ignoram só essa mensagem.

## Privacidade

- O IP só é exibido ao próprio visitante, só na memória da página: não vai para `localStorage`,
  cookies, URLs, analytics nem outro serviço.
- O ipify recebe o pedido (e, com ele, o IP), como qualquer servidor; sem cookies nem referer.

## Testes

- Os e2e respondem o pedido por uma fixture comum (`tests/e2e/support/test.ts`) com
  `{"ip":"203.0.113.7"}`. Nenhum teste chega ao serviço real.
- Unidade (`tests/unit/visitor-ip.spec.ts`): IPv4 válido, IPv6, texto, JSON inválido, `status 500`,
  erro de rede e tempo esgotado → `null`, sem chamadas a `console`.
