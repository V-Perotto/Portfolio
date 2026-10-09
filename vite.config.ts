import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type {} from 'vite-ssg' // tipos de ssgOptions

// GitHub Pages publica em https://v-perotto.github.io/Portfolio/ — único lugar com o prefixo.
const base = '/Portfolio/'
// versão exibida na sessão SSH da porta de acesso (feature 005, FR-016): o `version` do package.json é a
// fonte única; o build injeta só a string (research R6)
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

export default defineConfig({
  base,
  define: { __PORTFOLIO_VERSION__: JSON.stringify(version) },
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  ssgOptions: {
    formatting: 'minify',
    script: 'async',
    // CSS crítico embutido no HTML (beasties): o resto do CSS deixa de bloquear a renderização
    beastiesOptions: { publicPath: base, preload: 'media', pruneSource: false },
  },
})
