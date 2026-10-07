import { expect, test } from '@playwright/test'

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
    ]
    for (const text of texts) await expect(page.getByText(text, { exact: false }).first()).toBeVisible()
  })

  test('nenhum texto escondido por estado inicial de animação', async ({ page }) => {
    await page.goto('./')
    const hidden = await page.evaluate(() => {
      const offenders: string[] = []
      const walker = document.createTreeWalker(document.getElementById('app')!, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const el = node.parentElement
        if (!el || !node.textContent?.trim() || el.closest('[aria-hidden="true"]')) continue
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

  test('âncora leva à seção', async ({ page }) => {
    await page.goto('./#experiencia')
    await expect(page.locator('#experiencia')).toBeInViewport()
  })

  test('sem tela de boot e prompt com o cargo principal', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('.boot-screen')).toHaveCount(0)
    await expect(page.locator('.hero-terminal')).toContainText('Desenvolvedor Full-Stack')
  })
})
