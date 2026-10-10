import type { InjectionKey, Ref } from 'vue'
import type { TerminalTyping } from '@/composables/useTerminalTyping'

/**
 * O que o `DesktopWindow` oferece ao `TerminalWindow` dentro dele (feature 004, research R8): os
 * controles `−` e `✕` funcionais, e o registro da digitação, para completar ao minimizar e digitar de
 * novo ao reabrir uma janela fechada. As janelas de editor (006) acrescentam o maximizar.
 */
export interface WindowControls {
  /** `false` no servidor e até montar: os controles continuam desenho (FR-009). */
  mounted: Readonly<Ref<boolean>>
  minimize(): void
  close(): void
  register(typing: TerminalTyping): void
  /** Só nas janelas de editor (feature 006, FR-013): o `□` maximiza e restaura. */
  maximize?: { active: Readonly<Ref<boolean>>; toggle(): void }
  /**
   * Feature 007 (research R3): o `EditorFrame` entrega o seu maximizar ao `DesktopWindow`, que o põe no
   * registro de janelas (`src/lib/windows.ts`) para o comando `open` do terminal da dock.
   */
  exposeMaximize?(fn: () => Promise<void>): void
}

export const WINDOW_CONTROLS: InjectionKey<WindowControls> = Symbol('window-controls')
