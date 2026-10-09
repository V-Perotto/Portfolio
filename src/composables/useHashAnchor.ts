import { onMounted } from 'vue'

/**
 * Links diretos para uma seção (`/#projetos`, SC-010): o navegador rola até a âncora no primeiro
 * layout, mas as fontes com `font-display: swap` chegam depois e reflowam o texto, tirando a seção
 * do lugar. Quando as fontes terminam, reposiciona na âncora — só se o visitante ainda não rolou.
 */
export function useHashAnchor(): void {
  onMounted(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    // com a porta de acesso na tela, a página abre no topo no fim dela e a âncora sai (feature 006,
    // FR-020); isto só vale sem porta (JS que chegou tarde, FR-022)
    if (!id || document.documentElement.classList.contains('gate')) return

    let userScrolled = false
    const markUser = () => {
      userScrolled = true
    }
    const events = ['wheel', 'touchmove', 'keydown', 'mousedown'] as const
    for (const event of events) window.addEventListener(event, markUser, { once: true, passive: true })

    document.fonts.ready.then(() => {
      for (const event of events) window.removeEventListener(event, markUser)
      if (!userScrolled) document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
  })
}
