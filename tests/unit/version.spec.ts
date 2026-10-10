import { describe, expect, it } from 'vitest'
import { displayVersion } from '@/lib/boot'
import packageJson from '../../package.json?raw'

// Feature 005, US2 (FR-016, SC-004): a versão da sessão é a do package.json, sem texto fixo.
describe('versão do portfólio', () => {
  const { version } = JSON.parse(packageJson) as { version: string }

  it('o build injeta a versão do package.json', () => {
    expect(__PORTFOLIO_VERSION__).toBe(version)
  })

  it('a sessão exibe maior e menor (nesta feature, v2.7)', () => {
    const [major, minor] = version.split('.')
    expect(displayVersion(__PORTFOLIO_VERSION__)).toBe(`v${major}.${minor}`)
    expect(displayVersion(__PORTFOLIO_VERSION__)).toBe('v2.7')
  })
})
