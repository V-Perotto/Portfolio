import { expect, test } from './support/test'
import { gotoGate } from './support/gate'
import { expectStaticSkillLoops } from './support/skills'

// Princípio III / FR-012: todo o conteúdo do currículo no HTML, visível sem JavaScript (quickstart V4).
test.use({ javaScriptEnabled: false })

test.describe('sem JS', () => {
  test('todo o conteúdo do currículo está visível', async ({ page }) => {
    await page.goto('./')
    const texts = [
      'Vittorio Perotto',
      'Empresa de Tecnologia (Confidencial)',
      'Osuper Sistemas LTDA',
      'Quadritech Tecnologia',
      'COINOV Consultoria e Serviços LTDA',
      'Prime Control e Prime Robot',
      'linguagens_frameworks',
      'conceitos_web',
      'gestao_de_dados',
      'desenho_de_processos',
      'devops_qualidade',
      'Pós-Graduação em Cibersegurança',
      'Bacharelado em Sistemas de Informação',
      'Técnico em Análise e Desenvolvimento de Sistemas',
      'github.com/V-Perotto',
      'www.linkedin.com/in/vittorioperotto/',
      // feature 002 (FR-037)
      'Demonstrativo de Aluguéis',
      'EM DESENVOLVIMENTO',
      'OCR de Prontuários',
      'QClass-BOT',
      'github.com/V-Perotto/ItaliaMi-Back',
      'CIEE-PR',
      'github.com/V-Perotto/AxyaTest_API',
      'Gincana Junina',
      '1º Empregotech',
      'Prime Control, uma das patrocinadoras',
    ]
    // o texto das janelas de editor (006) aparece duas vezes no HTML: no YAML, só com JS, e nos cartões
    for (const text of texts) await expect(page.getByText(text, { exact: false }).filter({ visible: true }).first()).toBeVisible()
    // feature 008 (FR-012, SC-004): a Educação mostra os 4 cartões, sem árvore nem rodapé do editor
    const education = page.locator('#educacao')
    await expect(education.locator('.edu-list > li h3')).toHaveCount(4)
    for (const title of await education.locator('.edu-list > li h3').all()) await expect(title).toBeVisible()
    await expect(education.locator('.editor-tree')).toBeHidden()
    await expect(education.locator('.editor-footer')).toBeHidden()
  })

  test('nenhum texto escondido por estado inicial de animação', async ({ page }) => {
    await page.goto('./')
    const hidden = await page.evaluate(() => {
      const offenders: string[] = []
      const walker = document.createTreeWalker(document.getElementById('app')!, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const el = node.parentElement
        if (!el || !node.textContent?.trim() || el.closest('[aria-hidden="true"]')) continue
        // a visão de editor (006, FR-012) é a outra apresentação dos cartões, que ficam visíveis
        if (el.closest('.editor-tabs, .editor-tree, .editor-files, .editor-footer')) continue
        // sobe a árvore: qualquer ancestral escondido esconde o texto
        for (let cur: Element | null = el; cur; cur = cur.parentElement) {
          const style = getComputedStyle(cur)
          if (style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none') {
            // .sr-only é texto para leitor de tela, não estado de animação
            if (!cur.classList.contains('sr-only')) offenders.push(node.textContent.trim().slice(0, 40))
            break
          }
        }
      }
      return offenders
    })
    expect(hidden).toEqual([])
  })

  test('feature 006: □ desenhado como desativado, loader no estado final e favicon (V9, V13, V15, FR-025, FR-042)', async ({ page }) => {
    await page.goto('./')
    const max = page.locator('.t-max')
    // 12 janelas: a de Educação entrou na 008
    expect(await max.count()).toBe(12)
    expect(await max.evaluateAll((els) => els.every((el) => el.tagName === 'SPAN' && el.classList.contains('t-btn--disabled')))).toBe(true)
    await expect(page.locator('#home .hero-boot')).toHaveAttribute('data-loader', 'done')
    await expect(page.locator('#home .ll-text[data-active]')).toHaveText('portfolio.service carregado com sucesso!')
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', /favicon\.svg$/)
  })

  test('âncora leva à seção', async ({ page }) => {
    await page.goto('./#experiencia')
    await expect(page.locator('#experiencia')).toBeInViewport()
  })

  test('sem tela de boot e prompt com o cargo principal', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('.access-gate')).toHaveCount(0)
    await expect(page.locator('.hero-terminal')).toContainText('Desenvolvedor Full-Stack')
  })

  test('loops de skills parados, com todas as skills dentro da fita (V10, FR-025 da 003)', async ({ page }) => {
    await page.goto('./')
    await expectStaticSkillLoops(page)
  })

  test('janelas de terminal completas, sem estado de digitação (FR-029, SC-006)', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('[data-t-state], [data-t-anim], .t-typed')).toHaveCount(0)
    await expect(page.locator('#sobre [data-t-cmd]').first()).toHaveText('$ cat sobre.txt')
    await expect(page.locator('#contato .contact-list')).toBeVisible()
  })

  test('feature 004: sem dock, terminal, canvas, grade nem ícones; janelas abertas; rodapé de uma linha (V17)', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('.app-dock, #dock-terminal, .desktop-icon, canvas, .hero-grid')).toHaveCount(0)
    // navegação com os 6 links, sem o prompt
    await expect(page.locator('.nav-links a')).toHaveCount(6)
    await expect(page.locator('.navbar')).not.toContainText('viper@portfolio')
    // 12 janelas completas (as 4 de editor: as 3 da 006 e a de Educação da 008), com os controles só desenho
    await expect(page.locator('.desktop-window')).toHaveCount(12)
    await expect(page.locator('.terminal-bar button')).toHaveCount(0)
    expect(await page.locator('.t-controls').evaluateAll((els) => els.every((el) => el.getAttribute('aria-hidden') === 'true'))).toBe(true)
    await expect(page.locator('footer.footer p')).toHaveCount(1)
    // meia tela antes do Sobre (FR-014)
    const gap = await page.evaluate(
      () => document.querySelector('#sobre h2')!.getBoundingClientRect().top - document.getElementById('home')!.getBoundingClientRect().bottom,
    )
    const height = page.viewportSize()!.height
    expect(gap).toBeGreaterThanOrEqual(height * 0.45)
    expect(gap).toBeLessThanOrEqual(height * 0.55)
  })
})

