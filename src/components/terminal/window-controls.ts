import type { InjectionKey, Ref } from 'vue'
import type { TerminalTyping } from '@/composables/useTerminalTyping'

/**
 * O que o `DesktopWindow` oferece ao `TerminalWindow` dentro dele (feature 004, research R8): os
 * controles `−` e `✕` funcionais, e o registro da digitação, para completar ao minimizar e digitar de
 * novo ao reabrir uma janela fechada.
 */
export interface WindowControls {
  /** `false` no servidor e até montar: os controles continuam desenho (FR-009). */
  mounted: Readonly<Ref<boolean>>
  minimize(): void
  close(): void
  register(typing: TerminalTyping): void
}

export const WINDOW_CONTROLS: InjectionKey<WindowControls> = Symbol('window-controls')
