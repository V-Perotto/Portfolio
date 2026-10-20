import { describe, expect, it } from 'vitest'
import sprite from '@/assets/tech-icons/sprite.svg?raw'
import { TECH_ICONS } from '@/lib/tech-icons'

// Registro tecnologia → ícone × sprite gerado por tools/build-tech-icons.mjs (FR-013, FR-016, FR-017
// da 003; data-model, "Validação").
const symbols = new Map([...sprite.matchAll(/<symbol id="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g)].map(([, id, body]) => [id!, body!]))
const used = new Set<string>(Object.values(TECH_ICONS))

describe('ícones de tecnologia', () => {
  it('todo id do registro existe como <symbol> no sprite', () => {
    const missing = [...used].filter((id) => !symbols.has(id))
    expect(missing, 'acrescente o ícone no manifesto de tools/build-tech-icons.mjs e rode-o').toEqual([])
  })

  it('todo símbolo do sprite é usado por alguma tecnologia', () => {
    expect([...symbols.keys()].filter((id) => !used.has(id))).toEqual([])
  })

  it('nenhum símbolo tem cor fixa: tudo pinta com currentColor (FR-014)', () => {
    for (const [id, body] of symbols) {
      const colors = [...body.matchAll(/\b(?:fill|stroke|stop-color)="([^"]+)"/g)].map(([, c]) => c)
      expect(colors.filter((c) => c !== 'none' && c !== 'currentColor'), id).toEqual([])
      expect(body, id).not.toMatch(/style=|<style|Gradient|<mask|<image/)
    }
  })

  it('a fonte do ícone segue a ordem devicon → vectorlogo.zone → simple-icons → dashboard-icons → Lucide, pelo prefixo do id', () => {
    for (const id of used) expect(id).toMatch(/^(devicon|vectorlogo|simpleicons|dashboard|lucide)-[a-z0-9-]+$/)
    expect(TECH_ICONS['SAP SD']).toBe('vectorlogo-sap')
  })

  // Feature 009 (research R3): os logotipos que faltam no devicon e no vectorlogo.zone vêm do
  // simple-icons; CasaOS, OpenWebUI e Samba, do dashboard-icons, preparados para uma cor só
  it('tecnologias e apps da feature 009 com o logotipo das fontes certas', () => {
    expect(TECH_ICONS['Spring Boot']).toBe('devicon-spring')
    expect(TECH_ICONS.Debian).toBe('devicon-debian')
    const simple = ['H2', 'Tailscale', 'Ollama', 'Ente Photos', 'Kiwix', 'Syncthing', 'SearXNG', 'Watchtower'] as const
    for (const name of simple) {
      expect(TECH_ICONS[name], name).toMatch(/^simpleicons-/)
      expect(symbols.has(TECH_ICONS[name]), name).toBe(true)
    }
    expect(TECH_ICONS.CasaOS).toBe('dashboard-casaos')
    expect(TECH_ICONS.Samba).toBe('dashboard-samba-server')
    // o "OI" branco virou recorte do disco
    expect(TECH_ICONS.OpenWebUI).toBe('dashboard-open-webui')
    expect(symbols.get('dashboard-open-webui')).toContain('fill-rule="evenodd"')
  })

  it('o Valkey usa o logotipo do homarr-labs/dashboard-icons, vazado no miolo (FR-043 da 004)', () => {
    expect(TECH_ICONS.Valkey).toBe('dashboard-valkey')
    expect(symbols.get('dashboard-valkey')).toContain('fill-rule="evenodd"')
    expect(symbols.has('lucide-database')).toBe(false)
  })

  it('variações de nome da mesma tecnologia usam o mesmo ícone', () => {
    expect(TECH_ICONS['Vue 3']).toBe(TECH_ICONS['Vue.js'])
    expect(TECH_ICONS['Python (Flask)']).toBe(TECH_ICONS.Python)
    expect(TECH_ICONS['Java (Quarkus)']).toBe(TECH_ICONS.Java)
  })
})
