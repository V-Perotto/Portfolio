/**
 * IP público do visitante para a sessão SSH da porta de acesso (feature 005, FR-014, FR-015, research
 * R5, contracts/ip-lookup.md).
 *
 * O site é estático e não conhece o IP de quem o visita: a página pergunta, uma vez por carga, a um
 * serviço público sem chave (ipify), que devolve o IPv4 de quem pergunta. É a exceção de recurso de
 * terceiro desta feature (Princípio III): sem cookies nem referer, e qualquer falha (rede, bloqueador,
 * demora, resposta inválida) vira `null` em silêncio, e a sessão usa `127.0.0.1`. O IP não é guardado
 * nem enviado a mais nada.
 */

export const IP_SERVICE_URL = 'https://api.ipify.org?format=json'

const OCTET = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)'
const IPV4 = new RegExp(`^${OCTET}(\\.${OCTET}){3}$`)

/** Quatro octetos decimais de 0 a 255, sem zero à esquerda. */
export const isIPv4 = (value: unknown): value is string => typeof value === 'string' && IPV4.test(value)

/** O IPv4 do visitante, ou `null` se o serviço não respondeu bem em `timeoutMs`. Nunca rejeita. */
export async function lookupVisitorIp(timeoutMs = 5000): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(IP_SERVICE_URL, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) return null
    const body: unknown = await response.json()
    const ip = (body as { ip?: unknown } | null)?.ip
    return isIPv4(ip) ? ip : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
