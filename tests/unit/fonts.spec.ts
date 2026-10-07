import { describe, expect, it } from 'vitest'
import { resume } from '@/data/resume'
import chars from '../../tools/iosevka-800.chars?raw'

// O peso 800 da Iosevka só tem as letras do nome do hero (tools/build-fonts.sh, SC-004).
describe('fonte do nome', () => {
  it('o subset do peso 800 cobre todas as letras de profile.name', () => {
    const missing = [...new Set(resume.profile.name)].filter((c) => !chars.includes(c))
    expect(missing, 'rode tools/build-fonts.sh depois de mudar o nome').toEqual([])
  })
})
