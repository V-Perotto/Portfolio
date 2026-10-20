import { describe, expect, it } from 'vitest'
import {
  byIssuedDesc,
  CERT_THUMB_WIDTH,
  certificateCaption,
  certificateFileName,
  certificateImage,
  formatHours,
  verificationText,
} from '@/lib/certificates'
import type { Certificate, CertificatePlatform } from '@/types/resume'

// Feature 010 (data-model §2, research R2 e R5): os valores derivados dos certificados.
const logica: Certificate = {
  id: 'logica-programacao',
  title: 'Lógica de programação essencial',
  issued: '2020-04-13',
  hours: 4,
  verification: { url: 'https://hermes.dio.me/certificates/F4F49CF0.pdf' },
}
const dio: CertificatePlatform = { id: 'dio', name: 'DIO', image: { width: 1200, height: 849 }, certificates: [logica] }

describe('certificados — valores derivados', () => {
  it('nome do arquivo `AAAA-MM-DD_<id>.yml` (FR-006)', () => {
    expect(certificateFileName(logica)).toBe('2020-04-13_logica-programacao.yml')
  })

  it('imagens derivadas da plataforma, da data e do slug, com o texto alternativo gerado (FR-009)', () => {
    expect(certificateImage(dio, logica)).toEqual({
      src: 'certificados/dio/2020-04-13_logica-programacao-640.webp',
      srcWidth: CERT_THUMB_WIDTH,
      full: 'certificados/dio/2020-04-13_logica-programacao-1200.webp',
      width: 1200,
      height: 849,
      alt: 'Certificado da DIO: Lógica de programação essencial, 4 h, 13/04/2020',
    })
  })

  it('legenda do visualizador e carga horária', () => {
    expect(certificateCaption(dio, logica)).toBe('# DIO · Lógica de programação essencial · 13 ABR 2020')
    expect(formatHours(79)).toBe('79 h')
  })

  it('ordem da pasta: data desc., estável no mesmo dia, sem mutar (FR-003)', () => {
    const a: Certificate = { ...logica, id: 'a', issued: '2020-07-01' }
    const b: Certificate = { ...logica, id: 'b', issued: '2020-07-01' }
    const c: Certificate = { ...logica, id: 'c', issued: '2020-07-03' }
    const list = [a, b, c]
    expect(byIssuedDesc(list).map((x) => x.id)).toEqual(['c', 'a', 'b'])
    expect(list.map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })

  it('texto da verificação: endereço sem protocolo, host · código, ou só o código (R5)', () => {
    expect(verificationText({ url: 'https://hermes.dio.me/certificates/F4F49CF0.pdf' })).toBe('hermes.dio.me/certificates/F4F49CF0.pdf')
    expect(verificationText({ url: 'https://ude.my/UC-6d75d1fc-c72a-4df4-8cf1-9b572b69e489' })).toBe('ude.my/UC-6d75d1fc-c72a-4df4-8cf1-9b572b69e489')
    expect(
      verificationText({ url: 'https://e-certificado.com/login/autenticar?c=1641756A81BF361B10825550', code: '1641756A81BF361B10825550' }),
    ).toBe('e-certificado.com · 1641756A81BF361B10825550')
    expect(verificationText({ code: '666923b8ee6805a1a5040c2ddcb47d02' })).toBe('666923b8ee6805a1a5040c2ddcb47d02')
  })
})