test.describe('sem JS, feature 005', () => {
  test('sem porta, sem capa e sem pedido ao ipify; controles com os ícones Lucide decorativos (T039, FR-011, FR-024)', async ({ page }) => {
    const ipify: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('ipify')) ipify.push(r.url())
    })
    await page.goto('./')
    await expect(page.locator('.access-gate')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveClass(/\bbooting\b|\bgate\b/)
    await expect(page.locator('h1')).toBeVisible()
    const icons = await page.locator('.terminal-bar').first().locator('svg').evaluateAll((svgs) => svgs.map((s) => s.getAttribute('class') ?? ''))
    expect(icons.map((c) => c.match(/lucide-(minus|maximize-2|x)\b/)?.[0])).toEqual(['lucide-minus', 'lucide-maximize-2', 'lucide-x'])
    expect(ipify).toEqual([])
  })
})

// Feature 005 (T039): na impressão, a porta e o fundo do hero não saem no papel, mesmo com a porta na tela
test.describe('impressão com a porta na tela', () => {
  test.use({ javaScriptEnabled: true, reducedMotion: 'no-preference' })

  test('a página sai inteira, sem a porta nem a capa', async ({ page }) => {
    await gotoGate(page)
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('.access-gate')).toBeHidden()
    const cover = await page.evaluate(() => getComputedStyle(document.documentElement, '::before').display)
    expect(cover).toBe('none')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('#contato .contact-list')).toBeVisible()
    // feature 008 (FR-012, SC-004): os 4 cartões de formação saem, sem a árvore da `~/formacao`
    const education = page.locator('#educacao')
    await expect(education.locator('.edu-list > li h3')).toHaveCount(4)
    for (const title of await education.locator('.edu-list > li h3').all()) await expect(title).toBeVisible()
    await expect(education.locator('.editor-tree')).toBeHidden()
  })
})

// FR-018: o script inline rodou, mas o JavaScript principal falhou — nada fica escondido
test.describe('JS principal falhou', () => {
  test.use({ javaScriptEnabled: true, reducedMotion: 'no-preference' })

  test('em até 5 s todo o texto aparece no estado final', async ({ page }) => {
    await page.route('**/assets/*.js', (route) => route.abort())
    await page.goto('./')
    await page.waitForFunction(() => performance.now() > 5000, null, { timeout: 8000 })
    expect(await page.evaluate(() => document.documentElement.classList.contains('booting'))).toBe(false)
    const hidden = await page.evaluate(() => {
      const offenders: string[] = []
      const walker = document.createTreeWalker(document.getElementById('app')!, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const el = node.parentElement
        if (!el || !node.textContent?.trim() || el.closest('[aria-hidden="true"], .sr-only')) continue
        // a visão de editor (006, FR-012) é a outra apresentação dos cartões, que ficam visíveis
        if (el.closest('.editor-tabs, .editor-tree, .editor-files, .editor-footer')) continue
        for (let cur: Element | null = el; cur; cur = cur.parentElement) {
          const style = getComputedStyle(cur)
          if (style.opacity === '0' || style.visibility === 'hidden') {
            offenders.push(node.textContent.trim().slice(0, 40))
            break
          }
        }
      }
      return offenders
    })
    expect(hidden).toEqual([])
  })

  test('loops de skills parados e completos depois do fim do boot (V10, FR-025 da 003)', async ({ page }) => {
    await page.route('**/assets/*.js', (route) => route.abort())
    await page.goto('./')
    await page.waitForFunction(() => performance.now() > 4000, null, { timeout: 8000 })
    expect(await page.evaluate(() => document.documentElement.classList.contains('motion'))).toBe(false)
    await expectStaticSkillLoops(page)
  })
})
