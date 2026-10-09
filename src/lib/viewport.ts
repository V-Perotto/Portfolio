/**
 * Teclado virtual do celular (feature 004, edge case "Celular" da spec): com o terminal da dock
 * aberto, o teclado não pode cobrir o prompt. `--kb-offset` no <html> é a altura que o teclado (ou
 * outra interface do navegador) tira da parte de baixo da tela; a dock e o terminal sobem esse tanto.
 */
export function trackKeyboardOffset(): () => void {
  const viewport = window.visualViewport
  if (!viewport) return () => {}
  const root = document.documentElement
  const update = () => {
    const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
    root.style.setProperty('--kb-offset', `${Math.round(offset)}px`)
  }
  viewport.addEventListener('resize', update)
  viewport.addEventListener('scroll', update)
  update()
  return () => {
    viewport.removeEventListener('resize', update)
    viewport.removeEventListener('scroll', update)
    root.style.removeProperty('--kb-offset')
  }
}
