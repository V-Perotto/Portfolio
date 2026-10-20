import { shallowRef } from 'vue'
import type { ImageFile } from '@/types/resume'

/**
 * Estado do visualizador de imagem único (feature 010, research R7; contracts/certificates-window.md §5).
 * Na 009, cada captura tinha o próprio `<dialog>`; com 61 certificados e a foto da Prime Control, a
 * página tem um só, montado no `<body>` pelo `ImageViewer` (fora do `#app`, que a janela maximizada torna
 * inerte). Quem quer abrir uma imagem chama `openViewer` com o elemento que a abriu: o foco volta a ele.
 */
export interface ViewerRequest {
  image: ImageFile
  /** Legenda e nome acessível do diálogo: '# DIO · <título> · 29 JUL 2020'. */
  caption: string
  trigger: HTMLElement
}

export const viewerRequest = shallowRef<ViewerRequest | null>(null)

/** O visualizador está montado (no cliente). Sem ele, o link segue o comportamento padrão (nova aba). */
export const viewerReady = shallowRef(false)

/** Pede a abertura; devolve `false` quando o visualizador não existe e o link deve seguir. */
export function openViewer(image: ImageFile, caption: string, trigger: HTMLElement): boolean {
  if (!viewerReady.value) return false
  viewerRequest.value = { image, caption, trigger }
  return true
}

/**
 * Clique num gatilho (a figura ou o link `ver certificado`): sem modificador, abre o visualizador; com
 * Ctrl/⌘/Shift/Alt ou outro botão, o navegador segue o link, como faria com qualquer link (nova aba).
 */
export function onViewerClick(e: MouseEvent, image: ImageFile, caption: string): void {
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return
  if (openViewer(image, caption, e.currentTarget as HTMLElement)) e.preventDefault()
}
