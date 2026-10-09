/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare global {
  /** `version` do package.json, injetado no build (vite.config.ts, feature 005 FR-016). */
  const __PORTFOLIO_VERSION__: string
}

declare module 'vue' {
  interface GlobalDirectives {
    vReveal: typeof import('./directives/reveal').vReveal
  }
}

export {}
