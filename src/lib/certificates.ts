import { formatDate } from '@/lib/period'
import type { Certificate, CertificatePlatform, CertificateVerification, ImageFile } from '@/types/resume'

/**
 * Valores derivados dos certificados (feature 010, data-model §2, research R2 e R5): funções puras, usadas
 * pelos arquivos da janela `~/certificados`, pelos cartões e pelos testes. Os caminhos das imagens não
 * ficam nos dados: saem da plataforma, da data e do slug, no mesmo padrão que tools/build-certificates.mjs
 * usa para gravá-las.
 */

/** Largura da miniatura no arquivo (20rem a 2×, research R4). */
export const CERT_THUMB_WIDTH = 640

/** Do mais recente para o mais antigo pela data de emissão; no mesmo dia, a ordem dos dados. Não muta. */
export function byIssuedDesc(list: readonly Certificate[]): Certificate[] {
  return [...list].sort((a, b) => b.issued.localeCompare(a.issued))
}

/** `2020-04-13_logica-programacao.yml` (FR-006). */
export const certificateFileName = (cert: Certificate): string => `${cert.issued}_${cert.id}.yml`

/** `'2020-04-13'` → `'13/04/2020'` (texto alternativo). */
const dayMonthYear = (value: string) => value.split('-').reverse().join('/')

/** `4 h` */
export const formatHours = (hours: number): string => `${hours} h`

/** As duas versões publicadas do certificado e o texto alternativo gerado dos dados (FR-009). */
export function certificateImage(platform: CertificatePlatform, cert: Certificate): ImageFile {
  const base = `certificados/${platform.id}/${cert.issued}_${cert.id}`
  return {
    src: `${base}-${CERT_THUMB_WIDTH}.webp`,
    srcWidth: CERT_THUMB_WIDTH,
    full: `${base}-${platform.image.width}.webp`,
    width: platform.image.width,
    height: platform.image.height,
    alt: `Certificado da ${platform.name}: ${cert.title}, ${formatHours(cert.hours)}, ${dayMonthYear(cert.issued)}`,
  }
}

/** Legenda do visualizador: `# DIO · Lógica de programação essencial · 13 ABR 2020`. */
export const certificateCaption = (platform: CertificatePlatform, cert: Certificate): string =>
  `# ${platform.name} · ${cert.title} · ${formatDate(cert.issued)}`

/**
 * Texto da verificação (research R5): o endereço sem protocolo; com endereço e código (o e-certificado, de
 * endereço longo), `e-certificado.com · <código>`; só o código, quando o endereço não funciona mais.
 */
export function verificationText(verification: CertificateVerification): string {
  const { url, code } = verification
  if (!url) return code ?? ''
  const host = new URL(url).host.replace(/^www\./, '')
  return code ? `${host} · ${code}` : url.replace(/^https?:\/\//, '')
}
